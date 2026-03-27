import { prisma } from './db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding SafeHaven database...\n');

  // --- Admin User ---
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passphraseHash: adminPassword,
      role: 'ADMIN'
    }
  });
  console.log(`✅ Admin user created: ${admin.username} (password: admin123)`);

  // --- Demo Seeker ---
  const seekerPassword = await bcrypt.hash('seeker123', 12);
  const seeker = await prisma.user.upsert({
    where: { username: 'demo_seeker' },
    update: {},
    create: {
      username: 'demo_seeker',
      passphraseHash: seekerPassword,
      role: 'USER'
    }
  });
  console.log(`✅ Seeker user created: ${seeker.username} (password: seeker123)`);

  // --- Volunteer User ---
  const volPassword = await bcrypt.hash('volunteer123', 12);
  const volUser = await prisma.user.upsert({
    where: { username: 'dr_amina' },
    update: {},
    create: {
      username: 'dr_amina',
      passphraseHash: volPassword,
      role: 'VOLUNTEER_APPROVED'
    }
  });

  // --- Volunteer Profile ---
  await prisma.volunteerProfile.upsert({
    where: { userId: volUser.id },
    update: {},
    create: {
      userId: volUser.id,
      track: 'PROFESSIONAL',
      name: 'Dr. Amina Wanjiku',
      photo: 'https://ui-avatars.com/api/?name=Amina+Wanjiku&background=random',
      role: 'licensed',
      qualification: 'PhD Clinical Psychology – University of Nairobi',
      topics: ['Anxiety', 'Depression', 'Trauma', 'Grief'],
      location: 'Nairobi, Kenya',
      whatsapp: '+254700000001',
      telegram: 'DrAminaHelp',
      languages: ['English', 'Swahili'],
      isOnline: true,
      verified: true,
      bio: 'Over 15 years of experience specializing in trauma-informed care for survivors of domestic violence and abuse. Committed to creating safe spaces for healing.',
      views: 342,
      chats: 127
    }
  });
  console.log(`✅ Volunteer profile created: Dr. Amina Wanjiku`);

  // --- Second Volunteer ---
  const vol2Password = await bcrypt.hash('volunteer123', 12);
  const vol2User = await prisma.user.upsert({
    where: { username: 'brian_kipkoech' },
    update: {},
    create: {
      username: 'brian_kipkoech',
      passphraseHash: vol2Password,
      role: 'VOLUNTEER_APPROVED'
    }
  });

  await prisma.volunteerProfile.upsert({
    where: { userId: vol2User.id },
    update: {},
    create: {
      userId: vol2User.id,
      track: 'PEER_LISTENER',
      name: 'Brian Kipkoech',
      photo: 'https://ui-avatars.com/api/?name=Brian+Kipkoech&background=random',
      role: 'intern',
      qualification: 'MSc Counselling Psychology – Kenyatta University',
      topics: ['Youth Support', 'Self-Harm', 'Relationship Issues'],
      location: 'Eldoret, Kenya',
      whatsapp: '+254700000002',
      languages: ['English', 'Swahili', 'Kalenjin'],
      isOnline: false,
      verified: true,
      bio: 'Passionate about supporting young people through difficult times. Trained in crisis intervention and cognitive behavioral therapy.',
      views: 89,
      chats: 34
    }
  });
  console.log(`✅ Volunteer profile created: Brian Kipkoech`);

  // --- Forum Posts ---
  const forumPosts = [
    { author: 'HopefulHeart', title: 'Finding Strength in Small Steps', body: 'Today I managed to go for a walk after weeks of staying indoors. It felt like a huge achievement. Sometimes healing isn\'t linear, and that\'s okay. I hope this encourages someone else who is struggling.', category: 'Recovery Stories', hugs: 24 },
    { author: 'QuietWarrior', title: 'How do you deal with flashbacks?', body: 'I\'ve been having vivid flashbacks lately, especially at night. Has anyone found techniques that help? My therapist suggested grounding exercises but I\'d love to hear what works for others.', category: 'Coping Strategies', hugs: 18 },
    { author: 'SunriseKE', title: 'Free counselling resources in Nairobi', body: 'I wanted to share some free resources I\'ve found: Befrienders Kenya (0722 178 177), FIDA Kenya for legal aid, and the Gender Violence Recovery Centre at Kenyatta National Hospital. Stay safe everyone.', category: 'Resources', hugs: 45 },
    { author: 'AnonymousSurvivor', title: 'I left today', body: 'After three years, I finally gathered the courage to leave. I\'m scared but I know this is the right decision. Thank you to this community for giving me hope.', category: 'Recovery Stories', hugs: 89, isTriggering: true },
  ];

  for (const post of forumPosts) {
    await prisma.forumPost.create({ data: { ...post, isTriggering: post.isTriggering || false, isFlagged: false } });
  }
  console.log(`✅ ${forumPosts.length} forum posts seeded`);

  // --- Resources (Articles) ---
  const articles = [
    { type: 'ARTICLE', title: 'Understanding Trauma Responses', description: 'Trauma can manifest in many ways — fight, flight, freeze, or fawn. Understanding your response patterns is the first step to healing. This article explores each response and provides evidence-based coping strategies.', category: 'Mental Health', imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800', readTime: 7 },
    { type: 'ARTICLE', title: 'Safety Planning: A Practical Guide', description: 'A safety plan is a personalized, practical plan that can help you avoid dangerous situations and prepare for the best way to react if you find yourself in one. Here\'s how to create yours step by step.', category: 'Safety', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', readTime: 5 },
    { type: 'ARTICLE', title: 'Legal Rights for Survivors in Kenya', description: 'The Protection Against Domestic Violence Act (2015) provides comprehensive protection. Learn about your rights, how to obtain protection orders, and the legal resources available to survivors in Kenya.', category: 'Legal', imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800', readTime: 10 },
  ];

  for (const article of articles) {
    await prisma.resource.create({ data: article });
  }
  console.log(`✅ ${articles.length} articles seeded`);

  // --- Group Chat ---
  const groupChat = await prisma.conversation.create({
    data: {
      type: 'group',
      name: 'Nairobi Anxiety Support',
      avatar: 'https://ui-avatars.com/api/?name=Anxiety+Support&background=random',
      lastMessage: 'Welcome to the group. This is a safe space.',
      lastMessageAt: new Date()
    }
  });
  console.log(`✅ Group chat created: ${groupChat.name}`);

  console.log('\n🎉 Seeding complete!');
}

seed()
  .catch(e => { console.error('Seeding failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
