import { db } from './database/db.ts';
import { users } from '../shared/schema.ts';

async function checkUsers() {
  try {
    const allUsers = await db.select().from(users);
    console.log('Users in database:');
    allUsers.forEach(user => {
      console.log(`- ID: ${user.id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.isActive}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkUsers();