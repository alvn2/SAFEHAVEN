import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedVolunteerForAdmin() {
  console.log('🌱 Seeding volunteer profile for admin user...');

  const username = 'alvn';
  
  try {
    const admin = await prisma.user.findUnique({ where: { username } });
    if (!admin) {
        console.error('Admin user not found!');
        return;
    }

    await prisma.volunteerProfile.upsert({
      where: { userId: admin.id },
      update: {
        track: 'PEER_LISTENER',
        name: 'Admin Alvn',
        role: 'listener',
        qualification: 'Platform Admin & Peer Listener',
        topics: ['General Support', 'Platform Help'],
        location: 'Global',
        whatsapp: '+1234567890',
        languages: ['English'],
        isOnline: true,
        verified: true,
        bio: 'I am the platform administrator and a verified peer listener!',
      },
      create: {
        userId: admin.id,
        track: 'PEER_LISTENER',
        name: 'Admin Alvn',
        photo: 'https://ui-avatars.com/api/?name=Admin+Alvn&background=random',
        role: 'listener',
        qualification: 'Platform Admin & Peer Listener',
        topics: ['General Support', 'Platform Help'],
        location: 'Global',
        whatsapp: '+1234567890',
        languages: ['English'],
        isOnline: true,
        verified: true,
        bio: 'I am the platform administrator and a verified peer listener!',
      }
    });

    console.log(`✅ Success! Volunteer Profile created for '${admin.username}'. You can now use the Care Dashboard!`);
  } catch (error) {
    console.error('❌ Failed to seed volunteer profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedVolunteerForAdmin();
