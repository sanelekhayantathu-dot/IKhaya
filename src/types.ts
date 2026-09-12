export type AccommodationType = 'Single Studio' | 'En-suite Room' | 'Shared 2-Bed' | 'Cluster Apartment' | 'Bachelor Flat';

export type GenderPolicy = 'Mixed' | 'Female Only' | 'Male Only';

export type LeaseDuration = 'Full Academic Year (10-12 Mo)' | 'One Semester (5-6 Mo)' | 'Short Stay / Summer';

export interface UniversityProximity {
  universityName: string;
  campusName: string;
  distanceKm: number;
  walkingTimeMin: number;
  shuttleTimeMin?: number;
  transitNotes: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: 'Utilities' | 'Security' | 'Lifestyle' | 'Study';
}

export interface RoomOption {
  id: string;
  name: string;
  type: AccommodationType;
  pricePerMonth: number;
  deposit: number;
  isAvailable: boolean;
  availableCount: number;
  features: string[];
  image: string;
}

export interface LandlordReview {
  id: string;
  studentName: string;
  studentUniversity: string;
  studentAvatar: string;
  date: string;
  rating: number; // 1-5 overall
  categories: {
    maintenance: number;
    safety: number;
    depositFairness: number;
    wifiReliability: number;
    noiseManagement: number;
  };
  comment: string;
  stayDuration: string;
  roomType: string;
  verifiedTenant: boolean;
  helpfulCount: number;
}

export interface TenantReview {
  id: string;
  landlordName: string;
  propertyName: string;
  date: string;
  rating: number; // 1-5 overall
  categories: {
    paymentPromptness: number;
    cleanliness: number;
    houseRulesAdherence: number;
    communication: number;
  };
  comment: string;
  stayDuration: string;
}

export interface Landlord {
  id: string;
  name: string;
  agencyName?: string;
  avatar: string;
  phone: string;
  email: string;
  isVerified: boolean;
  responseTime: string;
  responseRate: string;
  memberSince: string;
  overallRating: number;
  totalReviews: number;
  badges: string[];
  reviews: LandlordReview[];
}

export interface Accommodation {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  town: string;
  suburb: string;
  streetAddress: string;
  priceFrom: number;
  priceTo: number;
  depositAmount: number;
  images: string[];
  videoTourUrl?: string;
  nsfasAccredited: boolean;
  bursaryAccepted: boolean[];
  allBillsIncluded: boolean;
  hasBackupPower: boolean;
  type: AccommodationType;
  genderPolicy: GenderPolicy;
  universities: UniversityProximity[];
  amenities: string[];
  rooms: RoomOption[];
  landlord: Landlord;
  landlordId?: string;
  houseRules: string[];
  securityFeatures: string[];
  featured: boolean;
  verifiedListing: boolean;
  approvalStatus?: 'Approved' | 'Pending Approval' | 'Rejected';
  moderationNotes?: string;
  viewsCount?: number;
  inquiriesCount?: number;
  applicationsCount?: number;
  instantBookAvailable: boolean;
  totalBeds: number;
  availableBeds: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  createdAt: string;
}

export interface RentalDocument {
  id: string;
  type: 'ID_PASSPORT' | 'PROOF_OF_REGISTRATION' | 'NSFAS_BURSARY_LETTER' | 'BANK_STATEMENT' | 'GUARANTOR_FORM' | 'OTHER';
  name: string;
  fileName?: string;
  fileSize: string;
  uploadedAt: string;
  status: 'Verified' | 'Pending Verification' | 'Requires Update';
  fileUrl?: string;
  verificationNotes?: string;
}

export type UserRole = 'student' | 'landlord' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone: string;
  avatar: string;
  // Student-specific fields
  university?: string;
  studentNumber?: string;
  idNumber?: string;
  idType?: 'sa_id' | 'passport';
  passwordHash?: string;
  course?: string;
  yearOfStudy?: string;
  fundingType?: 'NSFAS' | 'Bursary / Corporate Sponsor' | 'Self / Family Funded';
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  guarantorInfo?: {
    fullName?: string;
    relationship?: string;
    idNumber?: string;
    phone?: string;
    email?: string;
    monthlyIncome?: string;
  };
  documents?: RentalDocument[];
  savedProperties?: string[];
  // Landlord-specific fields
  agencyName?: string;
  isVerifiedLandlord?: boolean;
  responseTime?: string;
  responseRate?: string;
  propertyCount?: string;
  // Metadata
  registeredDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  university: string;
  studentNumber: string;
  idNumber?: string;
  course?: string;
  yearOfStudy: string;
  fundingType: 'NSFAS' | 'Bursary / Corporate Sponsor' | 'Self / Family Funded';
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  guarantorInfo?: {
    fullName?: string;
    relationship?: string;
    idNumber?: string;
    phone?: string;
    email?: string;
    monthlyIncome?: string;
  };
  documents: RentalDocument[];
  savedProperties: string[]; // IDs
  registeredDate?: string;
}

export interface BookingApplication {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  roomId: string;
  roomName: string;
  monthlyRent: number;
  deposit: number;
  landlordId?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentUniversity: string;
  fundingType: string;
  moveInDate: string;
  leaseDuration: LeaseDuration;
  status: 'Pending Review' | 'Accepted' | 'Declined' | 'Viewing Scheduled';
  appliedDate: string;
  documentsAttached: string[]; // document IDs
  specialNotes?: string;
  viewingDate?: string;
  viewingType?: 'In-Person' | 'Virtual Video Tour';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'landlord';
  senderAvatar: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachmentName?: string;
  viewingInvite?: {
    date: string;
    time: string;
    type: 'In-Person' | 'Virtual Video Tour';
    status: 'pending' | 'accepted' | 'declined';
  };
}

export interface Conversation {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  propertyPrice: number;
  landlordId: string;
  landlordName: string;
  landlordAvatar: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface FilterState {
  searchQuery: string;
  town: string;
  university: string;
  maxDistanceKm: number;
  minPrice: number;
  maxPrice: number;
  accommodationType: string;
  genderPolicy: string;
  nsfasOnly: boolean;
  backupPowerOnly: boolean;
  allBillsIncludedOnly: boolean;
  instantBookOnly: boolean;
  amenities: string[];
  sortBy: 'recommended' | 'price_low' | 'price_high' | 'closest' | 'top_rated';
}

export interface StudentDocumentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentUniversity?: string;
  studentNumber: string;
  documentType: RentalDocument['type'];
  documentName: string;
  fileSize: string;
  uploadedAt: string;
  submittedAt?: string;
  status: 'Verified' | 'Pending Verification' | 'Requires Update' | 'Declined';
  fileUrl?: string;
  adminNotes?: string;
  rejectionReason?: string;
  reviewedAt?: string;
}

