import { Article, ForumPost, Volunteer, CommunityGroup, Event, Book, Video, Quote, Poll } from '../types';

export const CRISIS_NUMBERS = [
  { name: 'Befrienders Kenya', number: '0722 178 177' },
  { name: 'KEMRI Suicide Hotline', number: '0800 723 253' },
  { name: 'Emergency', number: '999' },
  { name: 'Gender Violence RC', number: '0800 720 501' },
];

export const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'die', 'hurt myself', 'cutting', 'overdose', 'want to die', 'better off dead'
];

export const TOPICS = [
  'Anxiety', 'Depression', 'Grief', 'Relationships', 'Academic Stress', 'Loneliness', 'Trauma', 'Addiction'
];

export const VOLUNTEER_ROLES = {
  licensed: { label: 'Licensed Pro', color: 'green', icon: '🟢', description: 'Verified Professional' },
  intern: { label: 'Student Intern', color: 'yellow', icon: '🟡', description: 'Under Supervision' },
  listener: { label: 'Peer Listener', color: 'blue', icon: '🔵', description: 'Trained Supporter' },
};

export const VOLUNTEERS: Volunteer[] = [
  {
    id: '1',
    userId: 'u1',
    name: 'Dr. Amina Juma',
    photo: 'https://ui-avatars.com/api/?name=Amina+Juma&background=10b981&color=fff',
    role: 'licensed',
    qualification: 'PhD Clinical Psychology',
    topics: ['Anxiety', 'Depression', 'Trauma'],
    location: 'Nairobi',
    whatsapp: '254700000001',
    telegram: 'DrAminaHelp',
    languages: ['English', 'Swahili'],
    isOnline: true,
    verified: true,
    bio: 'Experienced clinical psychologist with 10+ years helping individuals overcome trauma and anxiety.',
    impact: { views: 1240, chats: 45 }
  },
  {
    id: '2',
    userId: 'u2',
    name: 'James Mwangi',
    photo: 'https://ui-avatars.com/api/?name=James+Mwangi&background=eab308&color=fff',
    role: 'intern',
    qualification: 'MA Student (Supervised)',
    topics: ['Academic Stress', 'Relationships'],
    location: 'Nairobi',
    whatsapp: '254700000002',
    languages: ['English', 'Swahili', 'Sheng'],
    isOnline: true,
    verified: false,
    bio: 'Final year Masters student passionate about helping students navigate academic pressure.',
    impact: { views: 850, chats: 120 }
  },
  {
    id: '3',
    userId: 'u3',
    name: 'Sarah Ochieng',
    photo: 'https://ui-avatars.com/api/?name=Sarah+Ochieng&background=3b82f6&color=fff',
    role: 'listener',
    qualification: 'Trained Peer Counselor',
    topics: ['Loneliness', 'Grief'],
    location: 'Kisumu',
    whatsapp: '254700000003',
    languages: ['English', 'Luo'],
    isOnline: false,
    verified: false,
    bio: 'I am here to listen without judgment. I have been trained in active listening and grief support.',
    impact: { views: 560, chats: 85 }
  },
];

export const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Understanding Anxiety',
    content: 'Anxiety is more than just feeling stressed or worried. It is a natural response to stress.',
    category: 'Anxiety & Stress',
    image: 'https://placehold.co/600x400?text=Anxiety',
    readTime: 5,
    type: 'article'
  },
  {
    id: '2',
    title: '5 Steps to Better Sleep',
    content: 'Sleep hygiene is crucial for mental health. Try these steps: 1. Stick to a regular sleep schedule.',
    category: 'Self-Care',
    image: 'https://placehold.co/600x400?text=Sleep',
    readTime: 3,
    type: 'article'
  }
];

export const BOOKS: Book[] = [];
export const VIDEOS: Video[] = [];
export const QUOTES: Quote[] = [{ id: 'q1', text: "Just take the first step.", author: "MLK Jr.", category: "Hope", type: "quote" }];

export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: '1',
    author: 'HopefulNairobi',
    title: 'Feeling overwhelmed lately',
    body: 'Work has been really stressful and I feel like I cannot catch a break. Anyone else feel this way?',
    category: 'Anxiety & Stress',
    hugs: 5,
    date: '2023-10-25T10:00:00Z',
  }
];

export const DAILY_POLL: Poll = {
  id: 'poll-1',
  question: "What is your main goal for this week?",
  totalVotes: 142,
  options: [
    { id: '1', text: 'Improve my sleep schedule', votes: 45 },
    { id: '2', text: 'Talk to a friend', votes: 30 },
    { id: '3', text: 'Exercise more', votes: 20 },
    { id: '4', text: 'Just survive', votes: 47 }
  ]
};

export const COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    id: '1',
    name: 'Nairobi Anxiety Support',
    description: 'A safe space for those dealing with GAD and social anxiety.',
    link: '#',
    platform: 'In-App',
    category: 'Support Group',
    chatGroupId: 'group_anxiety_nbo',
    safetyRating: 'Verified Safe'
  },
  {
    id: '2',
    name: 'Students Mental Health',
    description: 'Peer support for university students.',
    link: '#',
    platform: 'In-App',
    category: 'Support Group',
    chatGroupId: 'group_students',
    safetyRating: 'Community Moderated'
  }
];

export const EVENTS: Event[] = [];