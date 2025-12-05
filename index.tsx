export type UserRole = 'USER' | 'ADMIN' | 'VOLUNTEER_PENDING' | 'VOLUNTEER_APPROVED';

export interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  role: UserRole;
  recoveryKey?: string;
  passphraseHash?: string;
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
  impact: { views: number; chats: number; };
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  entry: string;
  tags: string[];
  isDraft?: boolean;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  image: string;
  readTime: number;
  type: 'article';
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  link: string;
  cover: string;
  category: string;
  type: 'book';
}

export interface Video {
  id: string;
  title: string;
  presenter: string;
  description: string;
  duration: string;
  thumbnail: string;
  link: string;
  category: string;
  type: 'video';
}

export interface Quote {
  id: string;
  text: string;
  textSw?: string;
  author: string;
  category: string;
  type: 'quote';
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
}

export interface ForumPost {
  id: string;
  author: string;
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
  warningSigns: string;
  copingStrategies: string;
  safeContacts: string;
  professionalContacts: string;
  environmentChanges: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  link: string;
  platform: 'WhatsApp' | 'Telegram' | 'Discord' | 'In-Person' | 'Website' | 'In-App';
  category: 'Support Group' | 'NGO' | 'Crisis Center';
  chatGroupId?: string;
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

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system' | 'alert';
  isRead: boolean;
}

export interface Conversation {
  id: string;
  type: 'dm' | 'group';
  name?: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  avatar?: string;
  pinnedMessageId?: string;
  slowMode?: number;
}