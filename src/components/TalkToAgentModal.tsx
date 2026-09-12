import React, { useState } from 'react';
import { 
  X, 
  Headphones, 
  ShieldCheck, 
  MessageSquare, 
  Send, 
  Phone, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  GraduationCap,
  Award
} from 'lucide-react';
import { StudentProfile } from '../types';

interface TalkToAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile | null;
  onStartAgentChat: (initialMessage: string) => void;
}

export const TalkToAgentModal: React.FC<TalkToAgentModalProps> = ({
  isOpen,
  onClose,
  studentProfile,
  onStartAgentChat,
}) => {
  const [topic, setTopic] = useState<'nsfas' | 'room_matching' | 'viewing' | 'general'>('room_matching');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedCampus, setSelectedCampus] = useState(studentProfile?.university || 'University of Cape Town (UCT)');

  if (!isOpen) return null;

  const quickTopics = [
    { id: 'room_matching', label: 'Help me find a room near my campus', defaultText: 'Hi, I need help finding an accredited single studio or en-suite room close to campus within my budget.' },
    { id: 'nsfas', label: 'NSFAS accreditation & allowance guidance', defaultText: 'Hello, I am funded by NSFAS and want to know how the 2026 accommodation allowance direct payment works with iKhaya residences.' },
    { id: 'viewing', label: 'Book an in-person or video tour', defaultText: 'Hi Nandi, I would like to arrange a physical or virtual video viewing for top residences near campus.' },
    { id: 'general', label: 'Lease & deposit assistance', defaultText: 'Hi, could an agent explain the lease signing process and security deposit protection?' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMsg = customMessage.trim() || quickTopics.find((t) => t.id === topic)?.defaultText || 'Hi, I would like to speak to an iKhaya housing advisor.';
    onStartAgentChat(finalMsg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header with Advisor Card */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
                alt="iKhaya Housing Agent"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white/80 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-lime-400 border-2 border-white" title="Online now" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Nandi Khumalo</h3>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-300" />
                  Senior Housing Advisor
                </span>
              </div>
              <p className="text-xs text-orange-100 mt-0.5">
                iKhaya Student Living Placement Specialist & NSFAS Liaison
              </p>
              <div className="flex items-center gap-3 text-[11px] text-white/90 mt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-lime-300" />
                  Replies in &lt; 5 mins
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-lime-300" />
                  100% Free Service
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content & Inquiry Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              What do you need assistance with?
            </label>
            <div className="grid grid-cols-1 gap-2">
              {quickTopics.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setTopic(item.id as any);
                    setCustomMessage(item.defaultText);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                    topic === item.id
                      ? 'bg-orange-50 border-orange-400 text-orange-950 font-semibold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {topic === item.id && <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Your Message to Agent Nandi
            </label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Tell us what you're looking for, campus, budget, or move-in date..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-400 font-medium"
            />
          </div>

          {/* Quick Direct Contacts */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-600" />
              <span className="font-semibold text-slate-900">+27 21 890 4000</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-600" />
              <span>advisors@ikhaya.co.za</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Start Live Chat with Agent</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
