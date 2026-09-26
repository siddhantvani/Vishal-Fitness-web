import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const createOrUpdateAdmin = async () => {
  try {
    console.log('--- Starting Admin Setup ---');
    
    const email = 'siddhantvani@gmail.com';
    const plainPassword = 'Siddhant@2026';
    
    // Hash password securely (match existing 10 rounds standard from auth.controller)
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log(`User ${email} already exists. Updating to ADMIN role and refreshing password...`);
      await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          passwordHash,
          isActive: true
        }
      });
      console.log('Admin account successfully updated!');
    } else {
      console.log(`User ${email} not found. Creating new ADMIN account...`);
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'ADMIN',
          firstName: 'Siddhant',
          lastName: 'Vani',
          isActive: true
        }
      });
      console.log('Admin account successfully created!');
    }
    
  } catch (error) {
    console.error('Error setting up admin account:', error);
  } finally {
    await prisma.$disconnect();
    console.log('--- Admin Setup Complete ---');
  }
};

createOrUpdateAdmin();
