import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  FileCheck, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MessageSquare, 
  ShieldCheck, 
  Star, 
  Calendar, 
  Zap, 
  Clock, 
  ChevronRight,
  Sparkles,
  Bed,
  FileText,
  AlertCircle,
  Plus,
  Inbox,
  Home
} from 'lucide-react';
import { Accommodation, BookingApplication, StudentProfile, RentalDocument, UserProfile } from '../types';
import { getAmenityDetails } from '../utils/amenityIcons';

interface LandlordPortalProps {
  accommodations: Accommodation[];
  applications: BookingApplication[];
  studentProfile: StudentProfile | null;
  userProfile?: UserProfile | null;
  onUpdateApplicationStatus: (appId: string, status: BookingApplication['status']) => void;
  onOpenAddListing: () => void;
  onOpenMessages: () => void;
  onRateTenant?: (tenantName: string) => void;
}

export const LandlordPortal: React.FC<LandlordPortalProps> = ({
  accommodations,
  applications,
  studentProfile,
  userProfile,
  onUpdateApplicationStatus,
  onOpenAddListing,
  onOpenMessages,
  onRateTenant,
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'properties' | 'tenants'>('applications');
  const [inspectingApp, setInspectingApp] = useState<BookingApplication | null>(null);

  const totalBeds = accommodations.reduce((acc, p) => acc + (p.totalBeds || 0), 0);
  const availableBeds = accommodations.reduce((acc, p) => acc + (p.availableBeds || 0), 0);
  const occupiedBeds = Math.max(0, totalBeds - availableBeds);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const pendingApps = applications.filter((a) => a.status === 'Pending Review').length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 text-slate-900">
      {/* Landlord Header Banner */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 px-2 py-0.5 bg-orange-50 rounded border border-orange-200">
              Landlord & Residence Manager Portal
            </span>
            <span className="text-xs font-semibold text-lime-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-lime-600" />
              Verified Accredited Host
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Student Housing Management Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            Review student rental applications with attached POPIA-verified IDs, manage room allocations, converse with applicants, and issue tenant ratings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="landlord-list-property-btn"
            onClick={onOpenAddListing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Student Property</span>
          </button>

          <button
            onClick={onOpenMessages}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition shadow-xs"
          >
            <MessageSquare className="w-4 h-4 text-orange-600" />
            <span>Applicant Chat</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-0.5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-orange-600" />
            Active Residences
          </span>
          <p className="text-xl font-bold text-slate-900 font-mono">{accommodations.length}</p>
          <p className="text-[10px] text-lime-900 font-semibold">100% Accredited Listings</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-0.5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-orange-600" />
            Student Beds & Occupancy
          </span>
          <p className="text-xl font-bold text-slate-900 font-mono">
            {occupiedBeds} / {totalBeds}
          </p>
          <p className="text-[10px] text-orange-700 font-semibold">{occupancyRate}% Full Capacity</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-0.5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-amber-500" />
            Pending Applications
          </span>
          <p className="text-xl font-bold text-amber-700 font-mono">{pendingApps}</p>
          <p className="text-[10px] text-slate-500">Requires Document Review</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-0.5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Landlord Reputation
          </span>
          <p className="text-xl font-bold text-slate-900 font-mono">4.9 / 5.0</p>
          <p className="text-[10px] text-lime-900 font-semibold">Top Rated Host in Rondebosch</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-6 text-xs sm:text-sm font-semibold">
        {[
          { id: 'applications', label: `Student Applications (${applications.length})` },
          { id: 'properties', label: `My Properties (${accommodations.length})` },
          { id: 'tenants', label: 'Rate Student Tenants' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 text-xs sm:text-sm font-bold transition border-b-2 ${
              activeTab === tab.id
                ? 'border-orange-500 text-orange-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: APPLICATIONS TABLE */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-orange-600" />
                Submitted Rental Applications & Attached Vault Documents
              </h3>
              <span className="text-xs text-slate-500">{applications.length} total applications</span>
            </div>

            {applications.length > 0 ? (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                {applications.map((app, appIdx) => (
                  <div
                    key={app.id || `app-${appIdx}`}
                    className="p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <img
                        src={app.propertyImage}
                        alt=""
                        className="w-14 h-12 rounded-lg object-cover shrink-0 border border-slate-200 shadow-xs"
                      />
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{app.studentName}</h4>
                          <span className="text-[10px] font-semibold text-orange-800 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                            {app.studentUniversity}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              app.status === 'Accepted'
                                ? 'bg-lime-50 text-lime-900 border-lime-300'
                                : app.status === 'Declined'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600">
                          Applying for: <strong>{app.roomName}</strong> at <strong>{app.propertyTitle}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Rent: <strong className="text-slate-900">R{(app.monthlyRent || 0).toLocaleString()}/mo</strong> &bull; Move-in: {app.moveInDate} &bull; Funding: <strong className="text-lime-900">{app.fundingType}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Attached Documents & Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* View Attached Docs Button */}
                      <button
                        onClick={() => setInspectingApp(app)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-lime-900 transition shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-lime-600" />
                        <span>Inspect {(app.documentsAttached || []).length} Documents</span>
                      </button>

                      {/* Chat with student */}
                      <button
                        onClick={onOpenMessages}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition shadow-xs"
                        title="Chat with student"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                      </button>

                      {/* Approve / Decline Controls */}
                      {app.status === 'Pending Review' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateApplicationStatus(app.id, 'Accepted')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-lime-600 hover:bg-lime-700 text-slate-950 text-xs font-bold shadow-xs transition"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approve Lease</span>
                          </button>
                          <button
                            onClick={() => onUpdateApplicationStatus(app.id, 'Declined')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition shadow-xs"
                          >
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-xs">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">No Student Applications Yet</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You don't have any pending or past rental applications. Once students browse your accommodations and submit lease requests, their applications with encrypted POPIA ID documents will appear here.
                  </p>
                </div>
                {accommodations.length === 0 && (
                  <button
                    onClick={onOpenAddListing}
                    className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>List First Property</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY PROPERTIES */}
      {activeTab === 'properties' && (
        <div>
          {accommodations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accommodations.map((prop, propIdx) => {
                const status = prop.approvalStatus || (prop.verifiedListing ? 'Approved' : 'Pending Approval');

                return (
                  <div
                    key={prop.id || `prop-${propIdx}`}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden space-y-2.5 p-3.5 flex flex-col justify-between shadow-xs"
                  >
                    <div className="space-y-2.5">
                      <div className="relative">
                        <img
                          src={prop.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'}
                          alt={prop.title}
                          className="w-full h-36 object-cover rounded-lg border border-slate-200"
                        />
                        <div className="absolute top-2 right-2">
                          {status === 'Approved' && (
                            <span className="px-2 py-0.5 rounded-full bg-lime-100/95 text-lime-900 font-bold border border-lime-300 text-[10px] shadow-2xs backdrop-blur-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-lime-700" />
                              Live & Accredited
                            </span>
                          )}
                          {status === 'Pending Approval' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100/95 text-amber-900 font-bold border border-amber-300 text-[10px] shadow-2xs backdrop-blur-xs flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-700" />
                              Pending Accreditation
                            </span>
                          )}
                          {status === 'Rejected' && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100/95 text-rose-900 font-bold border border-rose-300 text-[10px] shadow-2xs backdrop-blur-xs flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-700" />
                              Requires Action
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs text-orange-700 font-bold uppercase">
                          <span>{prop.suburb}</span>
                          <span className="text-lime-900 font-semibold">{prop.availableBeds} beds available</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{prop.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{prop.tagline}</p>
                      </div>

                      {/* Feedback / Moderation Note Banner */}
                      {prop.moderationNotes && (
                        <div className={`p-2.5 rounded-lg border text-xs ${
                          status === 'Rejected'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : status === 'Approved'
                            ? 'bg-lime-50 border-lime-200 text-lime-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}>
                          <span className="font-bold block text-[10px] uppercase tracking-wider mb-0.5">
                            {status === 'Rejected' ? 'Admin Rejection Feedback' : status === 'Approved' ? 'Accreditation Note' : 'Audit Feedback'}
                          </span>
                          <p className="text-[11px] leading-snug">{prop.moderationNotes}</p>
                        </div>
                      )}

                      {/* Amenities with symbols (Top 2) */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {(prop.amenities || []).slice(0, 2).map((amenity, i) => {
                          const config = getAmenityDetails(amenity);
                          const IconComp = config.icon;
                          return (
                            <span
                              key={`${prop.id || propIdx}-amenity-${i}-${amenity}`}
                              title={amenity}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${config.bgClass} ${config.borderClass} ${config.colorClass}`}
                            >
                              <IconComp className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[100px]">{config.shortLabel}</span>
                            </span>
                          );
                        })}
                        {(prop.amenities?.length || 0) > 2 && (
                          <span
                            title={(prop.amenities || []).slice(2).join(', ')}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>{(prop.amenities?.length || 0) - 2} more</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-900">
                        From R{(prop.priceFrom || 0).toLocaleString()}/mo
                      </span>
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        status === 'Approved'
                          ? 'bg-lime-100 text-lime-900 border border-lime-300'
                          : status === 'Pending Approval'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        {status === 'Approved' ? 'Active on Student Feed' : status === 'Pending Approval' ? 'Awaiting Inspection' : 'Listing Flagged'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-xs">
                <Home className="w-6 h-6" />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="text-sm font-bold text-slate-900">No Accommodations Uploaded Yet</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  As a newly registered landlord, you don't have any residences listed on iKhaya yet. Upload your first student residence with photos, house rules, and room pricing to start receiving applications.
                </p>
              </div>
              <button
                onClick={onOpenAddListing}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List New Student Property</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TENANTS & APPLICANTS DIRECTORY */}
      {activeTab === 'tenants' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-600" />
                Registered Student Tenants & Applicants
              </h3>
              <p className="text-xs text-slate-500">
                Verified student directory with encrypted identity & university registration status.
              </p>
            </div>
          </div>

          {/* Student Tenant Cards */}
          {studentProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm border-2 border-lime-400">
                    {studentProfile.fullName
                      ? studentProfile.fullName
                          .split(' ')
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'ST'}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{studentProfile.fullName || 'Student'}</h4>
                    <p className="text-xs text-slate-500">{studentProfile.university || 'University Student'} &bull; {studentProfile.yearOfStudy || 'Undergraduate'}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-lime-800 bg-lime-50 px-2 py-0.5 rounded border border-lime-300 mt-1">
                      <ShieldCheck className="w-3 h-3 text-lime-600" />
                      {studentProfile.fundingType || 'Verified Funding'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                  <p><span className="font-semibold text-slate-800">Email:</span> {studentProfile.email || 'N/A'}</p>
                  <p><span className="font-semibold text-slate-800">Phone:</span> {studentProfile.phone || 'N/A'}</p>
                  <p><span className="font-semibold text-slate-800">Student ID:</span> {studentProfile.studentNumber || 'N/A'}</p>
                  <p><span className="font-semibold text-slate-800">Vault:</span> {(studentProfile.documents || []).length} verified documents on file</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No active student profiles currently loaded.</p>
          )}
        </div>
      )}

      {/* Inspect Student Application Documents Lightbox */}
      {inspectingApp && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-4 sm:p-5 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 bg-slate-50 -m-4 sm:-m-5 p-4 sm:p-5 mb-1 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-lime-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Applicant Document Verification: {inspectingApp.studentName}
                </h3>
              </div>
              <button onClick={() => setInspectingApp(null)}>
                <XCircle className="w-4 h-4 text-slate-500 hover:text-slate-900" />
              </button>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs text-slate-600">
                Verified rental documentation attached from Ikhaya Secure Student Vault:
              </p>

              <div className="space-y-2">
                {(studentProfile?.documents || []).length > 0 ? (
                  (studentProfile?.documents || []).map((doc, docIdx) => (
                    <div
                      key={doc.id || `doc-${doc.name || ''}-${docIdx}`}
                      className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-lime-600" />
                        <div>
                          <p className="font-bold text-slate-900">{doc.name}</p>
                          <span className="text-[10px] text-slate-500">
                            {doc.fileSize} &bull; {doc.verificationNotes}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] text-lime-800 bg-lime-50 px-1.5 py-0.2 rounded font-bold border border-lime-300">
                        Verified
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Documents submitted directly with application.</p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500">POPIA Compliant Secure View</span>
              <button
                onClick={() => {
                  onUpdateApplicationStatus(inspectingApp.id, 'Accepted');
                  setInspectingApp(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs"
              >
                Approve Lease Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
