import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sanitizeForFirestore } from '../utils/sanitize';
import { sendSupportTicketEmails, SupportTicketData } from './emailService';

export interface NewSupportQueryInput {
  name: string;
  email: string;
  phone?: string;
  role?: 'student' | 'landlord' | 'guest' | string;
  category: string;
  subject: string;
  message: string;
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
  university?: string;
  propertyReference?: string;
}

export function generateTicketNumber(): string {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `IKH-2026-${randomSuffix}`;
}

export async function submitSupportTicket(input: NewSupportQueryInput): Promise<SupportTicketData> {
  const cleanEmail = (input.email || '').trim().toLowerCase();
  const ticketNumber = generateTicketNumber();
  const ticketId = `ticket-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const createdAt = new Date().toISOString();

  const ticketData: SupportTicketData = {
    id: ticketId,
    ticketNumber,
    name: (input.name || 'Resident / User').trim(),
    email: cleanEmail,
    phone: input.phone?.trim() || '',
    role: input.role || 'student',
    category: input.category || 'General Support',
    subject: input.subject.trim() || 'Support Query regarding iKhaya Accommodation',
    message: input.message.trim(),
    urgency: input.urgency || 'normal',
    university: input.university || '',
    createdAt,
  };

  // 1. Save ticket to Firestore
  try {
    const ticketDocRef = doc(db, 'supportTickets', ticketId);
    await setDoc(ticketDocRef, sanitizeForFirestore({
      ...ticketData,
      status: 'open',
      assignedTo: 'support@ikhayaresliving.co.za',
      updatedAt: createdAt,
    }), { merge: true });
  } catch (error) {
    console.warn('Could not write ticket directly to Firestore (saving locally):', error);
  }

  // Also save to local storage for offline continuity
  try {
    const existingRaw = localStorage.getItem('ikhaya_submitted_tickets') || '[]';
    const existing = JSON.parse(existingRaw);
    existing.unshift(ticketData);
    localStorage.setItem('ikhaya_submitted_tickets', JSON.stringify(existing.slice(0, 20)));
  } catch (e) {
    // Ignore storage quota
  }

  // 2. Dispatch email notifications (Support desk + Confirmation to student/landlord)
  try {
    await sendSupportTicketEmails(ticketData);
  } catch (emailErr) {
    console.warn('Email dispatch warning:', emailErr);
  }

  return ticketData;
}
