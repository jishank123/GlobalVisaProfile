// Script to create/update test users with correct credentials
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

const createTestUsers = async () => {
  try {
    console.log('👥 === CREATING/UPDATING TEST USERS ===\n');
    
    // Hash password function
    const hashPassword = async (password) => {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    };
    
    // Test users with correct credentials
    const testUsers = [
      { 
        email: 'admin@gmail.com', 
        password: 'admin@#A', 
        role: 'admin', 
        name: 'Admin User',
        first_name: 'Admin',
        last_name: 'User'
      },
      { 
        email: 'lead@manager.com', 
        password: 'manager123', 
        role: 'lead_manager', 
        name: 'Lead Manager',
        first_name: 'Lead',
        last_name: 'Manager'
      },
      { 
        email: 'crm@manager.com', 
        password: 'crm123', 
        role: 'crm_manager', 
        name: 'CRM Manager',
        first_name: 'CRM',
        last_name: 'Manager'
      },
      { 
        email: 'client@test.com', 
        password: 'client123', 
        role: 'client', 
        name: 'Test Client',
        first_name: 'Test',
        last_name: 'Client'
      }
    ];
    
    for (const userData of testUsers) {
      console.log(`🔧 Processing user: ${userData.email}`);
      
      const hashedPassword = await hashPassword(userData.password);
      
      // Update or create user
      const result = await User.findOneAndUpdate(
        { email: userData.email },
        {
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          name: userData.name,
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: userData.name,
          isActive: true,
          phone: '+1-555-0000'
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
      
      console.log(`   ✅ User ${result.isNew ? 'created' : 'updated'} successfully`);
    }
    
    console.log('\n🎯 Dashboard Routes:');
    console.log('🛡️ Admin → /admin (2-admin-dashboard.html)');
    console.log('👨‍💼 Lead Manager → /lead-manager (1-lead-manager.html)');
    console.log('👩‍💼 CRM Manager → /crm-manager (4-crm-manager.html)');
    console.log('👤 Client → /client-profile (3-client-profile.html)');
    
    console.log('\n✅ === ROLE-BASED USERS CREATED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createTestUsers();