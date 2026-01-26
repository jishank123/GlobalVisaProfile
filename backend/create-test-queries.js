const mongoose = require('mongoose');
const Query = require('./models/Query');
const Client = require('./models/Client');
const User = require('./models/User');
require('dotenv').config();

async function createTestQueries() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a CRM manager and their clients
    const crmManager = await User.findOne({ role: 'crm_manager' });
    if (!crmManager) {
      console.log('❌ No CRM manager found. Creating one...');
      const newCrmManager = await User.create({
        email: 'crm@manager.com',
        password: 'hashedpassword',
        role: 'crm_manager',
        first_name: 'Emily',
        last_name: 'Roberts',
        status: 'active'
      });
      console.log('✅ CRM manager created:', newCrmManager.email);
    }

    // Find clients assigned to CRM manager
    let clients = await Client.find({ crm_manager: crmManager._id });
    
    if (clients.length === 0) {
      console.log('❌ No clients assigned to CRM manager. Creating test clients...');
      
      // Create test clients
      const testClients = [
        {
          name: 'Dr. Sarah Mitchell',
          email: 'sarah.mitchell@stanford.edu',
          university: 'Stanford University',
          status: 'active',
          crm_manager: crmManager._id,
          phone: '+1-650-555-0143'
        },
        {
          name: 'Prof. James Chen',
          email: 'james.chen@mit.edu',
          university: 'MIT',
          status: 'active',
          crm_manager: crmManager._id,
          phone: '+1-617-555-0198'
        },
        {
          name: 'Dr. Priya Patel',
          email: 'priya.patel@oxford.ac.uk',
          university: 'Oxford University',
          status: 'vip',
          crm_manager: crmManager._id,
          phone: '+44-1865-555-0234'
        }
      ];
      
      clients = await Client.insertMany(testClients);
      console.log('✅ Test clients created:', clients.length);
    }

    // Create test queries
    const testQueries = [
      {
        client: clients[0]._id,
        assignedTo: crmManager._id,
        subject: 'Project Timeline Question',
        description: 'Hi Emily, can we schedule a call to discuss the publication timeline? I have a conference deadline coming up and need to expedite the review process.',
        category: 'Project',
        priority: 'high',
        status: 'open'
      },
      {
        client: clients[1]._id,
        assignedTo: crmManager._id,
        subject: 'Payment Status Inquiry',
        description: 'I made the payment yesterday but haven\'t received confirmation. Can you check the status?',
        category: 'Billing',
        priority: 'medium',
        status: 'open'
      },
      {
        client: clients[2]._id,
        assignedTo: crmManager._id,
        subject: 'Document Upload Issue',
        description: 'I\'m trying to upload additional research data but getting an error. File size is about 50MB. Is there a limit?',
        category: 'Technical',
        priority: 'low',
        status: 'in_progress',
        responses: [{
          user: crmManager._id,
          message: 'Hi Dr. Patel, the file size limit is 100MB. Can you try uploading again? If it still fails, please let me know the exact error message.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          isInternal: false
        }]
      },
      {
        client: clients[0]._id,
        assignedTo: crmManager._id,
        subject: 'Additional Service Request',
        description: 'I would like to add profile building services to my current package. What are the options available?',
        category: 'General',
        priority: 'medium',
        status: 'open'
      },
      {
        client: clients[1]._id,
        assignedTo: crmManager._id,
        subject: 'Meeting Reschedule',
        description: 'I need to reschedule our meeting tomorrow due to a conference call conflict. Are you available on Friday afternoon?',
        category: 'General',
        priority: 'medium',
        status: 'resolved',
        resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    // Clear existing queries for clean test
    await Query.deleteMany({ assignedTo: crmManager._id });
    console.log('🧹 Cleared existing test queries');

    // Create new queries
    const createdQueries = await Query.insertMany(testQueries);
    console.log('✅ Test queries created:', createdQueries.length);

    // Display summary
    console.log('\n📊 Test Data Summary:');
    console.log(`👤 CRM Manager: ${crmManager.first_name} ${crmManager.last_name} (${crmManager.email})`);
    console.log(`👥 Assigned Clients: ${clients.length}`);
    console.log(`❓ Queries Created: ${createdQueries.length}`);
    
    console.log('\n📋 Queries by Status:');
    const statusCounts = {};
    createdQueries.forEach(query => {
      statusCounts[query.status] = (statusCounts[query.status] || 0) + 1;
    });
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log('\n🎯 CRM Manager can now:');
    console.log('   - View assigned clients');
    console.log('   - See client queries');
    console.log('   - Respond to queries');
    console.log('   - Update query status');
    console.log('   - View client projects and payments');

  } catch (error) {
    console.error('❌ Error creating test queries:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
createTestQueries();