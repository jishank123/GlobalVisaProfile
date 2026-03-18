const mongoose = require('mongoose');
const path = require('path');

// Load environment variables FIRST
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const ProfileAssessment = require('../models/ProfileAssessment');
const ContactForm = require('../models/ContactForm');
const AppointmentRequest = require('../models/AppointmentRequest');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

async function checkRegistrations() {
  try {
    console.log('👥 === CHECKING REGISTRATIONS DATA ===');
    
    // Get all client users
    const clientUsers = await User.find({ role: 'client' });
    console.log(`📊 Total client users: ${clientUsers.length}`);
    
    if (clientUsers.length > 0) {
      console.log('\n👤 Client users:');
      for (const user of clientUsers) {
        console.log(`  - ID: ${user._id}`);
        console.log(`    Name: ${user.first_name} ${user.last_name}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Created: ${user.createdAt}`);
        console.log('');
      }
    }
    
    // Get all profile assessments
    const assessments = await ProfileAssessment.find({});
    console.log(`📊 Total profile assessments: ${assessments.length}`);
    
    const assessmentEmails = assessments.map(a => a.client_email?.toLowerCase()).filter(Boolean);
    console.log(`📧 Assessment emails: ${assessmentEmails.join(', ')}`);
    
    // Get all contact forms
    const contacts = await ContactForm.find({});
    console.log(`📊 Total contact forms: ${contacts.length}`);
    
    const contactEmails = contacts.map(c => c.email?.toLowerCase()).filter(Boolean);
    console.log(`📧 Contact emails: ${contactEmails.join(', ')}`);
    
    // Get all appointments
    const appointments = await AppointmentRequest.find({});
    console.log(`📊 Total appointments: ${appointments.length}`);
    
    const appointmentEmails = appointments.map(a => a.email?.toLowerCase()).filter(Boolean);
    console.log(`📧 Appointment emails: ${appointmentEmails.join(', ')}`);
    
    // Check which users would be filtered out
    const formEmails = new Set([...contactEmails, ...assessmentEmails, ...appointmentEmails]);
    console.log(`\n🔍 Form emails set: ${Array.from(formEmails).join(', ')}`);
    
    console.log('\n🔍 Registration filtering results:');
    for (const user of clientUsers) {
      const userEmail = user.email?.toLowerCase();
      const hasFilledForm = formEmails.has(userEmail);
      
      console.log(`  - ${user.first_name} ${user.last_name} (${userEmail})`);
      console.log(`    Has filled form: ${hasFilledForm}`);
      console.log(`    Would show in registrations: ${!hasFilledForm}`);
      console.log('');
    }
    
    console.log('\n👥 === CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Error during check:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkRegistrations();