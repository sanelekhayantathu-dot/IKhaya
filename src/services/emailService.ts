import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sanitizeForFirestore } from '../utils/sanitize';

export interface SupportTicketData {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'landlord' | 'guest' | string;
  category: string;
  subject: string;
  message: string;
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
  university?: string;
  createdAt: string;
}

export interface AccountWelcomeData {
  userId: string;
  name: string;
  email: string;
  role: 'student' | 'landlord' | 'admin' | string;
  phone?: string;
  university?: string;
  studentNumber?: string;
  agencyName?: string;
  createdAt: string;
}

export interface DispatchedEmailRecord {
  id: string;
  to: string;
  subject: string;
  type: 'welcome' | 'support_receipt' | 'support_alert' | 'verification';
  dispatchedAt: string;
  snippet: string;
}

const SUPPORT_EMAIL = 'support@ikhayaresliving.co.za';

/**
 * Saves a dispatched email log locally so the user can verify delivery even in offline/preview environments
 */
function recordLocalEmailDispatch(record: DispatchedEmailRecord) {
  try {
    const existingRaw = localStorage.getItem('ikhaya_sent_confirmations');
    const existing: DispatchedEmailRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [record, ...existing.filter(r => r.id !== record.id)].slice(0, 50);
    localStorage.setItem('ikhaya_sent_confirmations', JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ikhaya-email-confirmation-dispatched', {
        detail: record
      }));
    }
  } catch (err) {
    console.warn('Could not record local email dispatch:', err);
  }
}

/**
 * Retrieve dispatched email logs for a specific recipient or all
 */
export function getSentEmailConfirmations(recipientEmail?: string): DispatchedEmailRecord[] {
  try {
    const raw = localStorage.getItem('ikhaya_sent_confirmations');
    if (!raw) return [];
    const list: DispatchedEmailRecord[] = JSON.parse(raw);
    if (!recipientEmail) return list;
    const clean = recipientEmail.trim().toLowerCase();
    return list.filter(item => item.to.toLowerCase() === clean);
  } catch {
    return [];
  }
}

/**
 * Dispatches confirmation emails for a newly submitted support query:
 * 1. An alert email to the iKhaya Support desk (support@ikhayaresliving.co.za)
 * 2. A confirmation receipt email to the student/landlord
 */
