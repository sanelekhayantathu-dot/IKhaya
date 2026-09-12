import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole, StudentProfile } from '../types';
import { SAMPLE_STUDENT_PROFILE } from '../data/mockData';
import { sanitizeForFirestore } from '../utils/sanitize';
import { hashPassword } from '../utils/validators';
import { sendAccountWelcomeEmail } from '../services/emailService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isEmailVerified: boolean;
  sendEmailConfirmation: (customEmail?: string) => Promise<{ success: boolean; message: string }>;
  checkEmailVerificationStatus: () => Promise<boolean>;
  signInWithGoogle: (preferredRole?: UserRole) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, profileData: Partial<UserProfile>) => Promise<void>;
  signInWithDemo: (role: UserRole, customData?: Partial<UserProfile>) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  student: {
    id: 'demo-student-sanele',
    email: 'sanele.ntathu@student.uj.ac.za',
    role: 'student',
    fullName: 'Sanele Ntathu',
    phone: '+27 72 849 3920',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    university: 'University of Johannesburg (UJ)',
    studentNumber: '202391084',
    idNumber: '0204125890087',
    course: 'BCom Accounting & Information Systems (Year 2)',
    yearOfStudy: '2nd Year Undergrad',
    fundingType: 'NSFAS',
    emergencyContact: {
      name: 'Noluthando Ntathu',
      relationship: 'Mother / Legal Guardian',
      phone: '+27 83 491 8201',
      email: 'n.ntathu@telkomsa.net'
    },
    documents: [],
    savedProperties: ['acc-1', 'acc-3'],
    registeredDate: '2025-01-14',
    createdAt: new Date().toISOString()
  },
  landlord: {
    id: 'demo-landlord-sibusiso',
    email: 'sibusiso@campusliving.co.za',
    role: 'landlord',
    fullName: 'Sibusiso Ndlovu',
    phone: '+27 82 443 1928',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    agencyName: 'Campus Living Property Group',
    isVerifiedLandlord: true,
    responseTime: 'Under 1 hour',
    responseRate: '98%',
    propertyCount: '3 Residences (180 Beds)',
    registeredDate: '2023-11-02',
    createdAt: new Date().toISOString()
  },
  admin: {
    id: 'demo-admin-staff',
    email: 'sanelekhayantathu@gmail.com',
    role: 'admin',
    fullName: 'iKhaya Compliance Officer',
    phone: '+27 11 900 2400',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    agencyName: 'iKhaya Platform Compliance & Verification Unit',
    registeredDate: '2023-01-01',
    createdAt: new Date().toISOString()
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    // Default to unsigned in profile on visit unless real authenticated session exists
    const saved = localStorage.getItem('ikhaya_active_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Do not auto-login to demo profile or someone else's profile
        if (parsed && parsed.id && !parsed.id.startsWith('demo-')) {
          return parsed;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Sync profile state changes to local cache for instant reload
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('ikhaya_active_profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('ikhaya_active_profile');
    }
  }, [userProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            setUserProfile(data);
          } else {
            // Determine default role: admin if admin email, else student
            const isAdminEmail = firebaseUser.email === 'sanelekhayantathu@gmail.com';
            const role: UserRole = isAdminEmail ? 'admin' : 'student';

            const newProfile: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              role,
              fullName: firebaseUser.displayName || (role === 'admin' ? 'System Administrator' : 'Student Resident'),
              phone: firebaseUser.phoneNumber || '+27 70 000 0000',
              avatar: firebaseUser.photoURL || '',
              university: 'University of Johannesburg (UJ)',
              studentNumber: 'STU' + Math.floor(100000 + Math.random() * 900000),
              yearOfStudy: '2nd Year Undergrad',
              fundingType: 'NSFAS',
              savedProperties: [],
              documents: [],
              registeredDate: new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString()
            };

            await setDoc(userDocRef, sanitizeForFirestore(newProfile), { merge: true });
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile from Firestore:', error);
          // Fallback to local default if network or offline
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (preferredRole: UserRole = 'student') => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        const isAdminEmail = user.email === 'sanelekhayantathu@gmail.com';
        const assignedRole = isAdminEmail ? 'admin' : preferredRole;

        const newProfile: UserProfile = {
          id: user.uid,
          email: user.email || '',
          role: assignedRole,
          fullName: user.displayName || (assignedRole === 'landlord' ? 'Property Landlord' : 'Student Resident'),
          phone: user.phoneNumber || '+27 70 000 0000',
          avatar: user.photoURL || '',
          university: 'University of Johannesburg (UJ)',
          studentNumber: 'STU' + Math.floor(100000 + Math.random() * 900000),
          yearOfStudy: '2nd Year Undergrad',
          fundingType: 'NSFAS',
          agencyName: assignedRole === 'landlord' ? 'Accredited Housing Provider' : '',
          savedProperties: [],
          documents: [],
          registeredDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        };

        await setDoc(userDocRef, sanitizeForFirestore(newProfile), { merge: true });
        setUserProfile(newProfile);

        // Dispatch welcome confirmation email to newly registered Google user
        if (newProfile.email) {
          sendAccountWelcomeEmail({
            userId: newProfile.id,
            name: newProfile.fullName,
            email: newProfile.email,
            role: newProfile.role,
            phone: newProfile.phone,
            university: newProfile.university,
            agencyName: newProfile.agencyName,
            createdAt: newProfile.createdAt || new Date().toISOString(),
          }).catch((e) => console.warn('Account welcome email notice:', e));
        }
      } else {
        setUserProfile(userSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();
      if (!cleanEmail) {
        throw new Error('Please enter a valid email address.');
      }
      if (!cleanPassword) {
        throw new Error('Please enter your account password.');
      }
      
      let userProfileFound: UserProfile | null = null;
      let firebaseUid: string | null = null;

      // 1. Attempt standard Firebase Auth sign-in
      try {
        const result = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        firebaseUid = result.user?.uid;
      } catch (authErr: any) {
        console.warn('Firebase Auth Sign-In notice:', authErr?.code || authErr?.message);
        const code = authErr?.code;
        if (code === 'auth/wrong-password') {
          throw new Error('Incorrect password. Please verify your credentials and try again.');
        } else if (code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address format.');
        } else if (code === 'auth/too-many-requests') {
          throw new Error('Too many failed login attempts. Please wait a few moments before trying again.');
        }
        // If code is auth/user-not-found, auth/invalid-credential, auth/operation-not-allowed, or auth/admin-restricted-operation:
        // We will strictly look up whether a real registered account exists in Firestore
      }

      // 2. Fetch User Profile from Firestore
      const fallbackUid = `user-${(cleanEmail || '').replace(/[^a-zA-Z0-9]/g, '_')}`;

      // Try Firebase UID first if auth succeeded
      if (firebaseUid) {
        const userDocRef = doc(db, 'users', firebaseUid);
        const userSnap = await getDoc(userDocRef).catch(() => null);
        if (userSnap && userSnap.exists()) {
          userProfileFound = userSnap.data() as UserProfile;
        }
      }

      // If not yet found by firebaseUid, look up by deterministic email UID
      if (!userProfileFound) {
        const fallbackRef = doc(db, 'users', fallbackUid);
        const fallbackSnap = await getDoc(fallbackRef).catch(() => null);
        if (fallbackSnap && fallbackSnap.exists()) {
          const stored = fallbackSnap.data() as UserProfile;
          // Verify password if a password hash was stored with registration
          if (stored.passwordHash && stored.passwordHash !== hashPassword(cleanPassword)) {
            throw new Error('Incorrect password. Please verify your credentials and try again.');
          }
          userProfileFound = stored;
        }
      }

      // Dedicated check for platform administrator account
      if (!userProfileFound && cleanEmail === 'sanelekhayantathu@gmail.com') {
        const adminProfile: UserProfile = {
          ...DEMO_PROFILES.admin,
          email: cleanEmail,
          passwordHash: hashPassword(cleanPassword),
          updatedAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, 'users', fallbackUid), sanitizeForFirestore(adminProfile), { merge: true });
        } catch (e) {
          console.warn('Admin sync notice:', e);
        }
        userProfileFound = adminProfile;
      }

      // STRICT CHECK: If no registered profile exists in Firestore or Firebase Auth,
      // DO NOT let them log in and DO NOT create a dummy account!
      if (!userProfileFound) {
        throw new Error('No account found with this email. Please check your credentials or click "Create Account" to register.');
      }

      setUserProfile(userProfileFound);
    } catch (error: any) {
      console.error('Email Sign-In Error:', error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();
      if (!cleanEmail) {
        throw new Error('Please enter a valid email address.');
      }
      if (!cleanPassword || cleanPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const fallbackUid = `user-${(cleanEmail || '').replace(/[^a-zA-Z0-9]/g, '_')}`;

      // Strict Pre-Check: Prevent duplicate account creation if email already registered in Firestore
      const existingSnap = await getDoc(doc(db, 'users', fallbackUid)).catch(() => null);
      if (existingSnap && existingSnap.exists()) {
        const friendlyErr = new Error('An account with this email already exists. Please switch to Sign In.');
        (friendlyErr as any).code = 'auth/email-already-in-use';
        throw friendlyErr;
      }

      let userId = fallbackUid;
      let userEmail = cleanEmail;

      try {
        const result = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        if (result?.user) {
          userId = result.user.uid;
          userEmail = result.user.email || cleanEmail;
          // Dispatch native Firebase Email Verification link
          try {
            await sendEmailVerification(result.user);
          } catch (verifErr) {
            console.warn('Firebase Auth sendEmailVerification notice:', verifErr);
          }
        }
      } catch (authErr: any) {
        console.warn('Firebase Auth Registration notice:', authErr?.code || authErr?.message);
        if (authErr?.code === 'auth/email-already-in-use') {
          const friendlyErr = new Error('An account with this email already exists. Please switch to Sign In.');
          (friendlyErr as any).code = 'auth/email-already-in-use';
          throw friendlyErr;
        } else if (authErr?.code === 'auth/weak-password') {
          throw new Error('Password must be at least 6 characters long.');
        } else if (authErr?.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.');
        }
        // For operation-not-allowed or admin-restricted-operation:
        // Account will be registered and stored in Firestore database
        userId = fallbackUid;
        userEmail = cleanEmail;
      }

      const role: UserRole = profileData.role || 'student';

      const newProfile: UserProfile = {
        id: userId,
        email: userEmail,
        role,
        fullName: profileData.fullName || 'New Resident',
        phone: profileData.phone || '+27 70 000 0000',
        idNumber: profileData.idNumber || '',
        idType: profileData.idType || 'sa_id',
        passwordHash: hashPassword(cleanPassword),
        avatar: profileData.avatar || '',
        university: profileData.university || 'University of Johannesburg (UJ)',
        studentNumber: profileData.studentNumber || '',
        course: profileData.course || '',
        yearOfStudy: profileData.yearOfStudy || '1st Year Student',
        fundingType: profileData.fundingType || 'NSFAS',
        agencyName: profileData.agencyName || (role === 'landlord' ? 'Accredited Housing Provider' : ''),
        propertyCount: profileData.propertyCount || '',
        savedProperties: [],
        documents: [],
        registeredDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', userId), sanitizeForFirestore(newProfile), { merge: true });
        if (userId !== fallbackUid) {
          // Mirror under deterministic fallbackUid for seamless lookup
          await setDoc(doc(db, 'users', fallbackUid), sanitizeForFirestore(newProfile), { merge: true }).catch(() => null);
        }
      } catch (firestoreErr) {
        console.warn('Could not sync newly registered user to Firestore users collection:', firestoreErr);
      }

      setUserProfile(newProfile);

      // Dispatch confirmation welcome email to newly registered student/landlord
      if (newProfile.email) {
        sendAccountWelcomeEmail({
          userId: newProfile.id,
          name: newProfile.fullName,
          email: newProfile.email,
          role: newProfile.role,
          phone: newProfile.phone,
          university: newProfile.university,
          studentNumber: newProfile.studentNumber,
          agencyName: newProfile.agencyName,
          createdAt: newProfile.createdAt || new Date().toISOString(),
        }).catch((e) => console.warn('Account welcome email notice:', e));
      }
    } catch (error: any) {
      console.error('Email Registration Error:', error);
      throw error;
    }
  };

  const signInWithDemo = async (role: UserRole, customData?: Partial<UserProfile>) => {
    const base = DEMO_PROFILES[role];
    const profile: UserProfile = {
      ...base,
      ...customData,
      id: customData?.id || base.id,
      role
    };
    
    // Save to Firestore if connected
    try {
      await setDoc(doc(db, 'users', profile.id), sanitizeForFirestore(profile), { merge: true });
    } catch (e) {
      console.warn('Could not sync demo profile to Firestore:', e);
    }

    setUserProfile(profile);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...updates, updatedAt: new Date().toISOString() };
    setUserProfile(updated);

    try {
      await setDoc(doc(db, 'users', userProfile.id), sanitizeForFirestore(updates), { merge: true });
    } catch (error) {
      console.error('Failed to update profile in Firestore:', error);
    }
  };

  const isEmailVerified = Boolean(currentUser?.emailVerified);

  const sendEmailConfirmation = async (customEmail?: string): Promise<{ success: boolean; message: string }> => {
    const targetEmail = (customEmail || currentUser?.email || userProfile?.email || '').trim().toLowerCase();
    if (!targetEmail) {
      throw new Error('No email address available to dispatch confirmation.');
    }

    if (currentUser) {
      try {
        await sendEmailVerification(currentUser);
      } catch (authErr: any) {
        console.warn('Firebase Auth sendEmailVerification note:', authErr);
        if (authErr?.code === 'auth/too-many-requests') {
          return {
            success: true,
            message: `A verification email was recently dispatched to ${targetEmail}. Please check your inbox and spam folder.`
          };
        }
      }
    }

    // Also dispatch account confirmation email via iKhaya mail queue
    try {
      await sendAccountWelcomeEmail({
        userId: userProfile?.id || `user-${targetEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: userProfile?.fullName || targetEmail.split('@')[0],
        email: targetEmail,
        role: userProfile?.role || 'student',
        phone: userProfile?.phone,
        university: userProfile?.university,
        studentNumber: userProfile?.studentNumber,
        agencyName: userProfile?.agencyName,
        createdAt: new Date().toISOString(),
      });
    } catch (emailErr) {
      console.warn('sendAccountWelcomeEmail notice:', emailErr);
    }

    return {
      success: true,
      message: `Confirmation email dispatched to ${targetEmail}. Please check your inbox and spam folder.`
    };
  };

  const checkEmailVerificationStatus = async (): Promise<boolean> => {
    if (currentUser) {
      try {
        await currentUser.reload();
        return Boolean(currentUser.emailVerified);
      } catch (err) {
        console.warn('Could not reload currentUser:', err);
      }
    }
    return false;
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout note:', e);
    }
    setUserProfile(null);
    localStorage.removeItem('ikhaya_active_profile');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role: userProfile?.role || null,
        loading,
        isEmailVerified,
        sendEmailConfirmation,
        checkEmailVerificationStatus,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        signInWithDemo,
        updateUserProfile,
        updateProfileData: updateUserProfile,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
