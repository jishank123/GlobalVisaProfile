/**
 * Script to Assign Specific Records to a Lead Manager
 * 
 * This script allows you to assign specific appointment and project records
 * to a particular lead manager by setting the created_by field.
 */

const mongoose = require('mongoose');
const AppointmentRequest = require('../models/AppointmentRequest');
const Project = require('../models/Project');
const User = require('../models/User');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/immigration_crm', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Assign specific records to a lead manager
const assignRecordsToLeadManager = async (leadManagerEmail, appointmentIds = [], projectIds = []) => {
  try {
    console.log(`🎯 Assigning records to lead manager: ${leadManagerEmail}`);
    
    // Find the lead manager
    const leadManager = await User.findOne({ 
      email: leadManagerEmail, 
      role: 'lead_manager' 
    });
    
    if (!leadManager) {
      console.error(`❌ Lead manager not found: ${leadManagerEmail}`);
      return;
    }
    
    console.log(`✅ Found lead manager: ${leadManager.first_name} ${leadManager.last_name} (${leadManager.email})`);
    
    let updatedAppointments = 0;
    let updatedProjects = 0;
    
    // Update appointments if IDs provided
    if (appointmentIds.length > 0) {
      console.log(`📅 Updating ${appointmentIds.length} appointments...`);
      
      const appointmentResult = await AppointmentRequest.updateMany(
        { _id: { $in: appointmentIds } },
        { 
          $set: { 
            created_by: leadManager._id,
            source: 'lead_manager'
          } 
        }
      );
      
      updatedAppointments = appointmentResult.modifiedCount;
      console.log(`✅ Updated ${updatedAppointments} appointments`);
    }
    
    // Update projects if IDs provided
    if (projectIds.length > 0) {
      console.log(`📊 Updating ${projectIds.length} projects...`);
      
      const projectResult = await Project.updateMany(
        { _id: { $in: projectIds } },
        { 
          $set: { 
            created_by: leadManager._id
          } 
        }
      );
      
      updatedProjects = projectResult.modifiedCount;
      console.log(`✅ Updated ${updatedProjects} projects`);
    }
    
    console.log(`🎉 Assignment completed! Updated ${updatedAppointments} appointments and ${updatedProjects} projects`);
    
    return {
      leadManager: {
        id: leadManager._id,
        email: leadManager.email,
        name: `${leadManager.first_name} ${leadManager.last_name}`
      },
      updatedAppointments,
      updatedProjects
    };
    
  } catch (error) {
    console.error('❌ Error assigning records:', error);
    throw error;
  }
};

// List all records without created_by field
const listRecordsWithoutCreatedBy = async () => {
  try {
    console.log('🔍 Finding records without created_by field...');
    
    // Find appointments without created_by
    const appointments = await AppointmentRequest.find({
      $or: [
        { created_by: null },
        { created_by: { $exists: false } }
      ]
    }).select('_id name email status createdAt');
    
    // Find projects without created_by
    const projects = await Project.find({
      $or: [
        { created_by: null },
        { created_by: { $exists: false } }
      ]
    }).select('_id project_id service_name status createdAt').populate('client', 'name email');
    
    console.log('\n📅 APPOINTMENTS WITHOUT CREATED_BY:');
    console.log('=====================================');
    appointments.forEach(apt => {
      console.log(`ID: ${apt._id}`);
      console.log(`Name: ${apt.name}`);
      console.log(`Email: ${apt.email}`);
      console.log(`Status: ${apt.status}`);
      console.log(`Created: ${apt.createdAt}`);
      console.log('---');
    });
    
    console.log('\n📊 PROJECTS WITHOUT CREATED_BY:');
    console.log('===============================');
    projects.forEach(proj => {
      console.log(`ID: ${proj._id}`);
      console.log(`Project ID: ${proj.project_id}`);
      console.log(`Service: ${proj.service_name}`);
      console.log(`Client: ${proj.client?.name || 'Unknown'}`);
      console.log(`Status: ${proj.status}`);
      console.log(`Created: ${proj.createdAt}`);
      console.log('---');
    });
    
    return { appointments, projects };
    
  } catch (error) {
    console.error('❌ Error listing records:', error);
    throw error;
  }
};

// Main execution function
const main = async () => {
  console.log('🚀 Starting record assignment script...');
  
  try {
    await connectDB();
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (command === 'list') {
      // List all records without created_by
      await listRecordsWithoutCreatedBy();
      
    } else if (command === 'assign') {
      // Assign specific records to a lead manager
      const leadManagerEmail = args[1];
      const appointmentIds = args[2] ? args[2].split(',') : [];
      const projectIds = args[3] ? args[3].split(',') : [];
      
      if (!leadManagerEmail) {
        console.error('❌ Please provide lead manager email');
        console.log('Usage: node assign-records-to-lead-manager.js assign <email> [appointmentIds] [projectIds]');
        console.log('Example: node assign-records-to-lead-manager.js assign john@example.com "id1,id2" "id3,id4"');
        return;
      }
      
      await assignRecordsToLeadManager(leadManagerEmail, appointmentIds, projectIds);
      
    } else {
      console.log('📖 Usage:');
      console.log('  List records: node assign-records-to-lead-manager.js list');
      console.log('  Assign records: node assign-records-to-lead-manager.js assign <email> [appointmentIds] [projectIds]');
      console.log('');
      console.log('Examples:');
      console.log('  node assign-records-to-lead-manager.js list');
      console.log('  node assign-records-to-lead-manager.js assign john@example.com "697ec8c0f0e81802a84b6a95" "697ec8a6f0e81802a84b6a7f"');
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Handle script execution
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();
  
  main().catch(error => {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = { assignRecordsToLeadManager, listRecordsWithoutCreatedBy };