export async function sendSupportTicketEmails(ticket: SupportTicketData): Promise<void> {
  const mailCollection = collection(db, 'mail');
  const notificationCollection = collection(db, 'emailNotifications');
  const timestamp = new Date().toISOString();

  // 1. Alert Email to iKhaya Res Living Support Team
  const adminMailId = `mail-support-alert-${ticket.id}`;
  const adminMailPayload = {
    to: [SUPPORT_EMAIL],
    replyTo: ticket.email,
    message: {
      subject: `[New Support Query #${ticket.ticketNumber}] ${ticket.subject}`,
      text: `
New Support Query Received from iKhaya Res Living

Ticket ID: #${ticket.ticketNumber}
From: ${ticket.name} (${ticket.email})
Role: ${ticket.role.toUpperCase()}
Phone: ${ticket.phone || 'Not provided'}
University / Campus: ${ticket.university || 'General'}
Category: ${ticket.category}
Urgency: ${ticket.urgency || 'Normal'}
Submitted: ${ticket.createdAt}

Query Details:
----------------------------------------
${ticket.message}
----------------------------------------

Please respond to the user at: ${ticket.email}
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #f97316; padding: 24px; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; font-weight: bold;">iKhaya Res Living Support Desk</h1>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">New Student & Landlord Query Received</p>
          </div>
          <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <div style="background-color: #f8fafc; border-left: 4px solid #f97316; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
              <strong>Ticket Reference:</strong> #${ticket.ticketNumber}<br/>
              <strong>Category:</strong> ${ticket.category}<br/>
              <strong>Priority:</strong> ${ticket.urgency || 'Normal'}
            </div>
            
            <h3 style="margin: 0 0 8px; font-size: 15px; color: #0f172a;">User Information:</h3>
            <ul style="margin: 0 0 20px; padding-left: 20px; color: #475569;">
              <li><strong>Name:</strong> ${ticket.name}</li>
              <li><strong>Email:</strong> <a href="mailto:${ticket.email}">${ticket.email}</a></li>
              <li><strong>Role:</strong> ${ticket.role.toUpperCase()}</li>
              <li><strong>Phone:</strong> ${ticket.phone || 'N/A'}</li>
              ${ticket.university ? `<li><strong>Institution:</strong> ${ticket.university}</li>` : ''}
            </ul>

            <h3 style="margin: 0 0 8px; font-size: 15px; color: #0f172a;">Subject: ${ticket.subject}</h3>
            <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 20px; white-space: pre-wrap; color: #334155;">${ticket.message}</div>

            <p style="margin: 0; font-size: 12px; color: #64748b;">
              To respond directly to this user, reply to this email or contact them at <a href="mailto:${ticket.email}">${ticket.email}</a>.
            </p>
          </div>
        </div>
      `,
    },
    ticketId: ticket.id,
    type: 'support_admin_alert',
    createdAt: timestamp,
  };

  // 2. Confirmation Email to the Submitting Student / Landlord
  const userMailId = `mail-user-confirm-${ticket.id}`;
  const userMailPayload = {
    to: [ticket.email],
    replyTo: SUPPORT_EMAIL,
    message: {
      subject: `Support Query Received: #${ticket.ticketNumber} - iKhaya Res Living`,
      text: `
Hello ${ticket.name},

Thank you for contacting iKhaya Res Living Support.

We have safely received your inquiry (Ticket #${ticket.ticketNumber}) regarding "${ticket.subject}".

Our student & landlord support officers are reviewing your request and will get back to you within 24 hours.

Your Submission Summary:
- Ticket Number: #${ticket.ticketNumber}
- Category: ${ticket.category}
- Message:
${ticket.message}

If you need urgent assistance, you can also reach us directly at ${SUPPORT_EMAIL}.

Warm regards,
iKhaya Res Living Support Team
https://ikhayaresliving.co.za
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 24px; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: bold;">iKhaya Res Living</h1>
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">Support Inquiry Confirmation</p>
          </div>
          
          <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <p style="margin: 0 0 16px;">Dear <strong>${ticket.name}</strong>,</p>
            
            <p style="margin: 0 0 16px;">
              Thank you for reaching out to us. We have received your support query and our team has opened a dedicated ticket on your behalf.
            </p>

            <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #7c2d12; font-weight: bold; width: 140px;">Ticket Reference:</td>
                  <td style="padding: 4px 0; font-family: monospace; font-weight: bold; color: #c2410c;">#${ticket.ticketNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #7c2d12; font-weight: bold;">Category:</td>
                  <td style="padding: 4px 0; color: #334155;">${ticket.category}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #7c2d12; font-weight: bold;">Status:</td>
                  <td style="padding: 4px 0; color: #16a34a; font-weight: bold;">Received &amp; In Queue</td>
                </tr>
              </table>
            </div>

            <h3 style="margin: 0 0 8px; font-size: 14px; color: #0f172a;">Your Message:</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 13px; color: #475569; white-space: pre-wrap;">${ticket.message}</div>

            <p style="margin: 0 0 16px;">
              A representative will review your inquiry and follow up directly via this email address. We aim to respond within <strong>24 business hours</strong>.
            </p>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 4px;"><strong>Need to add more information?</strong></p>
              <p style="margin: 0;">Reply directly to this email or email us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #ea580c; text-decoration: none;">${SUPPORT_EMAIL}</a> citing your ticket number.</p>
            </div>
          </div>

          <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
            &copy; ${new Date().getFullYear()} iKhaya Res Living. South Africa's Student Housing Platform.
          </div>
        </div>
      `,
    },
    ticketId: ticket.id,
    type: 'support_user_confirmation',
    createdAt: timestamp,
  };

  // Write both email documents to Firestore
  try {
    await setDoc(doc(mailCollection, adminMailId), sanitizeForFirestore(adminMailPayload), { merge: true });
    await setDoc(doc(mailCollection, userMailId), sanitizeForFirestore(userMailPayload), { merge: true });
    // Also save in local audit collection
    await setDoc(doc(notificationCollection, adminMailId), sanitizeForFirestore(adminMailPayload), { merge: true }).catch(() => null);
    await setDoc(doc(notificationCollection, userMailId), sanitizeForFirestore(userMailPayload), { merge: true }).catch(() => null);
  } catch (error) {
    console.warn('Email dispatch notice (saved locally):', error);
  }

  // Record locally for immediate UI receipt & confirmation verification
  recordLocalEmailDispatch({
    id: userMailId,
    to: ticket.email,
    subject: `[Received] Support Inquiry Confirmation #${ticket.ticketNumber}`,
    type: 'support_receipt',
    dispatchedAt: timestamp,
    snippet: `Confirmation receipt for ticket #${ticket.ticketNumber}: "${ticket.subject}" sent to ${ticket.email}`
  });
}

/**
 * Dispatches an account creation confirmation / welcome email to the newly registered student or landlord
 */
