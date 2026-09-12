import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  X, 
  User, 
  GraduationCap, 
  Building2, 
  FileText, 
  UploadCloud, 
  ShieldCheck, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  Lock, 
  LogOut, 
  Edit3, 
  Save, 
  Plus, 
  ClipboardList, 
  Heart, 
  Sparkles, 
  Clock, 
  AlertCircle,
  Mail,
  Phone,
  ArrowRight,
  MessageSquare,
  Send,
  Calendar,
  DollarSign,
  MapPin,
  Check,
  ChevronRight,
  Paperclip,
  Share2,
  ExternalLink,
  Shield,
  UserCheck,
  Award
} from 'lucide-react';
import { StudentProfile, RentalDocument, BookingApplication, Accommodation, Conversation, ChatMessage } from '../types';
import { UNIVERSITIES_LIST } from '../data/mockData';
import { DocumentViewerModal } from './DocumentViewerModal';

export interface StudentProfileHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentView?: 'student' | 'landlord';
  onViewChange?: (view: 'student' | 'landlord') => void;
  studentProfile: StudentProfile | null;
  applications: BookingApplication[];
  savedAccommodations: Accommodation[];
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  onSendMessage: (conversationId: string, text: string, attachmentName?: string) => void;
  onUpdateProfile: (updated: StudentProfile) => void;
  onUploadDocument: (doc: RentalDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onSignOut: () => void;
  onSelectSavedProperty: (property: Accommodation) => void;
  onOpenBooking: (property: Accommodation) => void;
  onOpenFullMessaging?: (conversationId?: string) => void;
  initialTab?: 'messages' | 'applications' | 'profile' | 'documents' | 'saved' | 'guarantor';
}

type TabType = 'messages' | 'applications' | 'profile' | 'documents' | 'saved' | 'guarantor';

