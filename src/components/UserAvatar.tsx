import React, { useState } from 'react';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  email?: string;
  role?: 'student' | 'landlord' | 'admin' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

// Check if a URL is a placeholder/stock photo rather than a user-uploaded photo
function isStockPlaceholder(url?: string | null): boolean {
  if (!url) return true;
  // If it's an unsplash stock image used in mock data, treat as not user-uploaded
  if (url.includes('images.unsplash.com')) return true;
  return false;
}

export function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length === 1) {
      return parts[0].toUpperCase();
    }
  }

  if (email && email.trim()) {
    const local = email.split('@')[0].replace(/[^a-zA-Z]/g, '');
    if (local.length >= 2) {
      return local.slice(0, 2).toUpperCase();
    }
    if (local.length === 1) {
      return local.toUpperCase();
    }
  }

  return 'IK';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = '',
  avatarUrl,
  email,
  role = 'student',
  size = 'md',
  className = '',
  showBorder = true,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const initials = getInitials(name, email);
  const hasUserUploadedPhoto = !isStockPlaceholder(avatarUrl) && !imageFailed;

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-lg font-bold',
  }[size];

  const roleStyles = {
    student: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white border-orange-300',
    landlord: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400',
    admin: 'bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 border-amber-400',
  }[role] || 'bg-gradient-to-br from-orange-500 to-amber-600 text-white border-orange-300';

  if (hasUserUploadedPhoto && avatarUrl) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden ${sizeClasses} ${
          showBorder ? 'border-2 border-white shadow-2xs' : ''
        } ${className}`}
      >
        <img
          src={avatarUrl}
          alt={name || 'User Profile'}
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none font-bold tracking-tight shadow-2xs transition-transform ${sizeClasses} ${roleStyles} ${
        showBorder ? 'border-2' : ''
      } ${className}`}
      title={name ? `${name} (${initials})` : 'User Profile'}
      aria-label={name || 'Profile'}
    >
      <span>{initials}</span>
    </div>
  );
};
