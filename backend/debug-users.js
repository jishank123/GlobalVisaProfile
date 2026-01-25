// Debug users in database
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

const debugUsers = async () => {
  try {
    console.log('📊 === DEBUGGING USERS ===\n');
    
    // Find all users
    const users = await User.find({});
    console.log('📊 Total Users in database:', users.length);
    
    if (users.length > 0) {
      console.log('\n📊 Users:');
      users.forEach(user => {
        console.log(`  - ${user._id}: ${user.email} (${user.role}) - ${user.first_name} ${user.last_name}`);
      });
    }
    
    // Check for client@test.com specifically
    const testUser = await User.findOne({ email: 'client@test.com' });
    console.log('\n🔍 User for client@test.com:', testUser ? {
      id: testUser._id,
      email: testUser.email,
      role: testUser.role,
      name: `${testUser.first_name} ${testUser.last_name}`
    } : 'NOT FOUND');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

debugUsers();