export const StudentProfileHubModal: React.FC<StudentProfileHubModalProps> = ({
  isOpen,
  onClose,
  currentView = 'student',
  onViewChange,
  studentProfile,
  applications,
  savedAccommodations,
  conversations,
  messages,
  onSendMessage,
  onUpdateProfile,
  onUploadDocument,
  onDeleteDocument,
  onSignOut,
  onSelectSavedProperty,
  onOpenBooking,
  onOpenFullMessaging,
  initialTab = 'profile',
}) => {
  const userDocs = studentProfile?.documents || [];
  const safeConversations = conversations || [];
  const safeApplications = applications || [];
  const safeSaved = savedAccommodations || [];

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);
  
  // Embedded Chat active conversation
  const [activeConvId, setActiveConvId] = useState<string>(
    safeConversations.length > 0 ? safeConversations[0].id : ''
  );
  const [chatReplyText, setChatReplyText] = useState('');
  const [attachedVaultDoc, setAttachedVaultDoc] = useState<string | null>(null);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState(studentProfile?.fullName || '');
  const [editEmail, setEditEmail] = useState(studentProfile?.email || '');
  const [editPhone, setEditPhone] = useState(studentProfile?.phone || '');
  const [editUniversity, setEditUniversity] = useState(studentProfile?.university || '');
  const [editStudentNumber, setEditStudentNumber] = useState(studentProfile?.studentNumber || '');
  const [editIdNumber, setEditIdNumber] = useState(studentProfile?.idNumber || '0408195089082');
  const [editCourse, setEditCourse] = useState(studentProfile?.course || 'BSc Computer Science & Data Analytics');
  const [editYearOfStudy, setEditYearOfStudy] = useState(studentProfile?.yearOfStudy || '2nd Year Undergrad');
  const [editFundingType, setEditFundingType] = useState(studentProfile?.fundingType || 'NSFAS');

  // Guarantor editing state
  const [isEditingGuarantor, setIsEditingGuarantor] = useState(false);
  const [guarantorName, setGuarantorName] = useState(studentProfile?.emergencyContact?.name || 'Nomsa Ntathu');
  const [guarantorRelation, setGuarantorRelation] = useState(studentProfile?.emergencyContact?.relationship || 'Parent / Guardian');
  const [guarantorPhone, setGuarantorPhone] = useState(studentProfile?.emergencyContact?.phone || '+27 83 456 7890');
  const [guarantorEmail, setGuarantorEmail] = useState(studentProfile?.emergencyContact?.email || 'nomsa.ntathu@gmail.com');

  useEffect(() => {
    if (studentProfile) {
      setEditFullName(studentProfile.fullName);
      setEditEmail(studentProfile.email);
      setEditPhone(studentProfile.phone);
      setEditUniversity(studentProfile.university);
      setEditStudentNumber(studentProfile.studentNumber);
      setEditIdNumber(studentProfile.idNumber || '0408195089082');
      setEditCourse(studentProfile.course || 'BSc Computer Science & Data Analytics');
      setEditYearOfStudy(studentProfile.yearOfStudy);
      setEditFundingType(studentProfile.fundingType);
      setGuarantorName(studentProfile.emergencyContact?.name || 'Nomsa Ntathu');
      setGuarantorRelation(studentProfile.emergencyContact?.relationship || 'Parent / Guardian');
      setGuarantorPhone(studentProfile.emergencyContact?.phone || '+27 83 456 7890');
      setGuarantorEmail(studentProfile.emergencyContact?.email || 'nomsa.ntathu@gmail.com');
    }
  }, [studentProfile]);

  // Document upload state
  const [docType, setDocType] = useState<RentalDocument['type']>('ID_PASSPORT');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<RentalDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set of document types that student has already uploaded
  const uploadedDocTypes = useMemo(() => {
    const set = new Set<RentalDocument['type']>();
    (userDocs || []).forEach((d) => {
      if (d.type) set.add(d.type);
    });
    return set;
  }, [userDocs]);

  const isCurrentDocTypeUploaded = uploadedDocTypes.has(docType);

  // Auto-switch to next available document type if current one is already uploaded
  useEffect(() => {
    if (uploadedDocTypes.has(docType)) {
      const allTypes: RentalDocument['type'][] = [
        'ID_PASSPORT',
        'PROOF_OF_REGISTRATION',
        'NSFAS_BURSARY_LETTER',
        'BANK_STATEMENT',
        'GUARANTOR_FORM',
        'OTHER',
      ];
      const nextAvailable = allTypes.find((t) => !uploadedDocTypes.has(t));
      if (nextAvailable) {
        setDocType(nextAvailable);
      }
    }
  }, [uploadedDocTypes, docType]);

  // Compute Unread messages count
  const unreadMessagesCount = useMemo(() => {
    return safeConversations.reduce((acc, c) => acc + c.unreadCount, 0);
  }, [safeConversations]);

  const activeConversation = useMemo(() => {
    return safeConversations.find((c) => c.id === activeConvId) || safeConversations[0] || null;
  }, [safeConversations, activeConvId]);

  const currentChatMessages = useMemo(() => {
    if (!activeConversation) return [];
    return messages[activeConversation.id] || [];
  }, [messages, activeConversation]);

  if (!isOpen || !studentProfile) return null;

  const docTypeLabels: Record<RentalDocument['type'], { title: string; hint: string }> = {
    ID_PASSPORT: {
      title: 'Certified SA ID / Passport',
      hint: 'Clear certified copy stamped within the last 3 months',
    },
    PROOF_OF_REGISTRATION: {
      title: 'Official Proof of University Registration',
      hint: 'Current 2026 academic enrollment letter with student number',
    },
    NSFAS_BURSARY_LETTER: {
      title: 'NSFAS Award Letter / Bursary Remittance',
      hint: 'Proof of accommodation allowance funding approval',
    },
    BANK_STATEMENT: {
      title: '3-Month Stamped Bank Statements',
      hint: 'Official bank e-statement showing income or allowance deposits',
    },
    GUARANTOR_FORM: {
      title: 'Parent / Sponsor Guarantor Agreement',
      hint: 'Signed surety agreement for private funded leases',
    },
    OTHER: {
      title: 'Supplementary Document',
      hint: 'Vaccination record, previous residence reference, etc.',
    },
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      ...studentProfile,
      fullName: editFullName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      university: editUniversity,
      studentNumber: editStudentNumber.trim(),
      idNumber: editIdNumber.trim(),
      course: editCourse.trim(),
      yearOfStudy: editYearOfStudy.trim(),
      fundingType: editFundingType,
    };
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  const handleSaveGuarantor = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      ...studentProfile,
      emergencyContact: {
        name: guarantorName.trim(),
        relationship: guarantorRelation.trim(),
        phone: guarantorPhone.trim(),
        email: guarantorEmail.trim(),
      },
    };
    onUpdateProfile(updated);
    setIsEditingGuarantor(false);
  };

  const handleFileSelect = (file: File) => {
    if (uploadedDocTypes.has(docType)) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploadedDocTypes.has(docType)) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadedDocTypes.has(docType)) return;
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || uploadedDocTypes.has(docType)) return;
    setIsUploading(true);

    setTimeout(() => {
      const docId = `doc-${Date.now()}`;
      const newDoc: RentalDocument = {
        id: docId,
        type: docType,
        name: selectedFile.name,
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'Pending Verification',
        verificationNotes: 'Pending review by iKhaya compliance officer',
        fileUrl: fileDataUrl || undefined,
      };

      if (fileDataUrl) {
        try {
          localStorage.setItem(`ikhaya_doc_file_${docId}`, fileDataUrl);
        } catch {
          // ignore localStorage quota
        }
      }

      onUploadDocument(newDoc);
      setSelectedFile(null);
      setFileDataUrl(null);
      setIsUploading(false);
    }, 450);
  };

  const handleSendEmbeddedReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReplyText.trim() && !attachedVaultDoc) return;
    if (!activeConversation) return;

    onSendMessage(activeConversation.id, chatReplyText, attachedVaultDoc || undefined);
    setChatReplyText('');
    setAttachedVaultDoc(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full h-[92vh] max-h-[850px] shadow-2xl overflow-hidden flex flex-col text-slate-900">
        
        {/* Top Header & Student Banner */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl ${currentView === 'landlord' ? 'bg-lime-600 border-lime-400' : 'bg-orange-500 border-orange-300'} text-white flex items-center justify-center font-bold text-sm border-2 shadow-2xs`}>
                {currentView === 'landlord' ? 'SN' : (
                  studentProfile?.fullName
                    ? studentProfile.fullName
                        .split(' ')
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'ST'
                )}
              </div>
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${currentView === 'landlord' ? 'bg-lime-500' : 'bg-orange-500'} border-2 border-white ring-1 ring-slate-400/30`}></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {currentView === 'landlord' ? 'Sibusiso Ndlovu' : (studentProfile?.fullName || 'Student Profile')}
                </h2>
                {currentView === 'landlord' ? (
                  <span className="text-[10px] font-extrabold bg-lime-100 text-lime-900 border border-lime-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <Building2 className="w-3.5 h-3.5 text-lime-700" />
                    Landlord
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
                    Student
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {currentView === 'landlord'
                  ? 'Campus Living Property Group • Accredited Residence Host'
                  : `${studentProfile.email} • Student ID #${studentProfile.studentNumber}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-semibold border border-slate-200 hover:border-rose-200 transition shadow-2xs"
              title="Sign Out from student profile"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Master-Detail Layout with Structured Profile List */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50/50">
          
          {/* LEFT SIDEBAR: PROFILE LIST MENU */}
          <aside className="w-full md:w-64 lg:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
            {/* Verification Status Meter */}
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <Award className="w-3.5 h-3.5 text-orange-500" />
                  Profile Readiness
                </span>
                <span className="text-lime-700 text-xs font-extrabold">100% Ready</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-lime-500 h-full w-full rounded-full"></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-lime-600" />
                NSFAS & University Verified for Instant Lease
              </p>
            </div>

            {/* Profile List Navigation Items */}
            <nav className="p-2 space-y-1 overflow-y-auto flex-1 text-xs">
              
              {/* 1. Messages */}
              <button
                id="profile-nav-messages"
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition text-left ${
                  activeTab === 'messages'
                    ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${activeTab === 'messages' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'}`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Messages & Inquiries</span>
                    <span className="text-[10px] text-slate-500 font-normal">Landlord chats & viewing invites</span>
                  </div>
                </div>
                {unreadMessagesCount > 0 ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-orange-600 text-white">
                    {unreadMessagesCount} new
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400">
                    {safeConversations.length}
                  </span>
                )}
              </button>

              {/* 2. Applications */}
              <button
                id="profile-nav-applications"
                onClick={() => setActiveTab('applications')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition text-left ${
                  activeTab === 'applications'
                    ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${activeTab === 'applications' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'}`}>
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Rental Applications</span>
                    <span className="text-[10px] text-slate-500 font-normal">Submitted lease bookings & status</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {safeApplications.length}
                </span>
              </button>

              {/* 3. Student & Academic Profile Information */}
              <button
                id="profile-nav-info"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition text-left ${
                  activeTab === 'profile'
                    ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === 'profile' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold truncate">Student & Academic Profile Information</span>
                    <span className="text-[10px] text-slate-500 font-normal truncate block">ID, University, Course, Funding</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </button>

              {/* 4. Encrypted Rental Document Vault (4) */}
              <button
                id="profile-nav-documents"
                onClick={() => setActiveTab('documents')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition text-left ${
                  activeTab === 'documents'
                    ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === 'documents' ? 'bg-lime-600 text-white' : 'bg-lime-100 text-lime-700'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold truncate">Encrypted Rental Document Vault ({userDocs.length})</span>
                    <span className="text-[10px] text-slate-500 font-normal truncate block">Certified ID, NSFAS & Proof of Reg</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-lime-50 text-lime-800 border border-lime-300 shrink-0 ml-1">
                  {userDocs.length} verified
                </span>
              </button>

              {/* 5. Saved Accommodations */}
              <button
                id="profile-nav-saved"
                onClick={() => setActiveTab('saved')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition text-left ${
                  activeTab === 'saved'
                    ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${activeTab === 'saved' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'}`}>
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Saved Residences</span>
                    <span className="text-[10px] text-slate-500 font-normal">Bookmarked accommodations</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {savedAccommodations.length}
                </span>
              </button>

              {/* 6. Guarantor & Emergency Contact */}
              <button
                id="profile-nav-guarantor"
                onClick={() => setActiveTab('guarantor')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition text-left ${
                  activeTab === 'guarantor'
                    ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${activeTab === 'guarantor' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Guarantor & Next-of-Kin</span>
                    <span className="text-[10px] text-slate-500 font-normal">Parent / Sponsor emergency details</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </nav>

            {/* Quick Support / Contact footer in sidebar */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-500" />
                Ikhaya Student Guarantee
              </p>
              <p className="text-[10px] text-slate-400">
                100% verified properties & zero upfront placement commission fees.
              </p>
            </div>
          </aside>

          {/* RIGHT DETAIL PANE: DYNAMIC SECTION CONTENT */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">

            {/* Contextual Sub-Navigation Tabs for Student Profile Hub */}
            {(activeTab === 'profile' || activeTab === 'documents' || activeTab === 'guarantor') && (
              <div className="mb-5 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto">
                  <button
                    id="subtab-student-profile-info"
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      activeTab === 'profile'
                        ? 'bg-white text-orange-600 shadow-2xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-orange-600" />
                    <span>Student & Academic Profile Information</span>
                  </button>

                  <button
                    id="subtab-document-vault"
                    onClick={() => setActiveTab('documents')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      activeTab === 'documents'
                        ? 'bg-white text-lime-700 shadow-2xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-lime-600" />
                    <span>Encrypted Rental Document Vault ({userDocs.length})</span>
                    <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-lime-100 text-lime-800 border border-lime-300">
                      {userDocs.length}
                    </span>
                  </button>

                  <button
                    id="subtab-guarantor-info"
                    onClick={() => setActiveTab('guarantor')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      activeTab === 'guarantor'
                        ? 'bg-white text-orange-600 shadow-2xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-orange-500" />
                    <span>Guarantor & Next-of-Kin</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 1. MESSAGES & INQUIRIES LIST VIEW */}
            {/* ========================================================================= */}
            {activeTab === 'messages' && (
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-orange-600" />
                      Landlord Inquiries & Messages ({safeConversations.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Direct real-time communication with accredited accommodation managers
                    </p>
                  </div>
                  {onOpenFullMessaging && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenFullMessaging(activeConvId);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 text-xs font-bold border border-orange-200 flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Full Screen Chat</span>
                    </button>
                  )}
                </div>

                {safeConversations.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">No active message conversations yet.</p>
                    <p className="text-slate-400 max-w-sm mx-auto">
                      Click "Chat with Landlord" on any accommodation listing to ask questions or arrange a viewing.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[480px]">
                    
                    {/* Conversation List */}
                    <div className="lg:col-span-5 space-y-2 overflow-y-auto max-h-[500px] pr-1">
                      {conversations.map((conv) => {
                        const isSelected = conv.id === activeConvId;
                        return (
                          <div
                            key={conv.id}
                            onClick={() => setActiveConvId(conv.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                              isSelected
                                ? 'bg-orange-50/80 border-orange-300 shadow-2xs'
                                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                            }`}
                          >
                            <div
                              className="w-10 h-10 rounded-full bg-lime-600 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs"
                            >
                              {conv.landlordName
                                ? conv.landlordName.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'LL'
                                : 'LL'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 truncate">
                                  {conv.landlordName || 'Landlord'}
                                </h4>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {conv.lastMessageTime}
                                </span>
                              </div>
                              <p className="text-[11px] font-semibold text-orange-700 truncate">
                                {conv.propertyTitle}
                              </p>
                              <p className="text-xs text-slate-600 truncate mt-0.5">
                                {conv.lastMessage}
                              </p>
                            </div>
                            {conv.unreadCount > 0 && (
                              <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0 self-center"></span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Conversation Chat Window */}
                    <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col overflow-hidden h-[500px]">
                      {activeConversation ? (
                        <>
                          {/* Chat Header */}
                          <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-full bg-lime-600 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-orange-200 shadow-2xs"
                              >
                                {activeConversation.landlordName
                                  ? activeConversation.landlordName.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'LL'
                                  : 'LL'}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                                  {activeConversation.landlordName || 'Landlord'}
                                </h4>
                                <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                  {activeConversation.propertyTitle}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-50 text-lime-800 border border-lime-300">
                              Online Landlord
                            </span>
                          </div>

                          {/* Chat Message Stream */}
                          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                            {currentChatMessages.map((msg) => {
                              const isMe = msg.senderRole === 'student';
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                >
                                  <div
                                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                                      isMe
                                        ? 'bg-orange-500 text-white rounded-br-xs shadow-2xs'
                                        : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200 shadow-2xs'
                                    }`}
                                  >
                                    <p>{msg.text}</p>

                                    {msg.attachmentName && (
                                      <div className={`mt-1.5 p-1.5 rounded-lg flex items-center gap-1.5 text-[11px] font-bold ${
                                        isMe ? 'bg-orange-600/60 text-white' : 'bg-lime-50 text-lime-800 border border-lime-200'
                                      }`}>
                                        <FileText className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{msg.attachmentName}</span>
                                      </div>
                                    )}

                                    {msg.viewingInvite && (
                                      <div className="mt-2 p-2 rounded-xl bg-orange-50 text-orange-950 border border-orange-200 space-y-1">
                                        <div className="flex items-center gap-1 font-bold text-[11px]">
                                          <Calendar className="w-3 h-3 text-orange-600" />
                                          <span>Viewing Invitation: {msg.viewingInvite.date} at {msg.viewingInvite.time}</span>
                                        </div>
                                        <p className="text-[10px] text-orange-800">Format: {msg.viewingInvite.type}</p>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.timestamp}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick Document Attachment Bar */}
                          {attachedVaultDoc && (
                            <div className="px-3 py-1.5 bg-lime-50 border-t border-lime-200 flex items-center justify-between text-xs text-lime-900">
                              <div className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-lime-600" />
                                <span className="font-bold">Attaching: {attachedVaultDoc}</span>
                              </div>
                              <button
                                onClick={() => setAttachedVaultDoc(null)}
                                className="text-lime-700 hover:text-lime-900 text-xs font-bold"
                              >
                                Remove
                              </button>
                            </div>
                          )}

                          {/* Chat Input */}
                          <form onSubmit={handleSendEmbeddedReply} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
                            <div className="relative group">
                              <button
                                type="button"
                                title="Attach Verified Document from Vault"
                                onClick={() => {
                                  if (studentProfile?.documents && studentProfile.documents.length > 0) {
                                    setAttachedVaultDoc(studentProfile.documents[0].name);
                                  }
                                }}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                              >
                                <Paperclip className="w-4 h-4" />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={chatReplyText}
                              onChange={(e) => setChatReplyText(e.target.value)}
                              placeholder="Write a message to landlord..."
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                            />
                            <button
                              type="submit"
                              disabled={!chatReplyText.trim() && !attachedVaultDoc}
                              className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white transition shadow-xs"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                          Select a conversation to read and reply.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. RENTAL APPLICATIONS LIST VIEW */}
            {/* ========================================================================= */}
            {activeTab === 'applications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-orange-600" />
                      Submitted Rental Applications ({safeApplications.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Track responses, lease approvals, and viewing schedules from residence providers
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs"
                  >
                    + Apply for Another Room
                  </button>
                </div>

                {safeApplications.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-3">
                    <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">You have no submitted rental applications yet.</p>
                    <p className="text-slate-400 max-w-md mx-auto text-[11px]">
                      Browse accredited residences on the home page and click "Instant Book / Apply" to submit an application with your verified documents attached.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition"
                    >
                      Explore Accredited Accommodations
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3 hover:bg-slate-100/60 transition shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start sm:items-center gap-3.5">
                            <img
                              src={app.propertyImage}
                              alt={app.propertyTitle}
                              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-900">{app.propertyTitle}</h4>
                                <span
                                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                    app.status === 'Accepted'
                                      ? 'bg-lime-50 text-lime-900 border-lime-300'
                                      : app.status === 'Declined'
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 font-semibold pt-0.5">
                                {app.roomName} &bull; <span className="text-orange-700 font-bold">R{(app.monthlyRent || 0).toLocaleString()}/month</span> &bull; Move-in: {app.moveInDate}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Applied: {app.appliedDate} &bull; Funding: {app.fundingType} &bull; Lease: {app.leaseDuration}
                              </p>
                            </div>
                          </div>

                          {/* Application Actions */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={() => {
                                setActiveTab('messages');
                                const match = conversations.find((c) => c.propertyId === app.propertyId);
                                if (match) setActiveConvId(match.id);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 text-orange-600 text-xs font-bold border border-slate-200 hover:border-orange-300 transition flex items-center gap-1 shadow-2xs"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Message Landlord</span>
                            </button>
                          </div>
                        </div>

                        {/* Application Notes & Attachments Summary */}
                        <div className="pt-2.5 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-lime-600 shrink-0" />
                            <span>
                              <strong className="text-slate-700">{(app.documentsAttached || []).length} Verified Vault Documents</strong> attached with automatic NSFAS pre-approval.
                            </span>
                          </div>
                          {app.specialNotes && (
                            <span className="italic text-slate-600">
                              Note: "{app.specialNotes}"
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. STUDENT & ACADEMIC INFO VIEW */}
            {/* ========================================================================= */}
            {activeTab === 'profile' && (
              <div className="space-y-5 max-w-3xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-600" />
                      Student & Academic Profile Information
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verified details shared securely with accredited landlords during room booking
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setEditFullName(studentProfile.fullName);
                        setEditEmail(studentProfile.email);
                        setEditPhone(studentProfile.phone);
                        setEditUniversity(studentProfile.university);
                        setEditStudentNumber(studentProfile.studentNumber);
                        setEditIdNumber(studentProfile.idNumber || '0408195089082');
                        setEditCourse(studentProfile.course || 'BSc Computer Science & Data Analytics');
                        setEditYearOfStudy(studentProfile.yearOfStudy);
                        setEditFundingType(studentProfile.fundingType);
                        setIsEditing(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 transition shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Information</span>
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-4">
                    {/* Information Grid List */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 divide-y divide-slate-200/80">
                      
                      {/* Item 1: Full Name */}
                      <div className="py-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Legal Name</span>
                        <span className="text-xs font-bold text-slate-900">{studentProfile.fullName}</span>
                      </div>

                      {/* Item 2: South African ID / Passport */}
                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SA ID Number / Passport</span>
                        <span className="text-xs font-mono font-bold text-slate-900">{studentProfile.idNumber || '0408195089082'}</span>
                      </div>

                      {/* Item 3: University */}
                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Enrolled University</span>
                        <span className="text-xs font-bold text-slate-900">{studentProfile.university}</span>
                      </div>

                      {/* Item 4: Student Number */}
                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student ID Number</span>
                        <span className="text-xs font-mono font-bold text-slate-900">{studentProfile.studentNumber}</span>
                      </div>

                      {/* Item 5: Degree & Course */}
                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Course / Degree of Study</span>
                        <span className="text-xs font-bold text-slate-900">{studentProfile.course || 'BSc Computer Science & Data Analytics'}</span>
                      </div>

                      {/* Item 6: Year of Study */}
                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Level</span>
                        <span className="text-xs font-bold text-slate-900">{studentProfile.yearOfStudy}</span>
                      </div>

                      {/* Item 7: Email Address */}
                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">University Email</span>
                        <span className="text-xs font-bold text-slate-900">{studentProfile.email}</span>
                      </div>

                      {/* Item 8: Phone */}
                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mobile Phone</span>
                        <span className="text-xs font-bold text-slate-900">{studentProfile.phone}</span>
                      </div>

                      {/* Item 9: Funding Source */}
                      <div className="py-2.5 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Funding / Allowance Type</span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-lime-500"></span>
                          {studentProfile.fundingType}
                        </span>
                      </div>
                    </div>

                    {/* Embedded Sub-Section 1: Encrypted Rental Document Vault */}
                    <div className="pt-6 border-t border-slate-200 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-lime-600" />
                            Encrypted Rental Document Vault ({userDocs.length})
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Upload and store certified documents required for verified student lease agreements
                          </p>
                        </div>
                        <span className="text-[10px] font-bold bg-lime-50 text-lime-800 border border-lime-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-lime-600" />
                          256-Bit Encrypted
                        </span>
                      </div>

                      {/* Document Dropzone */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-700">Document Type</label>
                          <select
                            value={docType}
                            onChange={(e) => setDocType(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                          >
                            {Object.entries(docTypeLabels).map(([key, value]) => {
                              const isUploaded = uploadedDocTypes.has(key as RentalDocument['type']);
                              return (
                                <option key={key} value={key} disabled={isUploaded}>
                                  {value.title} {isUploaded ? '✓ (Already Uploaded)' : ''}
                                </option>
                              );
                            })}
                          </select>
                          <p className="text-[11px] text-slate-500">{docTypeLabels[docType].hint}</p>
                        </div>

                        {isCurrentDocTypeUploaded ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Document Already Uploaded</p>
                              <p className="text-[11px] text-amber-800 mt-0.5">
                                You already have a {docTypeLabels[docType].title} uploaded. Only one document per document type is permitted. To upload a new file, remove the existing document below first.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={handleFileDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                                selectedFile
                                  ? 'border-orange-500 bg-orange-50/50'
                                  : 'border-slate-300 hover:border-orange-400 bg-white'
                              }`}
                            >
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                              {selectedFile ? (
                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-orange-700">
                                  <FileText className="w-4 h-4 text-orange-600" />
                                  <span>{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <UploadCloud className="w-5 h-5 mx-auto text-slate-400" />
                                  <p className="text-xs font-semibold text-slate-700">
                                    Drag & drop certified document, or <span className="text-orange-600 font-bold">Browse</span>
                                  </p>
                                  <p className="text-[10px] text-slate-400">PDF, JPG, or PNG up to 15MB</p>
                                </div>
                              )}
                            </div>

                            {selectedFile && (
                              <button
                                type="button"
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
                              >
                                {isUploading ? 'Encrypting & Uploading...' : 'Upload Document to Vault'}
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Documents Grid */}
                      {userDocs.length === 0 ? (
                        <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-white text-center space-y-1">
                          <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                          <p className="text-xs font-bold text-slate-700">No documents uploaded yet</p>
                          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                            Upload your ID / Passport, Proof of Registration, or NSFAS/Bursary letter above to start verifying your student rental profile.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {userDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-2 shadow-2xs hover:bg-slate-100/70 transition"
                          >
                            <div className="flex items-start gap-2.5 overflow-hidden">
                              <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 shrink-0">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div className="overflow-hidden">
                                <h5 className="text-xs font-bold text-slate-900 truncate" title={doc.name}>
                                  {doc.name}
                                </h5>
                                <p className="text-[10px] text-slate-500">
                                  {doc.fileSize} &bull; {doc.uploadedAt}
                                </p>
                                {doc.status === 'Verified' ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    Verified
                                  </span>
                                ) : doc.status === 'Requires Update' ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mt-0.5">
                                    <AlertCircle className="w-2.5 h-2.5" />
                                    Requires Update
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                                    <Clock className="w-2.5 h-2.5 animate-pulse" />
                                    Pending Verification
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(doc)}
                                className="p-1 rounded-md bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs transition"
                                title="Preview Document"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteDocument(doc.id)}
                                className="p-1 rounded-md bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-400 text-xs transition"
                                title="Remove Document"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      )}
                    </div>

                    {/* Embedded Sub-Section 2: Guarantor, Sponsor & Next-of-Kin Information */}
                    <div className="pt-6 border-t border-slate-200 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-orange-600" />
                            Guarantor, Sponsor & Next-of-Kin Information
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Required emergency & surety contacts for South African student rental agreements
                          </p>
                        </div>
                        {!isEditingGuarantor && (
                          <button
                            type="button"
                            onClick={() => setIsEditingGuarantor(true)}
                            className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 transition"
                          >
                            Edit Guarantor
                          </button>
                        )}
                      </div>

                      {!isEditingGuarantor ? (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 divide-y divide-slate-200/80">
                          <div className="py-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Guarantor Name</span>
                            <span className="text-xs font-bold text-slate-900">{guarantorName}</span>
                          </div>
                          <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Relationship</span>
                            <span className="text-xs font-bold text-slate-900">{guarantorRelation}</span>
                          </div>
                          <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Phone</span>
                            <span className="text-xs font-bold text-slate-900">{guarantorPhone}</span>
                          </div>
                          <div className="py-2 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Guarantor Email</span>
                            <span className="text-xs font-bold text-slate-900">{guarantorEmail}</span>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleSaveGuarantor} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                              <input
                                type="text"
                                required
                                value={guarantorName}
                                onChange={(e) => setGuarantorName(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                              <input
                                type="text"
                                required
                                value={guarantorRelation}
                                onChange={(e) => setGuarantorRelation(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Phone</label>
                              <input
                                type="tel"
                                required
                                value={guarantorPhone}
                                onChange={(e) => setGuarantorPhone(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                              <input
                                type="email"
                                required
                                value={guarantorEmail}
                                onChange={(e) => setGuarantorEmail(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsEditingGuarantor(false)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                            >
                              Save Guarantor
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                ) : (
                  /* EDIT FORM */
                  <form onSubmit={handleSaveProfile} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Update Student Information</h4>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          required
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">SA ID Number / Passport</label>
                        <input
                          type="text"
                          required
                          value={editIdNumber}
                          onChange={(e) => setEditIdNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">University</label>
                        <select
                          value={editUniversity}
                          onChange={(e) => setEditUniversity(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                        >
                          {UNIVERSITIES_LIST.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Student Number</label>
                        <input
                          type="text"
                          value={editStudentNumber}
                          onChange={(e) => setEditStudentNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Course / Degree</label>
                        <input
                          type="text"
                          value={editCourse}
                          onChange={(e) => setEditCourse(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                        <input
                          type="text"
                          value={editYearOfStudy}
                          onChange={(e) => setEditYearOfStudy(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">University Email</label>
                        <input
                          type="email"
                          required
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Funding Source</label>
                        <select
                          value={editFundingType}
                          onChange={(e) => setEditFundingType(e.target.value as any)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                        >
                          <option value="NSFAS">NSFAS (Accredited)</option>
                          <option value="Bursary / Corporate Sponsor">Bursary / Corporate Sponsor</option>
                          <option value="Self / Family Funded">Self / Family Funded (Private)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. DOCUMENT VAULT VIEW */}
            {/* ========================================================================= */}
            {activeTab === 'documents' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-lime-600" />
                      Encrypted Rental Document Vault ({userDocs.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Certified documents attached to fast-track your 2026 student lease applications
                    </p>
                  </div>
                </div>

                {/* Upload Zone Card */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-lime-100 text-lime-700 flex items-center justify-center border border-lime-300">
                        <UploadCloud className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Upload New Verification Document</h4>
                    </div>
                    <span className="text-[10px] font-bold bg-lime-50 text-lime-800 border border-lime-300 px-2 py-0.5 rounded-full">
                      256-Bit Encrypted
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Document Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                    >
                      {Object.entries(docTypeLabels).map(([key, value]) => {
                        const isUploaded = uploadedDocTypes.has(key as RentalDocument['type']);
                        return (
                          <option key={key} value={key} disabled={isUploaded}>
                            {value.title} {isUploaded ? '✓ (Already Uploaded)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-[11px] text-slate-500 pt-0.5">{docTypeLabels[docType].hint}</p>
                  </div>

                  {isCurrentDocTypeUploaded ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Document Already Uploaded</p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          You already have an active {docTypeLabels[docType].title} in your vault. Only one document per category is permitted. If you need to re-upload or update this document, please remove the existing file from your vault below first.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                          selectedFile
                            ? 'border-orange-500 bg-orange-50/50'
                            : 'border-slate-300 hover:border-orange-400 bg-white'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {selectedFile ? (
                          <div className="flex items-center justify-center gap-2 text-xs font-bold text-orange-700">
                            <FileText className="w-4 h-4 text-orange-600" />
                            <span>{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <UploadCloud className="w-6 h-6 mx-auto text-slate-400" />
                            <p className="text-xs font-semibold text-slate-700">
                              Drag and drop file here, or <span className="text-orange-600 font-bold">Browse</span>
                            </p>
                            <p className="text-[10px] text-slate-400">PDF, JPG, or PNG up to 15MB</p>
                          </div>
                        )}
                      </div>

                      {selectedFile && (
                        <button
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
                        >
                          {isUploading ? 'Encrypting & Uploading...' : 'Upload Document to Vault'}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Uploaded Documents List */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Active Verified Documents ({userDocs.length})
                  </h4>

                  {userDocs.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-xs text-slate-500 space-y-2">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700">No documents in your vault yet</p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        Your vault starts empty. Upload your official certified documents above to verify your account and apply for residences.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between gap-3 shadow-2xs hover:bg-slate-100/70 transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                              <h5 className="text-xs font-bold text-slate-900 truncate" title={doc.name}>
                                {doc.name}
                              </h5>
                              <p className="text-[10px] text-slate-500">
                                {doc.fileSize} &bull; Uploaded {doc.uploadedAt}
                              </p>
                              {doc.status === 'Verified' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  Verified
                                </span>
                              ) : doc.status === 'Requires Update' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mt-1">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  Requires Update
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1">
                                  <Clock className="w-2.5 h-2.5 animate-pulse" />
                                  Pending Verification
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200">
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="p-1.5 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-medium transition"
                              title="Preview Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteDocument(doc.id)}
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-400 text-xs font-medium transition"
                              title="Remove Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. SAVED RESIDENCES LIST VIEW */}
            {/* ========================================================================= */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      Saved Student Residences ({safeSaved.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Bookmarked student accommodation options for easy comparison & 1-click apply
                    </p>
                  </div>
                </div>

                {safeSaved.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
                    <Heart className="w-10 h-10 text-rose-300 mx-auto" />
                    <p className="font-bold text-slate-700">No saved residences yet.</p>
                    <p className="text-slate-400 max-w-sm mx-auto">
                      Click the heart icon on any residence card to bookmark it here for quick access.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedAccommodations.map((prop) => (
                      <div
                        key={prop.id}
                        className="bg-slate-50 hover:bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200 space-y-3 transition shadow-2xs group flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <img
                            src={prop.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'}
                            alt={prop.title}
                            className="w-full h-36 object-cover rounded-xl border border-slate-200 group-hover:opacity-95 transition"
                          />
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{prop.title}</h4>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {prop.suburb} &bull; {prop.universities?.[0]?.distanceKm || 1.2} km to campus
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">From</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              R{(prop.priceFrom || 0).toLocaleString()}/mo
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                onClose();
                                onSelectSavedProperty(prop);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                onClose();
                                onOpenBooking(prop);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. GUARANTOR & EMERGENCY CONTACT LIST VIEW */}
            {/* ========================================================================= */}
            {activeTab === 'guarantor' && (
              <div className="space-y-5 max-w-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-orange-600" />
                      Guarantor, Sponsor & Next-of-Kin Information
                    </h3>
                    <p className="text-xs text-slate-500">
                      Required for South African student rental contracts and emergency notifications
                    </p>
                  </div>
                  {!isEditingGuarantor && (
                    <button
                      onClick={() => setIsEditingGuarantor(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 transition shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                  )}
                </div>

                {!isEditingGuarantor ? (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 divide-y divide-slate-200/80">
                      
                      {/* Name */}
                      <div className="py-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Guarantor / Contact Name</span>
                        <span className="text-xs font-bold text-slate-900">{guarantorName}</span>
                      </div>

                      {/* Relationship */}
                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Relationship to Student</span>
                        <span className="text-xs font-bold text-slate-900">{guarantorRelation}</span>
                      </div>

                      {/* Phone */}
                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Contact Number</span>
                        <span className="text-xs font-bold text-slate-900">{guarantorPhone}</span>
                      </div>

                      {/* Email */}
                      <div className="py-2.5 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Guarantor Email Address</span>
                        <span className="text-xs font-bold text-slate-900">{guarantorEmail}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50/80 rounded-2xl border border-orange-200 text-xs text-orange-950 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-orange-600" />
                        South African Rental Housing Act Compliance
                      </p>
                      <p className="text-[11px] text-orange-800">
                        Guarantor information is strictly encrypted and will only be provided to landlords once a lease agreement is formally accepted.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* EDIT GUARANTOR FORM */
                  <form onSubmit={handleSaveGuarantor} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Update Guarantor Information</h4>
                      <button
                        type="button"
                        onClick={() => setIsEditingGuarantor(false)}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          required
                          value={guarantorName}
                          onChange={(e) => setGuarantorName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                          placeholder="e.g. Nomsa Ntathu"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                        <input
                          type="text"
                          required
                          value={guarantorRelation}
                          onChange={(e) => setGuarantorRelation(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                          placeholder="e.g. Parent / Guardian / Sponsor"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Mobile Phone</label>
                        <input
                          type="tel"
                          required
                          value={guarantorPhone}
                          onChange={(e) => setGuarantorPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                          placeholder="+27 83 000 0000"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={guarantorEmail}
                          onChange={(e) => setGuarantorEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                          placeholder="guardian@example.com"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingGuarantor(false)}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Guarantor</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Document Detailed Preview Modal */}
      {previewDoc && (
        <DocumentViewerModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc}
          mode="student"
        />
      )}
    </div>
  );
};
