
import { Article, ForumPost, Volunteer, Badge, JournalEntry, CommunityGroup, Event } from './types';

export const CRISIS_NUMBERS = [
  { name: 'Befrienders Kenya', number: '0722 178 177' },
  { name: 'KEMRI Suicide Hotline', number: '0800 723 253' },
  { name: 'Emergency', number: '999' },
  { name: 'Gender Violence RC', number: '0800 720 501' },
];

export const TOPICS = [
  'Anxiety', 'Depression', 'Grief', 'Relationships', 'Academic Stress', 'Loneliness', 'Trauma', 'Addiction'
];

export const VOLUNTEER_ROLES = {
  licensed: { label: 'Licensed Pro', color: 'green', icon: '🟢' },
  intern: { label: 'Student Intern', color: 'yellow', icon: '🟡' },
  listener: { label: 'Peer Listener', color: 'blue', icon: '🔵' },
};

export const VOLUNTEERS: Volunteer[] = [
  {
    id: '1',
    userId: 'u1',
    name: 'Dr. Amina Juma',
    photo: 'https://picsum.photos/200/200?random=1',
    role: 'licensed',
    qualification: 'PhD Clinical Psychology',
    topics: ['Anxiety', 'Depression', 'Trauma'],
    location: 'Nairobi',
    whatsapp: '254700000001',
    languages: ['English', 'Swahili'],
    isOnline: true,
    verified: true,
    bio: 'Experienced clinical psychologist with 10+ years helping individuals overcome trauma and anxiety. Compassionate and evidence-based approach.',
    impact: { views: 1240, chats: 45 }
  },
  {
    id: '2',
    userId: 'u2',
    name: 'James Mwangi',
    photo: 'https://picsum.photos/200/200?random=2',
    role: 'intern',
    qualification: 'MA Student (Supervised)',
    topics: ['Academic Stress', 'Relationships'],
    location: 'Nairobi',
    whatsapp: '254700000002',
    languages: ['English', 'Swahili', 'Sheng'],
    isOnline: true,
    verified: false,
    bio: 'Final year Masters student passionate about helping students navigate academic pressure and relationship challenges.',
    impact: { views: 850, chats: 120 }
  },
  {
    id: '3',
    userId: 'u3',
    name: 'Sarah Ochieng',
    photo: 'https://picsum.photos/200/200?random=3',
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
    titleSw: 'Kuelewa Wasiwasi',
    content: 'Anxiety is more than just feeling stressed or worried. It is a natural response to stress. It becomes a problem when it is constant, overwhelming, or interferes with your daily life. Common symptoms include rapid heartbeat, sweating, and feeling restless.',
    contentSw: 'Wasiwasi ni zaidi ya kuhisi mkazo au hofu. Ni majibu ya asili kwa mkazo. Inakuwa tatizo wakati ni ya mara kwa mara, yenye nguvu, au inaingilia maisha yako ya kila siku.',
    category: 'Anxiety & Stress',
    image: 'https://picsum.photos/600/400?random=10',
    readTime: 5,
  },
  {
    id: '2',
    title: '5 Steps to Better Sleep',
    titleSw: 'Hatua 5 za Kupata Usingizi Bora',
    content: 'Sleep hygiene is crucial for mental health. Try these steps: 1. Stick to a regular sleep schedule. 2. Create a relaxing bedtime routine. 3. Limit screen time before bed. 4. Avoid caffeine in the afternoon. 5. Make your bedroom comfortable and dark.',
    contentSw: 'Usafi wa kulala ni muhimu kwa afya ya akili. Jaribu hatua hizi: 1. Shikilia ratiba ya kawaida ya kulala. 2. Unda utaratibu wa kupumzika kabla ya kulala.',
    category: 'Self-Care',
    image: 'https://picsum.photos/600/400?random=11',
    readTime: 3,
  },
  {
    id: '3',
    title: 'Coping with Depression',
    titleSw: 'Kukabiliana na Unyogovu',
    content: 'Depression can feel isolating. Here are small steps you can take today: Reach out to a friend, spend time in nature, and try to move your body. Remember, you are not alone in this.',
    contentSw: 'Unyogovu unaweza kukufanya uhisi mpweke. Hapa kuna hatua ndogo unazoweza kuchukua leo: Wasiliana na rafiki, tumia wakati katika asili.',
    category: 'Depression',
    image: 'https://picsum.photos/600/400?random=12',
    readTime: 7,
  }
];

