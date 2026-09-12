import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  GraduationCap, 
  SlidersHorizontal, 
  RotateCcw, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Navigation,
  X,
  PlusCircle,
  Building2,
  CornerUpLeft
} from 'lucide-react';
import { FilterState } from '../types';
import { 
  UNIVERSITIES_LIST, 
  TOWNS_LIST, 
  AMENITIES_CATALOG, 
  SA_LOCATIONS_CATALOG, 
  SouthAfricanLocation, 
  getUniversitiesForLocation 
} from '../data/mockData';
import { getAmenityDetails } from '../utils/amenityIcons';

interface SearchFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  resultsCount: number;
  onOpenAddListing?: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  resultsCount,
  onOpenAddListing,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [locationInput, setLocationInput] = useState(filters.town || '');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const locationRef = useRef<HTMLDivElement>(null);

  // Dynamically calculate universities that belong ONLY to the typed location/city
  const availableUniversities = useMemo(() => {
    return getUniversitiesForLocation(locationInput || filters.town);
  }, [locationInput, filters.town]);

  // Sync internal state when filters reset
  useEffect(() => {
    setLocationInput(filters.town || '');
  }, [filters.town]);

  // If currently selected university is not in availableUniversities for this location, reset university selection
  useEffect(() => {
    if (filters.university && availableUniversities.length > 0 && !availableUniversities.includes(filters.university)) {
      onFilterChange({ ...filters, university: '' });
    }
  }, [availableUniversities, filters.university]);

  // Click outside to close location suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Google-like Autocomplete: Score and rank places resembling what the user typed (5 to 6 places)
  const locationSuggestions = useMemo(() => {
    const query = locationInput.trim().toLowerCase();

    // If input is empty, show 6 top popular student hubs
    if (!query) {
      const topHubs = ['Cape Town', 'Johannesburg', 'Pretoria', 'Durban', 'Stellenbosch', 'Bloemfontein'];
      return SA_LOCATIONS_CATALOG
        .filter((loc) => topHubs.includes(loc.name))
        .slice(0, 6)
        .map((loc) => ({ loc, score: 100, matchedSuburb: '' }));
    }

    // Score all 41 South African places based on resemblance to what was typed
    const scored = SA_LOCATIONS_CATALOG.map((loc) => {
      const nameLower = (loc.name || '').toLowerCase();
      const instLower = (loc.institution || '').toLowerCase();
      const provLower = (loc.province || '').toLowerCase();
      let score = 0;
      let matchedSuburb = '';

      // 1. Exact full name match
      if (nameLower === query) {
        score = 1000;
      }
      // 2. Starts with query (e.g. user typed 'P' -> Pretoria, Potchefstroom, Polokwane, Port Shepstone, Phalaborwa, Phuthaditjhaba)
      else if (nameLower.startsWith(query)) {
        score = 600 - (nameLower.length - query.length); // Shorter names prioritized
      }
      // 3. Any word in the place name starts with query (e.g. 'Town' in 'Cape Town' when typing 't', 'Shepstone' in 'Port Shepstone')
      else if (nameLower.split(/\s+/).some((w) => w.startsWith(query))) {
        score = 450;
      }
      // 4. A prominent student suburb starts with query (e.g. 'Hatfield' -> Pretoria, 'Braamfontein' -> Johannesburg, 'Summerstrand' -> Gqeberha)
      else if (loc.popularSuburbs?.some((sub) => {
        if ((sub || '').toLowerCase().startsWith(query)) {
          matchedSuburb = sub;
          return true;
        }
        return false;
      })) {
        score = 400;
      }
      // 5. Place name contains query substring
      else if (nameLower.includes(query)) {
        score = 250;
      }
      // 6. Suburb contains query substring
      else if (loc.popularSuburbs?.some((sub) => {
        if ((sub || '').toLowerCase().includes(query)) {
          matchedSuburb = sub;
          return true;
        }
        return false;
      })) {
        score = 200;
      }
      // 7. Institution or province matches query (e.g. typing 'Fort Hare', 'Wits', 'Limpopo')
      else if (instLower.includes(query) || provLower.includes(query)) {
        score = 150;
      }

      return { loc, score, matchedSuburb };
    });

    // Filter matching places, sort descending by resemblance score, then alphabetical
    const sorted = scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.loc.name.localeCompare(b.loc.name));

    // Limit strictly to 5 or 6 places as requested
    return sorted.slice(0, 6);
  }, [locationInput]);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [locationSuggestions]);

  const handleSelectLocation = (loc: SouthAfricanLocation, suburb?: string) => {
    const selectedName = loc.name;
    setLocationInput(selectedName);
    setIsLocationDropdownOpen(false);
    
    onFilterChange({ 
      ...filters, 
      town: selectedName,
      searchQuery: suburb ? suburb : (filters.searchQuery || '')
    });
  };

  const handleClearLocation = () => {
    setLocationInput('');
    onFilterChange({ ...filters, town: '', university: '' });
  };

  // Keyboard navigation for Google-like dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isLocationDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsLocationDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev < locationSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev > 0 ? prev - 1 : locationSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < locationSuggestions.length) {
        const item = locationSuggestions[highlightedIndex];
        if (item?.loc) {
          handleSelectLocation(item.loc, item.matchedSuburb);
        }
      } else if (locationSuggestions.length > 0 && locationSuggestions[0]?.loc) {
        const item = locationSuggestions[0];
        handleSelectLocation(item.loc, item.matchedSuburb);
      } else {
        setIsLocationDropdownOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsLocationDropdownOpen(false);
    }
  };

  // Google-style text highlighting for matching characters
  const renderHighlightedName = (name: string, query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return <span className="font-semibold text-slate-900">{name}</span>;
    }

    const lowerName = name.toLowerCase();
    const matchIdx = lowerName.indexOf(q);

    if (matchIdx === -1) {
      return <span className="font-semibold text-slate-900">{name}</span>;
    }

    const before = name.slice(0, matchIdx);
    const matched = name.slice(matchIdx, matchIdx + q.length);
    const after = name.slice(matchIdx + q.length);

    return (
      <span className="text-slate-900">
        {before}
        <span className="font-black text-orange-600 bg-orange-100/80 px-1 py-0.5 rounded">
          {matched}
        </span>
        <span className="font-bold">{after}</span>
      </span>
    );
  };

  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, university: e.target.value });
  };

  const handleAmenityToggle = (amenityName: string) => {
    const exists = filters.amenities.includes(amenityName);
    const updated = exists
      ? filters.amenities.filter((a) => a !== amenityName)
      : [...filters.amenities, amenityName];
    onFilterChange({ ...filters, amenities: updated });
  };

  const roomTypes = [
    'All Types',
    'Single Studio',
    'En-suite Room',
    'Shared 2-Bed',
    'Cluster Apartment',
    'Bachelor Flat',
  ];

  const hasActiveFilters = Boolean(
    filters.university ||
    filters.town ||
    filters.searchQuery ||
    filters.nsfasOnly ||
    filters.backupPowerOnly ||
    filters.allBillsIncludedOnly ||
    filters.instantBookOnly ||
    filters.accommodationType !== 'All Types' ||
    filters.amenities.length > 0 ||
    filters.maxDistanceKm < 10
  );

  return (
    <div className="bg-white border-b border-slate-200 text-slate-900 py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Unified Clean Search Bar: Location (City) FIRST -> Universities in that City SECOND */}
        <div className="bg-slate-50 rounded-2xl p-2 sm:p-2.5 border border-slate-200 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            
            {/* 1. LOCATION FILTER (FIRST) - Google-Style Live Autocomplete with 41 Places */}
            <div className="md:col-span-4 relative" ref={locationRef}>
              <div className="relative flex items-center bg-white rounded-xl border border-slate-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition shadow-2xs">
                <MapPin className="w-4 h-4 text-orange-600 ml-3 shrink-0" />
                <input
                  id="location-search-input"
                  type="text"
                  value={locationInput}
                  onChange={(e) => {
                    setLocationInput(e.target.value);
                    setIsLocationDropdownOpen(true);
                    onFilterChange({ ...filters, town: e.target.value });
                  }}
                  onFocus={() => setIsLocationDropdownOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search location or city (e.g. Pretoria, Cape Town, Polokwane)..."
                  className="w-full bg-transparent text-slate-900 rounded-xl pl-2.5 pr-8 py-2.5 text-xs sm:text-sm focus:outline-none placeholder-slate-400 font-medium"
                  autoComplete="off"
                />
                {locationInput ? (
                  <button
                    onClick={handleClearLocation}
                    className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 transition rounded-full"
                    title="Clear location"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
                )}
              </div>

              {/* Google-like Autocomplete Dropdown: Displays 5 or 6 places resembling the typed query */}
              {isLocationDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span className="uppercase tracking-wider">
                      {locationInput.trim() ? `Places matching "${locationInput}"` : 'Popular Student Locations'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {locationSuggestions.length} suggestions • Use ↑↓ to navigate
                    </span>
                  </div>

                  {locationSuggestions.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-500">
                      <p className="font-semibold text-slate-700">No places found matching &ldquo;{locationInput}&rdquo;</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Try searching a South African university town like Pretoria, Polokwane, Bloemfontein, or Cape Town.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                      {locationSuggestions.map((item, idx) => {
                        const loc = item?.loc;
                        if (!loc || !loc.name) return null;
                        const isHighlighted = highlightedIndex === idx;
                        return (
                          <div
                            key={loc.name}
                            role="option"
                            aria-selected={isHighlighted}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            onClick={() => handleSelectLocation(loc, item.matchedSuburb)}
                            className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between cursor-pointer transition-colors ${
                              isHighlighted ? 'bg-orange-50/90 text-orange-950' : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                isHighlighted ? 'bg-orange-500 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                              }`}>
                                <MapPin className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {renderHighlightedName(loc.name, locationInput)}
                                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                    {loc.province}
                                  </span>
                                  {item.matchedSuburb && (
                                    <span className="text-[10px] font-medium text-orange-700 bg-orange-100/70 px-1.5 py-0.5 rounded shrink-0">
                                      near {item.matchedSuburb}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {loc.institution}
                                </p>
                              </div>
                            </div>

                            {/* Google-like autocomplete return arrow */}
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <span className={`text-[10px] font-bold ${isHighlighted ? 'text-orange-600' : 'text-slate-400'} hidden sm:inline`}>
                                Select
                              </span>
                              <div className={`p-1 rounded-md ${isHighlighted ? 'text-orange-600 bg-orange-100' : 'text-slate-400'}`}>
                                <CornerUpLeft className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Clean footer prompt */}
                  <div className="px-3.5 py-1.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>41 Accredited SA Student Hubs Supported</span>
                    <span>Press ↵ Enter to choose</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. UNIVERSITIES FILTER (DYNAMIC - Only universities in the typed city/town) */}
            <div className="md:col-span-4 relative">
              <div className="relative flex items-center bg-white rounded-xl border border-slate-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition shadow-2xs">
                <GraduationCap className="w-4 h-4 text-orange-600 ml-3 shrink-0 pointer-events-none" />
                <select
                  id="university-select"
                  value={filters.university}
                  onChange={handleUniversityChange}
                  className="w-full bg-transparent text-slate-900 rounded-xl pl-2.5 pr-8 py-2.5 text-xs sm:text-sm focus:outline-none appearance-none font-medium truncate"
                >
                  <option value="">
                    {locationInput.trim() 
                      ? `All Universities in this area (${availableUniversities.length})` 
                      : 'All Universities & Colleges'}
                  </option>
                  {availableUniversities.map((uni) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
              </div>
            </div>

            {/* 3. FREE SEARCH KEYWORDS */}
            <div className="md:col-span-2 relative">
              <div className="relative flex items-center bg-white rounded-xl border border-slate-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition shadow-2xs">
                <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0 pointer-events-none" />
                <input
                  id="search-input"
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                  placeholder="Keywords (e.g. Studio, Gym)..."
                  className="w-full bg-transparent text-slate-900 rounded-xl pl-2.5 pr-3 py-2.5 text-xs sm:text-sm focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            {/* 4. FILTERS TOGGLE & RESULTS COUNT */}
            <div className="md:col-span-2 flex items-center gap-2 justify-between md:justify-end">
              <button
                id="toggle-advanced-filters-btn"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition shadow-2xs ${
                  isAdvancedOpen
                    ? 'bg-orange-500 border-orange-500 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {isAdvancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {/* Reset link if active */}
              {hasActiveFilters && (
                <button
                  id="reset-filters-btn"
                  onClick={onResetFilters}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 transition p-2 rounded-lg hover:bg-slate-100 shrink-0"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clean Sub-bar with Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900 font-bold">{resultsCount}</strong> verified student {resultsCount === 1 ? 'residence' : 'residences'}
            </span>
            {locationInput && (
              <span className="bg-orange-50 text-orange-800 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-orange-200">
                Near {locationInput}
              </span>
            )}
            {filters.university && (
              <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[200px]">
                {filters.university.split('(')[0]}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2 flex items-center gap-1"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Expandable Advanced Filters */}
        {isAdvancedOpen && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-lg space-y-5 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Campus Proximity Distance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-orange-600" />
                    Max Walking Distance
                  </span>
                  <span className="text-orange-600 font-bold">
                    {filters.maxDistanceKm >= 10 ? 'Any distance' : `Under ${filters.maxDistanceKm} km`}
                  </span>
                </div>
                <input
                  id="proximity-distance-slider"
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={filters.maxDistanceKm}
                  onChange={(e) => onFilterChange({ ...filters, maxDistanceKm: parseFloat(e.target.value) })}
                  className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>500m (Walk)</span>
                  <span>2 km</span>
                  <span>5 km (Shuttle)</span>
                  <span>10+ km</span>
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Max Monthly Rent</span>
                  <span className="text-orange-600 font-bold">
                    Up to R{(filters.maxPrice || 12000).toLocaleString()} /mo
                  </span>
                </div>
                <input
                  type="range"
                  min={3500}
                  max={12000}
                  step={250}
                  value={filters.maxPrice}
                  onChange={(e) => onFilterChange({ ...filters, maxPrice: parseInt(e.target.value) })}
                  className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>R3,500</span>
                  <span>R7,500</span>
                  <span>R12,000+</span>
                </div>
              </div>

              {/* Room Layout Type */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Room Layout
                </label>
                <div className="relative">
                  <select
                    id="room-type-select"
                    value={filters.accommodationType}
                    onChange={(e) => onFilterChange({ ...filters, accommodationType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none font-medium"
                  >
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Quick Feature Checkboxes inside Advanced Panel */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={filters.nsfasOnly}
                  onChange={(e) => onFilterChange({ ...filters, nsfasOnly: e.target.checked })}
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
                <span>NSFAS Accredited Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={filters.backupPowerOnly}
                  onChange={(e) => onFilterChange({ ...filters, backupPowerOnly: e.target.checked })}
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
                <span>Solar / Backup Power</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={filters.allBillsIncludedOnly}
                  onChange={(e) => onFilterChange({ ...filters, allBillsIncludedOnly: e.target.checked })}
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
                <span>All Bills Included</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={filters.instantBookOnly}
                  onChange={(e) => onFilterChange({ ...filters, instantBookOnly: e.target.checked })}
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
                <span>Instant Bookable</span>
              </label>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">
                Key Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {AMENITIES_CATALOG.map((item) => {
                  const isSelected = filters.amenities.includes(item.name);
                  const config = getAmenityDetails(item.name);
                  const IconComp = config.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleAmenityToggle(item.name)}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium border text-left transition ${
                        isSelected
                          ? 'bg-orange-50 text-orange-700 border-orange-300 font-bold shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{config.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Sort Order & Close */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Sort by:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'recommended', label: 'Recommended' },
                    { id: 'closest', label: 'Closest to Campus' },
                    { id: 'price_low', label: 'Price: Low to High' },
                    { id: 'price_high', label: 'Price: High to Low' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onFilterChange({ ...filters, sortBy: s.id as any })}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                        filters.sortBy === s.id
                          ? 'bg-orange-500 text-white font-semibold shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsAdvancedOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
