import React, { useState, useRef } from 'react';
import { 
  X, 
  Building, 
  MapPin, 
  GraduationCap, 
  Zap, 
  ShieldCheck, 
  Plus, 
  Sparkles,
  Bed,
  CheckCircle2,
  DollarSign,
  Image as ImageIcon,
  Upload,
  Trash2,
  Star,
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react';
import { Accommodation, RoomOption, AccommodationType, GenderPolicy, UserProfile } from '../types';
import { UNIVERSITIES_LIST, TOWNS_LIST, AMENITIES_CATALOG } from '../data/mockData';
import { compressImageFile } from '../utils/imageCompressor';

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccommodation: (accommodation: Accommodation) => void;
  userProfile?: UserProfile | null;
}

const PRESET_HOUSE_RULES = [
  'Strict quiet study hours (22:00 – 06:00)',
  'No smoking inside rooms, bathrooms or corridors',
  'No unauthorized overnight visitors without prior approval',
  'Biometric visitor check-in required at gate',
  'Keep communal kitchens and study pods clean after use',
  'No unauthorized high-wattage electric heaters or stoves',
  'No parties or loud sound systems on residence premises',
  'No pets permitted inside accommodation units',
];

const MAX_IMAGES = 5;

export const AddListingModal: React.FC<AddListingModalProps> = ({
  isOpen,
  onClose,
  onAddAccommodation,
  userProfile,
}) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [town, setTown] = useState(TOWNS_LIST[0]);
  const [suburb, setSuburb] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [priceFrom, setPriceFrom] = useState(5500);
  const [depositAmount, setDepositAmount] = useState(5500);
  const [type, setType] = useState<AccommodationType>('Single Studio');
  const [genderPolicy, setGenderPolicy] = useState<GenderPolicy>('Mixed');
  const [nsfasAccredited, setNsfasAccredited] = useState(true);
  const [hasBackupPower, setHasBackupPower] = useState(true);
  const [allBillsIncluded, setAllBillsIncluded] = useState(true);
  const [totalBeds, setTotalBeds] = useState(40);
  const [selectedUniversity, setSelectedUniversity] = useState(UNIVERSITIES_LIST[0]);
  const [distanceKm, setDistanceKm] = useState(0.8);
  const [walkingTimeMin, setWalkingTimeMin] = useState(9);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    '500Mbps Fibre Wi-Fi',
    'Solar & Inverter Backup Power',
    '24/7 Biometric Access & Guard',
    'Free On-site Laundry Machines',
    'Silent Study Labs & Pods',
    'Water & Electricity Included',
  ]);
  const [description, setDescription] = useState('');

  // House Rules state
  const [houseRules, setHouseRules] = useState<string[]>([
    'Strict quiet study hours (22:00 – 06:00)',
    'No smoking inside rooms, bathrooms or corridors',
    'Biometric visitor check-in required at gate',
    'Keep communal kitchens and study pods clean after use'
  ]);
  const [customRuleInput, setCustomRuleInput] = useState('');

  // Image upload states (Max 5 images including cover) - Starts with no default images
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const toggleAmenity = (name: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleTogglePresetRule = (rule: string) => {
    setHouseRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]
    );
  };

  const handleAddCustomRule = () => {
    const trimmed = customRuleInput.trim();
    if (!trimmed) return;
    if (!houseRules.includes(trimmed)) {
      setHouseRules((prev) => [...prev, trimmed]);
    }
    setCustomRuleInput('');
  };

  const handleRemoveRule = (ruleToRemove: string) => {
    setHouseRules((prev) => prev.filter((r) => r !== ruleToRemove));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const countToProcess = Math.min(files.length, remainingSlots);
    const filesArray = (Array.from(files) as File[]).slice(0, countToProcess);

    for (const file of filesArray) {
      try {
        const compressedBase64 = await compressImageFile(file, 960, 0.7);
        if (compressedBase64) {
          setImages((prev) => {
            if (prev.length >= MAX_IMAGES) return prev;
            return [...prev, compressedBase64];
          });
          setImageError('');
        }
      } catch (err) {
        console.warn('Image processing error:', err);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim() || images.length >= MAX_IMAGES) return;
    setImages((prev) => (prev.length < MAX_IMAGES ? [...prev, imageUrlInput.trim()] : prev));
    setImageUrlInput('');
    setImageError('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCoverImage = (index: number) => {
    setImages((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, idx) => idx !== index);
      return [item, ...rest];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (images.length === 0) {
      setImageError('Please upload at least one photo of the accommodation before submitting.');
      return;
    }
    setImageError('');

    const finalImages = images.slice(0, MAX_IMAGES);

    const newAccommodation: Accommodation = {
      id: `prop-${Date.now()}`,
      title,
      slug: (title || `prop-${Date.now()}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: tagline || 'Newly listed premium accredited student accommodation',
      town,
      suburb: suburb || 'University Hub',
      streetAddress: streetAddress || 'Campus Road',
      priceFrom,
      priceTo: priceFrom + 2000,
      depositAmount,
      images: finalImages,
      nsfasAccredited,
      bursaryAccepted: [true, true, true],
      allBillsIncluded,
      hasBackupPower,
      type,
      genderPolicy,
      featured: false,
      verifiedListing: false,
      approvalStatus: 'Pending Approval',
      moderationNotes: 'Awaiting administrative verification and campus accreditation review.',
      viewsCount: 0,
      inquiriesCount: 0,
      applicationsCount: 0,
      instantBookAvailable: true,
      totalBeds,
      availableBeds: Math.round(totalBeds * 0.2) || 4,
      coordinates: { lat: -33.95, lng: 18.47 },
      universities: [
        {
          universityName: selectedUniversity,
          campusName: 'Main Campus',
          distanceKm,
          walkingTimeMin,
          transitNotes: `Direct ${walkingTimeMin} min walking route to main lecture halls and library`,
        },
      ],
      amenities: selectedAmenities,
      rooms: [
        {
          id: `room-${Date.now()}-1`,
          name: 'Standard Private En-suite Room',
          type,
          pricePerMonth: priceFrom,
          deposit: depositAmount,
          isAvailable: true,
          availableCount: 4,
          features: ['Private En-suite Bathroom', 'High-Speed Wi-Fi', 'Study Station', 'Double Wardrobe'],
          image: finalImages[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        },
      ],
      landlordId: userProfile?.id || 'demo-landlord-sibusiso',
      landlord: {
        id: userProfile?.id || 'demo-landlord-sibusiso',
        name: userProfile?.fullName || 'Accredited Housing Provider',
        agencyName: userProfile?.agencyName || 'Campus Housing Group',
        avatar: userProfile?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        phone: userProfile?.phone || '+27 82 555 1234',
        email: userProfile?.email || 'landlord@resi24.co.za',
        isVerified: false,
        responseTime: 'Under 15 mins',
        responseRate: '100%',
        memberSince: '2026',
        overallRating: 5.0,
        totalReviews: 0,
        badges: ['Accredited Landlord'],
        reviews: [],
      },
      houseRules: houseRules.length > 0 ? houseRules : [
        'Strict quiet study hours (22:00 – 06:00)',
        'No smoking inside units',
        'Biometric check-in for visitors',
      ],
      securityFeatures: [
        '24/7 Monitored Biometric Gate Access',
        'CCTV coverage across all corridors',
        'Armed reaction link',
      ],
      description: description || `${title} offers modern student living in ${suburb}, close to ${selectedUniversity}. Featuring backup solar power and uncapped Wi-Fi.`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddAccommodation(newAccommodation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-900 max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">List New Student Accommodation</h2>
              <p className="text-xs text-slate-500">Post verified residence listing on iKhaya Student Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition shadow-xs">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Residence / Property Name *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Peak Student Village, Rondebosch"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Short Catchy Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Modern en-suite rooms with backup solar power & uncapped fibre"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Town / Region</label>
              <select
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
              >
                {TOWNS_LIST.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Suburb</label>
              <input
                type="text"
                required
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                placeholder="e.g. Rondebosch, Braamfontein, Hatfield"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PHOTO UPLOAD & IMAGE GALLERY SECTION */}
          {/* ========================================================================= */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Accommodation Photos & Gallery</h4>
                  <p className="text-[11px] text-slate-500">Upload up to 5 photos of rooms, study areas, and facade (Cover photo + 4 gallery)</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  images.length >= MAX_IMAGES 
                    ? 'text-lime-900 bg-lime-100 border border-lime-300' 
                    : 'text-orange-700 bg-orange-100/70'
                }`}>
                  {images.length} / {MAX_IMAGES} Photos
                </span>
                {images.length >= MAX_IMAGES && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                    Limit Reached
                  </span>
                )}
              </div>
            </div>

            {/* Upload Buttons & File Drop */}
            {images.length < MAX_IMAGES ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* File Upload Box */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="listing-photo-upload"
                />
                <label
                  htmlFor="listing-photo-upload"
                  className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-xl bg-white hover:bg-orange-50/40 cursor-pointer transition text-center group"
                >
                  <Upload className="w-5 h-5 text-orange-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800">Browse or Drop Photos</span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, WebP from device ({MAX_IMAGES - images.length} slots left)</span>
                </label>

                {/* URL Input Box */}
                <div className="flex flex-col justify-between p-3 border border-slate-200 rounded-xl bg-white space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-slate-400" />
                    Or Add Picture URL
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shrink-0 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-lime-50 border border-lime-200 rounded-xl text-center">
                <p className="text-xs font-bold text-lime-900">
                  Maximum photo limit of 5 reached (Cover photo + 4 gallery photos).
                </p>
                <p className="text-[11px] text-lime-700">
                  You can reorder or remove any photo below to replace it.
                </p>
              </div>
            )}

            {imageError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Empty State when no photos uploaded */}
            {images.length === 0 && (
              <div className="p-5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center space-y-1">
                <ImageIcon className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No accommodation pictures uploaded yet</p>
                <p className="text-[11px] text-slate-500">
                  Please upload photos from your device or paste a URL above. No default photos will be added.
                </p>
              </div>
            )}

            {/* Photo Previews Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {images.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-4/3 shadow-2xs">
                    <img
                      src={imgUrl}
                      alt={`Residence upload ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    />
                    
                    {/* Cover badge */}
                    {idx === 0 ? (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-orange-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCoverImage(idx)}
                        className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 hover:bg-orange-600 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition shadow-xs"
                      >
                        Set Cover
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow-xs"
                      title="Remove photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* University Proximity Setup */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-700 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
              University Proximity & Walking Distance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-3">
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Primary University</label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 shadow-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  {UNIVERSITIES_LIST.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 shadow-xs font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Walking Time (Mins)</label>
                <input
                  type="number"
                  value={walkingTimeMin}
                  onChange={(e) => setWalkingTimeMin(parseInt(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 shadow-xs font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Total Beds Count</label>
                <input
                  type="number"
                  value={totalBeds}
                  onChange={(e) => setTotalBeds(parseInt(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 shadow-xs font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Policy */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Monthly Rent (ZAR) *</label>
              <input
                type="number"
                value={priceFrom}
                onChange={(e) => setPriceFrom(parseInt(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono shadow-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Deposit Amount (ZAR)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseInt(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono shadow-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Room Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 shadow-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="Single Studio">Single Studio</option>
                <option value="En-suite Room">En-suite Room</option>
                <option value="Shared 2-Bed">Shared 2-Bed</option>
                <option value="Cluster Apartment">Cluster Apartment</option>
                <option value="Bachelor Flat">Bachelor Flat</option>
              </select>
            </div>
          </div>

          {/* Toggles (NSFAS, Backup Power, All Bills) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer shadow-xs">
              <input
                type="checkbox"
                checked={nsfasAccredited}
                onChange={(e) => setNsfasAccredited(e.target.checked)}
                className="w-4 h-4 accent-lime-600 rounded"
              />
              <span className="text-xs font-semibold text-lime-900">NSFAS Accredited</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer shadow-xs">
              <input
                type="checkbox"
                checked={hasBackupPower}
                onChange={(e) => setHasBackupPower(e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded"
              />
              <span className="text-xs font-semibold text-orange-950">Backup Solar / Inverter</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer shadow-xs">
              <input
                type="checkbox"
                checked={allBillsIncluded}
                onChange={(e) => setAllBillsIncluded(e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded"
              />
              <span className="text-xs font-semibold text-orange-950">All Bills Included</span>
            </label>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Detailed Residence Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the atmosphere, study labs, safety features, security turnstiles, and transport links..."
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
            />
          </div>

          {/* House Rules & Code of Conduct */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Accommodation House Rules & Code of Conduct</h4>
                  <p className="text-[11px] text-slate-500">Set clear residency guidelines for student occupants</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded-md">
                {houseRules.length} {houseRules.length === 1 ? 'Rule' : 'Rules'} Active
              </span>
            </div>

            {/* Quick Presets Chips */}
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                Suggested Common Rules:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_HOUSE_RULES.map((rule, idx) => {
                  const isSelected = houseRules.includes(rule);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTogglePresetRule(rule)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition ${
                        isSelected
                          ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-3 h-3 text-orange-600 shrink-0" />
                      ) : (
                        <Plus className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                      <span>{rule}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Rule Input */}
            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={customRuleInput}
                onChange={(e) => setCustomRuleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomRule();
                  }
                }}
                placeholder="e.g. Visitors must sign out before 23:00 on weekdays"
                className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomRule}
                disabled={!customRuleInput.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold shrink-0 transition flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span>Add Rule</span>
              </button>
            </div>

            {/* Active Rules List */}
            {houseRules.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Configured House Rules:
                </span>
                <div className="space-y-1">
                  {houseRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-lime-600 shrink-0" />
                        <span className="text-slate-800 font-medium truncate">{rule}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(rule)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition opacity-60 group-hover:opacity-100"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Amenities Grid */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Select Available Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {AMENITIES_CATALOG.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggleAmenity(item.name)}
                  className={`p-2 rounded-lg border text-left text-xs transition flex items-center gap-1.5 ${
                    selectedAmenities.includes(item.name)
                      ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${selectedAmenities.includes(item.name) ? 'text-orange-600' : 'text-slate-300'}`} />
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Publish Student Accommodation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
