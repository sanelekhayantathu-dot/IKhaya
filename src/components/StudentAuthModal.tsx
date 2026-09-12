import React, { useState, useRef } from 'react';
import { 
  X, 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Building2, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Building,
  Headphones,
  Shield,
  Eye,
  EyeOff,
  IdCard,
  AlertCircle
} from 'lucide-react';
import { StudentProfile, UserProfile, UserRole } from '../types';
import { UNIVERSITIES_LIST, TOWNS_LIST } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { 
  validateEmail, 
  validateFullName, 
  validatePhoneNumber, 
  validateIdentityDocument, 
  validateStudentNumber, 
  validatePassword 
} from '../utils/validators';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'register';
  onAuthenticate?: (profile: StudentProfile) => void;
  onLoginSuccess?: (profile: StudentProfile) => void;
  onLandlordRegistered?: () => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onLandlordRegistered,
}) => {
  const { signInWithGoogle, signInWithEmail, registerWithEmail } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [accountType, setAccountType] = useState<UserRole>('student');
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  
  // Student Register state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [idType, setIdType] = useState<'sa_id' | 'passport'>('sa_id');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState(UNIVERSITIES_LIST[0]);
  const [studentNumber, setStudentNumber] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('2nd Year Undergrad');
  const [fundingType, setFundingType] = useState<StudentProfile['fundingType']>('NSFAS');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Landlord Register state
  const [landlordName, setLandlordName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [landlordEmail, setLandlordEmail] = useState('');
  const [landlordIdType, setLandlordIdType] = useState<'sa_id' | 'passport'>('sa_id');
  const [landlordIdNumber, setLandlordIdNumber] = useState('');
  const [landlordPhone, setLandlordPhone] = useState('');
  const [landlordTown, setLandlordTown] = useState(TOWNS_LIST[0]);
  const [propertyCount, setPropertyCount] = useState('1 - 5 Properties (10-50 Beds)');
  const [landlordPassword, setLandlordPassword] = useState('');
  const [landlordConfirmPassword, setLandlordConfirmPassword] = useState('');
  const [showLandlordPassword, setShowLandlordPassword] = useState(false);
  const [landlordSubmitted, setLandlordSubmitted] = useState(false);

  // Validation feedback
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminPromptNotice, setAdminPromptNotice] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectAdminPrompt = () => {
    setSignInEmail('sanelekhayantathu@gmail.com');
    setSignInPassword('');
    setAdminPromptNotice(true);
    setErrorMessage('');
    setFieldErrors({});
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 80);
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await signInWithGoogle(accountType);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setErrorMessage(err.message || 'Failed to sign in with Google. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const newFieldErrors: Record<string, string> = {};

    const cleanEmail = signInEmail.trim().toLowerCase();
    const cleanPassword = signInPassword.trim();

    // 1. Strict Email validation
    const emailRes = validateEmail(cleanEmail);
    if (!emailRes.isValid) {
      newFieldErrors.signInEmail = emailRes.error || 'Please enter a valid email address.';
    }

    // 2. Strict Password validation
    if (!cleanPassword) {
      newFieldErrors.signInPassword = 'Password is required to sign in.';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setErrorMessage('Please provide both a valid email and your account password.');
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      // Authenticates strictly against real accounts in Firebase Auth or Firestore
      await signInWithEmail(cleanEmail, cleanPassword);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      console.warn('Sign-in notice:', err);
      let message = 'Unable to sign in. Please check your credentials.';
      if (typeof err?.message === 'string') {
        message = err.message.replace(/^Firebase:\s*/, '');
      }
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const newFieldErrors: Record<string, string> = {};

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanId = idNumber.trim();
    const cleanPhone = phone.trim();
    const cleanStudentNum = studentNumber.trim();

    // 1. Full legal name validation (at least 2 words)
    const nameRes = validateFullName(cleanName);
    if (!nameRes.isValid) {
      newFieldErrors.fullName = nameRes.error || 'Full legal name (first and last name) is required.';
    }

    // 2. Email validation
    const emailRes = validateEmail(cleanEmail);
    if (!emailRes.isValid) {
      newFieldErrors.email = emailRes.error || 'Valid student or personal email address is required.';
    }

    // 3. ID / Passport Number validation (CRITICAL)
    const idRes = validateIdentityDocument(idType, cleanId);
    if (!idRes.isValid) {
      newFieldErrors.idNumber = idRes.error || (idType === 'sa_id' ? 'Valid 13-digit South African ID is required.' : 'Valid Passport number is required.');
    }

    // 4. Phone number validation
    const phoneRes = validatePhoneNumber(cleanPhone);
    if (!phoneRes.isValid) {
      newFieldErrors.phone = phoneRes.error || 'Valid phone number is required.';
    }

    // 5. Student Number validation
    const stuRes = validateStudentNumber(cleanStudentNum);
    if (!stuRes.isValid) {
      newFieldErrors.studentNumber = stuRes.error || 'Valid student number from your tertiary institution is required.';
    }

    // 6. Password & Confirmation validation
    const passRes = validatePassword(password);
    if (!passRes.isValid) {
      newFieldErrors.password = passRes.error || 'Password must be at least 6 characters long.';
    } else if (password !== confirmPassword) {
      newFieldErrors.confirmPassword = 'Passwords do not match. Please verify both passwords match.';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setErrorMessage('Please fill in all required fields with valid details before continuing.');
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const studentData: Partial<UserProfile> = {
        fullName: cleanName,
        email: cleanEmail,
        idType,
        idNumber: cleanId.toUpperCase(),
        phone: cleanPhone,
        university,
        studentNumber: cleanStudentNum.toUpperCase(),
        yearOfStudy: yearOfStudy || '1st Year Student',
        fundingType,
        role: 'student'
      };

      await registerWithEmail(cleanEmail, password, studentData);

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      console.warn('Registration error:', err);
      let message = 'Registration failed. Please verify your details.';
      if (err?.code === 'auth/email-already-in-use' || err?.message?.includes('already exists') || err?.message?.includes('email-already-in-use')) {
        message = 'An account with this email already exists. Please switch to Sign In.';
      } else if (typeof err?.message === 'string') {
        message = err.message.replace(/^Firebase:\s*/, '');
      }
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  const handleRegisterLandlord = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const newFieldErrors: Record<string, string> = {};

    const cleanName = landlordName.trim();
    const cleanCompany = companyName.trim();
    const cleanEmail = landlordEmail.trim().toLowerCase();
    const cleanId = landlordIdNumber.trim();
    const cleanPhone = landlordPhone.trim();

    // 1. Representative Name
    const nameRes = validateFullName(cleanName);
    if (!nameRes.isValid) {
      newFieldErrors.landlordName = nameRes.error || 'Representative first and last name is required.';
    }

    // 2. Company / Residence Name
    if (!cleanCompany || cleanCompany.length < 2) {
      newFieldErrors.companyName = 'Residence or company name is required (minimum 2 characters).';
    }

    // 3. Email
    const emailRes = validateEmail(cleanEmail);
    if (!emailRes.isValid) {
      newFieldErrors.landlordEmail = emailRes.error || 'Valid business email address is required.';
    }

    // 4. Representative ID / Passport
    const idRes = validateIdentityDocument(landlordIdType, cleanId);
    if (!idRes.isValid) {
      newFieldErrors.landlordIdNumber = idRes.error || (landlordIdType === 'sa_id' ? 'Valid 13-digit South African ID is required.' : 'Valid Passport number is required.');
    }

    // 5. Phone
    const phoneRes = validatePhoneNumber(cleanPhone);
    if (!phoneRes.isValid) {
      newFieldErrors.landlordPhone = phoneRes.error || 'Valid contact phone number is required.';
    }

    // 6. Password & Confirmation
    const passRes = validatePassword(landlordPassword);
    if (!passRes.isValid) {
      newFieldErrors.landlordPassword = passRes.error || 'Password must be at least 6 characters long.';
    } else if (landlordPassword !== landlordConfirmPassword) {
      newFieldErrors.landlordConfirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setErrorMessage('Please complete all required fields with valid details.');
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const landlordData: Partial<UserProfile> = {
        fullName: cleanName,
        agencyName: cleanCompany,
        email: cleanEmail,
        idType: landlordIdType,
        idNumber: cleanId.toUpperCase(),
        phone: cleanPhone,
        propertyCount,
        role: 'landlord'
      };

      await registerWithEmail(cleanEmail, landlordPassword, landlordData);

      setIsSubmitting(false);
      setLandlordSubmitted(true);
      if (onLandlordRegistered) {
        onLandlordRegistered();
      }
    } catch (err: any) {
      console.warn('Landlord registration error:', err);
      let message = 'Landlord registration failed. Please check your information.';
      if (err?.code === 'auth/email-already-in-use' || err?.message?.includes('already exists') || err?.message?.includes('email-already-in-use')) {
        message = 'An account with this email already exists. Please switch to Sign In.';
      } else if (typeof err?.message === 'string') {
        message = err.message.replace(/^Firebase:\s*/, '');
      }
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-900 my-8">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs ring-2 ring-lime-400/60">
              {accountType === 'landlord' && mode === 'register' ? (
                <Building className="w-5 h-5" />
              ) : (
                <GraduationCap className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === 'signin' 
                  ? 'Sign In to iKhaya' 
                  : accountType === 'student' 
                    ? 'Create Student Account' 
                    : 'Register as Landlord / Property Manager'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'signin' 
                  ? 'Access your saved properties, applications & direct chat' 
                  : 'Join South Africa’s accredited student housing community'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector (Sign In vs Register) */}
        <div className="grid grid-cols-2 p-2 bg-slate-100/70 border-b border-slate-200 gap-1.5">
          <button
            type="button"
            id="tab-btn-signin"
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
              setFieldErrors({});
              setLandlordSubmitted(false);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              mode === 'signin'
                ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            id="tab-btn-register"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
              setFieldErrors({});
              setLandlordSubmitted(false);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              mode === 'register'
                ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{errorMessage}</span>
              </div>
              {(errorMessage.includes('No account found') || errorMessage.includes('Create Account') || errorMessage.includes('register')) && mode === 'signin' && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (signInEmail) setEmail(signInEmail);
                      setMode('register');
                      setErrorMessage('');
                      setFieldErrors({});
                    }}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Create an Account Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
              {(errorMessage.includes('already exists') || errorMessage.includes('Sign In')) && mode === 'register' && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const emailToTransfer = accountType === 'student' ? email : landlordEmail;
                      if (emailToTransfer) setSignInEmail(emailToTransfer);
                      setMode('signin');
                      setErrorMessage('');
                      setFieldErrors({});
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Switch to Sign In &rarr;</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition flex items-center justify-center gap-2.5 group cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2 text-[10px] text-slate-400 font-semibold uppercase">Or sign in with registered email</span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. sanele@student.ac.za or name@gmail.com"
                    value={signInEmail}
                    onChange={(e) => {
                      setSignInEmail(e.target.value);
                      if (fieldErrors.signInEmail) setFieldErrors(prev => ({ ...prev, signInEmail: '' }));
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                      fieldErrors.signInEmail ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-orange-500'
                    }`}
                  />
                </div>
                {fieldErrors.signInEmail && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.signInEmail}</p>
                )}
              </div>

              {adminPromptNotice && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Administrator Credentials Required</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Please enter your administrator password for <strong className="font-mono">sanelekhayantathu@gmail.com</strong> to sign in.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    ref={passwordInputRef}
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    placeholder="•••••••• (Enter your account password)"
                    value={signInPassword}
                    onChange={(e) => {
                      setSignInPassword(e.target.value);
                      if (fieldErrors.signInPassword) setFieldErrors(prev => ({ ...prev, signInPassword: '' }));
                    }}
                    className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                      fieldErrors.signInPassword ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-orange-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.signInPassword && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.signInPassword}</p>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In to Account'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Administrator Quick Prompt */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-900 text-amber-400">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900">Administrator Access</span>
                    <span className="text-[10px] text-slate-500">Compliance & verification console</span>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-admin-prompt"
                  onClick={handleSelectAdminPrompt}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Prompt to sign in as Administrator"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>

              <div className="text-center pt-1">
                <p className="text-[11px] text-slate-500">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage('');
                      setFieldErrors({});
                    }}
                    className="text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* REGISTER FLOW */}
          {mode === 'register' && !landlordSubmitted && (
            <div className="space-y-4">
              {/* Account Role Selector: Student vs Landlord */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  I want to register as a:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountType('student');
                      setErrorMessage('');
                      setFieldErrors({});
                    }}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                      accountType === 'student'
                        ? 'bg-orange-50/70 border-orange-500 ring-2 ring-orange-500/20 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${accountType === 'student' ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold">Student</span>
                      <span className="text-[10px] text-slate-500">Looking for accredited housing & rooms</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountType('landlord');
                      setErrorMessage('');
                      setFieldErrors({});
                    }}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                      accountType === 'landlord'
                        ? 'bg-lime-50/70 border-lime-600 ring-2 ring-lime-600/20 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${accountType === 'landlord' ? 'bg-lime-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold">Landlord / Agent</span>
                      <span className="text-[10px] text-slate-500">List & manage student residences</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* STUDENT REGISTRATION FORM */}
              {accountType === 'student' ? (
                <form onSubmit={handleRegisterStudent} className="space-y-3.5 pt-1">
                  {/* Full Legal Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sanele Ntathu (First and Last Name)"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: '' }));
                        }}
                        className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                          fieldErrors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-orange-500'
                        }`}
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Student / Personal Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          placeholder="sanele@student.ac.za"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                          }}
                          className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                            fieldErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-orange-500'
                          }`}
                        />
                      </div>
                      {fieldErrors.email && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          placeholder="072 123 4567 or +27 72 123 4567"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                          }}
                          className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                            fieldErrors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-orange-500'
                          }`}
                        />
                      </div>
                      {fieldErrors.phone && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Identity Document Type & Number (SA ID / PASSPORT) */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800">
                        Identity Document (ID or Passport) *
                      </label>
                      <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setIdType('sa_id');
                            setIdNumber('');
                            setFieldErrors(prev => ({ ...prev, idNumber: '' }));
                          }}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition cursor-pointer ${
                            idType === 'sa_id' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          SA National ID
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIdType('passport');
                            setIdNumber('');
                            setFieldErrors(prev => ({ ...prev, idNumber: '' }));
                          }}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition cursor-pointer ${
                            idType === 'passport' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Passport
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder={idType === 'sa_id' ? 'Enter 13-digit SA ID (e.g. 0204125890087)' : 'Enter Passport Number (e.g. A12345678)'}
                        value={idNumber}
                        maxLength={idType === 'sa_id' ? 13 : 15}
                        onChange={(e) => {
                          const raw = e.target.value || '';
                          const val = idType === 'sa_id' 
                            ? raw.replace(/\D/g, '').slice(0, 13) 
                            : raw.toUpperCase();
                          setIdNumber(val);
                          if (fieldErrors.idNumber) setFieldErrors(prev => ({ ...prev, idNumber: '' }));
                        }}
                        className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs text-slate-900 font-mono focus:outline-hidden transition ${
                          fieldErrors.idNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-orange-500'
                        }`}
                      />
                    </div>
                    {fieldErrors.idNumber ? (
                      <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.idNumber}</p>
                    ) : (
                      <p className="text-[10px] text-slate-500">
                        {idType === 'sa_id' 
                          ? 'Must be a valid 13-digit South African ID number with verified birthdate and checksum.' 
                          : 'Enter your official foreign passport number (6 to 15 alphanumeric characters).'}
                      </p>
                    )}
                  </div>

                  {/* Tertiary Institution & Student Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        University / Tertiary Institution *
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <select
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500 focus:bg-white transition"
                        >
                          {UNIVERSITIES_LIST.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Student Number / ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 219084721"
                        value={studentNumber}
                        onChange={(e) => {
                          setStudentNumber(e.target.value);
                          if (fieldErrors.studentNumber) setFieldErrors(prev => ({ ...prev, studentNumber: '' }));
                        }}
                        className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                          fieldErrors.studentNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-orange-500'
                        }`}
                      />
                      {fieldErrors.studentNumber && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.studentNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Year of study and funding */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Year & Degree / Course
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2nd Year BSc Computer Science"
                        value={yearOfStudy}
                        onChange={(e) => setYearOfStudy(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Funding Source
                      </label>
                      <select
                        value={fundingType}
                        onChange={(e) => setFundingType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-orange-500 focus:bg-white transition"
                      >
                        <option value="NSFAS">NSFAS (Government Funding)</option>
                        <option value="Bursary / Corporate Sponsor">Bursary / Corporate Sponsor</option>
                        <option value="Self / Family Funded">Self / Family Funded (Private)</option>
                      </select>
                    </div>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Create Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 6 characters"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                          }}
                          className={`w-full pl-9 pr-10 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                            fieldErrors.password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-orange-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                          }}
                          className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                            fieldErrors.confirmPassword ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-orange-500'
                          }`}
                        />
                      </div>
                      {fieldErrors.confirmPassword && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-lime-50 rounded-xl border border-lime-200 flex items-start gap-2 text-xs text-lime-900">
                    <ShieldCheck className="w-4 h-4 text-lime-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Your identity document and student profile are protected and verified in accordance with POPIA and DHET student accommodation norms.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating Student Account...' : 'Complete Profile & Create Account'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                /* LANDLORD REGISTRATION FORM */
                <form onSubmit={handleRegisterLandlord} className="space-y-3.5 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Representative Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Johan Van Der Merwe"
                          value={landlordName}
                          onChange={(e) => {
                            setLandlordName(e.target.value);
                            if (fieldErrors.landlordName) setFieldErrors(prev => ({ ...prev, landlordName: '' }));
                          }}
                          className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                            fieldErrors.landlordName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-lime-600'
                          }`}
                        />
                      </div>
                      {fieldErrors.landlordName && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.landlordName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Residence / Company Name *
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Peak Student Living Pty"
                          value={companyName}
                          onChange={(e) => {
                            setCompanyName(e.target.value);
                            if (fieldErrors.companyName) setFieldErrors(prev => ({ ...prev, companyName: '' }));
                          }}
                          className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                            fieldErrors.companyName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-lime-600'
                          }`}
                        />
                      </div>
                      {fieldErrors.companyName && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.companyName}</p>
                      )}
                    </div>
                  </div>

                  {/* Landlord Representative ID / Passport */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800">
                        Representative ID / Passport *
                      </label>
                      <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setLandlordIdType('sa_id');
                            setLandlordIdNumber('');
                            setFieldErrors(prev => ({ ...prev, landlordIdNumber: '' }));
                          }}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition cursor-pointer ${
                            landlordIdType === 'sa_id' ? 'bg-lime-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          SA National ID
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLandlordIdType('passport');
                            setLandlordIdNumber('');
                            setFieldErrors(prev => ({ ...prev, landlordIdNumber: '' }));
                          }}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition cursor-pointer ${
                            landlordIdType === 'passport' ? 'bg-lime-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Passport
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder={landlordIdType === 'sa_id' ? 'Enter 13-digit SA ID number' : 'Enter Passport Number'}
                        value={landlordIdNumber}
                        maxLength={landlordIdType === 'sa_id' ? 13 : 15}
                        onChange={(e) => {
                          const raw = e.target.value || '';
                          const val = landlordIdType === 'sa_id' 
                            ? raw.replace(/\D/g, '').slice(0, 13) 
                            : raw.toUpperCase();
                          setLandlordIdNumber(val);
                          if (fieldErrors.landlordIdNumber) setFieldErrors(prev => ({ ...prev, landlordIdNumber: '' }));
                        }}
                        className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs text-slate-900 font-mono focus:outline-hidden transition ${
                          fieldErrors.landlordIdNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-lime-600'
                        }`}
                      />
                    </div>
                    {fieldErrors.landlordIdNumber && (
                      <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.landlordIdNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Business / Contact Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          placeholder="landlord@peakresidence.co.za"
                          value={landlordEmail}
                          onChange={(e) => {
                            setLandlordEmail(e.target.value);
                            if (fieldErrors.landlordEmail) setFieldErrors(prev => ({ ...prev, landlordEmail: '' }));
                          }}
                          className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                            fieldErrors.landlordEmail ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-lime-600'
                          }`}
                        />
                      </div>
                      {fieldErrors.landlordEmail && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.landlordEmail}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile / WhatsApp Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          placeholder="+27 82 555 1234"
                          value={landlordPhone}
                          onChange={(e) => {
                            setLandlordPhone(e.target.value);
                            if (fieldErrors.landlordPhone) setFieldErrors(prev => ({ ...prev, landlordPhone: '' }));
                          }}
                          className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                            fieldErrors.landlordPhone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-lime-600'
                          }`}
                        />
                      </div>
                      {fieldErrors.landlordPhone && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.landlordPhone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Primary City / Campus Region
                      </label>
                      <select
                        value={landlordTown}
                        onChange={(e) => setLandlordTown(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-lime-600 focus:bg-white transition"
                      >
                        {TOWNS_LIST.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Portfolio Scale / Bed Capacity
                      </label>
                      <select
                        value={propertyCount}
                        onChange={(e) => setPropertyCount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-lime-600 focus:bg-white transition"
                      >
                        <option value="1 - 5 Properties (10-50 Beds)">1 - 5 Properties (10-50 Beds)</option>
                        <option value="5 - 15 Properties (50-200 Beds)">5 - 15 Properties (50-200 Beds)</option>
                        <option value="Large Commercial Residence (200+ Beds)">Large Commercial Residence (200+ Beds)</option>
                        <option value="Single Private Unit / Flat">Single Private Unit / Flat</option>
                      </select>
                    </div>
                  </div>

                  {/* Landlord Passwords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Create Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showLandlordPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 6 characters"
                          value={landlordPassword}
                          onChange={(e) => {
                            setLandlordPassword(e.target.value);
                            if (fieldErrors.landlordPassword) setFieldErrors(prev => ({ ...prev, landlordPassword: '' }));
                          }}
                          className={`w-full pl-9 pr-10 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                            fieldErrors.landlordPassword ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-lime-600'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLandlordPassword(!showLandlordPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showLandlordPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {fieldErrors.landlordPassword && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.landlordPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showLandlordPassword ? 'text' : 'password'}
                          required
                          placeholder="Re-enter password"
                          value={landlordConfirmPassword}
                          onChange={(e) => {
                            setLandlordConfirmPassword(e.target.value);
                            if (fieldErrors.landlordConfirmPassword) setFieldErrors(prev => ({ ...prev, landlordConfirmPassword: '' }));
                          }}
                          className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white transition ${
                            fieldErrors.landlordConfirmPassword ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-lime-600'
                          }`}
                        />
                      </div>
                      {fieldErrors.landlordConfirmPassword && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.landlordConfirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <Headphones className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      <strong>Accreditation Notice:</strong> Once registered, our housing compliance team will verify your property credentials before listings are published to university students.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Registering Landlord...' : 'Submit Landlord Registration'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* LANDLORD POST-REGISTRATION CONFIRMATION SCREEN */}
          {mode === 'register' && landlordSubmitted && (
            <div className="space-y-4 py-2 text-center">
              <div className="w-14 h-14 rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center mx-auto border-2 border-lime-300">
                <CheckCircle2 className="w-8 h-8 text-lime-600" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Landlord Profile Successfully Created!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong>{landlordName || 'Partner'}</strong> ({companyName || 'Property Manager'}).
                </p>
              </div>

              <div className="p-4 bg-lime-50 rounded-2xl border border-lime-200 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-lime-950">
                  <ShieldCheck className="w-4 h-4 text-lime-600" />
                  <span>Activation & Authentication In Progress</span>
                </div>
                <p className="text-xs text-lime-900 leading-relaxed">
                  Your landlord account has been registered with iKhaya. You can now access your landlord portal to list accommodations and communicate with students.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Continue to iKhaya Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
