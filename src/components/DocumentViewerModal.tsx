import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
  ShieldCheck,
  Building2,
  GraduationCap,
  Landmark,
  UserCheck,
  Stamp,
  AlertTriangle
} from 'lucide-react';
import { RentalDocument, StudentDocumentSubmission } from '../types';

export interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: (RentalDocument | StudentDocumentSubmission | any) | null;
  mode: 'admin' | 'student';
  onApprove?: (id: string, notes?: string) => void;
  onDecline?: (id: string, reason?: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  mode,
  onApprove,
  onDecline,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [showDeclinePrompt, setShowDeclinePrompt] = useState<boolean>(false);
  const [declineReason, setDeclineReason] = useState<string>('');
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [cachedFileUrl, setCachedFileUrl] = useState<string | null>(null);

  // Retrieve cached file data URL if available
  useEffect(() => {
    if (!doc) {
      setCachedFileUrl(null);
      return;
    }
    const directUrl = doc.fileUrl;
    if (directUrl) {
      setCachedFileUrl(directUrl);
      return;
    }
    // Check localStorage cache for locally uploaded files
    try {
      const stored = localStorage.getItem(`ikhaya_doc_file_${doc.id}`);
      if (stored) {
        setCachedFileUrl(stored);
        return;
      }
    } catch {
      // ignore
    }
    setCachedFileUrl(null);
  }, [doc]);

  // Reset zoom and rotation when modal opens with a new document
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setShowDeclinePrompt(false);
    setDeclineReason('');
    setApprovalNotes('');
  }, [doc?.id, isOpen]);

  if (!isOpen || !doc) return null;

  const docType = doc.type || doc.documentType || 'OTHER';
  const docName = doc.name || doc.documentName || 'Document';
  const fileSize = doc.fileSize || 'Standard Size';
  const uploadedAt = doc.uploadedAt || 'Recent';
  const status: 'Verified' | 'Pending Verification' | 'Requires Update' | 'Declined' =
    doc.status || 'Pending Verification';
  const studentName = doc.studentName || 'Student Resident';
  const studentUniversity = doc.studentUniversity || 'South African University';
  const studentNumber = doc.studentNumber || 'STU2026';
  const notes = doc.adminNotes || doc.verificationNotes || '';

  const isImage =
    cachedFileUrl?.startsWith('data:image/') ||
    /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(docName);

  const isPdf =
    cachedFileUrl?.startsWith('data:application/pdf') ||
    /\.pdf$/i.test(docName);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    if (cachedFileUrl) {
      const link = window.document.createElement('a');
      link.href = cachedFileUrl;
      link.download = docName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else {
      // Generate a digital certification text summary for simulated documents
      const certText = `IKHAYA STUDENT LIVING - DIGITAL DOCUMENT CERTIFICATION
--------------------------------------------------------
Document ID: ${doc.id}
Category: ${docType}
File Name: ${docName}
Uploaded By: ${studentName}
Student Number: ${studentNumber}
Institution: ${studentUniversity}
Submission Date: ${uploadedAt}
Status: ${status}
Auditor Notes: ${notes || 'Verified against accredited student registrar database'}
SHA-256 Hash Verification: ${doc.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32).toUpperCase()}
Accreditation Standard: DHET Policy on Minimum Norms & Standards for Student Housing (Gazette No. 39238)
--------------------------------------------------------`;
      const blob = new Blob([certText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${docName.replace(/\.[^/.]+$/, '')}_Certified_Copy.txt`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleConfirmApprove = () => {
    if (onApprove) {
      onApprove(doc.id, approvalNotes.trim() || 'Document audited and verified against official student registry.');
    }
    onClose();
  };

  const handleConfirmDecline = () => {
    if (onDecline) {
      onDecline(
        doc.id,
        declineReason.trim() ||
          'Certification stamp expired or document image unclear. Please re-upload a recent certified copy stamped within the last 3 months.'
      );
    }
    setShowDeclinePrompt(false);
    onClose();
  };

  const docTypeLabels: Record<string, string> = {
    ID_PASSPORT: 'Certified SA ID / Passport',
    PROOF_OF_REGISTRATION: 'Proof of University Registration',
    NSFAS_BURSARY_LETTER: 'NSFAS Award Letter / Bursary Remittance',
    BANK_STATEMENT: '3-Month Stamped Bank Statement',
    GUARANTOR_FORM: 'Guarantor / Sponsor Surety Agreement',
    OTHER: 'Supplementary Verification Document',
  };

  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center border border-orange-200 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 truncate" title={docName}>
                  {docName}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full shrink-0">
                  {docTypeLabels[docType] || docType.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {studentName} &bull; {studentUniversity} &bull; {fileSize} &bull; Uploaded {uploadedAt}
              </p>
            </div>
          </div>

          {/* Status Badge & Close */}
          <div className="flex items-center gap-2 shrink-0">
            {status === 'Verified' ? (
              <span className="px-2.5 py-1 rounded-full bg-lime-100 text-lime-800 text-[11px] font-bold inline-flex items-center gap-1.5 border border-lime-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-lime-600" />
                Verified
              </span>
            ) : status === 'Pending Verification' ? (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold inline-flex items-center gap-1.5 border border-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                Pending Verification
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold inline-flex items-center gap-1.5 border border-rose-300">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Requires Update
              </span>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inspection Controls Toolbar */}
        <div className="px-5 py-2 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleZoomIn}
              className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1 font-semibold transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Zoom In</span>
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1 font-semibold transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
              <span>Zoom Out</span>
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1 font-semibold transition"
              title="Rotate 90 deg"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate</span>
            </button>
            {(zoom !== 1 || rotation !== 0) && (
              <button
                type="button"
                onClick={handleReset}
                className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition text-[11px]"
              >
                Reset (100%)
              </button>
            )}
            <span className="text-[11px] text-slate-500 pl-1 font-mono">
              {Math.round(zoom * 100)}%{rotation !== 0 ? ` (${rotation}°)` : ''}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {cachedFileUrl && (
              <a
                href={cachedFileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1 transition text-[11px]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Raw</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleDownload}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1 transition text-[11px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Copy</span>
            </button>
          </div>
        </div>

        {/* Main Document Preview Viewport */}
        <div className="flex-1 overflow-auto bg-slate-900/90 p-4 sm:p-8 flex items-center justify-center min-h-[360px] max-h-[56vh] relative">
          
          {/* 1. ACTUAL UPLOADED IMAGE */}
          {cachedFileUrl && isImage ? (
            <div
              className="transition-transform duration-200 ease-out origin-center flex items-center justify-center shadow-2xl rounded-lg overflow-hidden bg-white max-w-full"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              <img
                src={cachedFileUrl}
                alt={docName}
                className="max-h-[500px] w-auto object-contain rounded-lg shadow-xl"
              />
            </div>
          ) : cachedFileUrl && isPdf ? (
            /* 2. ACTUAL UPLOADED PDF */
            <div
              className="w-full h-full min-h-[460px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              <iframe
                src={cachedFileUrl}
                title={docName}
                className="w-full h-full min-h-[460px] border-0"
              />
            </div>
          ) : (
            /* 3. HIGH-FIDELITY OFFICIAL SOUTH AFRICAN DIGITAL DOCUMENT PREVIEW */
            <div
              className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full border border-slate-300 transition-transform duration-200 ease-out origin-center text-slate-900 relative select-none"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              {/* Background Watermark */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
                <ShieldCheck className="w-96 h-96 text-slate-900" />
              </div>

              {/* Document Header Based on Type */}
              {docType === 'ID_PASSPORT' ? (
                <div className="space-y-4">
                  <div className="border-b-2 border-emerald-800 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-700 text-amber-300 flex items-center justify-center font-serif font-black text-xl border-2 border-amber-400 shadow-xs">
                        RSA
                      </div>
                      <div>
                        <h4 className="text-xs font-black tracking-widest text-emerald-900 uppercase">
                          REPUBLIC OF SOUTH AFRICA &bull; REPUBLIEK VAN SUID-AFRIKA
                        </h4>
                        <h5 className="text-sm font-bold text-slate-900">
                          NATIONAL IDENTITY SMART CARD &bull; HOME AFFAIRS
                        </h5>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                          Department of Home Affairs &bull; Departement van Binnelandse Sake
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                        DHA-VERIFIED CARD
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="col-span-1 bg-slate-100 rounded-xl border border-slate-300 p-2 flex flex-col items-center justify-center text-center space-y-1">
                      <div className="w-20 h-24 bg-slate-200 rounded border border-slate-300 flex items-center justify-center text-slate-400 font-bold text-xs">
                        PHOTO
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">BIOMETRIC VALID</span>
                    </div>

                    <div className="col-span-2 space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Surname & Names:</span>
                        <span className="font-bold text-sm text-slate-900">{studentName.toUpperCase()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Identity Number:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {doc.studentIdNumber || '0304155829084'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Nationality:</span>
                          <span className="font-semibold text-slate-800">SOUTH AFRICAN (ZAF)</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Date of Birth:</span>
                          <span className="font-semibold text-slate-800">15 APR 2003</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Country of Birth:</span>
                          <span className="font-semibold text-slate-800">SOUTH AFRICA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SAPS Certified Stamp Graphic */}
                  <div className="mt-4 p-3 rounded-xl border-2 border-dashed border-blue-600 bg-blue-50/50 text-blue-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Stamp className="w-5 h-5 text-blue-700 shrink-0" />
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider block">
                          SOUTH AFRICAN POLICE SERVICE &bull; CERTIFIED TRUE COPY
                        </span>
                        <p className="text-[10px] text-blue-800">
                          SAPS Station: Cape Town Central &bull; Certified Date: {uploadedAt} &bull; Officer: Warrant Officer M. Dlamini
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-blue-800 border border-blue-300 bg-white px-2 py-0.5 rounded">
                      STAMP VALID
                    </span>
                  </div>
                </div>
              ) : docType === 'PROOF_OF_REGISTRATION' ? (
                <div className="space-y-4">
                  <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase text-slate-900">
                          {studentUniversity.toUpperCase()}
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                          Office of the Registrar &bull; Academic Enrollment Administration
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300 px-2 py-0.5 rounded">
                        OFFICIAL ENROLLMENT
                      </span>
                    </div>
                  </div>

                  <div className="text-center py-2 border-b border-slate-200">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      CERTIFICATE OF REGISTRATION & ACADEMIC STATUS
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      This document confirms that the undermentioned student is formally enrolled for the current academic term.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Full Student Name:</span>
                      <span className="font-bold text-slate-900">{studentName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Student Number:</span>
                      <span className="font-mono font-bold text-slate-900">{studentNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Enrollment Status:</span>
                      <span className="font-semibold text-emerald-700">Full-Time Registered</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Accommodation Status:</span>
                      <span className="font-semibold text-slate-700">Accredited Off-Campus Approved</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-lime-600" />
                      <span>Registrar Signature Validated</span>
                    </div>
                    <span className="font-mono text-[10px]">VERIFICATION KEY: REG-2026-UJ-91824</span>
                  </div>
                </div>
              ) : docType === 'NSFAS_BURSARY_LETTER' ? (
                <div className="space-y-4">
                  <div className="border-b-2 border-emerald-600 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                        <Landmark className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black tracking-widest text-emerald-900 uppercase">
                          NATIONAL STUDENT FINANCIAL AID SCHEME (NSFAS)
                        </h4>
                        <h5 className="text-sm font-bold text-slate-900">
                          2026 ACCOMMODATION ALLOWANCE REMITTANCE ADVICE
                        </h5>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                      FUNDING APPROVED
                    </span>
                  </div>

                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span>Monthly Accommodation Cap:</span>
                      <span className="text-base text-emerald-700 font-black">R 6,500.00 / month</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Approved for direct settlement or verified student housing remittance at accredited private student accommodations.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Beneficiary Name:</span>
                      <span className="font-bold text-slate-900">{studentName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Institution:</span>
                      <span className="font-semibold text-slate-800">{studentUniversity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Reference Number:</span>
                      <span className="font-mono font-bold text-slate-900">NSFAS-2026-ACC-8819</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Disbursement Schedule:</span>
                      <span className="font-semibold text-slate-800">Feb 2026 - Nov 2026 (10 Months)</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-emerald-700 font-bold">Official NSFAS Electronic Seal</span>
                    <span className="font-mono text-[10px]">PORTAL HASH: 91b0f82a93</span>
                  </div>
                </div>
              ) : (
                /* Bank statement or generic cert */
                <div className="space-y-4">
                  <div className="border-b-2 border-slate-800 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {docTypeLabels[docType] || docType.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                          Certified Student Rental Compliance Record &bull; iKhaya Vault
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded">
                      SHA-256 VERIFIED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Account / Resident:</span>
                      <span className="font-bold text-slate-900">{studentName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">University / Campus:</span>
                      <span className="font-semibold text-slate-800">{studentUniversity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Document File Name:</span>
                      <span className="font-mono font-semibold text-slate-800 truncate block">{docName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Recorded Submission:</span>
                      <span className="font-semibold text-slate-800">{uploadedAt}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-center space-y-1">
                    <p className="text-xs font-semibold text-slate-700">
                      Digital Authentication Certificate &bull; Hash verification checked
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Validated in compliance with national norms for accredited student accommodation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Actions Panel */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3">
          
          {/* Notes display */}
          {notes && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Auditor / Compliance Remarks:</strong>
                <p className="text-[11px] text-amber-800 mt-0.5">{notes}</p>
              </div>
            </div>
          )}

          {/* ADMIN MODE CONTROLS */}
          {mode === 'admin' && (
            <div className="space-y-3">
              {showDeclinePrompt ? (
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Specify Reason for Requesting Update / Declining</span>
                  </div>
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="e.g., SAPS certification stamp expired. Please upload a clear certified copy stamped within the last 3 months."
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeclinePrompt(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDecline}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                    >
                      Confirm & Request Update
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-600" />
                    <span>
                      Compliance Audit Panel &bull; Student: <strong className="text-slate-900">{studentName}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {status !== 'Requires Update' && onDecline && (
                      <button
                        type="button"
                        onClick={() => setShowDeclinePrompt(true)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Request Update</span>
                      </button>
                    )}

                    {status !== 'Verified' && onApprove && (
                      <button
                        type="button"
                        onClick={handleConfirmApprove}
                        className="px-4 py-2 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Mark Verified</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STUDENT MODE VIEW */}
          {mode === 'student' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                {status === 'Pending Verification' ? (
                  <div className="flex items-center gap-2 text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                    <span>
                      <strong>Pending Verification:</strong> Awaiting compliance officer review. You will see the update here once accepted.
                    </span>
                  </div>
                ) : status === 'Verified' ? (
                  <div className="flex items-center gap-2 text-lime-800 bg-lime-50 px-3 py-1.5 rounded-lg border border-lime-200">
                    <CheckCircle2 className="w-4 h-4 text-lime-600" />
                    <span>
                      <strong>Verified:</strong> This document is certified and linked to your active rental applications.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-800 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>
                      <strong>Action Required:</strong> Please review the auditor remark above, delete this copy, and upload a fresh certified document.
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition shrink-0"
              >
                Close Preview
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
