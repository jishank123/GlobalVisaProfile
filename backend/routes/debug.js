const express = require('express');
const mongoose = require('mongoose');
const ProfileAssessment = require('../models/ProfileAssessment');

const router = express.Router();

// @route   GET /api/debug/database
// @desc    Debug database contents
// @access  Public (for debugging only)
router.get('/database', async (req, res) => {
  try {
    console.log('🔍 === DATABASE DEBUG REQUEST ===');
    
    // Get database info
    const dbInfo = {
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      readyState: mongoose.connection.readyState
    };
    
    // Get collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Count documents
    const profileAssessmentCount = await ProfileAssessment.countDocuments();
    const User = require('../models/User');
    const Client = require('../models/Client');
    const userCount = await User.countDocuments();
    const clientCount = await Client.countDocuments();
    
    // Get sample data
    const sampleAssessments = await ProfileAssessment.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('client_name client_email overall_score profile_strength createdAt');
    
    const sampleUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('first_name last_name email role status createdAt');
    
    // Get database stats
    const stats = await mongoose.connection.db.stats();
    
    const debugInfo = {
      success: true,
      database: dbInfo,
      collections: collectionNames,
      counts: {
        profileAssessments: profileAssessmentCount,
        users: userCount,
        clients: clientCount
      },
      samples: {
        profileAssessments: sampleAssessments,
        users: sampleUsers
      },
      stats: {
        dataSize: Math.round(stats.dataSize / 1024 / 1024 * 100) / 100 + ' MB',
        storageSize: Math.round(stats.storageSize / 1024 / 1024 * 100) / 100 + ' MB',
        collections: stats.collections,
        objects: stats.objects
      }
    };
    
    console.log('🔍 Debug info collected:', debugInfo);
    res.json(debugInfo);
    
  } catch (error) {
    console.error('💥 Database debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// @route   GET /api/debug/profile-assessments
// @desc    Get all profile assessments for debugging
// @access  Public (for debugging only)
router.get('/profile-assessments', async (req, res) => {
  try {
    console.log('🔍 === PROFILE ASSESSMENTS DEBUG ===');
    
    const assessments = await ProfileAssessment.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`📊 Found ${assessments.length} profile assessments`);
    
    res.json({
      success: true,
      count: assessments.length,
      data: assessments
    });
    
  } catch (error) {
    console.error('💥 Profile assessments debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/debug/test-assessment
// @desc    Create a test profile assessment
// @access  Public (for debugging only)
router.post('/test-assessment', async (req, res) => {
  try {
    console.log('🧪 === CREATING TEST ASSESSMENT ===');
    
    const testAssessment = new ProfileAssessment({
      client_name: 'Debug Test User ' + Date.now(),
      client_email: `debug.${Date.now()}@example.com`,
      client_phone: '+1234567890',
      field_of_expertise: 'Technology & Engineering',
      years_of_experience: 5,
      current_location: 'us',
      criterion_1_awards: 2,
      criterion_2_memberships: 1,
      criterion_3_media: 1,
      criterion_4_judging: 2,
      criterion_5_contributions: 3,
      criterion_6_publications: 2,
      criterion_7_exhibitions: 0,
      criterion_8_leadership: 2,
      criterion_9_salary: 1,
      criterion_10_commercial: 1,
      overall_score: 50,
      profile_strength: 'Moderate Profile Strength',
      strong_criteria_count: 1,
      moderate_criteria_count: 5,
      weak_criteria_count: 4,
      criteria_met: 6
    });
    
    const savedAssessment = await testAssessment.save();
    console.log('✅ Test assessment created:', savedAssessment._id);
    
    res.json({
      success: true,
      message: 'Test assessment created successfully',
      data: savedAssessment
    });
    
  } catch (error) {
    console.error('💥 Test assessment creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;