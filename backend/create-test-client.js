// Script to create test client data
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const ClientAccount = require('./models/ClientAccount');
const Client = require('./models/Client');
const Project = require('./models/Project');
const Payment = require('./models/Payment');
const Service = require('./models/Service');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

const createTestClient = async () => {
  try {
    console.log('👤 === CREATING TEST CLIENT DATA ===\n');
    
    // Check if client account already exists
    let clientAccount = await ClientAccount.findOne({ email: 'client@test.com' });
    
    if (!clientAccount) {
      console.log('📝 Creating client account...');
      clientAccount = await ClientAccount.create({
        full_name: 'Dr. Sarah Mitchell',
        email: 'client@test.com',
        phone: '+1-650-555-0143',
        password_hash: 'client123', // Will be hashed by pre-save middleware
        email_verified: true,
        account_status: 'active',
        source: 'website'
      });
      console.log('✅ Client account created:', clientAccount._id);
    } else {
      console.log('✅ Client account already exists:', clientAccount._id);
    }
    
    // Check if client record exists
    let client = await Client.findOne({ email: 'client@test.com' });
    
    if (!client) {
      console.log('📝 Creating client record...');
      
      // Get a CRM manager to assign
      const crmManager = await User.findOne({ role: 'crm_manager' });
      
      client = await Client.create({
        name: 'Dr. Sarah Mitchell',
        email: 'client@test.com',
        phone: '+1-650-555-0143',
        university: 'Stanford University',
        status: 'active',
        crm_manager: crmManager ? crmManager._id : null,
        satisfaction_rating: 4.9,
        notes: 'VIP client with excellent payment history'
      });
      console.log('✅ Client record created:', client._id);
    } else {
      console.log('✅ Client record already exists:', client._id);
    }
    
    // Get services for projects
    const services = await Service.find({}).limit(3);
    if (services.length === 0) {
      console.log('❌ No services found. Please run seed script first.');
      return;
    }
    
    // Create test projects
    console.log('📊 Creating test projects...');
    
    const projectsData = [
      {
        project_id: 'PRJ-2025-001',
        client: client._id,
        service: services[0]._id,
        service_name: services[0].name,
        status: 'active',
        progress: 75,
        priority: 'high',
        amount: 5500,
        paid_amount: 2750,
        start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        assigned_to: client.crm_manager,
        description: 'Assistance with publishing research paper in top-tier journal'
      },
      {
        project_id: 'PRJ-2025-002',
        client: client._id,
        service: services[1]._id,
        service_name: services[1].name,
        status: 'active',
        progress: 45,
        priority: 'medium',
        amount: 8000,
        paid_amount: 4000,
        start_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        assigned_to: client.crm_manager,
        description: 'NSF grant proposal preparation and submission'
      },
      {
        project_id: 'PRJ-2025-003',
        client: client._id,
        service: services[2]._id,
        service_name: services[2].name,
        status: 'completed',
        progress: 100,
        priority: 'low',
        amount: 3200,
        paid_amount: 3200,
        start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        completion_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        assigned_to: client.crm_manager,
        description: 'Preparation of conference paper for IEEE conference'
      }
    ];
    
    // Clear existing projects for this client
    await Project.deleteMany({ client: client._id });
    
    const projects = await Project.insertMany(projectsData);
    console.log(`✅ Created ${projects.length} test projects`);
    
    // Create test payments
    console.log('💳 Creating test payments...');
    
    const paymentsData = [
      {
        client: client._id,
        project: projects[0]._id,
        amount: 2750,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'credit_card',
        transactionId: 'TXN-2025-001',
        paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        invoice: {
          invoiceNumber: 'INV-2025-001'
        }
      },
      {
        client: client._id,
        project: projects[1]._id,
        amount: 4000,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-2025-002',
        paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        invoice: {
          invoiceNumber: 'INV-2025-002'
        }
      },
      {
        client: client._id,
        project: projects[0]._id,
        amount: 2750,
        currency: 'USD',
        status: 'pending',
        paymentMethod: 'credit_card',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        invoice: {
          invoiceNumber: 'INV-2025-003'
        }
      },
      {
        client: client._id,
        project: projects[2]._id,
        amount: 3200,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'credit_card',
        transactionId: 'TXN-2025-003',
        paymentDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
        invoice: {
          invoiceNumber: 'INV-2025-004'
        }
      }
    ];
    
    // Clear existing payments for this client
    await Payment.deleteMany({ client: client._id });
    
    const payments = await Payment.insertMany(paymentsData);
    console.log(`✅ Created ${payments.length} test payments`);
    
    // Summary
    console.log('\n📊 === TEST CLIENT DATA SUMMARY ===');
    console.log('👤 Client Account:', clientAccount.email);
    console.log('🏢 Client Record:', client.name);
    console.log('📊 Projects:', projects.length);
    console.log('💳 Payments:', payments.length);
    console.log('💰 Total Paid:', payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0));
    console.log('⏳ Pending Amount:', payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0));
    
    console.log('\n🎯 === TEST CLIENT READY ===');
    console.log('🔐 Login credentials: client@test.com / client123');
    console.log('🌐 Access at: http://localhost:3000/client-profile');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createTestClient();