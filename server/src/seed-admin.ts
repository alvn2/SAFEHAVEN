import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  console.log('🌱 Seeding custom admin user...');

  const username = 'alvn';
  const plainPassword = 'Strong&#mighty1';
  
  try {
    const passwordHash = await bcrypt.hash(plainPassword, 12);
    
    const admin = await prisma.user.upsert({
      where: { username },
      update: {
        passphraseHash: passwordHash,
        role: 'ADMIN'
      },
      create: {
        username,
        passphraseHash: passwordHash,
        role: 'ADMIN'
      }
    });

    console.log(`✅ Success! User '${admin.username}' is now an ADMIN.`);
    console.log(`Password has been set to verify login.`);
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
