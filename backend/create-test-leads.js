// Script to create test leads
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Lead = require('./models/Lead');
const User = require('./models/User');
const Service = require('./models/Service');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

const createTestLeads = async () => {
  try {
    console.log('🎯 === CREATING TEST LEADS ===\n');
    
    // Get lead manager user
    const leadManager = await User.findOne({ email: 'lead@manager.com' });
    if (!leadManager) {
      console.log('❌ Lead manager not found');
      return;
    }
    
    // Get services
    const services = await Service.find({}).limit(5);
    if (services.length === 0) {
      console.log('❌ No services found');
      return;
    }
    
    // Clear existing leads
    await Lead.deleteMany({});
    console.log('🧹 Cleared existing leads');
    
    const universities = [
      'Stanford University', 'MIT', 'Harvard University', 'Oxford University',
      'Cambridge University', 'Yale University', 'Princeton University', 'Columbia University',
      'University of Chicago', 'Cal Tech', 'UC Berkeley', 'Cornell University'
    ];
    
    const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France'];
    const degrees = ['PhD', 'Masters', 'Bachelors'];
    const fields = ['Computer Science', 'Engineering', 'Business', 'Life Sciences', 'Physics', 'Mathematics'];
    const sources = ['website', 'referral', 'social_media', 'advertisement', 'event'];
    const statuses = ['new', 'contacted', 'qualified', 'negotiation', 'converted', 'lost'];
    const priorities = ['high', 'medium', 'low'];
    
    const testLeads = [];
    
    for (let i = 0; i < 25; i++) {
      const firstName = `Lead${i + 1}`;
      const lastName = 'Student';
      const email = `lead${i + 1}@university.edu`;
      const phone = `+1-555-${1000 + i}`;
      const university = universities[i % universities.length];
      const country = countries[i % countries.length];
      const degree = degrees[i % degrees.length];
      const fieldOfStudy = fields[i % fields.length];
      const source = sources[i % sources.length];
      const status = statuses[i % statuses.length];
      const priority = priorities[i % priorities.length];
      
      // Create lead with some variation in dates
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - (i * 2)); // Spread over last 50 days
      
      const lastContactDate = new Date(createdDate);
      if (status !== 'new') {
        lastContactDate.setDate(lastContactDate.getDate() + Math.floor(Math.random() * 10));
      }
      
      testLeads.push({
        firstName,
        lastName,
        email,
        phone,
        university,
        country,
        degree,
        fieldOfStudy,
        interestedServices: [services[i % services.length]._id],
        status,
        priority,
        source,
        estimatedValue: 2000 + (i * 500),
        notes: `Initial contact made. Interested in ${services[i % services.length].name}`,
        assignedTo: leadManager._id,
        nextFollowUp: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
        lastContact: status !== 'new' ? lastContactDate : null,
        createdAt: createdDate,
        updatedAt: status !== 'new' ? lastContactDate : createdDate
      });
    }
    
    const createdLeads = await Lead.insertMany(testLeads);
    console.log(`✅ Created ${createdLeads.length} test leads:`);
    
    // Show summary by status
    const statusCounts = {};
    createdLeads.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });
    
    console.log('\n📊 Leads by status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    console.log(`\n✅ All leads assigned to: ${leadManager.name} (${leadManager.email})`);
    console.log('\n🎯 === TEST LEADS CREATED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createTestLeads();