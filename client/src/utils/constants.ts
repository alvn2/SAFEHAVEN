import { Article, ForumPost, CommunityGroup, Event, Book, Video, Quote, Poll } from '../types';

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
  licensed: { label: 'Licensed Pro', color: 'green', description: 'Verified Professional' },
  intern: { label: 'Student Intern', color: 'yellow', description: 'Under Supervision' },
  listener: { label: 'Peer Listener', color: 'blue', description: 'Trained Supporter' },
};

export const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Understanding Anxiety',
    content: 'Anxiety is more than just feeling stressed or worried. It is a natural response to stress.',
    category: 'Anxiety & Stress',
    image: '/images/anxiety-guide.svg',
    readTime: 5,
    type: 'article'
  },
  {
    id: '2',
    title: '5 Steps to Better Sleep',
    content: 'Sleep hygiene is crucial for mental health. Try these steps: 1. Stick to a regular sleep schedule.',
    category: 'Self-Care',
    image: '/images/sleep-hygiene.svg',
    readTime: 3,
    type: 'article'
  }
];

export const BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'The Body Keeps the Score',
    author: 'Bessel van der Kolk, M.D.',
    description: 'A transformative exploration of trauma, somatic memory, and pathways to neurological and emotional recovery.',
    link: 'https://www.besselvanderkolk.com/resources/the-body-keeps-the-score',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
    category: 'Trauma & Healing',
    type: 'book'
  },
  {
    id: 'b2',
    title: 'Maybe You Should Talk to Someone',
    author: 'Lori Gottlieb',
    description: 'A candid and compassionate look at psychotherapy from both sides of the couch.',
    link: 'https://lorigottlieb.com/books/maybe-you-should-talk-to-someone/',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
    category: 'Therapy & Growth',
    type: 'book'
  },
  {
    id: 'b3',
    title: 'Set Boundaries, Find Peace',
    author: 'Nedra Glover Tawwab',
    description: 'A guide to reclaiming yourself through healthy boundary-setting and emotional safety.',
    link: 'https://www.nedratawwab.com/set-boundaries-find-peace',
    cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
    category: 'Boundaries & Relationships',
    type: 'book'
  }
];

export const VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'Understanding the Window of Tolerance',
    presenter: 'Trauma Informed Care Initiative',
    description: 'Learn how nervous system regulation and grounding techniques restore emotional equilibrium during acute distress.',
    duration: '11 min',
    thumbnail: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?w=800',
    link: 'https://www.youtube.com/watch?v=Wcm-1FBrWuI',
    category: 'Nervous System Regulation',
    type: 'video'
  },
  {
    id: 'v2',
    title: 'Somatic Grounding & Box Breathing',
    presenter: 'SafeHaven Listening Collective',
    description: 'A quiet, guided somatic audio-visual exercise designed to de-escalate panic attacks and hyperarousal.',
    duration: '5 min',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    link: 'https://www.youtube.com/watch?v=tEmt1Znux58',
    category: 'Grounding Exercises',
    type: 'video'
  }
];

export const ORGANIZATIONS = [
  {
    id: 'org-1',
    name: 'Befrienders Kenya',
    category: 'Crisis Intervention',
    description: 'Non-profit providing free, confidential emotional support and suicide prevention services across Kenya via 24/7 hotline.',
    link: 'https://befrienderskenya.org'
  },
  {
    id: 'org-2',
    name: 'FIDA Kenya',
    category: 'Psychosocial & Legal Aid',
    description: 'Premier women’s rights organization offering free trauma counselling and legal support to survivors of domestic violence.',
    link: 'https://fidakenya.org'
  },
  {
    id: 'org-3',
    name: 'Basic Needs Basic Rights Kenya',
    category: 'Community Mental Health',
    description: 'Pioneering community-based mental health advocacy, clinic referrals, and peer reintegration across Kenya.',
    link: 'https://basicneeds-kenya.org'
  },
  {
    id: 'org-4',
    name: 'Chiromo Hospital Group Crisis Unit',
    category: 'Clinical Behavioral Health',
    description: 'Leading psychiatric healthcare facility in Nairobi providing emergency mental healthcare and in-patient support.',
    link: 'https://chiromohg.co.ke'
  }
];

export const QUOTES: Quote[] = [{ id: 'q1', text: "Just take the first step.", author: "MLK Jr.", category: "Hope", type: "quote" }];

export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: '1',
    author: 'HopefulNairobi',
    title: 'Feeling overwhelmed lately',
    body: 'Work has been really stressful and I feel like I cannot catch a break. Anyone else feel this way?',
    category: 'Anxiety & Stress',
    hugs: 5,
    date: '2026-09-02T10:00:00Z',
  }
];

export const DAILY_POLL: Poll = {
  id: 'poll-1',
  question: "What is your main goal for this week?",
  totalVotes: 0,
  options: [
    { id: '1', text: 'Improve my sleep schedule', votes: 0 },
    { id: '2', text: 'Talk to a friend', votes: 0 },
    { id: '3', text: 'Exercise more', votes: 0 },
    { id: '4', text: 'Just survive', votes: 0 }
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