
import React, { useState } from 'react';
import { VideoScene } from '../../types';
import { FileText, Image as ImageIcon, RefreshCw, Mic, Check, Edit2, Trash2 } from 'lucide-react';

interface SceneListProps {
  scenes: VideoScene[];
  onRegenerateVisual: (index: number) => void;
  onRegenerateAudio: (index: number, text?: string) => void;
  onDeleteScene: (index: number) => void;
  isRegenerating: string | null;
}

const SceneList: React.FC<SceneListProps> = ({ 
  scenes, 
  onRegenerateVisual, 
  onRegenerateAudio,
  onDeleteScene,
  isRegenerating 
}) => {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleEditStart = (idx: number, text: string) => {
    setEditingIdx(idx);
    setEditText(text);
  };

  const handleEditSave = (idx: number) => {
    onRegenerateAudio(idx, editText);
    setEditingIdx(null);
  };

  return (
    <div className="space-y-4">
      {scenes.map((scene, idx) => (
        <div 
          key={scene.id} 
          className="group relative flex gap-4 p-4 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl transition-all"
        >
          {/* Visual Thumb */}
          <div className="relative w-28 h-44 shrink-0 bg-neutral-900 rounded-xl overflow-hidden border border-white/10 shadow-lg">
            {scene.imageUrl ? (
              <img src={scene.imageUrl} alt={`Scene ${idx + 1}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="text-gray-700" size={24} />
              </div>
            )}
            
            <button 
              onClick={() => onRegenerateVisual(idx)}
              disabled={!!isRegenerating}
              className={`absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity ${isRegenerating === `visual-${idx}` ? 'opacity-100' : ''}`}
            >
              <RefreshCw className={`text-white ${isRegenerating === `visual-${idx}` ? 'animate-spin' : ''}`} size={20} />
            </button>

            <div className="absolute top-2 left-2 w-6 h-6 bg-black/80 backdrop-blur-md rounded-lg flex items-center justify-center text-[10px] font-bold border border-white/10">
              {idx + 1}
            </div>
          </div>
          
          {/* Content Info */}
          <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[10px] uppercase tracking-wider">
                  <FileText size={10} /> Script
                </div>
                <div className="flex items-center gap-2">
                    {editingIdx === idx ? (
                      <button onClick={() => handleEditSave(idx)} className="text-green-400 hover:text-green-300">
                        <Check size={14} />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleEditStart(idx, scene.narration)} className="text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => onDeleteScene(idx)} className="text-red-900 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                </div>
              </div>

              {editingIdx === idx ? (
                <textarea 
                  className="w-full bg-black border border-purple-500/50 rounded-lg p-2 text-xs text-white resize-none h-20 outline-none"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                />
              ) : (
                <p className="text-xs text-gray-300 leading-relaxed italic line-clamp-4">
                  "{scene.narration}"
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
              <button 
                onClick={() => onRegenerateAudio(idx)}
                disabled={!!isRegenerating}
                className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-purple-400 transition-colors"
              >
                <Mic size={10} className={isRegenerating === `audio-${idx}` ? 'animate-pulse' : ''} />
                Regen Voice
              </button>
              
              {scene.duration && (
                <span className="ml-auto text-[10px] font-mono text-gray-600">
                  {scene.duration.toFixed(1)}s
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SceneList;
