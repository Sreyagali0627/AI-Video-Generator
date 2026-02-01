
import React, { useState, useCallback, useRef } from 'react';
import { 
  Step, 
  GenerationConfig, 
  VideoScript, 
  VoiceType,
  VideoScene
} from './types';
import { generateScript, generateSceneImage, generateSceneAudio } from './geminiService';
import { decode, decodeAudioData } from './utils';
import GeneratorForm from './frontend/components/GeneratorForm';
import SceneList from './frontend/components/Scene_list';
import VideoPlayer from './frontend/components/VideoPlayer';
import { 
  Layers, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Mic, 
  CheckCircle2, 
  Loader2,
  ChevronLeft,
  RefreshCcw,
  Check
} from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('INPUT');
  const [config, setConfig] = useState<GenerationConfig | null>(null);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>('');
  const [progress, setProgress] = useState<{current: number, total: number}>({current: 0, total: 0});
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStartGeneration = async (formData: GenerationConfig) => {
    setConfig(formData);
    setError(null);
    setStep('PLANNING');
    setLoadingMsg('Crafting the perfect script for your short...');

    try {
      const generatedScript = await generateScript(formData);
      setScript(generatedScript);
      setStep('GENERATING_ASSETS');
      
      const totalSteps = generatedScript.scenes.length * 2;
      let completedSteps = 0;
      
      const updatedScenes = [...generatedScript.scenes];

      for (let i = 0; i < updatedScenes.length; i++) {
        setLoadingMsg(`Generating visuals for Scene ${i + 1}...`);
        const imageUrl = await generateSceneImage(updatedScenes[i].visualPrompt);
        updatedScenes[i].imageUrl = imageUrl;
        completedSteps++;
        setProgress({ current: completedSteps, total: totalSteps });

        setLoadingMsg(`Generating voice-over for Scene ${i + 1}...`);
        const audioData = await generateSceneAudio(updatedScenes[i].narration, formData.voice, formData.language);
        updatedScenes[i].audioData = audioData;

        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 32000 });
        }
        const decoded = await decodeAudioData(decode(audioData), audioContextRef.current, 32000, 1);
        updatedScenes[i].duration = decoded.duration;

        completedSteps++;
        setProgress({ current: completedSteps, total: totalSteps });
        setScript({ ...generatedScript, scenes: [...updatedScenes] });
      }

      setStep('PREVIEW');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during generation.');
      setStep('INPUT');
    }
  };

  const regenerateSceneVisual = async (index: number) => {
    if (!script) return;
    setIsRegenerating(`visual-${index}`);
    try {
      const imageUrl = await generateSceneImage(script.scenes[index].visualPrompt);
      const newScenes = [...script.scenes];
      newScenes[index].imageUrl = imageUrl;
      setScript({ ...script, scenes: newScenes });
      showToast("Visual updated!");
    } catch (err) {
      console.error("Failed to regenerate visual", err);
    } finally {
      setIsRegenerating(null);
    }
  };

  const regenerateSceneAudio = async (index: number, newText?: string) => {
    if (!script || !config) return;
    setIsRegenerating(`audio-${index}`);
    try {
      const text = newText || script.scenes[index].narration;
      const audioData = await generateSceneAudio(text, config.voice, config.language);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 32000 });
      }
      const decoded = await decodeAudioData(decode(audioData), audioContextRef.current, 32000, 1);
      
      const newScenes = [...script.scenes];
      newScenes[index].audioData = audioData;
      newScenes[index].narration = text;
      newScenes[index].duration = decoded.duration;
      setScript({ ...script, scenes: newScenes });
      showToast("Voice-over updated!");
    } catch (err) {
      console.error("Failed to regenerate audio", err);
    } finally {
      setIsRegenerating(null);
    }
  };

  const deleteScene = (index: number) => {
    if (!script) return;
    if (script.scenes.length <= 1) {
      setError("Video must have at least one scene.");
      return;
    }
    const newScenes = script.scenes.filter((_, i) => i !== index);
    setScript({ ...script, scenes: newScenes });
    showToast("Scene removed.");
  };

  const handleShare = async () => {
    if (!script) return;
    
    const shareText = `Check out this AI video I generated: ${script.title}`;
    const shareUrl = window.location.href;

    // Fallback: Copy to clipboard if Share API is blocked or unavailable
    try {
      if (navigator.share) {
        await navigator.share({
          title: script.title,
          text: shareText,
          url: shareUrl,
        });
        showToast("Shared successfully!");
      } else {
        throw new Error("Share API not available");
      }
    } catch (err) {
      await navigator.clipboard.writeText(`${shareText} - ${shareUrl}`);
      showToast("Share link copied to clipboard!");
    }
  };

  const handleExport = async () => {
    if (!script) return;
    setIsExporting(true);
    
    try {
      let backendSuccess = false;
      
      // 1. Call Python Backend for "official" export registration
      try {
        console.log("Attempting to connect to backend at http://localhost:8000/export");
        const response = await fetch('http://localhost:8000/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(script),
            
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Backend export successful:", data);
          backendSuccess = true;
          showToast("Project sent to backend successfully!");
        } else {
          console.warn(`Backend returned status ${response.status}`);
        }
      } catch (e) {
        console.warn("Backend not reachable. Make sure the Python backend is running on port 8000.");
        console.error("Backend error details:", e);
      }

      // 2. Browser-side high-quality data pack (The "Full" download)
      const data = JSON.stringify(script, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${script.title.replace(/\s+/g, '_')}_master_project.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (!backendSuccess) {
        showToast("Project Master downloaded! (Backend unavailable)");
      } else {
        showToast("Project Master downloaded!");
      }
    } catch (err) {
      console.error("Export error:", err);
      showToast("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const reset = () => {
    setStep('INPUT');
    setScript(null);
    setConfig(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-white text-black px-4 py-2 rounded-full font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Check size={16} className="text-green-600" /> {toast}
        </div>
      )}

      <header className="px-6 py-4 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-outfit tracking-tight">ShortsMagic<span className="text-purple-500">.ai</span></span>
        </div>
        
        {step !== 'INPUT' && (
          <button 
            onClick={reset}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} /> New Project
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {step === 'INPUT' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
            <div className="text-center mb-10">
              <h1 className="text-5xl md:text-6xl font-extrabold font-outfit mb-4 bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
                AI Short-Form Studio
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Turn ideas into professional Reels, Shorts, and TikToks with synchronized AI visuals and voice-overs.
              </p>
            </div>
            
            <GeneratorForm onSubmit={handleStartGeneration} isLoading={false} />
            
            {error && (
              <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-sm max-w-md w-full text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {(step === 'PLANNING' || step === 'GENERATING_ASSETS') && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
              <div className="relative bg-white/5 border border-white/10 p-8 rounded-full">
                <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold font-outfit mb-2">{loadingMsg}</h2>
            <p className="text-gray-500 mb-8">Orchestrating script, visuals, and voice-over...</p>
            {step === 'GENERATING_ASSETS' && progress.total > 0 && (
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase tracking-widest font-semibold">
                  <span>Generating Assets</span>
                  <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'PREVIEW' && script && config && (
          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-73px)]">
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-black/40 border-r border-white/5">
              <VideoPlayer 
                script={script} 
                platform={config.platform} 
                onDownload={handleExport}
                onShare={handleShare}
                isExporting={isExporting}
              />
            </div>
            
            <div className="w-full lg:w-[400px] xl:w-[500px] overflow-y-auto bg-black p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-outfit">Timeline & Assets</h3>
                <button 
                  onClick={() => handleStartGeneration(config)}
                  className="p-2 text-gray-500 hover:text-white transition-colors"
                  title="Regenerate whole script"
                >
                  <RefreshCcw size={18} />
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-xl text-red-300 text-xs text-center">
                  {error}
                </div>
              )}
              
              <SceneList 
                scenes={script.scenes} 
                onRegenerateVisual={regenerateSceneVisual}
                onRegenerateAudio={regenerateSceneAudio}
                onDeleteScene={deleteScene}
                isRegenerating={isRegenerating}
              />

              <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
                 <button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                 >
                   {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                   {isExporting ? "Rendering..." : "Export High-Res Video"}
                 </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
