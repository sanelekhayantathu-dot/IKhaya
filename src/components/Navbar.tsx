import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Heart, 
  MessageSquare, 
  FileText, 
  PlusCircle, 
  GraduationCap,
  ClipboardList,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
  Sparkles,
  Headphones,
  Plus,
  Settings,
  Lock,
  Phone
} from 'lucide-react';
import { UserProfile, UserRole, StudentProfile } from '../types';
import { BrandLogo } from './BrandLogo';
import { UserAvatar } from './UserAvatar';

interface NavbarProps {
  currentView: 'student' | 'landlord' | 'admin';
  onViewChange?: (view: 'student' | 'landlord' | 'admin') => void;
  savedCount: number;
  unreadMessagesCount: number;
  userProfile: UserProfile | null;
  onOpenFavorites: () => void;
  onOpenMessages: () => void;
  onOpenDocuments: () => void;
  onOpenApplications: () => void;
  onOpenAddListing: () => void;
  onOpenStudentProfile: (tab?: 'messages' | 'applications' | 'profile' | 'documents' | 'saved' | 'guarantor') => void;
  onOpenAuthModal: (mode?: 'signin' | 'register') => void;
  onContactSupport?: () => void;
  onTalkToAgent?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  savedCount,
  unreadMessagesCount,
  userProfile,
  onOpenFavorites,
  onOpenMessages,
  onOpenDocuments,
  onOpenApplications,
  onOpenAddListing,
  onOpenStudentProfile,
  onOpenAuthModal,
  onContactSupport,
  onTalkToAgent,
  onSignOut,
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSupportClick = onContactSupport || onTalkToAgent;

  const role = userProfile?.role || null;
  const isStudent = role === 'student';
  const isLandlord = role === 'landlord';
  const isAdmin = role === 'admin';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-slate-200 text-slate-900 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          
          {/* Authentic Logo & Portal Identity */}
          <div 
            className="flex items-center gap-3 sm:gap-4 cursor-pointer select-none group" 
            onClick={() => {
              if (onViewChange) {
                onViewChange(isLandlord ? 'landlord' : isAdmin ? 'admin' : 'student');
              }
            }}
            title="iKhaya Res Living - Home"
          >
            <BrandLogo size="md" showSubtitle={true} subtitleText={isLandlord ? "Landlord Res" : isAdmin ? "Admin Res" : "Res Living"} />
            <div className="hidden lg:flex flex-col border-l-2 border-slate-200 pl-3.5 py-0.5">
              <span className="text-sm font-black tracking-tight text-slate-900 uppercase">
                iKhaya Res Living
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                {isLandlord 
                  ? 'Landlord & Property Management Console' 
                  : isAdmin 
                    ? 'Compliance, Accreditation & Audit Hub' 
                    : 'Verified South African Student Residences'}
              </span>
            </div>
          </div>

          {/* Clean Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Contact Support Option (Available to all students, landlords & visitors) */}
            {handleSupportClick && (
              <button
                id="nav-contact-support-btn"
                onClick={handleSupportClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200 text-xs font-bold transition shadow-2xs group cursor-pointer"
                title="Contact iKhaya Res Living Support (support@ikhayaresliving.co.za)"
              >
                <Phone className="w-3.5 h-3.5 text-orange-600 group-hover:rotate-12 transition-transform" />
                <span>Contact Support</span>
              </button>
            )}

            {/* Student-Only Top Action: Saved Favorites */}
            {isStudent && (
              <button
                id="nav-favorites-btn"
                onClick={onOpenFavorites}
                className="relative hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 text-xs font-bold transition shadow-2xs group"
                title="View your saved residences"
              >
                <Heart className={`w-3.5 h-3.5 ${savedCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-400 group-hover:text-rose-500'}`} />
                <span>Saved</span>
                {savedCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-black">
                    {savedCount}
                  </span>
                )}
              </button>
            )}

            {/* Student Top Action: Submitted Rental Applications Button */}
            {isStudent && userProfile && (
              <button
                id="nav-rental-applications-btn"
                onClick={onOpenApplications}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold transition shadow-2xs group cursor-pointer"
                title="View Submitted Rental Applications"
              >
                <ClipboardList className="w-3.5 h-3.5 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Rental Applications</span>
                <span className="sm:hidden">Applications</span>
              </button>
            )}

            {/* Landlord-Only Top Action: List Accommodation Button */}
            {isLandlord && (
              <button
                id="nav-list-accommodation-btn"
                onClick={onOpenAddListing}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-xs font-bold transition shadow-xs group"
                title="List a new student residence or property"
              >
                <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                <span className="hidden sm:inline">Add Listing</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}

            {/* Admin-Only Top Badge */}
            {isAdmin && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Staff</span>
              </div>
            )}

