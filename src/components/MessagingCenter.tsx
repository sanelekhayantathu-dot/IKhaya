import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Paperclip, 
  Calendar, 
  Check, 
  CheckCheck, 
  Clock, 
  Building, 
  Phone, 
  Mail, 
  Sparkles,
  FileText,
  User,
  ShieldCheck
} from 'lucide-react';
import { Conversation, ChatMessage, StudentProfile } from '../types';

const getInitials = (name?: string, fallback = 'IK') => {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface MessagingCenterProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  messages: Record<string, ChatMessage[]>;
  onSendMessage: (conversationId: string, text: string, attachmentName?: string) => void;
  currentRole: 'student' | 'landlord' | 'admin';
  studentProfile: StudentProfile | null;
}

export const MessagingCenter: React.FC<MessagingCenterProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  messages,
  onSendMessage,
  currentRole,
  studentProfile,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedViewingDate, setSelectedViewingDate] = useState('2026-02-06');
  const [selectedViewingTime, setSelectedViewingTime] = useState('14:00');
  const [selectedViewingType, setSelectedViewingType] = useState<'In-Person' | 'Virtual Video Tour'>('In-Person');

  if (!isOpen) return null;

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeMessages = activeConv ? messages[activeConv.id] || [] : [];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;
    onSendMessage(activeConv.id, inputMessage.trim());
    setInputMessage('');
  };

  const handleQuickPrompt = (promptText: string) => {
    if (!activeConv) return;
    onSendMessage(activeConv.id, promptText);
  };

  const handleSendDocument = (docName: string) => {
    if (!activeConv) return;
    onSendMessage(
      activeConv.id,
      `I have shared my verified document: ${docName}`,
      docName
    );
  };

  const handleScheduleViewing = () => {
    if (!activeConv) return;
    onSendMessage(
      activeConv.id,
      `📅 Viewing Requested: ${selectedViewingType} on ${selectedViewingDate} at ${selectedViewingTime}.`
    );
    setShowScheduleModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full h-[85vh] max-h-[750px] shadow-2xl overflow-hidden flex flex-col text-slate-900">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Direct Landlord & Student Messaging</h2>
              <p className="text-[11px] text-slate-500">Instant inquiries, viewing scheduling & document exchange</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messaging Split Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Conversation List */}
          <div className="w-72 sm:w-80 border-r border-slate-200 bg-slate-50/50 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Inquiries ({conversations.length})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {conversations.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`p-3 cursor-pointer transition flex gap-2.5 ${
                      isSelected
                        ? 'bg-orange-50/80 border-l-3 border-orange-500'
                        : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full ${
                        currentRole === 'student' ? 'bg-lime-600 text-white' : 'bg-orange-500 text-white'
                      } font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs`}
                    >
                      {getInitials(currentRole === 'student' ? conv.landlordName : conv.studentName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {currentRole === 'student' ? conv.landlordName : conv.studentName}
                        </h4>
                        <span className="text-[10px] text-slate-400">{conv.lastMessageTime}</span>
                      </div>
                      <p className="text-[11px] text-orange-700 truncate font-medium">
                        {conv.propertyTitle}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Chat View */}
          {activeConv ? (
            <div className="flex-1 flex flex-col bg-white min-w-0">
              {/* Chat Sub-Header */}
              <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full ${
                      currentRole === 'student' ? 'bg-lime-600 text-white' : 'bg-orange-500 text-white'
                    } font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs`}
                  >
                    {getInitials(currentRole === 'student' ? activeConv.landlordName : activeConv.studentName)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {currentRole === 'student' ? activeConv.landlordName : activeConv.studentName}
                    </h3>
                    <p className="text-[11px] text-orange-700 truncate max-w-xs sm:max-w-md font-medium">
                      {activeConv.propertyTitle} &bull; R{(activeConv.propertyPrice || 0).toLocaleString()}/mo
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 transition shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5 text-orange-600" />
                    <span>Schedule Viewing</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {activeMessages.map((msg) => {
                  const isMine =
                    (currentRole === 'student' && msg.senderRole === 'student') ||
                    (currentRole === 'landlord' && msg.senderRole === 'landlord');

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 max-w-[85%] ${
                        isMine ? 'ml-auto flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${
                          msg.senderRole === 'student' ? 'bg-orange-500 text-white' : 'bg-lime-600 text-white'
                        } font-bold text-[9px] flex items-center justify-center shrink-0 border border-slate-200 mt-1 shadow-2xs`}
                      >
                        {getInitials(msg.senderName || (msg.senderRole === 'student' ? 'Student' : 'Landlord'))}
                      </div>
                      <div className="space-y-0.5">
                        <div
                          className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                            isMine
                              ? 'bg-orange-500 text-white rounded-tr-none shadow-xs'
                              : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
                          }`}
                        >
                          <p>{msg.text}</p>

                          {/* Document attachment card */}
                          {msg.attachmentName && (
                            <div className={`mt-1.5 p-2 rounded-lg flex items-center gap-2 text-[11px] ${
                              isMine ? 'bg-orange-600 text-white' : 'bg-slate-50 border border-slate-200 text-lime-900'
                            }`}>
                              <FileText className="w-3.5 h-3.5 text-lime-600" />
                              <span className="font-semibold truncate">{msg.attachmentName}</span>
                              <span className="text-[9px] bg-lime-100 text-lime-900 border border-lime-300 px-1 rounded ml-auto">
                                Verified
                              </span>
                            </div>
                          )}

                          {/* Viewing Invite card */}
                          {msg.viewingInvite && (
                            <div className={`mt-2 p-2 rounded-lg border space-y-1 text-[11px] ${
                              isMine ? 'bg-orange-600 border-orange-400' : 'bg-slate-50 border-orange-200'
                            }`}>
                              <div className="flex items-center gap-1 font-bold">
                                <Calendar className="w-3 h-3 text-orange-300" />
                                <span>{msg.viewingInvite.type} Viewing Confirmed</span>
                              </div>
                              <p className={isMine ? 'text-orange-100' : 'text-slate-600'}>
                                Date: <strong>{msg.viewingInvite.date}</strong> at <strong>{msg.viewingInvite.time}</strong>
                              </p>
                              <span className="inline-block px-1.5 py-0.2 bg-lime-100 text-lime-900 border border-lime-300 rounded font-semibold text-[9px]">
                                Accepted &bull; Added to Calendar
                              </span>
                            </div>
                          )}
                        </div>

                        <div
                          className={`flex items-center gap-1 text-[10px] text-slate-400 ${
                            isMine ? 'justify-end' : ''
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {isMine && <CheckCheck className="w-3 h-3 text-orange-600" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Inquiry Suggestions */}
              <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[11px]">
                {[
                  'Is NSFAS accommodation allowance accepted?',
                  'Can I schedule a viewing this week?',
                  'What is the Wi-Fi speed & backup power setup?',
                  'Are there quiet study pods on the premises?',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-2.5 py-0.5 rounded-full bg-white hover:bg-slate-100 text-slate-600 shrink-0 border border-slate-200 transition shadow-xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSend}
                className="p-2.5 border-t border-slate-200 bg-white flex items-center gap-2"
              >
                {/* Document attachment quick button */}
                <div className="relative group">
                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 transition"
                    title="Attach Verified Document"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  {/* Dropdown to pick verified document */}
                  <div className="hidden group-hover:block absolute bottom-full left-0 mb-1.5 w-64 bg-white border border-slate-200 rounded-xl p-1.5 shadow-xl z-20 space-y-1 text-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-500 px-2 py-0.5">
                      Attach Verified Vault File
                    </p>
                    {studentProfile?.documents.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleSendDocument(d.name)}
                        className="w-full text-left p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 text-[11px] truncate flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-lime-600" />
                        <span className="truncate">{d.name}</span>
                      </button>
                    )) || (
                      <p className="text-[11px] text-slate-400 px-2 py-1">No documents uploaded yet</p>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type message or ask about rooms, move-in, deposit..."
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white transition shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a conversation to start messaging.
            </div>
          )}
        </div>

        {/* Schedule Viewing Modal Popup */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-4 space-y-3.5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  Schedule Accommodation Viewing
                </h3>
                <button onClick={() => setShowScheduleModal(false)}>
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Viewing Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['In-Person', 'Virtual Video Tour'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedViewingType(type as any)}
                        className={`p-2 rounded-lg border text-center font-bold transition ${
                          selectedViewingType === type
                            ? 'bg-orange-50 border-orange-400 text-orange-950 ring-1 ring-orange-400'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      value={selectedViewingDate}
                      onChange={(e) => setSelectedViewingDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-900 shadow-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Preferred Time</label>
                    <input
                      type="time"
                      value={selectedViewingTime}
                      onChange={(e) => setSelectedViewingTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-900 shadow-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleViewing}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs"
                >
                  Confirm & Send Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
