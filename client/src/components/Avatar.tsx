import React, { useState } from 'react';

interface AvatarProps {
  name: string;
  photo?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const GRADIENTS = [
  'from-teal-500 to-emerald-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-red-600',
  'from-emerald-500 to-teal-700'
];

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-14 h-14 text-lg'
};

export const Avatar: React.FC<AvatarProps> = ({ name, photo, className = '', size = 'md' }) => {
  const [imgError, setImgError] = useState(false);

  // Compute initials (e.g. "Dr. Amina Wanjiku" -> "AW", "Brian" -> "BR")
  const cleanName = (name || 'Anonymous').replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  let initials = 'SH';
  if (parts.length >= 2) {
    initials = `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  } else if (parts.length === 1 && parts[0].length >= 2) {
    initials = parts[0].substring(0, 2).toUpperCase();
  } else if (parts.length === 1) {
    initials = parts[0][0].toUpperCase();
  }

  // Pick deterministic gradient based on name string
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (name.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  const gradient = GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  // Ignore external ui-avatars.com to prevent third-party network tracking
  const isUiAvatars = photo?.includes('ui-avatars.com');
  const validPhoto = photo && !isUiAvatars && !imgError;

  if (validPhoto) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-full object-cover shadow-sm ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br ${gradient} text-white font-bold flex items-center justify-center shadow-sm select-none shrink-0 ${className}`}
      aria-label={name}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
};