            {/* Profile & Notification Hub */}
            {userProfile ? (
              /* LOGGED IN: Show avatar, user name, role badge, and notification badge */
              <div className="relative" ref={dropdownRef}>
                <button
                  id="nav-profile-btn"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="relative flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition shadow-2xs group"
                  title="Open Profile Menu"
                >
                  {/* Avatar with unread notification badge */}
                  <div className="relative">
                    <UserAvatar
                      name={userProfile.fullName}
                      avatarUrl={userProfile.avatar}
                      email={userProfile.email}
                      role={userProfile.role}
                      size="sm"
                      className="group-hover:scale-105 transition-transform ring-1 ring-slate-200"
                    />
                    {/* Unread badge */}
                    {unreadMessagesCount > 0 && (
                      <span 
                        id="profile-unread-badge"
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse"
                        title={`${unreadMessagesCount} unread message${unreadMessagesCount > 1 ? 's' : ''}`}
                      >
                        {unreadMessagesCount}
                      </span>
                    )}
                  </div>

                  {/* Name & Role Badge */}
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'User'}
                      </p>
                      {isAdmin ? (
                        <span className="text-[10px] font-extrabold bg-slate-900 text-amber-400 border border-amber-500/40 px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-2xs">
                          <Shield className="w-3 h-3 text-amber-400" />
                          Admin
                        </span>
                      ) : isLandlord ? (
                        <span className="text-[10px] font-extrabold bg-lime-100 text-lime-900 border border-lime-300 px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-2xs">
                          <Building2 className="w-3 h-3 text-lime-700" />
                          Landlord
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200 px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-2xs">
                          <GraduationCap className="w-3 h-3 text-orange-600" />
                          Student
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                      {isLandlord 
                        ? (userProfile.agencyName || userProfile.email) 
                        : userProfile.email}
                    </p>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header info */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={userProfile.fullName}
                          avatarUrl={userProfile.avatar}
                          email={userProfile.email}
                          role={userProfile.role}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {userProfile.fullName}
                            </p>
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded-full border border-amber-500/40">
                                <Shield className="w-3 h-3" />
                                Admin
                              </span>
                            ) : isLandlord ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-lime-900 bg-lime-100 px-2 py-0.5 rounded-full border border-lime-300">
                                <Building2 className="w-3 h-3 text-lime-700" />
                                Landlord
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                                <GraduationCap className="w-3 h-3 text-orange-600" />
                                Student
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                            {isLandlord ? userProfile.agencyName || userProfile.email : userProfile.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Role-Specific Navigation Items */}
                    <div className="p-1.5 space-y-0.5 text-xs">
                      {/* STUDENT ONLY FEATURES */}
                      {isStudent && (
                        <>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              onOpenStudentProfile('messages');
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-orange-50 text-slate-700 hover:text-orange-700 font-medium transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-1 rounded-lg bg-orange-100 text-orange-700">
                                <MessageSquare className="w-4 h-4" />
                              </div>
                              <span className="font-semibold">Messages & Inquiries</span>
                            </div>
                            {unreadMessagesCount > 0 && (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-600 text-white shadow-2xs">
                                {unreadMessagesCount}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              onOpenStudentProfile('applications');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-orange-50 text-slate-700 hover:text-orange-700 font-medium transition"
                          >
                            <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                              <ClipboardList className="w-4 h-4" />
                            </div>
                            <span>Submitted Rental Applications</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              onOpenStudentProfile('profile');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-orange-50 text-slate-700 hover:text-orange-700 font-medium transition"
                          >
                            <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="truncate">Student & Academic Profile</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              onOpenStudentProfile('documents');
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-lime-50 text-slate-700 hover:text-lime-800 font-medium transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-1 rounded-lg bg-lime-100 text-lime-700 shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <span className="truncate">Encrypted Document Vault</span>
                            </div>
                            <span className="text-[10px] text-lime-700 font-bold bg-lime-50 px-1.5 py-0.5 rounded border border-lime-200 shrink-0 ml-1.5">
                              {userProfile.documents?.length || 4} docs
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              onOpenStudentProfile('saved');
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-medium transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-1 rounded-lg bg-rose-100 text-rose-600">
                                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                              </div>
                              <span>Saved Residences</span>
                            </div>
                            {savedCount > 0 && (
                              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                {savedCount}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              onOpenStudentProfile('guarantor');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-orange-50 text-slate-700 hover:text-orange-700 font-medium transition"
                          >
                            <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                              <Shield className="w-4 h-4" />
                            </div>
                            <span>Guarantor & Surety</span>
                          </button>
                        </>
                      )}

                      {/* LANDLORD ONLY FEATURES */}
                      {isLandlord && (
                        <>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              if (onViewChange) onViewChange('landlord');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-lime-50 text-slate-700 hover:text-lime-900 font-semibold transition"
                          >
                            <div className="p-1 rounded-lg bg-lime-100 text-lime-700">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <span>Landlord Management Portal</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              onOpenAddListing();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-lime-50 text-slate-700 hover:text-lime-900 font-medium transition"
                          >
                            <div className="p-1 rounded-lg bg-lime-100 text-lime-700">
                              <PlusCircle className="w-4 h-4" />
                            </div>
                            <span>Add New Accommodation</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              onOpenMessages();
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-lime-50 text-slate-700 hover:text-lime-900 font-medium transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-1 rounded-lg bg-lime-100 text-lime-700">
                                <MessageSquare className="w-4 h-4" />
                              </div>
                              <span>Student Inquiries</span>
                            </div>
                            {unreadMessagesCount > 0 && (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-600 text-white shadow-2xs">
                                {unreadMessagesCount} new
                              </span>
                            )}
                          </button>
                        </>
                      )}

                      {/* ADMIN ONLY FEATURES */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              if (onViewChange) onViewChange('admin');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-900 font-bold transition"
                          >
                            <div className="p-1 rounded-lg bg-slate-900 text-amber-400">
                              <Shield className="w-4 h-4" />
                            </div>
                            <span>Admin Compliance Command</span>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Contact Support & Sign Out */}
                    <div className="p-1.5 border-t border-slate-100 space-y-0.5">
                      {handleSupportClick && (
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            handleSupportClick();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-semibold transition cursor-pointer"
                        >
                          <Phone className="w-4 h-4 text-orange-600" />
                          <span>Contact Support</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          if (onSignOut) onSignOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 text-xs font-semibold transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* NOT LOGGED IN */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  id="nav-signin-btn"
                  onClick={() => onOpenAuthModal('signin')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-orange-600" />
                  <span>Sign In</span>
                </button>
                <button
                  id="nav-register-btn"
                  onClick={() => onOpenAuthModal('register')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
