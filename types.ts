
export type UserRole = 'USER' | 'ADMIN' | 'VOLUNTEER_PENDING' | 'VOLUNTEER_APPROVED';

export interface User {
  id: string;
  username: string; // Used for login
  email?: string;   // Optional, only for Volunteers/Admins
  displayName?: string; // For anonymous interactions
  role: UserRole;
  recoveryKey?: string; // Hashed/Encrypted recovery phrase for Seekers
  passphraseHash?: string; // To verify login locally
}

export type VolunteerRole = 'licensed' | 'intern' | 'listener';

export interface Volunteer {
  id: string;
  userId: string;
  name: string;
  photo: string;
  role: VolunteerRole;
  qualification: string;
  topics: string[];
  location: string;
  whatsapp: string;
  languages: string[];
  isOnline: boolean;
  verified: boolean;
  bio: string;
  impact: {
    views: number;
    chats: number;
  };
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: number; // 1-5
  energy: number; // 1-5
  sleep: number; // 1-5
  entry: string; // Encrypted content
  tags: string[];
}

export interface Article {
  id: string;
  title: string;
  titleSw?: string;
  content: string;
  contentSw?: string;
  category: string;
  image: string;
  readTime: number;
}

export interface ForumPost {
  id: string;
  author: string; // Anonymous name
  title: string;
  body: string;
  category: string;
  hugs: number;
  date: string;
  isTriggering?: boolean;
  isFlagged?: boolean;
}

export interface SafetyPlan {
  id: string;
  userId: string;
  warningSigns: string;     // Encrypted
  copingStrategies: string; // Encrypted
  safeContacts: string;     // Encrypted
  professionalContacts: string; // Encrypted
  environmentChanges: string;   // Encrypted
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  link: string;
  platform: 'WhatsApp' | 'Telegram' | 'Discord' | 'In-Person' | 'Website';
  category: 'Support Group' | 'NGO' | 'Crisis Center';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  link?: string;
  organizer: string;
}

export type Language = 'en' | 'sw';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (entries: JournalEntry[], streak: number) => boolean;
}

export interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  qualification: string;
  experience: string;
  licenseNumber?: string;
  idNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}
