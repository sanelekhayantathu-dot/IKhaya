import React from 'react';
import {
  Wifi,
  Zap,
  ShieldCheck,
  Bus,
  Shirt,
  BookOpen,
  Dumbbell,
  Waves,
  Flame,
  Droplets,
  Bath,
  BedDouble,
  Camera,
  Car,
  Sparkles,
  Tv,
  Wind,
  Utensils,
  CheckCircle2,
  Lock,
  Sun,
  Laptop
} from 'lucide-react';

export interface AmenityIconConfig {
  icon: React.ComponentType<{ className?: string }>;
  shortLabel: string;
  category: 'Connectivity' | 'Power & Utilities' | 'Security' | 'Academic & Study' | 'Fitness & Lifestyle' | 'Living Comfort';
  description: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export function getAmenityDetails(amenityName: string): AmenityIconConfig {
  const safeName = typeof amenityName === 'string' ? amenityName : '';
  const lower = safeName.toLowerCase();

  // Wifi / Internet
  if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('fibre') || lower.includes('internet')) {
    return {
      icon: Wifi,
      shortLabel: 'Fibre Wi-Fi',
      category: 'Connectivity',
      description: 'Ultra-fast uncapped fibre internet with distributed mesh access points throughout all study desks and bedrooms.',
      colorClass: 'text-sky-600',
      bgClass: 'bg-sky-50',
      borderClass: 'border-sky-200',
    };
  }

  // Backup Power / Solar / Inverter
  if (lower.includes('power') || lower.includes('solar') || lower.includes('inverter') || lower.includes('generator') || lower.includes('loadshedding')) {
    return {
      icon: Zap,
      shortLabel: 'Solar Backup',
      category: 'Power & Utilities',
      description: 'Hybrid solar array and commercial lithium inverter guaranteeing 24/7 uninterrupted power for lighting, Wi-Fi, and study sockets during loadshedding.',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200',
    };
  }

  // Security / Biometrics / Guard
  if (lower.includes('biometric') || lower.includes('guard') || lower.includes('security') || lower.includes('access control')) {
    return {
      icon: ShieldCheck,
      shortLabel: '24/7 Security',
      category: 'Security',
      description: 'Round-the-clock on-site security guards, turnstile biometric fingerprint/facial access, and perimeter electric fencing.',
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-200',
    };
  }

  // CCTV
  if (lower.includes('cctv') || lower.includes('surveillance') || lower.includes('camera')) {
    return {
      icon: Camera,
      shortLabel: 'CCTV Secure',
      category: 'Security',
      description: 'High-definition 24-hour monitored CCTV cameras covering all building entrances, corridors, stairwells, and outdoor parking zones.',
      colorClass: 'text-slate-600',
      bgClass: 'bg-slate-50',
      borderClass: 'border-slate-200',
    };
  }

  // Shuttle / Transport / Bus
  if (lower.includes('shuttle') || lower.includes('bus') || lower.includes('transit') || lower.includes('transport')) {
    return {
      icon: Bus,
      shortLabel: 'Free Shuttle',
      category: 'Fitness & Lifestyle',
      description: 'Scheduled daily private minibus shuttle running directly between the residence and main campus lecture halls.',
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-50',
      borderClass: 'border-indigo-200',
    };
  }

  // Laundry
  if (lower.includes('laundry') || lower.includes('washing') || lower.includes('dryer')) {
    return {
      icon: Shirt,
      shortLabel: 'Free Laundry',
      category: 'Power & Utilities',
      description: 'Modern commercial speed-queen washing machines and tumble dryers with free tokenless or automated app credits.',
      colorClass: 'text-teal-600',
      bgClass: 'bg-teal-50',
      borderClass: 'border-teal-200',
    };
  }

  // Study Rooms / Labs
  if (lower.includes('study') || lower.includes('lab') || lower.includes('pod') || lower.includes('desk') || lower.includes('library')) {
    return {
      icon: BookOpen,
      shortLabel: 'Study Labs',
      category: 'Academic & Study',
      description: 'Acoustically treated silent study spaces, group collaboration tables, ergonomic chairs, and whiteboard briefing walls.',
      colorClass: 'text-violet-600',
      bgClass: 'bg-violet-50',
      borderClass: 'border-violet-200',
    };
  }

