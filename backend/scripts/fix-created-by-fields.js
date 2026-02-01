/**
 * Database Migration Script: Fix Missing created_by Fields
 * 
 * This script updates existing appointment and project records that are missing
 * the created_by field, which is needed for proper lead manager filtering.
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

// Fix appointments missing created_by field
const fixAppointments = async () => {
  try {
    console.log('🔍 Checking appointments for missing created_by fields...');
    
    // Find appointments with null or missing created_by
    const appointmentsToFix = await AppointmentRequest.find({
      $or: [
        { created_by: null },
        { created_by: { $exists: false } }
      ]
    });
    
    console.log(`📅 Found ${appointmentsToFix.length} appointments to fix`);
    
    if (appointmentsToFix.length === 0) {
      console.log('✅ No appointments need fixing');
      return;
    }
    
    // Get all lead managers to assign as default creators
    const leadManagers = await User.find({ role: 'lead_manager' }).select('_id email');
    
    if (leadManagers.length === 0) {
      console.log('⚠️ No lead managers found. Cannot assign created_by field.');
      return;
    }
    
    // Use the first lead manager as default creator for existing records
    const defaultCreator = leadManagers[0];
    console.log(`🎯 Using ${defaultCreator.email} as default creator for existing appointments`);
    
    // Update appointments
    const appointmentResult = await AppointmentRequest.updateMany(
      {
        $or: [
          { created_by: null },
          { created_by: { $exists: false } }
        ]
      },
      {
        $set: {
          created_by: defaultCreator._id,
          source: 'lead_manager' // Update source to reflect lead manager creation
        }
      }
    );
    
    console.log(`✅ Updated ${appointmentResult.modifiedCount} appointments with created_by field`);
    
  } catch (error) {
    console.error('❌ Error fixing appointments:', error);
  }
};

// Fix projects missing created_by field
const fixProjects = async () => {
  try {
    console.log('🔍 Checking projects for missing created_by fields...');
    
    // Find projects with null or missing created_by
    const projectsToFix = await Project.find({
      $or: [
        { created_by: null },
        { created_by: { $exists: false } }
      ]
    });
    
    console.log(`📊 Found ${projectsToFix.length} projects to fix`);
    
    if (projectsToFix.length === 0) {
      console.log('✅ No projects need fixing');
      return;
    }
    
    // Get all lead managers to assign as default creators
    const leadManagers = await User.find({ role: 'lead_manager' }).select('_id email');
    
    if (leadManagers.length === 0) {
      console.log('⚠️ No lead managers found. Cannot assign created_by field.');
      return;
    }
    
    // Use the first lead manager as default creator for existing records
    const defaultCreator = leadManagers[0];
    console.log(`🎯 Using ${defaultCreator.email} as default creator for existing projects`);
    
    // Update projects
    const projectResult = await Project.updateMany(
      {
        $or: [
          { created_by: null },
          { created_by: { $exists: false } }
        ]
      },
      {
        $set: {
          created_by: defaultCreator._id
        }
      }
    );
    
    console.log(`✅ Updated ${projectResult.modifiedCount} projects with created_by field`);
    
  } catch (error) {
    console.error('❌ Error fixing projects:', error);
  }
};

// Main execution function
const main = async () => {
  console.log('🚀 Starting database migration to fix created_by fields...');
  
  try {
    await connectDB();
    
    await fixAppointments();
    await fixProjects();
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the fixes
    const appointmentsWithoutCreatedBy = await AppointmentRequest.countDocuments({
      $or: [
        { created_by: null },
        { created_by: { $exists: false } }
      ]
    });
    
    const projectsWithoutCreatedBy = await Project.countDocuments({
      $or: [
        { created_by: null },
        { created_by: { $exists: false } }
      ]
    });
    
    console.log('📊 Verification Results:');
    console.log(`   - Appointments without created_by: ${appointmentsWithoutCreatedBy}`);
    console.log(`   - Projects without created_by: ${projectsWithoutCreatedBy}`);
    
    if (appointmentsWithoutCreatedBy === 0 && projectsWithoutCreatedBy === 0) {
      console.log('🎉 All records now have proper created_by fields!');
    } else {
      console.log('⚠️ Some records still need attention');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
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

module.exports = { fixAppointments, fixProjects };