import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  GraduationCap, 
  Zap, 
  ShieldCheck, 
  Star, 
  Check, 
  Calendar, 
  MessageSquare, 
  Bus, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Heart,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building,
  UserCheck,
  ThumbsUp,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { Accommodation, RoomOption } from '../types';
import { getAmenityDetails } from '../utils/amenityIcons';

interface PropertyDetailModalProps {
  property: Accommodation | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onInstantBook: (property: Accommodation, selectedRoom?: RoomOption) => void;
  onDirectMessage: (property: Accommodation) => void;
  onOpenRatingModal: (property: Accommodation) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onInstantBook,
  onDirectMessage,
  onOpenRatingModal,
}) => {
  const fallbackRoom: RoomOption = {
    id: property ? `room-${property.id}-1` : 'room-fallback',
    name: 'Standard Room',
    type: property?.type || 'Single Studio',
    pricePerMonth: property?.priceFrom || 5000,
    deposit: property?.depositAmount || 5000,
    isAvailable: true,
    availableCount: 1,
    features: ['Wi-Fi', 'Study Station'],
    image: property?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
  };

  const imagesList = property?.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'];

  const roomsList = property?.rooms || [];
  const amenitiesList = property?.amenities || [];
  const universitiesList = property?.universities || [];
  const landlordReviews = property?.landlord?.reviews || [];
  const totalReviews = property?.landlord?.totalReviews ?? landlordReviews.length;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<RoomOption>(
    roomsList[0] || fallbackRoom
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'proximity' | 'reviews'>('overview');

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition shadow-2xs"
              title="Return to search listings"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Listings</span>
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700 px-2 py-0.5 bg-orange-50 rounded border border-orange-200">
              {property.type}
            </span>
            {property.nsfasAccredited && (
              <span className="text-xs font-bold text-lime-900 px-2 py-0.5 bg-lime-100 rounded border border-lime-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-lime-700" />
                NSFAS Accredited
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(property.id)}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition shadow-xs"
              title="Save property"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition shadow-xs"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Title & Location Banner */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                {property.title}
              </h1>
              <div className="text-right">
                <span className="text-[11px] text-slate-500">Monthly Rent from</span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  R{(property.priceFrom || 0).toLocaleString()}
                  <span className="text-xs font-normal text-slate-500"> /mo</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>{property.streetAddress}, {property.suburb}, {property.town}</span>
            </p>
          </div>

          {/* Photo Gallery Grid with Back Button directly ON THE PICTURE */}
          <div className="space-y-2">
            <div className="relative aspect-16/9 md:aspect-21/9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs group">
              <img
                src={imagesList[activeImageIndex] || imagesList[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />

              {/* Back Button on Picture */}
              <button
                id="picture-back-button"
                onClick={onClose}
                className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md transition-all shadow-lg hover:scale-105 border border-white/20"
                title="Go back to residences list"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              {/* Photo Carousel Controls */}
              {imagesList.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-3 pointer-events-none">
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length)}
                    className="pointer-events-auto p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-xs transition shadow-md"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % imagesList.length)}
                    className="pointer-events-auto p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-xs transition shadow-md"
                    title="Next photo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Photo Counter Badge */}
              <div className="absolute bottom-3.5 right-3.5 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[11px] font-bold backdrop-blur-xs border border-white/20">
                {activeImageIndex + 1} / {imagesList.length}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagesList.map((img, i) => (
                <button
                  key={`thumb-${i}`}
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                    i === activeImageIndex ? 'border-orange-500 scale-102 shadow-xs' : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 gap-2 sm:gap-6 text-xs sm:text-sm font-semibold">
            {[
              { id: 'overview', label: 'Overview & Amenities' },
              { id: 'rooms', label: `Available Rooms (${roomsList.length})` },
              { id: 'proximity', label: 'University Proximity' },
              { id: 'reviews', label: `Landlord & Reviews (${totalReviews})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 text-xs sm:text-sm font-semibold transition border-b-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Highlights bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">NSFAS Status</span>
                  <p className="text-xs font-bold text-lime-800 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-lime-600" />
                    {property.nsfasAccredited ? '100% Accredited' : 'Private Only'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Power Supply</span>
                  <p className="text-xs font-bold text-amber-700 mt-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    {property.hasBackupPower ? 'Solar & Inverter' : 'Standard Grid'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Bills Policy</span>
                  <p className="text-xs font-bold text-lime-800 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-lime-600" />
                    {property.allBillsIncluded ? 'Water & Elec Included' : 'Prepaid Meter'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Gender Policy</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {property.genderPolicy} Accommodation
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">About this Residence</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {property.tagline}. Located right in the heart of {property.suburb}, this residence is built specifically for tertiary students who need a quiet, secure, and modern environment with high-speed internet, dedicated study pods, and 24-hour backup power.
                </p>
              </div>

              {/* Full Amenities with Detailed Descriptions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Included Amenities & Facilities ({amenitiesList.length})
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Verified building provisions
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {amenitiesList.map((amenity, idx) => {
                    const config = getAmenityDetails(amenity);
                    const IconComp = config.icon;
                    return (
                      <div
                        key={`amenity-${idx}`}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg border ${config.bgClass} ${config.borderClass} ${config.colorClass}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-900">{amenity}</span>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shrink-0">
                            {config.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed pl-8">
                          {config.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROOMS */}
          {activeTab === 'rooms' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-slate-500">
                Choose a room option below to calculate monthly rental deposit and start your direct application.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(roomsList.length > 0 ? roomsList : [fallbackRoom]).map((room, idx) => {
                  const isSelected = selectedRoom?.id === room.id;
                  return (
                    <div
                      key={room.id || `room-${idx}`}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900">{room.name}</h4>
                          <span className="text-xs font-bold text-orange-700 font-mono">
                            R{(room.pricePerMonth || 0).toLocaleString()} /mo
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{room.description}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {room.availableBeds || 1} beds available
                          </span>
                          {room.nsfasCovered && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-lime-100 text-lime-900 border border-lime-300">
                              NSFAS Rate Approved
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500 font-medium">
                          Deposit: R{(room.deposit || 0).toLocaleString()}
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-orange-600 bg-orange-600' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PROXIMITY */}
          {activeTab === 'proximity' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-sm font-bold text-slate-900">Proximity to University Campuses</h3>
              <div className="space-y-2.5">
                {universitiesList.map((uni, idx) => (
                  <div key={`uni-${idx}`} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-orange-600 shrink-0" />
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{uni.universityName}</h4>
                      </div>
                      <p className="text-xs text-slate-500 pl-6">{uni.campusName} &bull; {uni.transitNotes}</p>
                    </div>

                    <div className="flex items-center gap-3 pl-6 sm:pl-0">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Walking</span>
                        <p className="text-xs font-bold text-lime-700">{uni.walkingTimeMin} mins ({uni.distanceKm} km)</p>
                      </div>
                      {uni.shuttleTimeMin && (
                        <div className="text-right border-l border-slate-200 pl-3">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Shuttle</span>
                          <p className="text-xs font-bold text-orange-700">{uni.shuttleTimeMin} mins</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Landlord Header */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={property.landlord?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={property.landlord?.name || 'Landlord'}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{property.landlord?.name || 'Accredited Landlord'}</h4>
                    <p className="text-xs text-slate-500">Accredited Property Host &bull; {property.landlord?.responseRate || 98}% response rate</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-600 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{(property.landlord?.overallRating || 4.9).toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{totalReviews} verified reviews</span>
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-2.5">
                {landlordReviews.map((rev, idx) => (
                  <div key={rev.id || `rev-${idx}`} className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={rev.studentName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{rev.studentName}</span>
                            {rev.verifiedTenant && (
                              <span className="text-[9px] text-lime-900 bg-lime-100 px-1 py-0.2 rounded font-semibold border border-lime-300">
                                Verified Resident
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">{rev.studentUniversity} &bull; {rev.stayDuration}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{rev.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Fixed Action Bar with Enhanced Visibility */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-500">Selected Room: </span>
            <strong className="text-xs sm:text-sm text-slate-900 font-bold">{selectedRoom?.name || property.rooms?.[0]?.name || fallbackRoom.name}</strong>
            <span className="text-xs text-orange-600 font-mono font-bold ml-2">
              (R{(selectedRoom?.pricePerMonth || property.priceFrom || 0).toLocaleString()}/mo)
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Highly Visible Message Host Button */}
            <button
              id="detail-direct-message-btn"
              onClick={() => onDirectMessage(property)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border-2 border-orange-300 text-xs sm:text-sm font-bold transition shadow-2xs group"
            >
              <MessageSquare className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
              <span>Message Landlord</span>
            </button>

            {/* Apply & Secure Room Button */}
            <button
              id="detail-instant-book-btn"
              onClick={() => onInstantBook(property, selectedRoom)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-xs transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Apply & Secure Room</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
