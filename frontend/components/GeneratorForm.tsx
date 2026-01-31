
import React, { useState } from 'react';
import { TargetPlatform, VideoTone, VoiceType, GenerationConfig } from '../../types';
import { Wand2, Clock, Globe, MessageSquare, User, Hash } from 'lucide-react';

interface GeneratorFormProps {
  onSubmit: (config: GenerationConfig) => void;
  isLoading: boolean;
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<GenerationConfig>({
    topic: '',
    description: '',
    platform: TargetPlatform.YOUTUBE_SHORTS,
    duration: 30,
    tone: VideoTone.INFORMATIVE,
    voice: VoiceType.FEMALE,
    language: 'English',
    keywords: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Topic & Description */}
        <div className="col-span-full space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <MessageSquare size={14} className="text-purple-500" /> Video Topic & Vision
            </span>
            <input
              required
              placeholder="Ex: 5 Mind-Blowing Facts about Space Exploration"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            />
          </label>
          <textarea
            placeholder="Tell us more about the script idea, vibe, or key points you want included..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Platform & Tone */}
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Globe size={14} className="text-purple-500" /> Target Platform
            </span>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none appearance-none cursor-pointer"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value as TargetPlatform })}
            >
              {Object.values(TargetPlatform).map(p => <option key={p} value={p} className="bg-neutral-900">{p}</option>)}
            </select>
          </label>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Wand2 size={14} className="text-purple-500" /> Tone of Voice
            </span>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none appearance-none cursor-pointer"
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value as VideoTone })}
            >
              {Object.values(VideoTone).map(t => <option key={t} value={t} className="bg-neutral-900 capitalize">{t}</option>)}
            </select>
          </label>
        </div>

        {/* Duration & Voice */}
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Clock size={14} className="text-purple-500" /> Video Duration
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 60].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData({ ...formData, duration: d })}
                  className={`py-3 rounded-xl border transition-all font-bold ${formData.duration === d ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </label>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <User size={14} className="text-purple-500" /> Voice Type
            </span>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none appearance-none cursor-pointer"
              value={formData.voice}
              onChange={(e) => setFormData({ ...formData, voice: e.target.value as VoiceType })}
            >
              {Object.values(VoiceType).map(v => <option key={v} value={v} className="bg-neutral-900">{v}</option>)}
            </select>
          </label>
        </div>

        {/* Language & Keywords */}
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Globe size={14} className="text-purple-500" /> Language
            </span>
            <select
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 outline-none appearance-none cursor-pointer text-white"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Telugu">Telugu</option>
              <option value="Kannada">Kannada</option>
              <option value="Tamil">Tamil</option>
            </select>
          </label>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Hash size={14} className="text-purple-500" /> Keywords (Optional)
            </span>
            <input
              placeholder="space, tech, future"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.topic}
        className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-xl font-bold font-outfit shadow-[0_0_30px_-5px_rgba(147,51,234,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
      >
        <Sparkles size={24} /> Generate Script & Scenes
      </button>
    </form>
  );
};

const Sparkles = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3V4M12 20V21M4 12H3M21 12H20M18.364 5.636L17.657 6.343M6.343 17.657L5.636 18.364M18.364 18.364L17.657 17.657M6.343 6.343L5.636 5.636M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default GeneratorForm;
