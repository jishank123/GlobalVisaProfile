const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academic_erp')
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  // Check if we have any profile assessments
  const ProfileAssessment = require('./backend/models/ProfileAssessment');
  const ClientAccount = require('./backend/models/ClientAccount');
  
  const assessments = await ProfileAssessment.find({}).limit(5);
  console.log('📊 Total assessments in DB:', await ProfileAssessment.countDocuments());
  console.log('📊 Sample assessments:', assessments.map(a => ({
    id: a._id,
    email: a.client_email,
    name: a.client_name,
    score: a.overall_score,
    created: a.createdAt
  })));
  
  // Check client accounts
  const clients = await ClientAccount.find({}).limit(5);
  console.log('👥 Total client accounts:', await ClientAccount.countDocuments());
  console.log('👥 Sample clients:', clients.map(c => ({
    id: c._id,
    email: c.email,
    name: c.full_name,
    created: c.createdAt
  })));
  
  // Check if any assessments match client emails
  if (clients.length > 0 && assessments.length > 0) {
    const clientEmails = clients.map(c => c.email);
    const matchingAssessments = await ProfileAssessment.find({ 
      client_email: { $in: clientEmails } 
    });
    console.log('🔗 Matching assessments for clients:', matchingAssessments.length);
    matchingAssessments.forEach(a => {
      console.log('  ✅ Match:', a.client_email, '- Score:', a.overall_score, '- ID:', a._id);
    });
    
    // Test the specific query that the API uses
    if (clients.length > 0) {
      const testClient = clients[0];
      console.log('\n🧪 Testing API query for client:', testClient.email);
      const clientAssessments = await ProfileAssessment.find({ 
        client_email: testClient.email 
      }).sort({ createdAt: -1 });
      console.log('🧪 Found assessments for this client:', clientAssessments.length);
      clientAssessments.forEach(a => {
        console.log('  📋 Assessment:', a._id, '- Score:', a.overall_score);
      });
    }
  }
  
  process.exit(0);
})
.catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});