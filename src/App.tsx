import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  GraduationCap, 
  Zap, 
  ShieldCheck, 
  Heart, 
  Star, 
  Filter, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  MessageSquare, 
  PlusCircle, 
  ChevronRight,
  HelpCircle,
  Map,
  Grid,
  ClipboardList,
  Plus,
  Headphones,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { 
  Accommodation, 
  FilterState, 
  StudentProfile, 
  BookingApplication, 
  Conversation, 
  ChatMessage, 
  RoomOption, 
  RentalDocument, 
  LandlordReview, 
  TenantReview,
  StudentDocumentSubmission,
  UserRole
} from './types';
import { 
  SAMPLE_STUDENT_PROFILE 
} from './data/mockData';
import { getAmenityDetails } from './utils/amenityIcons';
import { useAuth } from './context/AuthContext';
import { useFirestoreData } from './hooks/useFirestoreData';
import { Navbar } from './components/Navbar';
import { SearchFilters } from './components/SearchFilters';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { BookingModal } from './components/BookingModal';
import { MessagingCenter } from './components/MessagingCenter';
import { RatingSystemModal } from './components/RatingSystemModal';
import { LandlordPortal } from './components/LandlordPortal';
import { AddListingModal } from './components/AddListingModal';
import { AdminPortal } from './components/AdminPortal';
import { AccommodationsMapView } from './components/AccommodationsMapView';
import { StudentAuthModal } from './components/StudentAuthModal';
import { StudentProfileHubModal } from './components/StudentProfileHubModal';
import { TalkToAgentModal } from './components/TalkToAgentModal';
import { BrandLogo } from './components/BrandLogo';