export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: '1',
    author: 'HopefulNairobi',
    title: 'Feeling overwhelmed lately',
    body: 'Work has been really stressful and I feel like I cannot catch a break. Anyone else feel this way?',
    category: 'Anxiety & Stress',
    hugs: 5,
    date: '2023-10-25T10:00:00Z',
  },
  {
    id: '2',
    author: 'QuietWalker',
    title: 'Small win today',
    body: 'I finally managed to clean my room after weeks of depression. It feels small but huge.',
    category: 'Success Stories',
    hugs: 12,
    date: '2023-10-24T14:30:00Z',
  },
  {
    id: '3',
    author: 'Anonymous User',
    title: 'This is a flagged post example',
    body: 'This post contains inappropriate content and should be moderated by the admin.',
    category: 'General',
    hugs: 0,
    date: '2023-10-23T09:00:00Z',
    isFlagged: true
  }
];

export const BADGES: Badge[] = [
  {
    id: 'streak-3',
    name: 'Momentum Builder',
    description: 'Journaled for 3 consecutive days',
    icon: 'flame',
    condition: (entries, streak) => streak >= 3
  },
  {
    id: 'streak-7',
    name: 'Weekly Warrior',
    description: 'Journaled for 7 consecutive days',
    icon: 'star',
    condition: (entries, streak) => streak >= 7
  },
  {
    id: 'streak-30',
    name: 'Consistency King',
    description: 'Journaled for 30 consecutive days',
    icon: 'trophy',
    condition: (entries, streak) => streak >= 30
  },
  {
    id: 'total-10',
    name: 'Self-Aware',
    description: 'Logged 10 total entries',
    icon: 'book',
    condition: (entries) => entries.length >= 10
  }
];

export const DAILY_CHALLENGES = [
  "Drink a glass of water right now.",
  "Take 3 deep breaths.",
  "Step outside and look at the sky for 2 minutes.",
  "List 3 things you are grateful for.",
  "Send a kind message to a friend.",
  "Stretch your arms and legs for 1 minute.",
  "Listen to your favorite song.",
  "Write down one thing you like about yourself.",
  "Declutter a small space (like your desk or wallet).",
  "Eat a piece of fruit mindfully."
];

export const COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    id: '1',
    name: 'Nairobi Anxiety Support',
    description: 'A safe space for those dealing with GAD and social anxiety.',
    link: 'https://chat.whatsapp.com/placeholder',
    platform: 'WhatsApp',
    category: 'Support Group'
  },
  {
    id: '2',
    name: 'Chiromo Hospital Group',
    description: 'Official mental health support resources.',
    link: 'https://chiromohospitalgroup.co.ke',
    platform: 'Website',
    category: 'Crisis Center'
  },
  {
    id: '3',
    name: 'Students Mental Health',
    description: 'Peer support for university students.',
    link: 'https://t.me/placeholder',
    platform: 'Telegram',
    category: 'Support Group'
  }
];

export const EVENTS: Event[] = [
  {
    id: '1',
    title: 'Mental Health Walk',
    description: 'Join us for a walk at Karura Forest to raise awareness.',
    date: '2024-11-15T09:00:00',
    location: 'Karura Forest, Nairobi',
    link: '#',
    organizer: 'SafeHaven Team'
  },
  {
    id: '2',
    title: 'Coping with Stress Webinar',
    description: 'Free online session with Dr. Amina Juma.',
    date: '2024-11-20T18:00:00',
    location: 'Online (Zoom)',
    link: '#',
    organizer: 'Dr. Amina Juma'
  }
];
