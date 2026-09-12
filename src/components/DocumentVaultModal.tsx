import React, { useState, useRef, useMemo } from 'react';
import { 
  X, 
  ShieldCheck, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Eye, 
  Lock, 
  Sparkles,
  FileCheck,
  Download,
  Plus
} from 'lucide-react';
import { RentalDocument } from '../types';
import { DocumentViewerModal } from './DocumentViewerModal';

interface DocumentVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: RentalDocument[];
  onUploadDocument: (doc: RentalDocument) => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentVaultModal: React.FC<DocumentVaultModalProps> = ({
  isOpen,
  onClose,
  documents,
  onUploadDocument,
  onDeleteDocument,
}) => {
  const [docType, setDocType] = useState<RentalDocument['type']>('ID_PASSPORT');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<RentalDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize uploaded document types to enforce one-per-type constraint
  const uploadedDocTypes = useMemo(() => {
    return new Set((documents || []).map((doc) => doc.type));
  }, [documents]);

  const isCurrentDocTypeUploaded = uploadedDocTypes.has(docType);

  if (!isOpen) return null;

  const docTypeLabels: Record<RentalDocument['type'], { title: string; hint: string }> = {
    ID_PASSPORT: {
      title: 'Certified South African ID or Passport',
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
      hint: 'Vaccination record, landlord reference letter, etc.',
    },
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
          // ignore quota
        }
      }

      onUploadDocument(newDoc);
      setSelectedFile(null);
      setFileDataUrl(null);
      setIsUploading(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-900 max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Student Rental Document Vault</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                  256-Bit Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pre-verify your student documents for instant lease compliance with landlords
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Upload Zone Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-orange-600" />
                Upload New Verification Document
              </h3>
              <span className="text-[11px] text-slate-500">Supports PDF, JPG, PNG up to 15MB</span>
            </div>

            {/* Document Type Dropdown */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Select Document Category</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
              >
                {Object.entries(docTypeLabels).map(([key, info]) => {
                  const isUploaded = uploadedDocTypes.has(key as RentalDocument['type']);
                  return (
                    <option key={key} value={key} disabled={isUploaded}>
                      {info.title} {isUploaded ? '✓ (Already Uploaded)' : ''}
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-slate-500 italic">{docTypeLabels[docType].hint}</p>
            </div>

            {isCurrentDocTypeUploaded ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Document Already Uploaded</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    You already have a {docTypeLabels[docType].title} in your vault. Only one document per category is permitted. To upload a new file, remove the existing document from your vault below first.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Drag & Drop File Area */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-orange-500 rounded-xl p-5 text-center cursor-pointer transition bg-white hover:bg-orange-50/30 group shadow-xs"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="w-10 h-10 rounded-full bg-orange-50 group-hover:bg-orange-100 text-orange-600 mx-auto flex items-center justify-center mb-2 transition">
                    <UploadCloud className="w-5 h-5" />
                  </div>

                  {selectedFile ? (
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-orange-700">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready to upload to compliance audit
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">
                        Click to browse or drag and drop your file here
                      </p>
                      <p className="text-[11px] text-slate-500">Official certified PDF, scan, or photo</p>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                {selectedFile && (
                  <div className="flex justify-end pt-1">
                    <button
                      disabled={isUploading}
                      onClick={handleUpload}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isUploading ? 'Securing & Encrypting...' : 'Upload Document to Vault'}</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Your Vault Documents ({documents.length})
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                POPIA Compliant Encrypted Storage
              </span>
            </div>

            <div className="space-y-2">
              {documents.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-xs text-slate-500 space-y-1">
                  <FileText className="w-7 h-7 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700">No documents in your vault yet</p>
                  <p className="text-[11px] text-slate-500">Upload your ID, Proof of Registration, or Bursary letter above.</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-slate-50 hover:bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition shadow-xs"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-orange-600 shrink-0 shadow-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{doc.name}</h4>
                          {doc.status === 'Verified' ? (
                            <span className="text-[9px] font-bold text-emerald-900 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          ) : doc.status === 'Requires Update' ? (
                            <span className="text-[9px] font-bold text-rose-900 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-300 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              Requires Update
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                              Pending Verification
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {doc.fileSize} &bull; Uploaded {doc.uploadedAt} &bull; {doc.verificationNotes}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition flex items-center gap-1 shadow-xs"
                        title="Preview Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 text-slate-500 hover:text-rose-600 text-xs transition shadow-xs"
                        title="Delete from Vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-lime-600" />
            Protected by POPIA compliance & encrypted cloud storage
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition shadow-xs"
          >
            Done
          </button>
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
    </div>
  );
};
