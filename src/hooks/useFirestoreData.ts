import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Accommodation, 
  BookingApplication, 
  Conversation, 
  ChatMessage, 
  StudentDocumentSubmission, 
  RentalDocument,
  UserProfile 
} from '../types';
import { 
  INITIAL_ACCOMMODATIONS, 
  INITIAL_APPLICATIONS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_MESSAGES,
  INITIAL_STUDENT_DOCUMENT_SUBMISSIONS 
} from '../data/mockData';
import { sanitizeForFirestore } from '../utils/sanitize';

export function useFirestoreData(userProfile: UserProfile | null) {
  const [accommodations, setAccommodations] = useState<Accommodation[]>(INITIAL_ACCOMMODATIONS);
  const [applications, setApplications] = useState<BookingApplication[]>(INITIAL_APPLICATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [studentDocuments, setStudentDocuments] = useState<StudentDocumentSubmission[]>(INITIAL_STUDENT_DOCUMENT_SUBMISSIONS);
  const [isInitializing, setIsInitializing] = useState(true);

  const userId = userProfile?.id;
  const userRole = userProfile?.role;

  // 1. Synchronize Accommodations
  useEffect(() => {
    const accCollection = collection(db, 'accommodations');
    
    // Canonical index map for rock-solid stability
    const initialOrderMap = new Map(INITIAL_ACCOMMODATIONS.map((acc, idx) => [acc.id, idx]));

    const unsubscribe = onSnapshot(accCollection, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Accommodation[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Accommodation;
          loaded.push({ ...data, id: data?.id || docSnap.id });
        });
        
        // Sort deterministically: canonical mock data first in their fixed order, then new listings by ID
        loaded.sort((a, b) => {
          const idA = a?.id || '';
          const idB = b?.id || '';
          const idxA = initialOrderMap.has(idA) ? initialOrderMap.get(idA)! : 9999;
          const idxB = initialOrderMap.has(idB) ? initialOrderMap.get(idB)! : 9999;
          if (idxA !== idxB) return idxA - idxB;
          return idA.localeCompare(idB);
        });

        setAccommodations(loaded);
      }
      setIsInitializing(false);
    }, (error) => {
      console.warn('Accommodations sync note (using local cache):', error.message);
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Synchronize Applications based on User Role and User ID
  useEffect(() => {
    if (!userId) {
      setApplications(INITIAL_APPLICATIONS);
      return;
    }

    const appCollection = collection(db, 'applications');
    let appQuery = query(appCollection);

    if (userRole === 'student') {
      // Strictly query this student's applications
      appQuery = query(appCollection, where('studentId', '==', userId));
    } else if (userRole === 'landlord') {
      // Strictly query applications for this landlord's residences
      appQuery = query(appCollection, where('landlordId', '==', userId));
    }

    const unsubscribe = onSnapshot(appQuery, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: BookingApplication[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as BookingApplication);
        });
        setApplications(loaded);
      } else {
        // Filter mock data locally for demo user if firestore empty
        if (userRole === 'student') {
          setApplications(INITIAL_APPLICATIONS.filter(a => a.studentId === userId || a.studentId === 'stud-demo'));
        } else if (userRole === 'landlord') {
          setApplications(INITIAL_APPLICATIONS.filter(a => a.landlordId === userId || a.landlordId === 'landlord-1'));
        } else {
          setApplications(INITIAL_APPLICATIONS);
        }
      }
    }, (error) => {
      console.warn('Applications sync note:', error.message);
    });

    return () => unsubscribe();
  }, [userId, userRole]);

  // 3. Synchronize Conversations & Messages strictly for this person
  useEffect(() => {
    if (!userId) {
      setConversations(INITIAL_CONVERSATIONS);
      return;
    }

    const convCollection = collection(db, 'conversations');
    let convQuery = query(convCollection);

    if (userRole === 'student') {
      convQuery = query(convCollection, where('studentId', '==', userId));
    } else if (userRole === 'landlord') {
      convQuery = query(convCollection, where('landlordId', '==', userId));
    }

    const unsubscribe = onSnapshot(convQuery, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as Conversation);
        });
        setConversations(loaded);
      } else {
        if (userRole === 'student') {
          setConversations(INITIAL_CONVERSATIONS.filter(c => c.studentId === userId || c.studentId === 'stud-demo'));
        } else if (userRole === 'landlord') {
          setConversations(INITIAL_CONVERSATIONS.filter(c => c.landlordId === userId || c.landlordId === 'landlord-1'));
        } else {
          setConversations(INITIAL_CONVERSATIONS);
        }
      }
    }, (error) => {
      console.warn('Conversations sync note:', error.message);
    });

    return () => unsubscribe();
  }, [userId, userRole]);

  // 4. Synchronize Student Documents (Per-Profile Isolation)
  useEffect(() => {
    const docCollection = collection(db, 'studentDocuments');
    let docQuery = query(docCollection);

    if (userRole === 'student' && userId) {
      docQuery = query(docCollection, where('studentId', '==', userId));
    }

    const unsubscribe = onSnapshot(docQuery, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: StudentDocumentSubmission[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as StudentDocumentSubmission;
          loaded.push({
            ...data,
            id: data?.id || docSnap.id,
            documentType: data?.documentType || 'OTHER',
            documentName: data?.documentName || 'Document',
            fileSize: data?.fileSize || '1.0 MB',
            uploadedAt: data?.uploadedAt || new Date().toISOString().split('T')[0],
            status: data?.status || 'Pending Verification',
            studentId: data?.studentId || 'unknown-student',
            studentName: data?.studentName || 'Student Resident',
            studentEmail: data?.studentEmail || '',
            studentUniversity: data?.studentUniversity || 'South African University',
            studentNumber: data?.studentNumber || 'STU2026'
          });
        });
        setStudentDocuments(loaded);
      } else {
        if (userRole === 'student' && userId) {
          setStudentDocuments(INITIAL_STUDENT_DOCUMENT_SUBMISSIONS.filter(d => d.studentId === userId || d.studentId === 'stud-1'));
        } else {
          setStudentDocuments(INITIAL_STUDENT_DOCUMENT_SUBMISSIONS);
        }
      }
    }, (error) => {
      console.warn('Student Documents sync note:', error.message);
    });

    return () => unsubscribe();
  }, [userId, userRole]);

  // --- ACTIONS & MUTATIONS ---

  const addAccommodation = async (newAcc: Accommodation) => {
    setAccommodations((prev) => [newAcc, ...prev]);
    try {
      await setDoc(doc(db, 'accommodations', newAcc.id), sanitizeForFirestore(newAcc));
    } catch (e) {
      console.error('Failed to add accommodation to Firestore:', e);
    }
  };

  const updateAccommodation = async (id: string, updates: Partial<Accommodation>) => {
    setAccommodations((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc))
    );
    try {
      await setDoc(doc(db, 'accommodations', id), sanitizeForFirestore(updates), { merge: true });
    } catch (e) {
      console.warn('Failed to update accommodation in Firestore (local state updated):', e);
    }
  };

  const submitApplication = async (newApp: BookingApplication) => {
    setApplications((prev) => [newApp, ...prev]);
    try {
      await setDoc(doc(db, 'applications', newApp.id), sanitizeForFirestore(newApp), { merge: true });
    } catch (e) {
      console.warn('Failed to submit application to Firestore (local state updated):', e);
    }
  };

  const updateApplicationStatus = async (id: string, status: BookingApplication['status'], extra?: Partial<BookingApplication>) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status, ...extra } : app))
    );
    try {
      await setDoc(doc(db, 'applications', id), sanitizeForFirestore({ status, ...extra }), { merge: true });
    } catch (e) {
      console.warn('Failed to update application status in Firestore (local state updated):', e);
    }
  };

  const createConversation = async (conv: Conversation, initialMsg: ChatMessage) => {
    setConversations((prev) => [conv, ...prev.filter(c => c.id !== conv.id)]);
    setMessages((prev) => ({
      ...prev,
      [conv.id]: [initialMsg]
    }));

    try {
      await setDoc(doc(db, 'conversations', conv.id), sanitizeForFirestore(conv), { merge: true });
      await setDoc(doc(db, 'conversations', conv.id, 'messages', initialMsg.id), sanitizeForFirestore(initialMsg), { merge: true });
    } catch (e) {
      console.warn('Failed to save conversation in Firestore (local state updated):', e);
    }
  };

  const sendMessage = async (convId: string, message: ChatMessage) => {
    setMessages((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), message]
    }));
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, lastMessage: message.text, lastMessageTime: message.timestamp } : c))
    );

    try {
      await setDoc(doc(db, 'conversations', convId, 'messages', message.id), sanitizeForFirestore(message), { merge: true });
      await setDoc(doc(db, 'conversations', convId), sanitizeForFirestore({
        lastMessage: message.text,
        lastMessageTime: message.timestamp
      }), { merge: true });
    } catch (e) {
      console.warn('Failed to send message to Firestore (local state updated):', e);
    }
  };

  const updateStudentDocumentStatus = async (
    docId: string, 
    status: StudentDocumentSubmission['status'], 
    adminNotes?: string
  ) => {
    const reviewedAt = new Date().toISOString().split('T')[0];
    setStudentDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status, adminNotes: adminNotes ?? d.adminNotes, reviewedAt } : d))
    );

    try {
      await setDoc(doc(db, 'studentDocuments', docId), sanitizeForFirestore({
        status,
        adminNotes: adminNotes || '',
        reviewedAt
      }), { merge: true });
    } catch (e) {
      console.warn('Failed to update student document in Firestore (local state updated):', e);
    }
  };

  const uploadStudentDocument = async (sub: StudentDocumentSubmission) => {
    setStudentDocuments((prev) => [sub, ...prev]);
    try {
      await setDoc(doc(db, 'studentDocuments', sub.id), sanitizeForFirestore(sub), { merge: true });
    } catch (e) {
      console.error('Failed to upload document submission to Firestore:', e);
    }
  };

  return {
    accommodations,
    applications,
    conversations,
    messages,
    studentDocuments,
    isInitializing,
    addAccommodation,
    updateAccommodation,
    submitApplication,
    updateApplicationStatus,
    createConversation,
    sendMessage,
    updateStudentDocumentStatus,
    uploadStudentDocument
  };
}
