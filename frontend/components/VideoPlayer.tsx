
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoScript, TargetPlatform, VideoScene } from '../../types';
import { decode, decodeAudioData } from '../../utils';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Share2, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  script: VideoScript;
  platform: TargetPlatform;
  onDownload: () => void;
  onShare: () => void;
  isExporting: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  script, 
  platform, 
  onDownload, 
  onShare, 
  isExporting 
}) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  // Fix: Added initial value 0 to satisfy "Expected 1 arguments" for useRef
  const rafRef = useRef<number>(0);

  // Calculate total duration
  useEffect(() => {
    const total = script.scenes.reduce((acc, scene) => acc + (scene.duration || 0), 0);
    setTotalTime(total);
    // Reset playhead if scenes change
    setCurrentSceneIdx(0);
    setCurrentTime(0);
    setProgress(0);
  }, [script]);

  const stopAudio = useCallback(() => {
    if (currentSourceRef.current) {
      // Fix: Added 0 as argument to stop() for strict environments
      currentSourceRef.current.stop(0);
      currentSourceRef.current = null;
    }
  }, []);

  const playSceneAudio = useCallback(async (index: number) => {
    const scene = script.scenes[index];
    if (!scene || !scene.audioData) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }

    stopAudio();

    const decoded = await decodeAudioData(decode(scene.audioData), audioContextRef.current, 24000, 1);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = decoded;
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : 1;
      source.connect(gainNodeRef.current);
    }
    
    source.onended = () => {
      if (isPlaying) {
        if (index < script.scenes.length - 1) {
          setCurrentSceneIdx(index + 1);
        } else {
          setIsPlaying(false);
          setCurrentSceneIdx(0);
          setCurrentTime(0);
        }
      }
    };

    source.start(0);
    currentSourceRef.current = source;
  }, [script.scenes, isMuted, isPlaying, stopAudio]);

  useEffect(() => {
    if (isPlaying) {
      playSceneAudio(currentSceneIdx);
    } else {
      stopAudio();
    }
    return () => stopAudio();
  }, [isPlaying, currentSceneIdx, playSceneAudio, stopAudio]);

  // Handle progress timer
  useEffect(() => {
    if (isPlaying) {
      const start = Date.now() - (currentTime * 1000);
      const update = () => {
        const now = Date.now();
        const elapsed = (now - start) / 1000;
        setCurrentTime(elapsed);
        setProgress((elapsed / totalTime) * 100);
        rafRef.current = requestAnimationFrame(update);
      };
      rafRef.current = requestAnimationFrame(update);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, totalTime]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (gainNodeRef.current) gainNodeRef.current.gain.value = isMuted ? 1 : 0;
  };

  const currentScene = script.scenes[currentSceneIdx] || script.scenes[0];

  const aspectRatioClass = platform === TargetPlatform.YOUTUBE_SHORTS || platform === TargetPlatform.INSTAGRAM_REELS 
    ? "aspect-[9/16] h-full max-h-[80vh]" 
    : "aspect-video w-full";

  return (
    <div className="relative flex flex-col items-center gap-6 w-full max-w-2xl">
      <div className={`relative bg-neutral-900 shadow-2xl overflow-hidden rounded-3xl border border-white/10 ${aspectRatioClass}`}>
        {currentScene?.imageUrl ? (
          <img 
            key={currentScene.id}
            src={currentScene.imageUrl} 
            alt="Preview" 
            className="w-full h-full object-cover animate-in fade-in duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black">
             <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full" />
                <div className="w-32 h-4 bg-white/10 rounded-full" />
             </div>
          </div>
        )}

        {/* Captions Overlay */}
        {currentScene && (
            <div className="absolute bottom-[15%] left-0 right-0 px-8 text-center pointer-events-none">
            <div className="inline-block bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-2xl">
                <p className="text-white text-lg font-bold font-outfit leading-tight drop-shadow-lg">
                {currentScene.narration}
                </p>
            </div>
            </div>
        )}

        {/* Branding Overlay */}
        <div className="absolute top-6 left-6 flex items-center gap-2 opacity-50">
           <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center">
              <span className="text-[10px] font-bold">AI</span>
           </div>
        </div>

        {isExporting && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <p className="font-outfit font-bold text-xl">Rendering {platform}...</p>
                <p className="text-gray-400 text-sm">Please don't close this window.</p>
            </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={togglePlay}
            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
          >
            {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
          </button>
          
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              <span>{currentTime.toFixed(1)}s</span>
              <span>{totalTime.toFixed(1)}s</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <div 
                  className="h-full bg-purple-500 transition-all duration-100" 
                  style={{ width: `${Math.min(100, progress)}%` }}
               />
            </div>
          </div>

          <button onClick={toggleMute} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        <div className="flex gap-2">
           <button 
             onClick={onDownload}
             disabled={isExporting}
             className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
           >
             <Download size={14} /> Download MP4
           </button>
           <button 
             onClick={onShare}
             className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
           >
             <Share2 size={14} /> Share
           </button>
           <button 
              onClick={() => {
                setCurrentSceneIdx(0);
                setCurrentTime(0);
                setProgress(0);
                setIsPlaying(false);
                stopAudio();
              }}
              className="px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
             <RotateCcw size={14} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
