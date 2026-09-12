import React, { useState, useEffect } from 'react';
import {
  X,
  LifeBuoy,
  Send,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  GraduationCap,
  ExternalLink,
  MessageSquareText,
  Copy,
  Check
} from 'lucide-react';
import { UserProfile, StudentProfile } from '../types';
import { submitSupportTicket } from '../services/supportService';
import { SupportTicketData } from '../services/emailService';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  studentProfile?: StudentProfile | null;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  studentProfile,
}) => {
  const [role, setRole] = useState<'student' | 'landlord' | 'guest'>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Accommodation Booking & Placement');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicketData | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Initialize with user profile if available
  useEffect(() => {
    if (isOpen) {
      setSubmittedTicket(null);
      setErrorMessage('');
      setCopiedTicket(false);

      if (userProfile) {
        setFullName(userProfile.fullName || '');
        setEmail(userProfile.email || '');
        setPhone(userProfile.phone || '');
        setRole(userProfile.role === 'landlord' ? 'landlord' : 'student');
      } else if (studentProfile) {
        setFullName(studentProfile.fullName || '');
        setEmail(studentProfile.email || '');
        setPhone(studentProfile.phone || '');
        setRole('student');
      } else {
        setFullName('');
        setEmail('');
        setPhone('');
        setRole('student');
      }
      setSubject('');
      setMessage('');
      setCategory('Accommodation Booking & Placement');
      setUrgency('normal');
    }
  }, [isOpen, userProfile, studentProfile]);

  if (!isOpen) return null;

  const categories = [
    'Accommodation Booking & Placement',
    'NSFAS & Bursary Payment Inquiries',
    'Landlord Listing, Verification & Accreditation',
    'Room Maintenance & Residence Dispute',
    'Account, Login & Identity Verification',
    'Other General Assistance',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address so we can confirm and respond to you.');
      return;
    }
    if (!cleanSubject) {
      setErrorMessage('Please provide a brief subject for your support query.');
      return;
    }
    if (!cleanMessage || cleanMessage.length < 10) {
      setErrorMessage('Please describe your query in more detail (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const ticket = await submitSupportTicket({
        name: cleanName,
        email: cleanEmail,
        phone: phone.trim(),
        role,
        category,
        subject: cleanSubject,
        message: cleanMessage,
        urgency,
        university: userProfile?.university || studentProfile?.university,
      });

      setSubmittedTicket(ticket);
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Support submission error:', err);
      setErrorMessage('Failed to submit support query. Please try again or email support@ikhayaresliving.co.za directly.');
      setIsSubmitting(false);
    }
  };

  const copyTicketId = () => {
    if (submittedTicket) {
      navigator.clipboard.writeText(submittedTicket.ticketNumber);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-900">
        
        {/* Support Header */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-white shrink-0 shadow-xs">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Contact iKhaya Support</h3>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-lime-300" />
                  Active Desk
                </span>
              </div>
              <p className="text-xs text-orange-100 mt-0.5">
                We assist students and landlords nationwide &bull; Mon &ndash; Sat
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] text-white/90">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-orange-200" />
              <span>Direct: <strong className="font-mono text-white">support@ikhayaresliving.co.za</strong></span>
            </div>
            <span className="hidden sm:inline text-white/80">&bull; Confirmations sent automatically</span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6">
          {submittedTicket ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="space-y-4 text-center py-2 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-full bg-lime-100 text-lime-600 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Query Submitted Successfully!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Our support team has received your inquiry and a confirmation has been sent to your email.
                </p>
              </div>

              {/* Ticket Badge Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Ticket Reference:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                      #{submittedTicket.ticketNumber}
                    </span>
                    <button
                      type="button"
                      onClick={copyTicketId}
                      className="p-1 text-slate-400 hover:text-slate-600 transition"
                      title="Copy ticket number"
                    >
                      {copiedTicket ? <Check className="w-3.5 h-3.5 text-lime-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2 text-xs space-y-1 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination:</span>
                    <span className="font-mono text-[11px] font-semibold text-slate-800">support@ikhayaresliving.co.za</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Confirmation Sent To:</span>
                    <span className="font-mono text-[11px] font-semibold text-slate-800">{submittedTicket.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subject:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">{submittedTicket.subject}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200 text-[11px] text-orange-950 text-left flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>
                  Please check your inbox (or spam folder) for the automated confirmation receipt with your ticket summary. Our team aims to reply within 24 hours.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <a
                  href={`mailto:support@ikhayaresliving.co.za?subject=Support Query %23${submittedTicket.ticketNumber} - ${encodeURIComponent(submittedTicket.subject)}`}
                  className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Email App</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* SUPPORT QUERY SUBMISSION FORM */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Role Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  I am reaching out as a:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                      role === 'student'
                        ? 'bg-orange-50 border-orange-400 text-orange-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student / Parent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('landlord')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                      role === 'landlord'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Landlord / Host</span>
                  </button>
                </div>
              </div>

              {/* Name & Email Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First & Last Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500 transition"
                  />
                  <span className="text-[10px] text-slate-400">Confirmation receipt sent here</span>
                </div>
              </div>

              {/* Category & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500 transition cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+27 70 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Assistance with lease agreement or room booking"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500 transition"
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    What do you need help with? *
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {message.length} chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe what you need assistance with in detail (e.g. campus location, accommodation name, lease query, or landlord accreditation)..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500 transition resize-none"
                />
              </div>

              {/* Notice & Destination */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Will be received by: <strong className="text-slate-900">support@ikhayaresliving.co.za</strong></span>
                </div>
                <div className="flex items-center gap-1 text-lime-700 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Query...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Query to Support</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
