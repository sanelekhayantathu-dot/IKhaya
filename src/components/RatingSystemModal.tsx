import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  UserCheck, 
  Building, 
  ThumbsUp, 
  Sparkles,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { Accommodation, LandlordReview, TenantReview } from '../types';

interface RatingSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'landlord' | 'tenant';
  property?: Accommodation | null;
  tenantName?: string;
  reviewerName?: string;
  reviewerUniversity?: string;
  onSubmitLandlordReview?: (review: LandlordReview, propertyId: string) => void;
  onSubmitTenantReview?: (review: TenantReview) => void;
}

export const RatingSystemModal: React.FC<RatingSystemModalProps> = ({
  isOpen,
  onClose,
  targetType,
  property,
  tenantName = 'Student Tenant',
  reviewerName = 'Verified Student',
  reviewerUniversity = 'University Student',
  onSubmitLandlordReview,
  onSubmitTenantReview,
}) => {
  // Student reviewing Landlord state
  const [overallRating, setOverallRating] = useState(5);
  const [maintenanceRating, setMaintenanceRating] = useState(5);
  const [safetyRating, setSafetyRating] = useState(5);
  const [depositRating, setDepositRating] = useState(5);
  const [wifiRating, setWifiRating] = useState(5);
  const [noiseRating, setNoiseRating] = useState(5);
  const [comment, setComment] = useState('');
  const [roomType, setRoomType] = useState('Single En-suite');
  const [stayDuration, setStayDuration] = useState('Full Academic Year 2025/2026');

  // Landlord reviewing Tenant state
  const [paymentRating, setPaymentRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [rulesRating, setRulesRating] = useState(5);
  const [commRating, setCommRating] = useState(5);

  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (targetType === 'landlord' && property && onSubmitLandlordReview) {
      const review: LandlordReview = {
        id: `lr-${Date.now()}`,
        studentName: reviewerName,
        studentUniversity: reviewerUniversity,
        studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        date: 'Just now',
        rating: overallRating,
        categories: {
          maintenance: maintenanceRating,
          safety: safetyRating,
          depositFairness: depositRating,
          wifiReliability: wifiRating,
          noiseManagement: noiseRating,
        },
        comment: comment || 'Outstanding student accommodation! Landlord responds promptly to maintenance and the premises are ultra safe.',
        stayDuration,
        roomType,
        verifiedTenant: true,
        helpfulCount: 0,
      };

      onSubmitLandlordReview(review, property.id);
    } else if (targetType === 'tenant' && onSubmitTenantReview) {
      const review: TenantReview = {
        id: `tr-${Date.now()}`,
        landlordName: property?.landlord.name || 'Apex Student Living',
        propertyName: property?.title || 'Campus Key Residence',
        date: 'Just now',
        rating: overallRating,
        categories: {
          paymentPromptness: paymentRating,
          cleanliness: cleanlinessRating,
          houseRulesAdherence: rulesRating,
          communication: commRating,
        },
        comment: comment || 'Top tier student tenant. Always respected quiet hours and kept the accommodation in pristine condition.',
        stayDuration: 'Full Academic Year',
      };

      onSubmitTenantReview(review);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const renderStarSelector = (
    currentVal: number,
    setter: (val: number) => void,
    label: string
  ) => (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-700 font-medium">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setter(star)}
            className="p-0.5 text-slate-300 hover:text-amber-400 transition"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                star <= currentVal ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-mono font-bold text-amber-600 ml-1">{currentVal}.0</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {targetType === 'landlord'
                  ? 'Rate Landlord & Student Residence'
                  : `Rate Student Tenant: ${tenantName}`}
              </h2>
              <p className="text-[11px] text-slate-500">
                {targetType === 'landlord' ? property?.title : 'Verified Landlord Reference System'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-2.5">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Verified Review Published!</h3>
              <p className="text-xs text-slate-500">
                Thank you for contributing to safe and accountable student housing.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Overall Score */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center space-y-1.5 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Overall Score
                </span>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOverallRating(star)}
                      className="p-1 transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= overallRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-amber-700 font-mono">
                  {overallRating === 5
                    ? '5.0 - Exceptional Standard'
                    : overallRating === 4
                    ? '4.0 - Great Experience'
                    : overallRating === 3
                    ? '3.0 - Average'
                    : 'Requires Improvement'}
                </p>
              </div>

              {/* Categorical Ratings */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-0.5 shadow-xs">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-orange-700 mb-1.5">
                  Category Breakdown
                </h4>

                {targetType === 'landlord' ? (
                  <>
                    {renderStarSelector(maintenanceRating, setMaintenanceRating, 'Maintenance & Repairs Speed')}
                    {renderStarSelector(safetyRating, setSafetyRating, '24/7 Safety & Biometrics')}
                    {renderStarSelector(depositRating, setDepositRating, 'Deposit Refund Fairness')}
                    {renderStarSelector(wifiRating, setWifiRating, 'Wi-Fi & Backup Power Inverter')}
                    {renderStarSelector(noiseRating, setNoiseRating, 'Quiet Study Atmosphere')}
                  </>
                ) : (
                  <>
                    {renderStarSelector(paymentRating, setPaymentRating, 'Rent Timeliness / NSFAS Remittance')}
                    {renderStarSelector(cleanlinessRating, setCleanlinessRating, 'Room Care & Cleanliness')}
                    {renderStarSelector(rulesRating, setRulesRating, 'House Rules & Quiet Hours')}
                    {renderStarSelector(commRating, setCommRating, 'Courtesy & Communication')}
                  </>
                )}
              </div>

              {/* Written Review */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {targetType === 'landlord' ? 'Detailed Student Review' : 'Landlord Recommendation Note'}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    targetType === 'landlord'
                      ? 'Share your experience regarding maintenance, internet stability, noise levels, security...'
                      : 'Write a character reference regarding lease compliance, respect for property...'
                  }
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
                />
              </div>

              {/* Verified badge confirmation */}
              <div className="bg-lime-50 border border-lime-200 p-2 rounded-lg flex items-center gap-2 text-[11px] text-lime-900">
                <ShieldCheck className="w-3.5 h-3.5 text-lime-600 shrink-0" />
                <span>Verified feedback badge will be affixed to this profile.</span>
              </div>

              {/* Submit */}
              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition"
                >
                  Submit Verified Rating
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
