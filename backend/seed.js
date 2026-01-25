const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Lead = require('./models/Lead');
const Client = require('./models/Client');
const Project = require('./models/Project');
const Service = require('./models/Service');
const Payment = require('./models/Payment');
const Query = require('./models/Query');
const Document = require('./models/Document');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Helper function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const seedDatabase = async () => {
  try {
    console.log('🧹 Clearing existing data...');
    
    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    await Client.deleteMany({});
    await Project.deleteMany({});
    await Service.deleteMany({});
    await Payment.deleteMany({});
    await Query.deleteMany({});
    await Document.deleteMany({});
    
    console.log('✅ Existing data cleared');
    
    // ============================================
    // 1. CREATE USERS
    // ============================================
    console.log('👥 Creating users...');
    
    const hashedPassword = await hashPassword('password123');
    
    const users = await User.insertMany([
      {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@academicerp.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+1-555-0100',
        status: 'active'
      },
      {
        first_name: 'Sandeep',
        last_name: 'Kumar',
        email: 'sandeep@academicerp.com',
        password: hashedPassword,
        role: 'crm_manager',
        phone: '+1-555-0101',
        status: 'active'
      },
      {
        first_name: 'Preet',
        last_name: 'Singh',
        email: 'preet@academicerp.com',
        password: hashedPassword,
        role: 'crm_manager',
        phone: '+1-555-0102',
        status: 'active'
      },
      {
        first_name: 'Deepali',
        last_name: 'Sharma',
        email: 'deepali@academicerp.com',
        password: hashedPassword,
        role: 'crm_manager',
        phone: '+1-555-0103',
        status: 'active'
      },
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@academicerp.com',
        password: hashedPassword,
        role: 'lead_manager',
        phone: '+1-555-0104',
        status: 'active'
      },
      {
        first_name: 'Sarah',
        last_name: 'Wilson',
        email: 'sarah@academicerp.com',
        password: hashedPassword,
        role: 'lead_manager',
        phone: '+1-555-0105',
        status: 'active'
      }
    ]);
    
    const [admin, sandeep, preet, deepali, john, sarah] = users;
    console.log(`✅ Created ${users.length} users`);
    
    // ============================================
    // 2. CREATE SERVICES
    // ============================================
    console.log('📋 Creating services...');
    
    const services = await Service.insertMany([
      {
        name: 'Research Paper Publication',
        description: 'Complete assistance with research paper writing, editing, and journal publication support',
        category: 'Research',
        pricing: {
          type: 'range',
          minPrice: 2000,
          maxPrice: 5000,
          currency: 'USD'
        },
        duration: '4-8 weeks',
        features: [
          'Topic selection and research design',
          'Literature review',
          'Data analysis',
          'Paper writing and formatting',
          'Journal submission support',
          'Response to reviewers'
        ],
        isActive: true,
        popularity: 95
      },
      {
        name: 'Thesis/Dissertation Help',
        description: 'Comprehensive support for Masters and PhD thesis/dissertation writing',
        category: 'Writing',
        pricing: {
          type: 'range',
          minPrice: 5000,
          maxPrice: 15000,
          currency: 'USD'
        },
        duration: '3-6 months',
        features: [
          'Proposal writing',
          'Literature review',
          'Methodology design',
          'Data collection and analysis',
          'Chapter writing',
          'Formatting and editing',
          'Defense preparation'
        ],
        isActive: true,
        popularity: 90
      },
      {
        name: 'Grant Writing Services',
        description: 'Professional grant proposal writing for research funding',
        category: 'Writing',
        pricing: {
          type: 'range',
          minPrice: 3000,
          maxPrice: 8000,
          currency: 'USD'
        },
        duration: '2-4 weeks',
        features: [
          'Funding opportunity identification',
          'Proposal writing',
          'Budget preparation',
          'Abstract and summary',
          'Supporting documents'
        ],
        isActive: true,
        popularity: 75
      },
      {
        name: 'Conference Paper Assistance',
        description: 'Support for writing and presenting conference papers',
        category: 'Research',
        pricing: {
          type: 'range',
          minPrice: 1500,
          maxPrice: 3500,
          currency: 'USD'
        },
        duration: '2-3 weeks',
        features: [
          'Abstract writing',
          'Full paper development',
          'Formatting for conference guidelines',
          'Presentation slides',
          'Poster design'
        ],
        isActive: true,
        popularity: 80
      },
      {
        name: 'Literature Review',
        description: 'Comprehensive literature review for research projects',
        category: 'Research',
        pricing: {
          type: 'range',
          minPrice: 1000,
          maxPrice: 3000,
          currency: 'USD'
        },
        duration: '1-3 weeks',
        features: [
          'Database search',
          'Article screening',
          'Critical analysis',
          'Synthesis of findings',
          'Reference management'
        ],
        isActive: true,
        popularity: 85
      }
    ]);
    
    console.log(`✅ Created ${services.length} services`);
    
    // ============================================
    // 3. CREATE LEADS
    // ============================================
    console.log('🎯 Creating leads...');
    
    const universities = [
      'Stanford University', 'MIT', 'Harvard University', 'Oxford University',
      'Cambridge University', 'Yale University', 'Princeton University', 'Columbia University',
      'University of Chicago', 'Cal Tech', 'UC Berkeley', 'Cornell University',
      'University of Toronto', 'ETH Zurich', 'Imperial College London', 'UCL',
      'University of Melbourne', 'National University of Singapore', 'Tsinghua University', 'Peking University'
    ];
    
    const leads = [];
    for (let i = 0; i < 20; i++) {
      const statusOptions = ['new', 'contacted', 'qualified', 'negotiation', 'converted', 'lost'];
      const priorityOptions = ['low', 'medium', 'high'];
      const sourceOptions = ['website', 'referral', 'social_media', 'advertisement', 'event'];
      
      leads.push({
        firstName: `Lead${i + 1}`,
        lastName: `Student`,
        email: `lead${i + 1}@university.edu`,
        phone: `+1-555-${1000 + i}`,
        university: universities[i],
        country: i < 8 ? 'USA' : i < 12 ? 'UK' : i < 16 ? 'Canada' : 'Australia',
        degree: i % 3 === 0 ? 'PhD' : i % 3 === 1 ? 'Masters' : 'Bachelors',
        fieldOfStudy: i % 4 === 0 ? 'Computer Science' : i % 4 === 1 ? 'Engineering' : i % 4 === 2 ? 'Business' : 'Life Sciences',
        interestedServices: [services[i % 5]._id],
        status: statusOptions[i % 6],
        priority: priorityOptions[i % 3],
        source: sourceOptions[i % 5],
        estimatedValue: 2000 + (i * 500),
        notes: `Initial contact made. Interested in ${services[i % 5].name}`,
        assignedTo: i % 2 === 0 ? john._id : sarah._id,
        nextFollowUp: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
      });
    }
    
    const createdLeads = await Lead.insertMany(leads);
    console.log(`✅ Created ${createdLeads.length} leads`);
    
    // ============================================
    // 4. CREATE CLIENTS & CLIENT USERS
    // ============================================
    console.log('👤 Creating clients...');
    
    const clientUsers = [];
    const clients = [];
    
    for (let i = 0; i < 15; i++) {
      // Create user account for client
      const clientUser = await User.create({
        first_name: `Client`,
        last_name: `${i + 1}`,
        email: `client${i + 1}@email.com`,
        password: hashedPassword,
        role: 'client',
        phone: `+1-555-${2000 + i}`,
        status: 'active'
      });
      
      clientUsers.push(clientUser);
      
      // Create client profile
      const statusOptions = ['active', 'inactive', 'vip'];
      const manager = i % 3 === 0 ? sandeep : i % 3 === 1 ? preet : deepali;
      
      clients.push({
        user: clientUser._id,
        name: `Client ${i + 1}`,
        email: `client${i + 1}@email.com`,
        phone: `+1-555-${2000 + i}`,
        university: universities[i % 20],
        country: i < 5 ? 'USA' : i < 10 ? 'UK' : i < 13 ? 'Canada' : 'India',
        degree: i % 3 === 0 ? 'PhD' : i % 3 === 1 ? 'Masters' : 'Bachelors',
        fieldOfStudy: i % 4 === 0 ? 'Computer Science' : i % 4 === 1 ? 'Engineering' : i % 4 === 2 ? 'Business' : 'Life Sciences',
        status: statusOptions[i % 3],
        crm_manager: manager._id,
        totalSpent: (i + 1) * 3000,
        notes: `Active client. Assigned to ${manager.first_name} ${manager.last_name}`
      });
    }
    
    const createdClients = await Client.insertMany(clients);
    
    // Link client profile to user
    for (let i = 0; i < clientUsers.length; i++) {
      clientUsers[i].clientProfile = createdClients[i]._id;
      await clientUsers[i].save();
    }
    
    console.log(`✅ Created ${createdClients.length} clients`);
    
    // ============================================
    // 5. CREATE PROJECTS
    // ============================================
    console.log('📊 Creating projects...');
    
    const projects = [];
    for (let i = 0; i < 30; i++) {
      const client = createdClients[i % 15];
      const service = services[i % 5];
      const statusOptions = ['planning', 'in_progress', 'review', 'completed', 'on_hold'];
      const priorityOptions = ['low', 'medium', 'high', 'urgent'];
      
      const startDate = new Date(Date.now() - (60 - i) * 24 * 60 * 60 * 1000);
      const estimatedEndDate = new Date(startDate.getTime() + 45 * 24 * 60 * 60 * 1000);
      
      const status = statusOptions[i % 5];
      const progress = status === 'completed' ? 100 : status === 'in_progress' ? 50 + (i % 40) : status === 'review' ? 90 : status === 'planning' ? 10 : 30;
      
      projects.push({
        title: `${service.name} - Client ${(i % 15) + 1}`,
        description: `${service.name} project for ${client.name} from ${client.university}`,
        client: client._id,
        service: service._id,
        status: status,
        priority: priorityOptions[i % 4],
        startDate: startDate,
        estimatedEndDate: estimatedEndDate,
        actualEndDate: status === 'completed' ? new Date(estimatedEndDate.getTime() - 5 * 24 * 60 * 60 * 1000) : null,
        progress: progress,
        budget: service.pricing.minPrice + ((service.pricing.maxPrice - service.pricing.minPrice) * (i % 3) / 2),
        assignedTeam: [client.assignedManager],
        createdBy: i % 2 === 0 ? sandeep._id : preet._id,
        milestones: [
          {
            title: 'Project Initiation',
            description: 'Initial consultation and requirement gathering',
            dueDate: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
            status: progress >= 25 ? 'completed' : 'in_progress',
            completedAt: progress >= 25 ? new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000) : null
          },
          {
            title: 'Research & Planning',
            description: 'Literature review and methodology design',
            dueDate: new Date(startDate.getTime() + 20 * 24 * 60 * 60 * 1000),
            status: progress >= 50 ? 'completed' : progress >= 25 ? 'in_progress' : 'pending',
            completedAt: progress >= 50 ? new Date(startDate.getTime() + 19 * 24 * 60 * 60 * 1000) : null
          },
          {
            title: 'Draft Submission',
            description: 'First draft completion',
            dueDate: new Date(startDate.getTime() + 35 * 24 * 60 * 60 * 1000),
            status: progress >= 75 ? 'completed' : progress >= 50 ? 'in_progress' : 'pending',
            completedAt: progress >= 75 ? new Date(startDate.getTime() + 34 * 24 * 60 * 60 * 1000) : null
          },
          {
            title: 'Final Delivery',
            description: 'Final document with all revisions',
            dueDate: estimatedEndDate,
            status: progress === 100 ? 'completed' : progress >= 75 ? 'in_progress' : 'pending',
            completedAt: progress === 100 ? new Date(estimatedEndDate.getTime() - 2 * 24 * 60 * 60 * 1000) : null
          }
        ]
      });
    }
    
    const createdProjects = await Project.insertMany(projects);
    console.log(`✅ Created ${createdProjects.length} projects`);
    
    // ============================================
    // 6. CREATE PAYMENTS
    // ============================================
    console.log('💰 Creating payments...');
    
    const payments = [];
    for (let i = 0; i < 40; i++) {
      const project = createdProjects[i % 30];
      const statusOptions = ['completed', 'pending', 'failed'];
      const methodOptions = ['credit_card', 'bank_transfer', 'paypal', 'stripe'];
      
      const paymentStatus = i < 30 ? statusOptions[i % 3] : 'pending';
      const amount = project.budget / (i % 3 + 1); // Split into installments
      
      payments.push({
        client: project.client,
        project: project._id,
        amount: amount,
        currency: 'USD',
        status: paymentStatus,
        paymentMethod: methodOptions[i % 4],
        transactionId: paymentStatus === 'completed' ? `TXN-${Date.now()}-${i}` : undefined,
        paymentDate: new Date(project.startDate.getTime() + (i % 3) * 15 * 24 * 60 * 60 * 1000),
        dueDate: new Date(project.startDate.getTime() + (i % 3 + 1) * 15 * 24 * 60 * 60 * 1000),
        notes: `Payment ${(i % 3) + 1} for ${project.title}`,
        invoice: {
          invoiceNumber: `INV-2024-${1000 + i}`,
          invoiceUrl: `/documents/invoices/INV-2024-${1000 + i}.pdf`
        }
      });
    }
    
    const createdPayments = await Payment.insertMany(payments);
    console.log(`✅ Created ${createdPayments.length} payments`);
    
    // ============================================
    // 7. CREATE QUERIES
    // ============================================
    console.log('❓ Creating queries...');
    
    const queries = [];
    for (let i = 0; i < 15; i++) {
      const client = createdClients[i];
      const statusOptions = ['open', 'in_progress', 'waiting', 'resolved', 'closed'];
      const priorityOptions = ['low', 'medium', 'high', 'urgent'];
      const categoryOptions = ['General', 'Technical', 'Billing', 'Project', 'Complaint'];
      
      const status = statusOptions[i % 5];
      const responses = [];
      
      if (status !== 'open') {
        responses.push({
          user: client.assignedManager,
          message: 'Thank you for reaching out. We are looking into your query and will get back to you shortly.',
          timestamp: new Date(Date.now() - (14 - i) * 24 * 60 * 60 * 1000),
          isInternal: false
        });
      }
      
      if (status === 'resolved' || status === 'closed') {
        responses.push({
          user: client.assignedManager,
          message: 'Your issue has been resolved. Please let us know if you need any further assistance.',
          timestamp: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000),
          isInternal: false
        });
      }
      
      queries.push({
        client: client._id,
        assignedTo: client.assignedManager,
        subject: `Query about ${categoryOptions[i % 5]} - ${i + 1}`,
        description: `I have a question regarding ${categoryOptions[i % 5].toLowerCase()} matter. Could you please assist me with this?`,
        category: categoryOptions[i % 5],
        priority: priorityOptions[i % 4],
        status: status,
        responses: responses,
        resolvedAt: status === 'resolved' || status === 'closed' ? new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000) : null,
        closedAt: status === 'closed' ? new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000) : null
      });
    }
    
    const createdQueries = await Query.insertMany(queries);
    console.log(`✅ Created ${createdQueries.length} queries`);
    
    // ============================================
    // 8. CREATE DOCUMENTS
    // ============================================
    console.log('📄 Creating documents...');
    
    const documents = [];
    for (let i = 0; i < 25; i++) {
      const project = createdProjects[i % 30];
      const categoryOptions = ['Contract', 'Proposal', 'Report', 'Invoice', 'Research', 'Submission'];
      const fileTypeOptions = ['pdf', 'doc', 'docx'];
      const statusOptions = ['draft', 'review', 'approved', 'archived'];
      
      documents.push({
        client: project.client,
        project: project._id,
        name: `${categoryOptions[i % 6]} - ${project.title}`,
        description: `${categoryOptions[i % 6]} document for project`,
        fileUrl: `/uploads/documents/${categoryOptions[i % 6].toLowerCase()}-${i + 1}.pdf`,
        fileType: fileTypeOptions[i % 3],
        fileSize: 1024 * 1024 * (1 + i % 5), // 1-5 MB
        category: categoryOptions[i % 6],
        uploadedBy: project.createdBy,
        status: statusOptions[i % 4],
        version: i % 3 + 1,
        isConfidential: i % 4 === 0,
        downloadCount: i * 2
      });
    }
    
    const createdDocuments = await Document.insertMany(documents);
    console.log(`✅ Created ${createdDocuments.length} documents`);
    
    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('✅ DATABASE SEEDED SUCCESSFULLY');
    console.log('='.repeat(50));
    console.log('\n📊 SUMMARY:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`      - Admin: 1`);
    console.log(`      - CRM Managers: 3 (Sandeep, Preet, Deepali)`);
    console.log(`      - Lead Managers: 2`);
    console.log(`      - Clients: ${clientUsers.length}`);
    console.log(`   📋 Services: ${services.length}`);
    console.log(`   🎯 Leads: ${createdLeads.length}`);
    console.log(`   👤 Clients: ${createdClients.length}`);
    console.log(`   📊 Projects: ${createdProjects.length}`);
    console.log(`   💰 Payments: ${createdPayments.length}`);
    console.log(`   ❓ Queries: ${createdQueries.length}`);
    console.log(`   📄 Documents: ${createdDocuments.length}`);
    console.log('\n🔐 DEFAULT LOGIN CREDENTIALS:');
    console.log('   Admin:');
    console.log('      Email: admin@academicerp.com');
    console.log('      Password: password123');
    console.log('\n   CRM Managers:');
    console.log('      Email: sandeep@academicerp.com | Password: password123');
    console.log('      Email: preet@academicerp.com | Password: password123');
    console.log('      Email: deepali@academicerp.com | Password: password123');
    console.log('\n   Lead Managers:');
    console.log('      Email: john@academicerp.com | Password: password123');
    console.log('      Email: sarah@academicerp.com | Password: password123');
    console.log('\n   Clients:');
    console.log('      Email: client1@email.com | Password: password123');
    console.log('      Email: client2@email.com | Password: password123');
    console.log('      ... (client1 to client15)');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedDatabase();
