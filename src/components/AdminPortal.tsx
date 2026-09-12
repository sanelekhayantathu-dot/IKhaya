import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Search, 
  Filter, 
  Building, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowUpRight, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  MapPin,
  GraduationCap,
  Download,
  Check,
  X,
  FileCheck,
  AlertCircle,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Star,
  Zap,
  Bus,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Accommodation, StudentDocumentSubmission, RoomOption } from '../types';
import { getAmenityDetails } from '../utils/amenityIcons';
import { DocumentViewerModal } from './DocumentViewerModal';

interface AdminPortalProps {
  accommodations: Accommodation[];
  onApproveAccommodation: (id: string, notes?: string) => void;
  onDenyAccommodation: (id: string, notes?: string) => void;
  studentDocuments: StudentDocumentSubmission[];
  onApproveDocument: (docId: string, notes?: string) => void;
  onDeclineDocument: (docId: string, reason?: string) => void;
  onViewAccommodation?: (property: Accommodation) => void;
  onExitAdmin?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  accommodations,
  onApproveAccommodation,
  onDenyAccommodation,
  studentDocuments,
  onApproveDocument,
  onDeclineDocument,
  onViewAccommodation,
  onExitAdmin,
}) => {
  // =========================================================================
  // 1. PASSWORD PROTECTION & STAFF AUTHENTICATION STATE
  // =========================================================================
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('ikhaya_admin_unlocked') === 'true';
  });
  const [staffIdInput, setStaffIdInput] = useState<string>(() => {
    return sessionStorage.getItem('ikhaya_staff_id') || '';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [activeStaffId, setActiveStaffId] = useState<string>(() => {
    return sessionStorage.getItem('ikhaya_staff_id') || 'STAFF-OFFICER-01';
  });

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffIdInput.trim()) {
      setAuthError('Please enter your iKhaya Staff ID.');
      return;
    }
    if (passwordInput !== 'theDuke@05') {
      setAuthError('Incorrect administrative password. Access denied.');
      return;
    }

    setAuthError('');
    setIsAdminUnlocked(true);
    const assignedStaffId = staffIdInput.trim();
    setActiveStaffId(assignedStaffId);
    sessionStorage.setItem('ikhaya_admin_unlocked', 'true');
    sessionStorage.setItem('ikhaya_staff_id', assignedStaffId);
  };

  const handleAdminLock = () => {
    setIsAdminUnlocked(false);
    setPasswordInput('');
    sessionStorage.removeItem('ikhaya_admin_unlocked');
  };

  // =========================================================================
  // 2. PORTAL NAVIGATION & MODAL STATES
  // =========================================================================
  const [activeTab, setActiveTab] = useState<'listings' | 'documents' | 'performance'>('listings');

  // Listings filter
  const [listingFilter, setListingFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [listingSearch, setListingSearch] = useState('');

  // Documents filter (Per Profile)
  const [docFilter, setDocFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'ACTION_REQUIRED'>('ALL');
  const [docSearch, setDocSearch] = useState('');
  const [expandedProfiles, setExpandedProfiles] = useState<Record<string, boolean>>({
    'stud-user': true,
    'stud-102': true,
    'stud-104': true,
  });

  // Accommodation Full Inspector Modal
  const [inspectingProperty, setInspectingProperty] = useState<Accommodation | null>(null);
  const [activeInspectorImg, setActiveInspectorImg] = useState<number>(0);
  const [selectedInspectorRoom, setSelectedInspectorRoom] = useState<RoomOption | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'rooms' | 'proximity' | 'amenities' | 'reviews'>('overview');

  // Rejection modal state for listing or document
  const [rejectItem, setRejectItem] = useState<{
    type: 'listing' | 'document' | 'profile';
    id: string;
    name: string;
    studentId?: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Document preview state
  const [previewDoc, setPreviewDoc] = useState<StudentDocumentSubmission | null>(null);

  // Approval note modal for accommodation
  const [approveListingItem, setApproveListingItem] = useState<Accommodation | null>(null);
  const [approvalNote, setApprovalNote] = useState('Accredited and approved for 2026 academic intake.');

  // =========================================================================
  // 3. COMPUTED DATA (LISTINGS & PER-PROFILE DOCUMENTS)
  // =========================================================================
  // Filtered accommodations
  const filteredListings = accommodations.filter((item) => {
    const status = item.approvalStatus || (item.verifiedListing ? 'Approved' : 'Pending Approval');
    if (listingFilter === 'PENDING' && status !== 'Pending Approval') return false;
    if (listingFilter === 'APPROVED' && status !== 'Approved') return false;
    if (listingFilter === 'REJECTED' && status !== 'Rejected') return false;
    if (listingSearch) {
      const q = listingSearch.toLowerCase();
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.town || '').toLowerCase().includes(q) ||
        (item.suburb || '').toLowerCase().includes(q) ||
        (item.landlord?.name || '').toLowerCase().includes(q) ||
        (item.type || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingListingsCount = accommodations.filter(
    (a) => (a.approvalStatus || (a.verifiedListing ? 'Approved' : 'Pending Approval')) === 'Pending Approval'
  ).length;

  // Group student documents PER STUDENT PROFILE
  interface StudentProfileGroup {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentUniversity: string;
    studentNumber: string;
    documents: StudentDocumentSubmission[];
    totalDocs: number;
    verifiedDocs: number;
    pendingDocs: number;
    actionRequiredDocs: number;
    profileStatus: 'Verified' | 'Pending Verification' | 'Requires Update';
  }

  const studentProfileGroups = useMemo<StudentProfileGroup[]>(() => {
    const map = new Map<string, StudentProfileGroup>();

    studentDocuments.forEach((doc) => {
      if (!map.has(doc.studentId)) {
        map.set(doc.studentId, {
          studentId: doc.studentId,
          studentName: doc.studentName,
          studentEmail: doc.studentEmail,
          studentUniversity: doc.studentUniversity,
          studentNumber: doc.studentNumber,
          documents: [],
          totalDocs: 0,
          verifiedDocs: 0,
          pendingDocs: 0,
          actionRequiredDocs: 0,
          profileStatus: 'Pending Verification',
        });
      }

      const group = map.get(doc.studentId)!;
      group.documents.push(doc);
      group.totalDocs += 1;
      if (doc.status === 'Verified') group.verifiedDocs += 1;
      else if (doc.status === 'Requires Update' || doc.status === 'Declined') group.actionRequiredDocs += 1;
      else group.pendingDocs += 1;
    });

    // Compute overall status for each student profile
    const groups = Array.from(map.values()).map((g) => {
      if (g.actionRequiredDocs > 0) {
        g.profileStatus = 'Requires Update';
      } else if (g.verifiedDocs === g.totalDocs && g.totalDocs > 0) {
        g.profileStatus = 'Verified';
      } else {
        g.profileStatus = 'Pending Verification';
      }
      return g;
    });

    return groups;
  }, [studentDocuments]);

  // Filter student profile groups
  const filteredProfileGroups = studentProfileGroups.filter((group) => {
    if (docFilter === 'PENDING' && group.profileStatus !== 'Pending Verification') return false;
    if (docFilter === 'VERIFIED' && group.profileStatus !== 'Verified') return false;
    if (docFilter === 'ACTION_REQUIRED' && group.profileStatus !== 'Requires Update') return false;
    if (docSearch) {
      const q = docSearch.toLowerCase();
      const matchDoc = group.documents.some(
        (d) =>
          (d?.documentName || '').toLowerCase().includes(q) ||
          (d?.documentType || '').toLowerCase().includes(q)
      );
      return (
        (group.studentName || '').toLowerCase().includes(q) ||
        (group.studentUniversity || '').toLowerCase().includes(q) ||
        (group.studentNumber || '').toLowerCase().includes(q) ||
        (group.studentEmail || '').toLowerCase().includes(q) ||
        matchDoc
      );
    }
    return true;
  });

  const pendingProfilesCount = studentProfileGroups.filter((g) => g.profileStatus === 'Pending Verification').length;
  const actionRequiredProfilesCount = studentProfileGroups.filter((g) => g.profileStatus === 'Requires Update').length;
  const verifiedProfilesCount = studentProfileGroups.filter((g) => g.profileStatus === 'Verified').length;

  const toggleProfileExpand = (studentId: string) => {
    setExpandedProfiles((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Rejection confirmation handler
  const handleConfirmReject = () => {
    if (!rejectItem) return;

    if (rejectItem.type === 'listing') {
      const note = rejectReason.trim() || 'Listing does not comply with accredited student housing safety standards.';
      onDenyAccommodation(rejectItem.id, note);
      if (inspectingProperty && inspectingProperty.id === rejectItem.id) {
        setInspectingProperty((prev) => prev ? { ...prev, approvalStatus: 'Rejected', moderationNotes: note } : null);
      }
    } else if (rejectItem.type === 'document') {
      const note = rejectReason.trim() || 'Document image unclear or certified stamp is older than 3 months. Please upload a fresh copy.';
      onDeclineDocument(rejectItem.id, note);
    } else if (rejectItem.type === 'profile' && rejectItem.studentId) {
      const note = rejectReason.trim() || 'Student profile documents require re-certification and update.';
      // Mark all non-verified documents for this student as Requires Update
      const targetDocs = studentDocuments.filter((d) => d.studentId === rejectItem.studentId && d.status !== 'Verified');
      targetDocs.forEach((d) => onDeclineDocument(d.id, note));
    }

    setRejectItem(null);
    setRejectReason('');
  };

  const handleConfirmApproval = () => {
    if (!approveListingItem) return;
    const note = approvalNote.trim() || 'Accredited and approved for 2026 academic intake.';
    onApproveAccommodation(approveListingItem.id, note);
    if (inspectingProperty && inspectingProperty.id === approveListingItem.id) {
      setInspectingProperty((prev) => prev ? { ...prev, approvalStatus: 'Approved', moderationNotes: note, verifiedListing: true } : null);
    }
    setApproveListingItem(null);
    setApprovalNote('Accredited and approved for 2026 academic intake.');
  };

  // Profile-level batch approve
  const handleApproveAllProfileDocs = (group: StudentProfileGroup) => {
    group.documents.forEach((doc) => {
      if (doc.status !== 'Verified') {
        onApproveDocument(doc.id, 'Verified against national student and DHA records');
      }
    });
  };

  // =========================================================================
  // RENDER: 1. LOCKED PASSWORD SCREEN
  // =========================================================================
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
          {/* Header Icon & Branding */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-orange-500 flex items-center justify-center mx-auto shadow-lg border border-slate-800">
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              Restricted Command Center
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              iKhaya Staff Administration
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Please authenticate with your official staff credentials to access listing accreditation, document audits, and moderation controls.
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                iKhaya Staff ID:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. STAFF-CPT-2026 or any Staff ID"
                  value={staffIdInput}
                  onChange={(e) => setStaffIdInput(e.target.value)}
                  className="w-full pl-3.5 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Enter your staff badge identifier or moderation username.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter staff master password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Command Center</span>
            </button>
          </form>

          {/* Footer exit link */}
          {onExitAdmin && (
            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onExitAdmin}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                &larr; Return to Student Portal
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: 2. UNLOCKED ADMIN COMMAND CENTER
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Banner / Welcome with Staff ID & Lock Controls */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              iKhaya System Administration & Compliance
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-lime-500/20 text-lime-300 border border-lime-500/30 text-[11px] font-bold">
              <UserCheck className="w-3 h-3" />
              <span>Staff ID: {activeStaffId}</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Accreditation & Moderation Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Inspect live accommodation submissions, audit student identity & NSFAS records per profile, and update live feedback directly to landlord & student hubs.
          </p>
        </div>

        {/* Quick Pending Counter Pills & Lock Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('listings');
              setListingFilter('PENDING');
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              pendingListingsCount > 0
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <span>{pendingListingsCount} Pending Listings</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('documents');
              setDocFilter('PENDING');
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              pendingProfilesCount > 0
                ? 'bg-orange-500/20 border-orange-500/40 text-orange-300 hover:bg-orange-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>{pendingProfilesCount} Pending Profiles</span>
          </button>

          <button
            onClick={handleAdminLock}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
            title="Lock Admin Session"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'listings'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Accommodations Moderation</span>
          {pendingListingsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
              {pendingListingsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'documents'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Student Document Vault Verification</span>
          {pendingProfilesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-black">
              {pendingProfilesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'performance'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Listing Performance & Platform Metrics</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACCOMMODATIONS MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setListingFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  listingFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({accommodations.length})
              </button>
              <button
                onClick={() => setListingFilter('PENDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  listingFilter === 'PENDING'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Pending Approval ({pendingListingsCount})
              </button>
              <button
                onClick={() => setListingFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  listingFilter === 'APPROVED'
                    ? 'bg-lime-600 text-white'
                    : 'bg-lime-50 text-lime-800 hover:bg-lime-100'
                }`}
              >
                Approved / Live ({accommodations.filter((a) => (a.approvalStatus || (a.verifiedListing ? 'Approved' : 'Pending Approval')) === 'Approved').length})
              </button>
              <button
                onClick={() => setListingFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  listingFilter === 'REJECTED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Declined ({accommodations.filter((a) => a.approvalStatus === 'Rejected').length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search residence, suburb, landlord..."
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Listings Cards */}
          <div className="grid grid-cols-1 gap-3.5">
            {filteredListings.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                <Building className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No accommodations match this filter</p>
                <p className="text-xs text-slate-400">All submissions are currently processed.</p>
              </div>
            ) : (
              filteredListings.map((property) => {
                const status = property.approvalStatus || (property.verifiedListing ? 'Approved' : 'Pending Approval');
                return (
                  <div
                    key={property.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition space-y-3 cursor-pointer group"
                    onClick={() => {
                      setInspectingProperty(property);
                      setActiveInspectorImg(0);
                      setSelectedInspectorRoom(property.rooms?.[0] || null as any);
                      setInspectorTab('overview');
                    }}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Property Left Details */}
                      <div className="flex items-start gap-3.5">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={property.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80'}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                            <Eye className="w-4 h-4 mr-1" /> Inspect
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                              {property.title}
                            </h3>
                            {/* Status Badge */}
                            {status === 'Approved' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-800 border border-lime-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-lime-600" />
                                Live & Approved
                              </span>
                            )}
                            {status === 'Pending Approval' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-700" />
                                Awaiting Audit
                              </span>
                            )}
                            {status === 'Rejected' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Declined / Flagged
                              </span>
                            )}
                            {property.nsfasAccredited && (
                              <span className="px-2 py-0.5 rounded-md bg-lime-50 text-lime-800 border border-lime-200 text-[10px] font-bold">
                                NSFAS
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{property.streetAddress}, {property.suburb}, {property.town}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                            <span className="font-semibold text-orange-600">
                              R{(property.priceFrom || 0).toLocaleString()} - R{(property.priceTo || property.priceFrom || 0).toLocaleString()}/mo
                            </span>
                            <span>&bull;</span>
                            <span>{property.totalBeds || 1} Total Beds ({property.availableBeds || 0} Available)</span>
                            <span>&bull;</span>
                            <span className="text-slate-500">
                              Host: <strong>{property.landlord?.name || 'Accredited Landlord'}</strong> ({property.landlord?.agencyName || 'Private Host'})
                            </span>
                          </div>

                          {property.moderationNotes && (
                            <div className="text-[11px] text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block mt-1">
                              <strong>Auditor Feedback:</strong> {property.moderationNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Property Right Actions */}
                      <div 
                        className="flex flex-wrap items-center gap-2 self-stretch lg:self-center justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setInspectingProperty(property);
                            setActiveInspectorImg(0);
                            setSelectedInspectorRoom(property.rooms?.[0] || null as any);
                            setInspectorTab('overview');
                          }}
                          className="px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-orange-600" />
                          <span>Inspect Residence</span>
                        </button>

                        {status !== 'Approved' && (
                          <button
                            type="button"
                            onClick={() => setApproveListingItem(property)}
                            className="px-3.5 py-2 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {status !== 'Rejected' && (
                          <button
                            type="button"
                            onClick={() => setRejectItem({ type: 'listing', id: property.id, name: property.title })}
                            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDENT DOCUMENTATION VERIFICATION CENTER (GROUPED PER PROFILE) */}
      {/* ========================================================================= */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {/* Summary Pills & Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setDocFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  docFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Student Profiles ({studentProfileGroups.length})
              </button>
              <button
                onClick={() => setDocFilter('PENDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  docFilter === 'PENDING'
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
                }`}
              >
                Pending Verification ({pendingProfilesCount})
              </button>
              <button
                onClick={() => setDocFilter('VERIFIED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  docFilter === 'VERIFIED'
                    ? 'bg-lime-600 text-white'
                    : 'bg-lime-50 text-lime-800 hover:bg-lime-100'
                }`}
              >
                Verified Profiles ({verifiedProfilesCount})
              </button>
              <button
                onClick={() => setDocFilter('ACTION_REQUIRED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  docFilter === 'ACTION_REQUIRED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Requires Update ({actionRequiredProfilesCount})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student, university, ID #..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Grouped Per Profile Cards */}
          <div className="space-y-4">
            {filteredProfileGroups.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No student profiles match this filter</p>
                <p className="text-xs text-slate-400">All submitted document bundles are processed.</p>
              </div>
            ) : (
              filteredProfileGroups.map((group) => {
                const isExpanded = expandedProfiles[group.studentId] ?? true;

                return (
                  <div
                    key={group.studentId}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition"
                  >
                    {/* Student Profile Header Bar */}
                    <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white font-black text-sm flex items-center justify-center shadow-xs border border-orange-400 shrink-0">
                          {group.studentName
                            ? (group.studentName
                                .split(' ')
                                .filter(Boolean)
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase() || 'ST')
                            : 'ST'}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900">
                              {group.studentName}
                            </h3>

                            {/* Overall Profile Status Badge */}
                            {group.profileStatus === 'Verified' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-800 border border-lime-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-lime-600" />
                                All Documents Verified
                              </span>
                            )}
                            {group.profileStatus === 'Pending Verification' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-700" />
                                Pending Verification ({group.pendingDocs} in review)
                              </span>
                            )}
                            {group.profileStatus === 'Requires Update' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                Action Required ({group.actionRequiredDocs} flagged)
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <span className="font-semibold text-orange-700 flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5" />
                              {group.studentUniversity}
                            </span>
                            <span>&bull;</span>
                            <span className="text-slate-500">Student #: <strong>{group.studentNumber}</strong></span>
                            <span>&bull;</span>
                            <span className="text-slate-500">{group.studentEmail}</span>
                          </div>
                        </div>
                      </div>

                      {/* Profile Action Buttons & Collapse Toggle */}
                      <div className="flex flex-wrap items-center gap-2 self-stretch md:self-center justify-end">
                        {group.profileStatus !== 'Verified' && (
                          <button
                            type="button"
                            onClick={() => handleApproveAllProfileDocs(group)}
                            className="px-3.5 py-1.5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify All ({group.totalDocs})</span>
                          </button>
                        )}

                        {group.profileStatus !== 'Requires Update' && (
                          <button
                            type="button"
                            onClick={() => setRejectItem({ 
                              type: 'profile', 
                              id: group.studentId, 
                              studentId: group.studentId, 
                              name: `${group.studentName}'s Document Bundle` 
                            })}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Request Resubmission</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleProfileExpand(group.studentId)}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold transition flex items-center gap-1"
                        >
                          <span>{group.documents.length} Docs</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Documents List for this Profile */}
                    {isExpanded && (
                      <div className="p-4 space-y-2 divide-y divide-slate-100">
                        {group.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition"
                          >
                            {/* Document Info */}
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>

                              <div className="space-y-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">{doc.documentName}</span>
                                  
                                  {doc.status === 'Verified' && (
                                    <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 text-[10px] font-bold inline-flex items-center gap-1">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-lime-600" />
                                      Verified
                                    </span>
                                  )}
                                  {doc.status === 'Pending Verification' && (
                                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold inline-flex items-center gap-1">
                                      <Clock className="w-2.5 h-2.5 text-orange-600" />
                                      Pending Review
                                    </span>
                                  )}
                                  {(doc.status === 'Requires Update' || doc.status === 'Declined') && (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold inline-flex items-center gap-1">
                                      <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                                      Requires Update
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] text-slate-500">
                                  Type: <strong className="text-slate-700">{String(doc.documentType || 'OTHER').replace(/_/g, ' ')}</strong> &bull; {doc.fileSize || 'Standard'} &bull; Uploaded: {doc.uploadedAt || 'Recently'}
                                </p>

                                {doc.adminNotes && (
                                  <div className="text-[11px] text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200 inline-block mt-0.5">
                                    <strong>Auditor Note:</strong> {doc.adminNotes}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Document Actions */}
                            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(doc)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>

                              {doc.status !== 'Verified' && (
                                <button
                                  type="button"
                                  onClick={() => onApproveDocument(doc.id, 'Certified and authenticated by iKhaya compliance officer')}
                                  className="px-2.5 py-1.5 rounded-lg bg-lime-50 hover:bg-lime-100 text-lime-700 border border-lime-200 text-xs font-bold transition flex items-center gap-1"
                                  title="Accept & Mark Verified"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Verify</span>
                                </button>
                              )}

                              {doc.status !== 'Requires Update' && (
                                <button
                                  type="button"
                                  onClick={() => setRejectItem({ 
                                    type: 'document', 
                                    id: doc.id, 
                                    name: `${doc.studentName} - ${doc.documentName}` 
                                  })}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1"
                                  title="Flag & Request Update"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Flag</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PLATFORM PERFORMANCE & ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Active Listed Beds</span>
                <Building className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {accommodations.reduce((acc, curr) => acc + (curr.totalBeds || 0), 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-lime-700 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Across {accommodations.length} accredited residences</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Student Listing Views</span>
                <Eye className="w-4 h-4 text-lime-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {accommodations.reduce((acc, curr) => acc + (curr.viewsCount || 1200), 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-lime-700 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+24.6% this academic intake</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Lease Applications</span>
                <FileCheck className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {accommodations.reduce((acc, curr) => acc + (curr.applicationsCount || 18), 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">
                Average approval turnaround 2.4 hrs
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">NSFAS Accreditation Rate</span>
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {Math.round((accommodations.filter((a) => a.nsfasAccredited).length / accommodations.length) * 100)}%
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold">
                Direct DHA & NSFAS automated checks
              </div>
            </div>
          </div>

          {/* Performance Ranking Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Residence Engagement & Conversion Performance</h3>
              <p className="text-xs text-slate-500">Live analytics on view counts, student inquiries, and application velocity</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-3.5 py-2.5">Residence</th>
                    <th className="px-3.5 py-2.5">Location</th>
                    <th className="px-3.5 py-2.5">Rent Range</th>
                    <th className="px-3.5 py-2.5">Views</th>
                    <th className="px-3.5 py-2.5">Inquiries</th>
                    <th className="px-3.5 py-2.5">Applications</th>
                    <th className="px-3.5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accommodations.map((item, index) => {
                    const views = item.viewsCount || (2400 - index * 250);
                    const inqs = item.inquiriesCount || (68 - index * 7);
                    const apps = item.applicationsCount || (24 - index * 3);
                    const status = item.approvalStatus || (item.verifiedListing ? 'Approved' : 'Pending Approval');

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="px-3.5 py-3 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="truncate max-w-[200px]">{item.title}</span>
                        </td>
                        <td className="px-3.5 py-3 text-slate-600">{item.town} ({item.suburb})</td>
                        <td className="px-3.5 py-3 font-semibold text-orange-600">R{item.priceFrom}</td>
                        <td className="px-3.5 py-3 font-mono">{views.toLocaleString()}</td>
                        <td className="px-3.5 py-3 font-mono">{inqs}</td>
                        <td className="px-3.5 py-3 font-mono font-bold text-slate-900">{apps}</td>
                        <td className="px-3.5 py-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            status === 'Approved' ? 'bg-lime-100 text-lime-800' : status === 'Pending Approval' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FULL ACCOMMODATION INSPECTOR MODAL (STUDENT'S VIEW WITH ADMIN CONTROLS) */}
      {/* ========================================================================= */}
      {inspectingProperty && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
            {/* Inspector Top Bar with Status & Quick Controls */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectingProperty(null)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Exit Inspector</span>
                </button>
                <div className="h-4 w-px bg-slate-700" />
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  Accreditation Inspector
                </span>
                <span className="text-xs text-slate-400 truncate max-w-xs">
                  {inspectingProperty.title}
                </span>
              </div>

              {/* Status & Moderation Action Buttons in Header */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  (inspectingProperty.approvalStatus || 'Pending Approval') === 'Approved'
                    ? 'bg-lime-500/20 text-lime-300 border border-lime-500/40'
                    : (inspectingProperty.approvalStatus || 'Pending Approval') === 'Pending Approval'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  Status: {inspectingProperty.approvalStatus || (inspectingProperty.verifiedListing ? 'Approved' : 'Pending Approval')}
                </span>

                {(inspectingProperty.approvalStatus || (inspectingProperty.verifiedListing ? 'Approved' : 'Pending Approval')) !== 'Approved' && (
                  <button
                    type="button"
                    onClick={() => setApproveListingItem(inspectingProperty)}
                    className="px-3.5 py-1.5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Listing</span>
                  </button>
                )}

                {inspectingProperty.approvalStatus !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => setRejectItem({ type: 'listing', id: inspectingProperty.id, name: inspectingProperty.title })}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject / Decline</span>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body: Identical to Student View */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
              {/* Photo Gallery Carousel */}
              <div className="space-y-2">
                <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img
                    src={inspectingProperty.images?.[activeInspectorImg] || inspectingProperty.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'}
                    alt={inspectingProperty.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-950 px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-lg shadow-xs">
                      {inspectingProperty.type}
                    </span>
                    {inspectingProperty.nsfasAccredited && (
                      <span className="text-xs font-bold text-lime-900 px-2.5 py-1 bg-lime-100/90 backdrop-blur-xs rounded-lg border border-lime-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-lime-700" />
                        NSFAS Accredited
                      </span>
                    )}
                    {inspectingProperty.hasBackupPower && (
                      <span className="text-xs font-bold text-amber-900 px-2.5 py-1 bg-amber-100/90 backdrop-blur-xs rounded-lg border border-amber-300 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-700" />
                        Load-Shedding Backup Power
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-xs rounded-full text-white text-xs font-bold">
                    {activeInspectorImg + 1} / {(inspectingProperty.images || []).length || 1} Photos
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {(inspectingProperty.images || []).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveInspectorImg(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                        activeInspectorImg === i ? 'border-orange-500 ring-2 ring-orange-200' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title, Address & Price Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{inspectingProperty.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>{inspectingProperty.streetAddress}, {inspectingProperty.suburb}, {inspectingProperty.town}</span>
                  </p>
                </div>

                <div className="text-left md:text-right space-y-0.5">
                  <div className="text-xs text-slate-500">Monthly Rental Range</div>
                  <div className="text-xl sm:text-2xl font-black text-orange-600 font-mono">
                    R{(inspectingProperty.priceFrom || 0).toLocaleString()} - R{(inspectingProperty.priceTo || inspectingProperty.priceFrom || 0).toLocaleString()}
                    <span className="text-xs text-slate-500 font-sans font-normal"> /mo</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Deposit: R{(inspectingProperty.depositAmount || 0).toLocaleString()} &bull; {inspectingProperty.totalBeds || 1} Total Student Beds
                  </div>
                </div>
              </div>

              {/* Inspector Sub-Tabs */}
              <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
                {[
                  { id: 'overview', label: 'Overview & Specs' },
                  { id: 'rooms', label: `Room Options (${(inspectingProperty.rooms || []).length})` },
                  { id: 'proximity', label: 'University Proximity' },
                  { id: 'amenities', label: 'Amenities & Security' },
                  { id: 'reviews', label: `Host & Reviews (${(inspectingProperty.landlord?.reviews || []).length})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setInspectorTab(t.id as any)}
                    className={`pb-2.5 transition border-b-2 ${
                      inspectorTab === t.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview */}
              {inspectorTab === 'overview' && (
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {inspectingProperty.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Gender Policy</span>
                      <span className="text-xs font-bold text-slate-900">{inspectingProperty.genderPolicy}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Bills Included</span>
                      <span className="text-xs font-bold text-slate-900">{inspectingProperty.allBillsIncluded ? 'Yes, All Inclusive' : 'Water Only'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Beds</span>
                      <span className="text-xs font-bold text-lime-700">{inspectingProperty.availableBeds} of {inspectingProperty.totalBeds} Beds</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Instant Book</span>
                      <span className="text-xs font-bold text-slate-900">{inspectingProperty.instantBookAvailable ? 'Enabled' : 'Host Pre-approval'}</span>
                    </div>
                  </div>

                  {/* House Rules */}
                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">House Rules</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(inspectingProperty.houseRules || []).map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Rooms */}
              {inspectorTab === 'rooms' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(inspectingProperty.rooms || []).map((room) => (
                    <div key={room.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <img src={room.image || inspectingProperty.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'} alt={room.name} className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{room.name}</h4>
                        <span className="text-xs font-mono font-bold text-orange-600">R{(room.pricePerMonth || inspectingProperty.priceFrom || 0).toLocaleString()}/mo</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Deposit: R{(room.deposit || inspectingProperty.depositAmount || 0).toLocaleString()} &bull; {room.availableCount || 1} Available</p>
                      <div className="flex flex-wrap gap-1">
                        {(room.features || []).map((f, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">{f}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Proximity */}
              {inspectorTab === 'proximity' && (
                <div className="space-y-3">
                  {(inspectingProperty.universities || []).map((uni, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-slate-900">{uni.universityName} ({uni.campusName})</div>
                        <div className="text-[11px] text-slate-500">{uni.transitNotes}</div>
                      </div>
                      <div className="text-right font-mono text-xs font-bold text-orange-600">
                        {uni.distanceKm} km &bull; {uni.walkingTimeMin} min walk
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Amenities */}
              {inspectorTab === 'amenities' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(inspectingProperty.amenities || []).map((amenity, i) => {
                    const config = getAmenityDetails(amenity);
                    const IconComp = config.icon;
                    return (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white">
                        <IconComp className="w-4 h-4 text-orange-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 5: Host & Reviews */}
              {inspectorTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3.5">
                    <img src={inspectingProperty.landlord?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} alt={inspectingProperty.landlord?.name || 'Landlord'} className="w-12 h-12 rounded-xl object-cover border border-slate-300" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{inspectingProperty.landlord?.name || 'Landlord Host'}</h4>
                      <p className="text-[11px] text-slate-500">{inspectingProperty.landlord?.agencyName || 'Independent Property'} &bull; Response Time: {inspectingProperty.landlord?.responseTime || 'Within 2 hours'}</p>
                      <div className="text-[11px] text-amber-600 font-bold mt-0.5">
                        ★ {inspectingProperty.landlord?.overallRating || 5.0} ({(inspectingProperty.landlord?.reviews || []).length} student reviews)
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(inspectingProperty.landlord?.reviews || []).map((rev) => (
                      <div key={rev.id} className="p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{rev.studentName} ({rev.studentUniversity})</span>
                          <span className="text-amber-600 font-bold">★ {rev.rating}</span>
                        </div>
                        <p className="text-slate-600 italic">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Inspector Bottom Sticky Action Bar */}
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span>Currently Viewing: </span>
                <strong className="text-slate-900">{inspectingProperty.title}</strong>
                {inspectingProperty.moderationNotes && (
                  <span className="ml-2 text-amber-800 font-medium">({inspectingProperty.moderationNotes})</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setInspectingProperty(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
                >
                  Close Inspector
                </button>

                {(inspectingProperty.approvalStatus || (inspectingProperty.verifiedListing ? 'Approved' : 'Pending Approval')) !== 'Approved' && (
                  <button
                    type="button"
                    onClick={() => setApproveListingItem(inspectingProperty)}
                    className="px-4 py-2 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Residence</span>
                  </button>
                )}

                {inspectingProperty.approvalStatus !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => setRejectItem({ type: 'listing', id: inspectingProperty.id, name: inspectingProperty.title })}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline / Reject</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. APPROVAL NOTE MODAL (FOR ACCOMMODATIONS) */}
      {/* ========================================================================= */}
      {approveListingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-lime-700 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-lime-600" />
                <span>Approve & Grant Live Accreditation</span>
              </div>
              <button
                onClick={() => setApproveListingItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are approving <strong>{approveListingItem.title}</strong> for publication. Landlord will be notified of verification success.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Auditor Accreditation Remarks (Optional):
              </label>
              <textarea
                rows={3}
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="e.g. Verified for 2026 intake. Electrical and fire clearance verified."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApproveListingItem(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="px-4 py-1.5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-xs font-bold shadow-xs transition"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. REJECTION / COMPLIANCE FEEDBACK MODAL (LISTING / DOCUMENT / PROFILE) */}
      {/* ========================================================================= */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {rejectItem.type === 'listing' 
                    ? 'Decline Accommodation Listing' 
                    : rejectItem.type === 'profile'
                    ? 'Request Student Profile Re-submission'
                    : 'Request Document Update / Flag'}
                </span>
              </div>
              <button
                onClick={() => setRejectItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Provide feedback for <strong>{rejectItem.name}</strong>. This comment will update in real-time to their respective portal so they know what must be fixed.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason / Compliance Feedback:
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={
                  rejectItem.type === 'listing'
                    ? 'e.g. Electrical compliance certificate missing, or room photos do not match registered floorplan.'
                    : 'e.g. Police certified stamp is older than 3 months. Please upload a fresh certified copy.'
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectItem(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
              >
                Submit Feedback & Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. DIGITAL DOCUMENT PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewDoc && (
        <DocumentViewerModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc}
          mode="admin"
          onApprove={(id, notes) => {
            onApproveDocument(id, notes || 'Certified and approved by iKhaya compliance officer');
            setPreviewDoc(null);
          }}
          onDecline={(id, reason) => {
            onDeclineDocument(id, reason || 'Document image unclear or expired certification stamp.');
            setPreviewDoc(null);
          }}
        />
      )}
    </div>
  );
};