export default function App() {
  const { userProfile, signOut, signInWithDemo, updateProfileData } = useAuth();
  
  // Real-time Firestore synchronized Data scoped strictly to current active User & Role
  const {
    accommodations,
    applications,
    conversations,
    messages,
    studentDocuments,
    addAccommodation,
    updateAccommodation,
    submitApplication,
    updateApplicationStatus,
    createConversation,
    sendMessage,
    updateStudentDocumentStatus,
    uploadStudentDocument
  } = useFirestoreData(userProfile);

  // View strictly locked to active signed-in user's role (defaults to public 'student' discovery view)
  const currentView: 'student' | 'landlord' | 'admin' = userProfile?.role || 'student';
  const [showMapView, setShowMapView] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    town: '',
    university: '',
    maxDistanceKm: 10,
    minPrice: 3500,
    maxPrice: 12000,
    accommodationType: 'All Types',
    genderPolicy: 'All',
    nsfasOnly: false,
    backupPowerOnly: false,
    allBillsIncludedOnly: false,
    instantBookOnly: false,
    amenities: [],
    sortBy: 'recommended',
  });

  // Modals state
  const [selectedProperty, setSelectedProperty] = useState<Accommodation | null>(null);
  const [bookingProperty, setBookingProperty] = useState<{ property: Accommodation; room?: RoomOption } | null>(null);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-1');
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [isTalkToAgentOpen, setIsTalkToAgentOpen] = useState(false);
  
  // Student Hub & Auth modals
  const [isStudentAuthOpen, setIsStudentAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register'>('signin');
  const [isStudentHubOpen, setIsStudentHubOpen] = useState(false);
  const [studentHubInitialTab, setStudentHubInitialTab] = useState<'messages' | 'applications' | 'profile' | 'documents' | 'saved' | 'guarantor'>('profile');

  // Rating Modal state
  const [ratingModalConfig, setRatingModalConfig] = useState<{
    isOpen: boolean;
    targetType: 'landlord' | 'tenant';
    property?: Accommodation | null;
    tenantName?: string;
  }>({
    isOpen: false,
    targetType: 'landlord',
  });

  // Synthesize StudentProfile representation for legacy student-only modals
  const studentProfileObj: StudentProfile | null = useMemo(() => {
    if (!userProfile) return null;
    if (userProfile.role !== 'student') return null;

    // Synchronize documents with real-time audit statuses from studentDocuments
    const syncedDocs = (userProfile.documents || []).map((doc) => {
      const auditRecord = (studentDocuments || []).find((sd) => sd.id === doc.id);
      if (auditRecord) {
        return {
          ...doc,
          status: auditRecord.status === 'Declined' ? ('Requires Update' as const) : (auditRecord.status as any),
          verificationNotes: auditRecord.adminNotes || doc.verificationNotes,
          fileUrl: auditRecord.fileUrl || doc.fileUrl,
        };
      }
      return doc;
    });

    return {
      id: userProfile.id,
      fullName: userProfile.fullName,
      email: userProfile.email,
      phone: userProfile.phone || '+27 72 000 0000',
      avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      university: userProfile.university || 'University of Johannesburg (UJ)',
      studentNumber: userProfile.studentNumber || 'STU202688',
      yearOfStudy: userProfile.yearOfStudy || '2nd Year Undergrad',
      fundingType: userProfile.fundingType || 'NSFAS',
      documents: syncedDocs,
      savedProperties: userProfile.savedProperties || [],
      registeredDate: userProfile.registeredDate || '2026-01-10',
      guarantorInfo: userProfile.guarantorInfo
    };
  }, [userProfile, studentDocuments]);

  // Filter Logic
  const filteredAccommodations = useMemo(() => {
    return (accommodations || []).filter((item) => {
      if (!item) return false;

      // Only approved listings appear under Student Accommodations & Residences
      if (item.approvalStatus !== 'Approved') {
        return false;
      }

      // Free text search
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = (item.title || '').toLowerCase().includes(query);
        const matchesSuburb = (item.suburb || '').toLowerCase().includes(query);
        const matchesTown = (item.town || '').toLowerCase().includes(query);
        const matchesAddress = (item.streetAddress || '').toLowerCase().includes(query);
        const matchesUni = (item.universities || []).some((u) => (u.universityName || '').toLowerCase().includes(query));
        if (!matchesTitle && !matchesSuburb && !matchesTown && !matchesAddress && !matchesUni) {
          return false;
        }
      }

      // Town filter
      if (filters.town) {
        const townStr = (item.town || '').toLowerCase();
        const suburbStr = (item.suburb || '').toLowerCase();
        const addressStr = (item.streetAddress || '').toLowerCase();
        const searchTown = filters.town.toLowerCase().trim();

        const matchesTown = townStr.includes(searchTown) || (searchTown.length > 3 && searchTown.includes(townStr));
        const matchesSuburb = suburbStr.includes(searchTown) || (searchTown.length > 3 && searchTown.includes(suburbStr));
        const matchesAddress = addressStr.includes(searchTown);
        const matchesUni = (item.universities || []).some((u) =>
          u.universityName.toLowerCase().includes(searchTown) || (searchTown.length > 3 && searchTown.includes(u.universityName.toLowerCase()))
        );

        if (!matchesTown && !matchesSuburb && !matchesAddress && !matchesUni) {
          return false;
        }
      }

      // University proximity filter
      if (filters.university) {
        const hasUni = (item.universities || []).some((u) => u.universityName === filters.university);
        if (!hasUni) return false;
      }

      // Proximity distance filter
      if (filters.maxDistanceKm < 10) {
        const unis = item.universities || [];
        if (unis.length > 0) {
          const minDistance = Math.min(...unis.map((u) => u.distanceKm || 0));
          if (minDistance > filters.maxDistanceKm) {
            return false;
          }
        }
      }

      // Price filter
      const priceFrom = item.priceFrom || 0;
      const priceTo = item.priceTo || priceFrom;
      if (priceFrom > filters.maxPrice || priceTo < filters.minPrice) {
        return false;
      }

      // Room Type filter
      if (filters.accommodationType !== 'All Types') {
        const hasType = item.type === filters.accommodationType || (item.rooms || []).some((r) => r.type === filters.accommodationType);
        if (!hasType) return false;
      }

      // NSFAS only toggle
      if (filters.nsfasOnly && !item.nsfasAccredited) {
        return false;
      }

      // Backup power only toggle
      if (filters.backupPowerOnly && !item.hasBackupPower) {
        return false;
      }

      // All bills included only toggle
      if (filters.allBillsIncludedOnly && !item.allBillsIncluded) {
        return false;
      }

      // Instant book only toggle
      if (filters.instantBookOnly && !item.instantBookAvailable) {
        return false;
      }

      // Amenities filter
      if (filters.amenities && filters.amenities.length > 0) {
        const itemAmenities = item.amenities || [];
        const hasAllAmenities = filters.amenities.every((a) => itemAmenities.includes(a));
        if (!hasAllAmenities) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_low') {
        const diff = (a.priceFrom || 0) - (b.priceFrom || 0);
        if (diff !== 0) return diff;
      } else if (filters.sortBy === 'price_high') {
        const diff = (b.priceFrom || 0) - (a.priceFrom || 0);
        if (diff !== 0) return diff;
      } else if (filters.sortBy === 'closest') {
        const unisA = a.universities || [];
        const unisB = b.universities || [];
        const distA = unisA.length > 0 ? Math.min(...unisA.map((u) => u.distanceKm || 0)) : 999;
        const distB = unisB.length > 0 ? Math.min(...unisB.map((u) => u.distanceKm || 0)) : 999;
        const diff = distA - distB;
        if (diff !== 0) return diff;
      } else if (filters.sortBy === 'top_rated') {
        const ratingA = a.landlord?.overallRating || 0;
        const ratingB = b.landlord?.overallRating || 0;
        const diff = ratingB - ratingA;
        if (diff !== 0) return diff;
      } else {
        // Recommended sort: featured listings first
        const featDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        if (featDiff !== 0) return featDiff;
      }
      // Fixed deterministic tie-breaker so listings NEVER jump or move
      return (a.id || '').localeCompare(b.id || '');
    });
  }, [accommodations, filters]);

  // Saved Favorites Toggle
  const toggleSaveProperty = async (id: string) => {
    if (!userProfile) {
      setAuthModalMode('signin');
      setIsStudentAuthOpen(true);
      return;
    }
    const currentSaved = userProfile.savedProperties || [];
    const isSaved = currentSaved.includes(id);
    const updated = isSaved ? currentSaved.filter((pid) => pid !== id) : [...currentSaved, id];
    await updateProfileData({ savedProperties: updated });
  };

  const savedAccommodations = useMemo(() => {
    if (!userProfile || !userProfile.savedProperties) return [];
    return accommodations.filter((p) => userProfile.savedProperties?.includes(p.id));
  }, [accommodations, userProfile]);

  // Handle Instant Booking / Application (Auth Guarded)
  const handleOpenBooking = (property: Accommodation, room?: RoomOption) => {
    if (!userProfile) {
      setAuthModalMode('signin');
      setIsStudentAuthOpen(true);
      return;
    }
    setBookingProperty({ property, room });
  };

  const handleBookingSubmit = async (newApp: BookingApplication) => {
    await submitApplication(newApp);
  };

  // Handle Direct Message Trigger (Auth Guarded)
  const handleOpenDirectMessage = async (property: Accommodation) => {
    if (!userProfile) {
      setAuthModalMode('signin');
      setIsStudentAuthOpen(true);
      return;
    }

    const studentId = userProfile.id;
    const studentName = userProfile.fullName;
    const studentAvatar = userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

    // Check if conversation exists or create new
    const existingConv = conversations.find((c) => c.propertyId === property.id && c.studentId === studentId);
    if (existingConv) {
      setActiveConversationId(existingConv.id);
    } else {
      const newConvId = `conv-${Date.now()}`;
      const landlordName = property.landlord?.name || 'Housing Provider';
      const newConv: Conversation = {
        id: newConvId,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImage: property.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        propertyPrice: property.priceFrom,
        landlordId: property.landlord?.id || property.landlordId || 'll-unknown',
        landlordName,
        landlordAvatar: property.landlord?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        studentId,
        studentName,
        studentAvatar,
        lastMessage: `Hi ${landlordName}, I am interested in ${property.title}.`,
        lastMessageTime: 'Just now',
        unreadCount: 0,
      };

      const initialChatMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: newConvId,
        senderId: studentId,
        senderName: studentName,
        senderRole: 'student',
        senderAvatar: studentAvatar,
        text: `Hi ${landlordName}, I am interested in viewing or booking a room at ${property.title} for the 2026 academic year. Is it still available?`,
        timestamp: 'Just now',
        isRead: true,
      };

      await createConversation(newConv, initialChatMessage);
      setActiveConversationId(newConvId);
    }

    setIsMessagingOpen(true);
  };

  // Talk to Agent Chat Handler
  const handleStartAgentChat = async (initialMessage: string) => {
    const agentConvId = `conv-agent-${userProfile?.id || 'guest'}`;
    const existingAgentConv = conversations.find((c) => c.id === agentConvId);

    const studentId = userProfile?.id || 'std-guest';
    const studentName = userProfile?.fullName || 'Student Applicant';
    const studentAvatar = userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

    if (!existingAgentConv) {
      const agentConv: Conversation = {
        id: agentConvId,
        propertyId: 'prop-advisor',
        propertyTitle: 'iKhaya Student Placement Support',
        propertyImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        propertyPrice: 0,
        landlordId: 'agent-nandi',
        landlordName: 'Nandi Khumalo (iKhaya Housing Advisor)',
        landlordAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        studentId,
        studentName,
        studentAvatar,
        lastMessage: initialMessage,
        lastMessageTime: 'Just now',
        unreadCount: 0,
      };

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: agentConvId,
        senderId: studentId,
        senderName: studentName,
        senderRole: 'student',
        senderAvatar: studentAvatar,
        text: initialMessage,
        timestamp: 'Just now',
        isRead: true,
      };

      await createConversation(agentConv, userMsg);
    } else {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: agentConvId,
        senderId: studentId,
        senderName: studentName,
        senderRole: 'student',
        senderAvatar: studentAvatar,
        text: initialMessage,
        timestamp: 'Just now',
        isRead: true,
      };
      await sendMessage(agentConvId, userMsg);
    }

    setActiveConversationId(agentConvId);
    setIsMessagingOpen(true);
  };

  const handleSendMessage = async (convId: string, text: string, attachmentName?: string) => {
    if (!userProfile) {
      setAuthModalMode('signin');
      setIsStudentAuthOpen(true);
      return;
    }

    const currentRole = userProfile.role;
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      senderId: userProfile.id,
      senderName: userProfile.fullName,
      senderRole: currentRole === 'student' ? 'student' : 'landlord',
      senderAvatar: userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      text,
      timestamp: 'Just now',
      isRead: true,
      attachmentName,
    };

    await sendMessage(convId, newMessage);
  };

  // List Accommodation Auth Guard
  const handleOpenAddListing = () => {
    if (!userProfile) {
      setAuthModalMode('register');
      setIsStudentAuthOpen(true);
      return;
    }
    setIsAddListingOpen(true);
  };

  // Admin Portal Listing Moderation Handlers
  const handleApproveAccommodation = async (id: string, notes?: string) => {
    await updateAccommodation(id, {
      approvalStatus: 'Approved',
      verifiedListing: true,
      moderationNotes: notes || 'Accredited and approved for 2026 academic intake.'
    });
  };

  const handleDenyAccommodation = async (id: string, notes?: string) => {
    await updateAccommodation(id, {
      approvalStatus: 'Rejected',
      verifiedListing: false,
      moderationNotes: notes || 'Listing does not meet verification criteria.'
    });
  };

  // Admin Portal Document Moderation Handlers
  const handleApproveDocument = async (docId: string, notes?: string) => {
    const verifiedNotes = notes || 'Document verified against national student records.';
    await updateStudentDocumentStatus(docId, 'Verified', verifiedNotes);
    if (userProfile?.documents?.some((d) => d.id === docId)) {
      const updatedDocs = userProfile.documents.map((d) =>
        d.id === docId ? { ...d, status: 'Verified' as const, verificationNotes: verifiedNotes } : d
      );
      await updateProfileData({ documents: updatedDocs });
    }
  };

  const handleDeclineDocument = async (docId: string, reason?: string) => {
    const declineReason = reason || 'Document image unclear or expired certification stamp.';
    await updateStudentDocumentStatus(docId, 'Requires Update', declineReason);
    if (userProfile?.documents?.some((d) => d.id === docId)) {
      const updatedDocs = userProfile.documents.map((d) =>
        d.id === docId ? { ...d, status: 'Requires Update' as const, verificationNotes: declineReason } : d
      );
      await updateProfileData({ documents: updatedDocs });
    }
  };

  // Document Vault Handlers (Persisted to Firestore and Student Profile)
  const handleUploadDocument = async (newDoc: RentalDocument) => {
    if (!userProfile) return;
    const currentDocs = userProfile.documents || [];
    const updatedDocs = [newDoc, ...currentDocs];
    await updateProfileData({ documents: updatedDocs });

    // Also register in studentDocuments audit collection
    await uploadStudentDocument({
      id: newDoc.id,
      studentId: userProfile.id,
      studentName: userProfile.fullName,
      studentNumber: userProfile.studentNumber || 'STU2026',
      documentType: newDoc.type,
      documentName: newDoc.name || newDoc.fileName || 'Rental Document',
      uploadedAt: newDoc.uploadedAt || new Date().toISOString().split('T')[0],
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'Pending Verification',
      fileSize: newDoc.fileSize,
      fileUrl: newDoc.fileUrl
    });
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!userProfile) return;
    const currentDocs = userProfile.documents || [];
    const updatedDocs = currentDocs.filter((d) => d.id !== docId);
    await updateProfileData({ documents: updatedDocs });
  };

  const handleUpdateStudentProfile = async (updatedProfile: StudentProfile) => {
    await updateProfileData({
      fullName: updatedProfile.fullName,
      phone: updatedProfile.phone,
      university: updatedProfile.university,
      studentNumber: updatedProfile.studentNumber,
      yearOfStudy: updatedProfile.yearOfStudy,
      fundingType: updatedProfile.fundingType,
      guarantorInfo: updatedProfile.guarantorInfo,
      documents: updatedProfile.documents,
      savedProperties: updatedProfile.savedProperties
    });
  };

  // Rating Modal Handlers
  const handleOpenRatingModal = (property: Accommodation) => {
    setRatingModalConfig({
      isOpen: true,
      targetType: 'landlord',
      property,
    });
  };

  const handleOpenTenantRatingModal = (tenantName: string) => {
    setRatingModalConfig({
      isOpen: true,
      targetType: 'tenant',
      tenantName,
    });
  };

  const handleSubmitLandlordReview = async (review: LandlordReview, propertyId: string) => {
    const prop = accommodations.find(p => p.id === propertyId);
    if (!prop) return;
    const updatedReviews = [review, ...prop.landlord.reviews];
    const newAvg = parseFloat(
      (updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length).toFixed(2)
    );
    await updateAccommodation(propertyId, {
      landlord: {
        ...prop.landlord,
        overallRating: newAvg,
        totalReviews: updatedReviews.length,
        reviews: updatedReviews
      }
    });
  };

  const handleSubmitTenantReview = (review: TenantReview) => {
    // Tenant review saved
  };

  // Landlord Application status update
  const handleUpdateApplicationStatus = async (appId: string, status: BookingApplication['status']) => {
    await updateApplicationStatus(appId, status);
  };

  // Landlord Add Listing Handler
  const handleAddAccommodation = async (newAcc: Accommodation) => {
    const updatedAcc: Accommodation = {
      ...newAcc,
      landlordId: userProfile?.id || newAcc.landlordId,
      landlord: {
        ...newAcc.landlord,
        id: userProfile?.id || newAcc.landlord.id,
        name: userProfile?.fullName || newAcc.landlord.name,
      }
    };
    await addAccommodation(updatedAcc);
  };

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // Determine filtered accommodations & applications for the Landlord view
  const isDemoLandlord = !userProfile || userProfile.id === 'demo-landlord-sibusiso' || userProfile.id === 'landlord-1';
  const landlordAccommodations = isDemoLandlord
    ? accommodations
    : accommodations.filter(a => a.landlordId === userProfile?.id || a.landlord?.id === userProfile?.id || (a.landlord?.email && a.landlord?.email === userProfile?.email));
  const landlordApplications = isDemoLandlord
    ? applications
    : applications.filter(app => {
        if (app.landlordId && (app.landlordId === userProfile?.id || app.landlordId === userProfile?.email)) return true;
        const matchedAcc = accommodations.find(a => a.id === app.propertyId);
        if (matchedAcc && (
          matchedAcc.landlordId === userProfile?.id ||
          matchedAcc.landlord?.id === userProfile?.id ||
          (matchedAcc.landlord?.email && matchedAcc.landlord?.email === userProfile?.email)
        )) {
          return true;
        }
        return false;
      });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Main Navigation */}
      <Navbar
        currentView={currentView}
        savedCount={userProfile?.savedProperties?.length || 0}
        unreadMessagesCount={unreadMessagesCount}
        userProfile={userProfile}
        onOpenFavorites={() => {
          if (!userProfile) {
            setAuthModalMode('signin');
            setIsStudentAuthOpen(true);
          } else {
            setStudentHubInitialTab('saved');
            setIsStudentHubOpen(true);
          }
        }}
        onOpenMessages={() => setIsMessagingOpen(true)}
        onOpenDocuments={() => {
          if (!userProfile) {
            setAuthModalMode('signin');
            setIsStudentAuthOpen(true);
          } else {
            setStudentHubInitialTab('documents');
            setIsStudentHubOpen(true);
          }
        }}
        onOpenApplications={() => {
          if (!userProfile) {
            setAuthModalMode('signin');
            setIsStudentAuthOpen(true);
          } else {
            setStudentHubInitialTab('applications');
            setIsStudentHubOpen(true);
          }
        }}
        onOpenAddListing={handleOpenAddListing}
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode || 'signin');
          setIsStudentAuthOpen(true);
        }}
        onOpenStudentProfile={(tab) => {
          setStudentHubInitialTab(tab || 'profile');
          setIsStudentHubOpen(true);
        }}
        onTalkToAgent={() => setIsTalkToAgentOpen(true)}
        onSignOut={() => signOut()}
      />

      {/* VIEW SWITCH: STUDENT PORTAL vs LANDLORD HUB vs ADMIN PORTAL */}
      {currentView === 'admin' ? (
        <AdminPortal
          accommodations={accommodations}
          studentDocuments={studentDocuments}
          onApproveAccommodation={handleApproveAccommodation}
          onDenyAccommodation={handleDenyAccommodation}
          onApproveDocument={handleApproveDocument}
          onDeclineDocument={handleDeclineDocument}
          onViewAccommodation={(prop) => setSelectedProperty(prop)}
        />
      ) : currentView === 'landlord' ? (
        <LandlordPortal
          accommodations={landlordAccommodations}
          applications={landlordApplications}
          studentProfile={studentProfileObj}
          userProfile={userProfile}
          onUpdateApplicationStatus={handleUpdateApplicationStatus}
          onOpenAddListing={handleOpenAddListing}
          onOpenMessages={() => setIsMessagingOpen(true)}
          onRateTenant={handleOpenTenantRatingModal}
        />
      ) : (
        <main className="flex-1 pb-16">
          {/* Search & Multi-Campus Filtering Banner */}
          <SearchFilters
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={() =>
              setFilters({
                searchQuery: '',
                town: '',
                university: '',
                maxDistanceKm: 10,
                minPrice: 3500,
                maxPrice: 12000,
                accommodationType: 'All Types',
                genderPolicy: 'All',
                nsfasOnly: false,
                backupPowerOnly: false,
                allBillsIncludedOnly: false,
                instantBookOnly: false,
                amenities: [],
                sortBy: 'recommended',
              })
            }
            resultsCount={filteredAccommodations.length}
            onOpenAddListing={handleOpenAddListing}
          />

          {/* Main Content Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-5">
            {/* View Mode Toolbar: Grid Cards vs Accommodation Search Map */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Student Accommodations & Residences
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-900 border border-lime-300">
                    2026 Academic Year
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Verified student housing with accredited walking distances, NSFAS coverage, and backup power
                </p>
              </div>

              {/* Grid vs Map Toggle & Talk to Agent CTA */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setIsTalkToAgentOpen(true)}
                  className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-50 text-lime-900 border border-lime-300 text-xs font-bold shadow-2xs"
                >
                  <Headphones className="w-3.5 h-3.5 text-lime-700" />
                  <span>Agent Help</span>
                </button>

                <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    id="view-mode-grid-btn"
                    onClick={() => setShowMapView(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      !showMapView ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Listings Grid</span>
                  </button>
                  <button
                    id="view-mode-map-btn"
                    onClick={() => setShowMapView(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      showMapView ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>Search on Map</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SEARCH MAP VIEW vs GRID LIST VIEW */}
            {showMapView ? (
              <AccommodationsMapView
                accommodations={filteredAccommodations}
                selectedUniversity={filters.university}
                selectedTown={filters.town}
                onSelectProperty={(prop) => setSelectedProperty(prop)}
                onDirectMessage={(prop) => handleOpenDirectMessage(prop)}
              />
            ) : (
              <>
                {filteredAccommodations.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto my-10 shadow-xs">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200">
                      <Search className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">No Student Accommodations Found</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      We could not find listings matching your specific combination of campus proximity, pricing, or location filters. Try expanding your search radius.
                    </p>
                    <button
                      onClick={() =>
                        setFilters({
                          searchQuery: '',
                          town: '',
                          university: '',
                          maxDistanceKm: 10,
                          minPrice: 3500,
                          maxPrice: 12000,
                          accommodationType: 'All Types',
                          genderPolicy: 'All',
                          nsfasOnly: false,
                          backupPowerOnly: false,
                          allBillsIncludedOnly: false,
                          instantBookOnly: false,
                          amenities: [],
                          sortBy: 'recommended',
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredAccommodations.map((property, idx) => (
                      <PropertyCard
                        key={property.id || `prop-${idx}`}
                        property={property}
                        isSaved={userProfile?.savedProperties ? userProfile.savedProperties.includes(property.id) : false}
                        onToggleSave={toggleSaveProperty}
                        onSelectProperty={(p) => setSelectedProperty(p)}
                        onInstantBook={(p) => handleOpenBooking(p)}
                        onDirectMessage={(p) => handleOpenDirectMessage(p)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      )}

      {/* POPUP & MODAL OVERLAYS */}

      {/* 1. Property Deep Detail View Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        isSaved={selectedProperty && userProfile?.savedProperties ? userProfile.savedProperties.includes(selectedProperty.id) : false}
        onToggleSave={toggleSaveProperty}
        onInstantBook={(p, room) => {
          setSelectedProperty(null);
          handleOpenBooking(p, room);
        }}
        onDirectMessage={(p) => {
          setSelectedProperty(null);
          handleOpenDirectMessage(p);
        }}
        onOpenRatingModal={(p) => {
          setSelectedProperty(null);
          handleOpenRatingModal(p);
        }}
      />

      {/* 2. Direct Booking & Rental Application Wizard Modal */}
      <BookingModal
        property={bookingProperty?.property || null}
        initialRoom={bookingProperty?.room}
        studentProfile={studentProfileObj}
        isOpen={!!bookingProperty}
        onClose={() => setBookingProperty(null)}
        onSubmitBooking={handleBookingSubmit}
        onViewApplications={() => {
          setStudentHubInitialTab('applications');
          setIsStudentHubOpen(true);
        }}
      />

      {/* 3. Direct Landlord & Student Real-Time Messaging Center */}
      <MessagingCenter
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        messages={messages}
        onSendMessage={handleSendMessage}
        currentRole={currentView}
        studentProfile={studentProfileObj}
      />

      {/* 4. Multi-Role Authentication Modal (Sign In / Register / Google / Demo) */}
      <StudentAuthModal
        isOpen={isStudentAuthOpen}
        onClose={() => setIsStudentAuthOpen(false)}
        initialMode={authModalMode}
      />

      {/* 5. Comprehensive Student Profile Hub */}
      <StudentProfileHubModal
        isOpen={isStudentHubOpen}
        onClose={() => setIsStudentHubOpen(false)}
        currentView={currentView}
        studentProfile={studentProfileObj}
        initialTab={studentHubInitialTab}
        applications={applications}
        savedAccommodations={savedAccommodations}
        conversations={conversations}
        messages={messages}
        onSendMessage={handleSendMessage}
        onUploadDocument={handleUploadDocument}
        onDeleteDocument={handleDeleteDocument}
        onUpdateProfile={handleUpdateStudentProfile}
        onSelectSavedProperty={(p) => {
          setIsStudentHubOpen(false);
          setSelectedProperty(p);
        }}
        onOpenBooking={(p) => {
          setIsStudentHubOpen(false);
          handleOpenBooking(p);
        }}
        onOpenFullMessaging={(convId) => {
          setIsStudentHubOpen(false);
          if (convId) setActiveConversationId(convId);
          setIsMessagingOpen(true);
        }}
        onSignOut={() => {
          signOut();
          setIsStudentHubOpen(false);
        }}
      />

      {/* 6. Dual Rating & Review System Modal */}
      <RatingSystemModal
        isOpen={ratingModalConfig.isOpen}
        onClose={() => setRatingModalConfig({ isOpen: false, targetType: 'landlord' })}
        targetType={ratingModalConfig.targetType}
        property={ratingModalConfig.property}
        tenantName={ratingModalConfig.tenantName}
        reviewerName={userProfile?.fullName || 'Anonymous Student'}
        reviewerUniversity={userProfile?.university || 'University of the Witwatersrand'}
        onSubmitLandlordReview={handleSubmitLandlordReview}
        onSubmitTenantReview={handleSubmitTenantReview}
      />

      {/* 7. Landlord Add New Accommodation Listing Modal */}
      <AddListingModal
        isOpen={isAddListingOpen}
        onClose={() => setIsAddListingOpen(false)}
        onAddAccommodation={handleAddAccommodation}
        userProfile={userProfile}
      />

      {/* 8. Dedicated Talk to an Agent Support Modal */}
      <TalkToAgentModal
        isOpen={isTalkToAgentOpen}
        onClose={() => setIsTalkToAgentOpen(false)}
        studentProfile={studentProfileObj}
        onStartAgentChat={handleStartAgentChat}
      />

      {/* Footer with full brand title */}
      <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <BrandLogo size="lg" showSubtitle={true} subtitleText="Res Living" />
            <p className="text-[12px] leading-relaxed text-slate-500">
              <strong className="text-slate-800 font-bold">iKhaya Res Living</strong> is South Africa's premier student housing platform. Connecting university students with verified residences, accredited landlords, and secure rental applications.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Top University Hubs</h4>
            <ul className="space-y-1.5 text-[12px] text-slate-500">
              <li>Cape Town (UCT, CPUT & UWC)</li>
              <li>Johannesburg (Wits & UJ)</li>
              <li>Pretoria (UP & TUT)</li>
              <li>Stellenbosch (SU)</li>
              <li>Durban (UKZN & DUT)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Trust & Safety</h4>
            <ul className="space-y-1.5 text-[12px] text-slate-500">
              <li>NSFAS Accredited Residences</li>
              <li>Secure Document Vault</li>
              <li>Verified Landlord Badging</li>
              <li>Direct Landlord & Agent Messaging</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Need Placement Help?</h4>
            <button
              onClick={() => setIsTalkToAgentOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-lime-50 hover:bg-lime-100 text-lime-950 border border-lime-300 font-bold text-xs transition"
            >
              <Headphones className="w-3.5 h-3.5 text-lime-700" />
              <span>Talk to an iKhaya Agent</span>
            </button>
            <p className="text-[11px] text-slate-500 pt-1">Email: support@ikhayastudentliving.co.za</p>
            <p className="text-[11px] text-slate-400">Available Monday &ndash; Saturday</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

