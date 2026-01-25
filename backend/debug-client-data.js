// Debug client data relationships
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const ClientAccount = require('./models/ClientAccount');
const Client = require('./models/Client');
const Project = require('./models/Project');
const Payment = require('./models/Payment');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

const debugClientData = async () => {
  try {
    console.log('🔍 === DEBUGGING CLIENT DATA RELATIONSHIPS ===\n');
    
    // Find client account
    const clientAccount = await ClientAccount.findOne({ email: 'client@test.com' });
    console.log('👤 Client Account:', {
      id: clientAccount?._id,
      email: clientAccount?.email,
      name: clientAccount?.full_name
    });
    
    // Find client record
    const client = await Client.findOne({ email: 'client@test.com' });
    console.log('🏢 Client Record:', {
      id: client?._id,
      name: client?.name,
      email: client?.email,
      crm_manager: client?.crm_manager
    });
    
    // Find user record
    const user = await User.findOne({ email: 'client@test.com' });
    console.log('👥 User Record:', {
      id: user?._id,
      email: user?.email,
      role: user?.role,
      name: user?.first_name + ' ' + user?.last_name
    });
    
    // Find projects for this client
    if (client) {
      const projects = await Project.find({ client: client._id });
      console.log('📊 Projects for client:', projects.length);
      projects.forEach(project => {
        console.log('  -', project.project_id, project.service_name, project.status);
      });
      
      // Find payments for this client
      const payments = await Payment.find({ client: client._id });
      console.log('💳 Payments for client:', payments.length);
      payments.forEach(payment => {
        console.log('  -', payment.invoice?.invoiceNumber, payment.amount, payment.status);
      });
    }
    
    console.log('\n🔍 === DEBUGGING COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

debugClientData();