  // Gym / Fitness
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('workout')) {
    return {
      icon: Dumbbell,
      shortLabel: 'Resident Gym',
      category: 'Fitness & Lifestyle',
      description: 'Fully equipped private resident fitness center with treadmills, free weights, squat racks, and stretching studio.',
      colorClass: 'text-rose-600',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-200',
    };
  }

  // Pool
  if (lower.includes('pool') || lower.includes('swim')) {
    return {
      icon: Waves,
      shortLabel: 'Swimming Pool',
      category: 'Fitness & Lifestyle',
      description: 'Private communal swimming pool with sun loungers and deck area for relaxation during summer terms.',
      colorClass: 'text-cyan-600',
      bgClass: 'bg-cyan-50',
      borderClass: 'border-cyan-200',
    };
  }

  // Braai / BBQ
  if (lower.includes('braai') || lower.includes('bbq') || lower.includes('fire')) {
    return {
      icon: Flame,
      shortLabel: 'Braai Area',
      category: 'Fitness & Lifestyle',
      description: 'Dedicated outdoor braai facilities with built-in stainless steel grills and shaded picnic bench seating.',
      colorClass: 'text-orange-600',
      bgClass: 'bg-orange-50',
      borderClass: 'border-orange-200',
    };
  }

  // Bathroom / En-suite
  if (lower.includes('bathroom') || lower.includes('en-suite') || lower.includes('ensuite') || lower.includes('shower')) {
    return {
      icon: Bath,
      shortLabel: 'En-suite Bath',
      category: 'Living Comfort',
      description: 'Private bathroom inside the room with hot water shower, vanity basin, mirror cabinet, and low-flow toilet.',
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
    };
  }

  // Furnished / Bed
  if (lower.includes('furnished') || lower.includes('bed') || lower.includes('furniture')) {
    return {
      icon: BedDouble,
      shortLabel: 'Furnished',
      category: 'Living Comfort',
      description: 'Complete student furniture setup including high-density mattress, study desk with lamp, wardrobe, and bookshelf.',
      colorClass: 'text-amber-700',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200',
    };
  }

  // Water & Electricity / Utilities
  if (lower.includes('water') || lower.includes('electricity') || lower.includes('utilities') || lower.includes('bills')) {
    return {
      icon: Droplets,
      shortLabel: 'Water & Elec Inc.',
      category: 'Power & Utilities',
      description: 'Monthly municipal water, refuse, sewer, and fair-use electricity allocations bundled directly into the rent.',
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
    };
  }

  // Parking
  if (lower.includes('parking') || lower.includes('garage') || lower.includes('carport')) {
    return {
      icon: Car,
      shortLabel: 'Secure Parking',
      category: 'Security',
      description: 'Gated off-street undercover vehicle parking with automated motorized gate access and night lighting.',
      colorClass: 'text-slate-700',
      bgClass: 'bg-slate-50',
      borderClass: 'border-slate-200',
    };
  }

  // Cleaning / Housekeeping
  if (lower.includes('clean') || lower.includes('housekeeping') || lower.includes('maid')) {
    return {
      icon: Sparkles,
      shortLabel: 'Weekly Cleaning',
      category: 'Living Comfort',
      description: 'Professional housekeeping team sanitizing communal kitchens, shared lounges, and corridors weekly.',
      colorClass: 'text-purple-600',
      bgClass: 'bg-purple-50',
      borderClass: 'border-purple-200',
    };
  }

  // Air conditioning
  if (lower.includes('ac') || lower.includes('air con') || lower.includes('air conditioning')) {
    return {
      icon: Wind,
      shortLabel: 'Air Con',
      category: 'Living Comfort',
      description: 'Climate-controlled air conditioning or heating unit for year-round temperature comfort.',
      colorClass: 'text-sky-600',
      bgClass: 'bg-sky-50',
      borderClass: 'border-sky-200',
    };
  }

  // Kitchen
  if (lower.includes('kitchen') || lower.includes('cook') || lower.includes('stove')) {
    return {
      icon: Utensils,
      shortLabel: 'Equipped Kitchen',
      category: 'Living Comfort',
      description: 'Shared or private kitchen with electric stoves, microwave ovens, lockable pantry cupboards, and refrigeration.',
      colorClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-200',
    };
  }

  // TV / Entertainment
  if (lower.includes('tv') || lower.includes('dstv') || lower.includes('netflix') || lower.includes('cinema')) {
    return {
      icon: Tv,
      shortLabel: 'Smart TV',
      category: 'Fitness & Lifestyle',
      description: 'Communal media lounge with large Ultra-HD smart television, streaming apps, and gaming consoles.',
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-50',
      borderClass: 'border-indigo-200',
    };
  }

  // Fallback
  return {
    icon: CheckCircle2,
    shortLabel: safeName.length > 20 ? `${safeName.slice(0, 18)}...` : (safeName || 'Verified Amenity'),
    category: 'Living Comfort',
    description: `Verified building feature provided by the residence management for resident convenience.`,
    colorClass: 'text-slate-600',
    bgClass: 'bg-slate-50',
    borderClass: 'border-slate-200',
  };
}
