import React, { useState } from 'react';
import { 
  MapPin, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Zap,
  HelpCircle,
  Search,
  ArrowRight
} from 'lucide-react';
import { SA_LOCATIONS_CATALOG, UNIVERSITIES_LIST } from '../data/mockData';
import { Accommodation } from '../types';

interface LocationHubSEOProps {
  accommodations: Accommodation[];
  onSelectLocation: (town: string) => void;
  onSelectUniversity: (university: string) => void;
}

export const LocationHubSEO: React.FC<LocationHubSEOProps> = ({
  accommodations,
  onSelectLocation,
  onSelectUniversity,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Top University Metros & Academic Hubs in South Africa
  const featuredCities = [
    { name: 'Cape Town', province: 'Western Cape', unis: 'UCT • CPUT • UWC' },
    { name: 'Johannesburg', province: 'Gauteng', unis: 'Wits • UJ • Central JHB' },
    { name: 'Pretoria', province: 'Gauteng', unis: 'UP • TUT • UNISA' },
    { name: 'Stellenbosch', province: 'Western Cape', unis: 'Stellenbosch University (SU)' },
    { name: 'Durban', province: 'KwaZulu-Natal', unis: 'UKZN • DUT' },
    { name: 'Bloemfontein', province: 'Free State', unis: 'UFS • CUT' },
    { name: 'Gqeberha', province: 'Eastern Cape', unis: 'NMU (Port Elizabeth)' },
    { name: 'Potchefstroom', province: 'North West', unis: 'North-West University (NWU)' },
    { name: 'Polokwane', province: 'Limpopo', unis: 'University of Limpopo (UL) • TUT' },
    { name: 'Mahikeng', province: 'North West', unis: 'NWU Mahikeng Campus' },
    { name: 'East London', province: 'Eastern Cape', unis: 'UFH East London • WSU' },
    { name: 'Thohoyandou', province: 'Limpopo', unis: 'University of Venda (UNIVEN)' },
  ];

  // Top National Universities for Direct Search Filtering
  const topUniversities = [
    'University of Cape Town (UCT)',
    'University of the Witwatersrand (Wits)',
    'University of Pretoria (UP)',
    'University of Johannesburg (UJ)',
    'Stellenbosch University (SU)',
    'University of KwaZulu-Natal (UKZN)',
    'Cape Peninsula University of Technology (CPUT)',
    'Durban University of Technology (DUT)',
    'Nelson Mandela University (NMU)',
    'North-West University (NWU)',
    'University of the Free State (UFS)',
    'University of the Western Cape (UWC)',
  ];

  // Frequently Asked Questions for South African Student Accommodation
  const faqs = [
    {
      q: 'How do I find NSFAS accredited student accommodation in South Africa?',
      a: 'On iKhaya Res Living, you can instantly filter verified student housing by clicking the "NSFAS Accredited Only" toggle. All approved residences meet the official Department of Higher Education and Training (DHET) minimum accommodation standards, have pre-verified lease contracts within the annual NSFAS allowance cap, and support direct bursary payment disbursement.',
    },
    {
      q: 'Which universities have off-campus accommodation on iKhaya Res Living?',
      a: 'iKhaya lists verified student flats, private rooms, and campus residence clusters across major South African university cities including Cape Town (UCT, CPUT, UWC), Johannesburg (Wits, UJ), Pretoria (UP, TUT), Stellenbosch (SU), Durban (UKZN, DUT), Bloemfontein (UFS), and Gqeberha (NMU).',
    },
    {
      q: 'Does student accommodation on iKhaya have backup power during load shedding?',
      a: 'Yes. Many student residences on iKhaya feature integrated solar photovoltaic panels, backup inverters, and emergency generators. You can use the "24/7 Backup Power" filter to exclusively display residences where study lighting, high-speed uncapped Wi-Fi, biometric access gates, and refrigeration operate continuously during Stage 1-6 load shedding.',
    },
    {
      q: 'What certified rental documents are required for university accommodation lease applications?',
      a: 'South African student lease agreements typically require: (1) Certified copy of SA National ID or passport, (2) Official Proof of Registration for the current academic year, (3) NSFAS Bursary Award Letter or 3-Month Bank Statements from a parent/guardian, and (4) Completed Tenant Emergency Contact Details. Our built-in Encrypted Document Vault allows students to pre-verify these documents once and reuse them for instant applications.',
    },
    {
      q: 'Are utility bills and high-speed Wi-Fi included in student accommodation rent?',
      a: 'Most purpose-built student accommodations (PBSA) and university accredited residences on iKhaya include high-speed uncapped fiber Wi-Fi, municipal water, and periodic cleaning in the monthly rent. Some properties provide prepaid electricity meters or an electricity allowance cap. Use the "All Bills Included" filter to view fully all-inclusive rates.',
    },
  ];

  return (
    <section 
      id="seo-locations-directory"
      aria-label="Student Accommodation Directory South Africa" 
      className="mt-12 pt-10 border-t border-slate-200 bg-white rounded-3xl p-6 sm:p-8 space-y-10"
    >
      {/* 1. Header & Context */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-xs font-bold border border-orange-200">
          <Building2 className="w-3.5 h-3.5 text-orange-600" />
          <span>South Africa Student Accommodation Directory</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Browse Student Residences & Flats by City and University
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Find verified off-campus student accommodation near your campus. Browse certified single rooms, en-suites, and shared student apartments across South Africa's leading university metropolises.
        </p>
      </div>

      {/* 2. Top Student Metros Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-600" />
          <span>Top South African University Cities & Towns</span>
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {featuredCities.map((city) => {
            const cityNameLower = (city.name || '').toLowerCase();
            const count = (accommodations || []).filter((a) => {
              if (!a) return false;
              const aTown = (a.town || '').toLowerCase();
              const aSuburb = (a.suburb || '').toLowerCase();
              return aTown.includes(cityNameLower) || aSuburb.includes(cityNameLower);
            }).length;

            return (
              <a
                key={city.name}
                href={`?location=${encodeURIComponent(city.name)}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectLocation(city.name);
                }}
                className="group p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/80 border border-slate-200 hover:border-orange-300 transition text-left flex flex-col justify-between"
                title={`Student Accommodation in ${city.name}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-950 transition">
                      {city.name}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 group-hover:border-orange-200 group-hover:text-orange-800">
                      {count > 0 ? `${count} listed` : 'Verified Hub'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-medium">
                    {city.unis}
                  </p>
                </div>
                <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-orange-600 group-hover:text-orange-700">
                  <span>View residences</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* 3. Browse by Top Universities */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-orange-600" />
          <span>Student Housing Near Major Universities</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {topUniversities.map((uni) => (
            <a
              key={uni}
              href={`?university=${encodeURIComponent(uni)}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectUniversity(uni);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 hover:text-orange-950 transition"
              title={`Student Accommodation near ${uni}`}
            >
              <span>{uni}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </a>
          ))}
        </div>
      </div>

      {/* 4. Frequently Asked Questions (FAQ SEO Section) */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-orange-600" />
            <span>Frequently Asked Questions: Student Accommodation in South Africa</span>
          </h3>
          <p className="text-xs text-slate-500">
            Everything you need to know about finding, funding, and securing verified university accommodation.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50 transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left gap-3 bg-white hover:bg-slate-50 transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-orange-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 py-3 text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 border-t border-slate-100 animate-in fade-in duration-150">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
