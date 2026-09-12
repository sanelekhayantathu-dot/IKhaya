import React, { useState } from 'react';
import { 
  MapPin, 
  GraduationCap, 
  ShieldCheck, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Calendar, 
  Sparkles,
  Plus
} from 'lucide-react';
import { Accommodation } from '../types';
import { getAmenityDetails } from '../utils/amenityIcons';

interface PropertyCardProps {
  property: Accommodation;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onSelectProperty: (property: Accommodation) => void;
  onInstantBook: (property: Accommodation) => void;
  onDirectMessage: (property: Accommodation) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isSaved,
  onToggleSave,
  onSelectProperty,
  onInstantBook,
  onDirectMessage,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imagesList = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  const primaryUniversity = property.universities?.[0];
  const amenitiesList = property.amenities || [];
  const maxVisibleIcons = 5;
  const displayedAmenities = amenitiesList.slice(0, maxVisibleIcons);
  const remainingCount = amenitiesList.length - maxVisibleIcons;

  return (
    <div
      id={`property-card-${property.id}`}
      onClick={() => onSelectProperty(property)}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      {/* Top Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={imagesList[currentImageIndex] || imagesList[0]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
        />

        {/* Carousel Navigation Arrows */}
        {imagesList.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-md transition backdrop-blur-xs"
              title="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-md transition backdrop-blur-xs"
              title="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Essential Badges (NSFAS Accredited Only) */}
        {property.nsfasAccredited && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-full bg-emerald-600/95 backdrop-blur-xs text-white text-[11px] font-semibold shadow-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              NSFAS Accredited
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(property.id);
            }}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-sm transition"
            title="Save property"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`} />
          </button>
        </div>

        {/* Image Indicators */}
        {imagesList.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {imagesList.map((_, idx) => (
              <div
                key={`dot-${property.id}-${idx}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Content & Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Location & Distance */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-600 flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {property.suburb} &bull; {property.type}
            </span>
            <span className="text-[11px] text-orange-700 font-bold bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 shrink-0">
              {property.availableBeds} beds left
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition leading-snug line-clamp-1">
            {property.title}
          </h3>

          {/* Campus Proximity */}
          {primaryUniversity && (
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="truncate font-medium">
                {primaryUniversity.distanceKm} km from {primaryUniversity.campusName} ({primaryUniversity.walkingTimeMin} min walk)
              </span>
            </p>
          )}

          {/* Compact Amenities Row (Icons Only - Sleek, single-line, zero descant on CTAs) */}
          <div className="pt-1 flex items-center gap-1.5 h-7 overflow-hidden">
            {displayedAmenities.map((amenity, i) => {
              const config = getAmenityDetails(amenity);
              const IconComponent = config.icon;
              return (
                <div
                  key={`amenity-${property.id}-${amenity}-${i}`}
                  title={`${amenity} (click for full residence details)`}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border ${config.bgClass} ${config.borderClass} ${config.colorClass} transition hover:scale-105 shrink-0`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
              );
            })}

            {/* If more amenities exist, compact count badge */}
            {remainingCount > 0 && (
              <div
                title={`${amenitiesList.slice(maxVisibleIcons).join(', ')} - Click card to view all amenities in detail`}
                className="h-7 px-2 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0 transition"
              >
                +{remainingCount}
              </div>
            )}
          </div>
        </div>

        {/* Pricing & High-Visibility Action Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Monthly Rent</div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900">
                R{(property.priceFrom || 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">/mo</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Highly Visible Message Landlord Button */}
            <button
              id={`chat-landlord-btn-${property.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDirectMessage(property);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-bold text-xs transition shadow-2xs group/msg"
              title="Send direct message to property landlord"
            >
              <MessageSquare className="w-3.5 h-3.5 text-orange-600 group-hover/msg:scale-110 transition-transform" />
              <span>Message</span>
            </button>

            {/* Apply / Book Button */}
            <button
              id={`instant-book-btn-${property.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onInstantBook(property);
              }}
              className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
