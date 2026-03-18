const mongoose = require('mongoose');
const path = require('path');

// Load environment variables FIRST
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

async function testUsersAPI() {
  try {
    console.log('🧪 === TESTING USERS API LOGIC ===');
    
    // Simulate the getUsers logic for role=client
    const role = 'client';
    const targetRoles = [role];
    
    // Get all users
    const allUsers = await User.find({}).select('-password');
    console.log(`📊 Total users found: ${allUsers.length}`);
    
    // Filter by role using decryption
    const encryption = require('../middleware/encryptionMiddleware');
    const roleFilteredUsers = allUsers.filter(user => {
      try {
        const decryptedRole = encryption.decrypt(user.role);
        const matches = targetRoles.includes(decryptedRole);
        if (matches) {
          console.log('✅ User matched:', user.email, 'Role:', decryptedRole);
        }
        return matches;
      } catch (error) {
        // If decryption fails, check if it's already plain text
        const matches = targetRoles.includes(user.role);
        if (matches) {
          console.log('✅ User matched (plain):', user.email, 'Role:', user.role);
        }
        return matches;
      }
    });
    
    console.log(`📊 Users after role filter: ${roleFilteredUsers.length}`);
    
    // Exclude deleted users
    const finalUsers = roleFilteredUsers.filter(user => {
      try {
        const decryptedStatus = encryption.decrypt(user.status);
        return decryptedStatus !== 'deleted';
      } catch (error) {
        return user.status !== 'deleted';
      }
    });
    
    console.log(`📊 Final users (excluding deleted): ${finalUsers.length}`);
    
    // Convert to display format
    const displayUsers = finalUsers.map(user => {
      try {
        return encryption.decryptDocument(user.toObject());
      } catch (error) {
        return user.toObject();
      }
    });
    
    console.log('\n👤 Final user data:');
    displayUsers.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name}`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Role: ${user.role}`);
      console.log(`    Status: ${user.status}`);
      console.log(`    Created: ${user.createdAt}`);
      console.log('');
    });
    
    console.log('🧪 === TEST COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    mongoose.connection.close();
  }
}

testUsersAPI();