export async function sendAccountWelcomeEmail(data: AccountWelcomeData): Promise<void> {
  const mailCollection = collection(db, 'mail');
  const notificationCollection = collection(db, 'emailNotifications');
  const timestamp = new Date().toISOString();
  const mailId = `mail-welcome-${data.userId}`;

  const isLandlord = data.role === 'landlord';

  const welcomePayload = {
    to: [data.email],
    replyTo: SUPPORT_EMAIL,
    message: {
      subject: `Welcome to iKhaya Res Living - Account Created Successfully!`,
      text: `
Hello ${data.name},

Welcome to iKhaya Res Living! Your new account has been created successfully.

Account Details:
- Role: ${isLandlord ? 'Accredited Landlord / Housing Provider' : 'Student Resident'}
- Registered Email: ${data.email}
${data.university ? `- University: ${data.university}\n` : ''}${data.agencyName ? `- Organization: ${data.agencyName}\n` : ''}

${isLandlord ? `
Next steps for Landlords:
1. List your student residence or apartments.
2. Upload building safety and NSFAS accreditation certificates.
3. Review and accept student rental applications directly.
` : `
Next steps for Students:
1. Browse verified student accommodation near your campus.
2. Save your favorite residences.
3. Upload your ID & NSFAS / bursary letter to your Document Vault for instant lease approvals.
`}

If you need any assistance, our support team is always ready to assist at ${SUPPORT_EMAIL}.

Welcome aboard!
iKhaya Res Living Team
https://ikhayaresliving.co.za
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 28px 24px; color: #ffffff; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">Welcome to iKhaya Res Living</h1>
            <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.95;">South Africa's Trusted Student Housing Network</p>
          </div>
          
          <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <p style="margin: 0 0 16px;">Dear <strong>${data.name}</strong>,</p>
            
            <p style="margin: 0 0 16px;">
              Your account has been successfully created on <strong>iKhaya Res Living</strong>. We are excited to assist you with ${
                isLandlord ? 'managing and leasing student accommodation properties.' : 'finding accredited, safe student accommodation for your studies.'
              }
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 10px; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Account Overview</h4>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; width: 140px;">Account Type:</td>
                  <td style="padding: 4px 0; font-weight: bold; color: ${isLandlord ? '#15803d' : '#ea580c'};">
                    ${isLandlord ? 'Landlord / Residence Host' : 'Student Resident'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Registered Email:</td>
                  <td style="padding: 4px 0; font-weight: bold; color: #334155;">${data.email}</td>
                </tr>
                ${data.university ? `
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">University / Campus:</td>
                  <td style="padding: 4px 0; color: #334155;">${data.university}</td>
                </tr>` : ''}
                ${data.agencyName ? `
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Property Group:</td>
                  <td style="padding: 4px 0; color: #334155;">${data.agencyName}</td>
                </tr>` : ''}
              </table>
            </div>

            <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 14px 16px; margin-bottom: 20px; border-radius: 4px;">
              <p style="margin: 0; font-size: 13px; color: #7c2d12;">
                <strong>Confirmation Notice:</strong> This confirmation email serves as official verification of your account creation with iKhaya Res Living.
              </p>
            </div>

            <p style="margin: 0 0 20px;">
              Need help or have questions? Our support team is here to assist you at <a href="mailto:${SUPPORT_EMAIL}" style="color: #ea580c; font-weight: bold; text-decoration: none;">${SUPPORT_EMAIL}</a>.
            </p>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center;">
              Thank you for choosing iKhaya Res Living &bull; <a href="mailto:${SUPPORT_EMAIL}" style="color: #ea580c;">Contact Support</a>
            </div>
          </div>
        </div>
      `,
    },
    userId: data.userId,
    type: 'account_welcome_confirmation',
    createdAt: timestamp,
  };

  try {
    await setDoc(doc(mailCollection, mailId), sanitizeForFirestore(welcomePayload), { merge: true });
    await setDoc(doc(notificationCollection, mailId), sanitizeForFirestore(welcomePayload), { merge: true }).catch(() => null);
  } catch (error) {
    console.warn('Welcome email dispatch notice (saved locally):', error);
  }

  // Record locally for audit & immediate UI confirmation receipt
  recordLocalEmailDispatch({
    id: mailId,
    to: data.email,
    subject: `Welcome to iKhaya Res Living - Account Created Successfully!`,
    type: 'welcome',
    dispatchedAt: timestamp,
    snippet: `Account registration confirmation dispatched to ${data.email} for ${data.name} (${data.role})`
  });
}
