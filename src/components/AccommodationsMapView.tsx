import React, { useState } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Zap, 
  GraduationCap, 
  Heart, 
  ChevronRight, 
  ExternalLink,
  Navigation,
  Compass,
  Layers,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { Accommodation } from '../types';

interface AccommodationsMapViewProps {
  accommodations: Accommodation[];
  selectedUniversity?: string;
  selectedTown?: string;
  onSelectProperty: (property: Accommodation) => void;
  onDirectMessage?: (property: Accommodation) => void;
}

export const AccommodationsMapView: React.FC<AccommodationsMapViewProps> = ({
  accommodations,
  selectedUniversity,
  selectedTown,
  onSelectProperty,
  onDirectMessage,
}) => {
  const [selectedPin, setSelectedPin] = useState<Accommodation | null>(
    accommodations[0] || null
  );
  const [activeZone, setActiveZone] = useState<'All' | 'Cape Town' | 'Johannesburg' | 'Pretoria' | 'Stellenbosch'>('All');

  // Filter accommodations by active zone tab if set
  const visibleAccommodations = accommodations.filter((item) => {
    if (activeZone === 'All') return true;
    if (activeZone === 'Cape Town') return item.town.includes('Cape Town') || item.suburb.includes('Rondebosch') || item.suburb.includes('Obs');
    if (activeZone === 'Johannesburg') return item.town.includes('Johannesburg') || item.suburb.includes('Braamfontein') || item.suburb.includes('Auckland');
    if (activeZone === 'Pretoria') return item.town.includes('Pretoria') || item.suburb.includes('Hatfield');
    if (activeZone === 'Stellenbosch') return item.town.includes('Stellenbosch');
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
      {/* Top Map Control Toolbar */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Interactive Accommodation Map</span>
              <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full border border-orange-200">
                {visibleAccommodations.length} Properties Located
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Click any property pin to view live rates, walking distances, and room availability
            </p>
          </div>
        </div>

        {/* Region Quick Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Cape Town', 'Johannesburg', 'Pretoria', 'Stellenbosch'] as const).map((zone) => (
            <button
              key={zone}
              onClick={() => setActiveZone(zone)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeZone === zone
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Side Drawer Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        {/* Left Side: Interactive Stylized Map Canvas */}
        <div className="lg:col-span-8 relative bg-gradient-to-br from-slate-100 via-amber-50/20 to-slate-200 p-4 sm:p-6 overflow-hidden flex flex-col justify-between select-none">
          {/* Stylized Simulated Map Grid & Geographic Elements */}
          <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]"></div>

          {/* Ambient Metro Roads & University Zone Highlights */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Curving Road Lines */}
            <svg className="w-full h-full opacity-25" viewBox="0 0 800 600" preserveAspectRatio="none">
              <path d="M 0,250 Q 200,200 400,280 T 800,220" stroke="#94a3b8" strokeWidth="18" fill="none" />
              <path d="M 150,0 Q 250,300 350,600" stroke="#f97316" strokeWidth="10" strokeDasharray="8 6" fill="none" opacity="0.3" />
              <path d="M 500,0 C 450,200 650,400 600,600" stroke="#94a3b8" strokeWidth="14" fill="none" />
              <circle cx="280" cy="220" r="90" fill="#fef3c7" opacity="0.4" />
              <circle cx="580" cy="340" r="110" fill="#dcfce7" opacity="0.4" />
            </svg>
          </div>

          {/* Campus Anchor Badges on Map */}
          <div className="relative z-10 flex flex-wrap items-center gap-2">
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800">
              <GraduationCap className="w-4 h-4 text-orange-600" />
              <span>Main University Campuses</span>
            </div>
            <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
              <Navigation className="w-3 h-3 text-lime-600" />
              <span>Transit & Jammie Shuttle Routes</span>
            </div>
          </div>

          {/* Interactive Property Map Pins Placed on the Grid */}
          <div className="relative z-10 my-8 min-h-[360px] flex items-center justify-center">
            <div className="relative w-full max-w-2xl h-[340px] bg-slate-900/5 rounded-2xl border border-slate-300/60 p-4 shadow-inner">
              {/* Campus Hub Central Markers */}
              <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg ring-4 ring-orange-200">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-bold shadow-xs whitespace-nowrap">
                  Campus Zone A
                </span>
              </div>

              <div className="absolute bottom-1/4 right-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-9 h-9 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-lg ring-4 ring-slate-200">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-md bg-slate-800 text-white text-[10px] font-bold shadow-xs whitespace-nowrap">
                  Campus Zone B
                </span>
              </div>

              {/* Dynamic Accommodation Pins positioned around the map */}
              {visibleAccommodations.map((prop, idx) => {
                const isSelected = selectedPin?.id === prop.id;
                // Distributed coordinates for clean visual layout
                const positions = [
                  { top: '18%', left: '42%' },
                  { top: '35%', left: '68%' },
                  { top: '58%', left: '22%' },
                  { top: '65%', left: '78%' },
                  { top: '38%', left: '15%' },
                  { top: '78%', left: '48%' },
                ];
                const pos = positions[idx % positions.length];

                return (
                  <div
                    key={prop.id}
                    style={{ top: pos.top, left: pos.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:z-30 cursor-pointer"
                    onClick={() => setSelectedPin(prop)}
                  >
                    <div
                      className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-bold text-xs shadow-md transition-all ${
                        isSelected
                          ? 'bg-orange-600 text-white scale-110 ring-4 ring-orange-300 z-20 shadow-xl'
                          : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 hover:scale-105'
                      }`}
                    >
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-orange-600'}`} />
                      <span className="font-mono">R{(prop.priceFrom || 0).toLocaleString()}</span>
                      {prop.nsfasAccredited && (
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-lime-300' : 'bg-lime-500'}`} title="NSFAS Accredited" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-500"></span>
                NSFAS Accredited
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Backup Power / Solar
              </span>
            </div>
            <span className="text-slate-500 font-medium">Click any pin to inspect residence card</span>
          </div>
        </div>

        {/* Right Side: Selected Residence Card & Quick Actions */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 p-4 sm:p-5 bg-white flex flex-col justify-between space-y-4">
          {selectedPin ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                {/* Photo & Badges */}
                <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={selectedPin.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'}
                    alt={selectedPin.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {selectedPin.nsfasAccredited && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <ShieldCheck className="w-3 h-3" />
                        NSFAS
                      </span>
                    )}
                    {selectedPin.hasBackupPower && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <Zap className="w-3 h-3" />
                        Solar Backup
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-xs font-bold font-mono">
                      R{(selectedPin.priceFrom || 0).toLocaleString()}/mo
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {selectedPin.suburb}, {(selectedPin.town || '').split('(')[0]}
                    </span>
                    <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                      {selectedPin.availableBeds} beds left
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {selectedPin.title}
                  </h4>

                  {/* Campus distance */}
                  {selectedPin.universities?.[0] && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <GraduationCap className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span className="truncate">{selectedPin.universities[0].universityName}</span>
                      </div>
                      <span className="font-bold text-lime-700 shrink-0">
                        {selectedPin.universities[0].walkingTimeMin} min walk
                      </span>
                    </div>
                  )}

                  {/* Key Amenities */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {(selectedPin.amenities || []).slice(0, 3).map((amenity, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-700 border border-slate-200"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onSelectProperty(selectedPin)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                {onDirectMessage && (
                  <button
                    onClick={() => onDirectMessage(selectedPin)}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    Message Host
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6 text-slate-400 text-xs">
              Select any residence on the map to inspect full pricing and room availability.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
