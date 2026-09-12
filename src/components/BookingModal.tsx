import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Calendar, 
  CreditCard, 
  FileCheck2, 
  CheckCircle2, 
  User, 
  GraduationCap, 
  Building, 
  Clock, 
  UploadCloud, 
  Lock, 
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Accommodation, RoomOption, StudentProfile, LeaseDuration, BookingApplication } from '../types';

interface BookingModalProps {
  property: Accommodation | null;
  initialRoom?: RoomOption;
  studentProfile: StudentProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitBooking: (application: BookingApplication) => void;
  onViewApplications?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  property,
  initialRoom,
  studentProfile,
  isOpen,
  onClose,
  onSubmitBooking,
  onViewApplications,
}) => {
  const fallbackRoom: RoomOption = {
    id: property ? `room-${property.id}-1` : 'room-fallback',
    name: 'Standard Private Room',
    type: property?.type || 'Single Studio',
    pricePerMonth: property?.priceFrom || 5000,
    deposit: property?.depositAmount || 5000,
    isAvailable: true,
    availableCount: 1,
    features: ['High-Speed Wi-Fi', 'Study Desk'],
    image: property?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
  };

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedRoom, setSelectedRoom] = useState<RoomOption>(
    initialRoom || property?.rooms?.[0] || fallbackRoom
  );
  const [moveInDate, setMoveInDate] = useState('2026-02-01');
  const [leaseDuration, setLeaseDuration] = useState<LeaseDuration>('Full Academic Year (10-12 Mo)');
  const [fundingType, setFundingType] = useState<'NSFAS' | 'Bursary' | 'Private'>(
    studentProfile?.fundingType === 'NSFAS' ? 'NSFAS' : 'Private'
  );
  const [specialNotes, setSpecialNotes] = useState('');
  const [guestName, setGuestName] = useState(studentProfile?.fullName || 'Student Applicant');
  const [guestEmail, setGuestEmail] = useState(studentProfile?.email || 'student@university.ac.za');
  const [guestPhone, setGuestPhone] = useState(studentProfile?.phone || '+27 82 000 0000');
  const [attachedDocIds, setAttachedDocIds] = useState<string[]>(
    studentProfile?.documents?.map((d) => d.id) || ['doc-1', 'doc-2']
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isOpen || !property) return null;

  const toggleDocAttachment = (docId: string) => {
    setAttachedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newApplication: BookingApplication = {
        id: `app-${Date.now()}`,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImage: property.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        landlordId: property.landlordId || property.landlord?.id || '',
        roomId: selectedRoom?.id || fallbackRoom.id,
        roomName: selectedRoom?.name || fallbackRoom.name,
        monthlyRent: selectedRoom?.pricePerMonth ?? property.priceFrom,
        deposit: selectedRoom?.deposit ?? property.depositAmount,
        studentId: studentProfile?.id || 'std-guest',
        studentName: studentProfile?.fullName || guestName,
        studentEmail: studentProfile?.email || guestEmail,
        studentPhone: studentProfile?.phone || guestPhone,
        studentUniversity: studentProfile?.university || 'University of the Witwatersrand',
        fundingType: fundingType === 'NSFAS' ? 'NSFAS Accredited Allowance' : fundingType,
        moveInDate,
        leaseDuration,
        status: 'Pending Review',
        appliedDate: new Date().toISOString().split('T')[0],
        documentsAttached: attachedDocIds,
        specialNotes,
      };

      onSubmitBooking(newApplication);
      setIsSubmitting(false);
      setIsConfirmed(true);

      // Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Student Rental Application & Booking</h2>
              <p className="text-xs text-slate-500">{property.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Step Progress Bar */}
        {!isConfirmed && (
          <div className="bg-slate-50 px-5 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
            {[
              { num: 1, label: 'Room & Dates' },
              { num: 2, label: 'Funding & Student Info' },
              { num: 3, label: 'Document Vault' },
              { num: 4, label: 'Confirm & Submit' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 ${
                  step === s.num
                    ? 'text-orange-600 font-bold'
                    : step > s.num
                    ? 'text-lime-800 font-bold'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step === s.num
                      ? 'bg-orange-500 text-white font-bold'
                      : step > s.num
                      ? 'bg-lime-100 text-lime-900 border border-lime-300 font-bold'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6">
          {isConfirmed ? (
            /* Confirmation Screen */
            <div className="text-center py-5 space-y-3.5 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-full bg-lime-50 text-lime-600 border border-lime-200 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Application Successfully Submitted!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your application for <strong>{selectedRoom?.name || 'Selected Room'}</strong> at <strong>{property.title}</strong> has been transmitted directly to <strong>{property.landlord?.name || 'Housing Provider'}</strong> with your verified documents attached.
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2 shadow-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Rent:</span>
                  <strong className="text-slate-900 font-mono">R{(selectedRoom?.pricePerMonth || property.priceFrom || 0).toLocaleString()}/mo</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Move-In Date:</span>
                  <strong className="text-slate-900">{moveInDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Documents Attached:</span>
                  <strong className="text-lime-800">{attachedDocIds.length} Verified Files</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Landlord Response Time:</span>
                  <strong className="text-orange-600">{property.landlord?.responseTime || 'Under 24h'}</strong>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-view-my-applications-modal"
                  onClick={() => {
                    onClose();
                    if (onViewApplications) {
                      onViewApplications();
                    }
                  }}
                  className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  View Rental Applications
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: ROOM & DATES */}
              {step === 1 && (
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Choose Room Option
                    </label>
                    <div className="space-y-2">
                      {(property.rooms && property.rooms.length > 0 ? property.rooms : [fallbackRoom]).map((room) => (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            selectedRoom?.id === room.id
                              ? 'bg-orange-50/70 border-orange-500 shadow-xs ring-1 ring-orange-400'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{room.name}</span>
                              <span className="text-[10px] text-orange-700 uppercase font-semibold px-1.5 py-0.2 bg-orange-50 border border-orange-200 rounded">
                                {room.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Deposit: R{(room.deposit || 0).toLocaleString()} &bull; {room.availableCount || 1} rooms available
                            </p>
                          </div>
                          <span className="text-sm font-bold text-orange-600 font-mono">
                            R{(room.pricePerMonth || 0).toLocaleString()}
                            <span className="text-xs font-normal text-slate-500">/mo</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Move-in Date</label>
                      <input
                        type="date"
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Lease Period</label>
                      <select
                        value={leaseDuration}
                        onChange={(e) => setLeaseDuration(e.target.value as LeaseDuration)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
                      >
                        <option value="Full Academic Year (10-12 Mo)">Full Academic Year (10-12 Mo)</option>
                        <option value="One Semester (5-6 Mo)">One Semester (5-6 Mo)</option>
                        <option value="Short Stay / Summer">Short Stay / Summer</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: FUNDING & STUDENT INFO */}
              {step === 2 && (
                <div className="space-y-3.5">
                  {studentProfile ? (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
                      <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs border border-orange-300">
                        {studentProfile.fullName ? studentProfile.fullName.slice(0, 2).toUpperCase() : 'ST'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{studentProfile.fullName || 'Student'}</h4>
                        <p className="text-[11px] text-slate-500">
                          {studentProfile.university || 'University'} &bull; Student #{studentProfile.studentNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700">Full Name</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                          placeholder="e.g. Sipho Sithole"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700">Email Address</label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                          placeholder="e.g. sipho@students.wits.ac.za"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Payment / Funding Source
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'NSFAS', label: 'NSFAS Allowance', desc: 'Direct bursary remittance' },
                        { id: 'Bursary', label: 'Private Bursary', desc: 'Corporate / Trust sponsor' },
                        { id: 'Private', label: 'Self / Parent Funded', desc: 'Monthly debit order / EFT' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFundingType(f.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            fundingType === f.id
                              ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold ring-1 ring-orange-400'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold block">{f.label}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{f.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Special Requests / Notes to Landlord (Optional)
                    </label>
                    <textarea
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="e.g. Request quiet top floor room, parking space needed, roommate preferences..."
                      rows={3}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: DOCUMENT VAULT ATTACHMENTS */}
              {step === 3 && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-lime-600" />
                        Attach Verified Rental Documents
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Landlords prioritize applicants with pre-verified ID and funding letters.
                      </p>
                    </div>
                    <span className="text-xs text-lime-900 font-bold bg-lime-100 px-2 py-0.5 rounded border border-lime-300">
                      {attachedDocIds.length} Attached
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {(studentProfile?.documents || [
                      { id: 'doc-1', name: 'South African ID Document / Passport', fileSize: '1.2 MB', status: 'Verified' },
                      { id: 'doc-2', name: 'University Proof of Registration 2026', fileSize: '850 KB', status: 'Verified' },
                      { id: 'doc-3', name: 'NSFAS Bursary Provision Letter', fileSize: '620 KB', status: 'Verified' },
                    ]).map((doc) => {
                      const isAttached = attachedDocIds.includes(doc.id);
                      return (
                        <div
                          key={doc.id}
                          onClick={() => toggleDocAttachment(doc.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                            isAttached
                              ? 'bg-lime-50/60 border-lime-300 text-slate-900'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isAttached}
                              onChange={() => toggleDocAttachment(doc.id)}
                              className="w-3.5 h-3.5 accent-lime-600 rounded"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{doc.name}</p>
                              <span className="text-[10px] text-slate-500">
                                {doc.fileSize} &bull; Status: <strong className="text-lime-800">{doc.status}</strong>
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-lime-900 bg-lime-100 px-2 py-0.5 rounded border border-lime-300 font-semibold">
                            Verified
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & CONFIRM */}
              {step === 4 && (
                <div className="space-y-3.5">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Application Financial Summary
                    </h4>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Room Type:</span>
                        <strong className="text-slate-900">{selectedRoom?.name || fallbackRoom.name}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Monthly Rent (Inclusive of Utilities & Wi-Fi):</span>
                        <strong className="text-slate-900 font-mono">R{(selectedRoom?.pricePerMonth ?? property.priceFrom ?? 0).toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Security Deposit (Refundable):</span>
                        <strong className="text-slate-900 font-mono">R{(selectedRoom?.deposit ?? property.depositAmount ?? 0).toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Portal Application & Processing Fee:</span>
                        <strong className="text-lime-800 font-bold">R0.00 (Free for Students)</strong>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-xs sm:text-sm">
                        <span className="text-slate-900">Total Initial Value:</span>
                        <span className="text-orange-600 font-mono font-bold">
                          R{((selectedRoom?.pricePerMonth ?? property.priceFrom ?? 0) + (selectedRoom?.deposit ?? property.depositAmount ?? 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50/70 border border-orange-200 p-2.5 rounded-lg flex items-start gap-2 text-xs text-orange-950">
                    <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>
                      Your application will be instantly delivered to the verified landlord. Once accepted, digital lease signing and payment escrow will be initiated securely.
                    </span>
                  </div>
                </div>
              )}

              {/* Modal Step Navigation Footer */}
              <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    onClick={() => setStep((prev) => (prev - 1) as any)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    onClick={() => setStep((prev) => (prev + 1) as any)}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    id="submit-rental-application-btn"
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-lime-600 hover:bg-lime-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    {isSubmitting ? (
                      <span>Transmitting Application...</span>
                    ) : (
                      <>
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Submit Rental Application</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
