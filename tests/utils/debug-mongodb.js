const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const ProfileAssessment = require('./backend/models/ProfileAssessment');
const ClientAccount = require('./backend/models/ClientAccount');

async function debugMongoDB() {
    try {
        console.log('🔍 === MONGODB DEBUG SCRIPT ===');
        console.log('📊 Connecting to MongoDB...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academic_erp', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connected to MongoDB successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🏠 Host: ${mongoose.connection.host}`);
        console.log(`🔌 Port: ${mongoose.connection.port}`);
        
        // Check all collections
        console.log('\n📋 === CHECKING COLLECTIONS ===');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📋 Available collections:');
        collections.forEach(collection => {
            console.log(`  - ${collection.name}`);
        });
        
        // Check Profile Assessments
        console.log('\n🧪 === PROFILE ASSESSMENTS ===');
        const assessmentCount = await ProfileAssessment.countDocuments();
        console.log(`📊 Total Profile Assessments: ${assessmentCount}`);
        
        if (assessmentCount > 0) {
            console.log('\n📄 Latest 5 Profile Assessments:');
            const assessments = await ProfileAssessment.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('client_name client_email overall_score profile_strength createdAt');
            
            assessments.forEach((assessment, index) => {
                console.log(`${index + 1}. ${assessment.client_name} (${assessment.client_email})`);
                console.log(`   Score: ${assessment.overall_score}% | Strength: ${assessment.profile_strength}`);
                console.log(`   Created: ${assessment.createdAt}`);
                console.log('');
            });
            
            // Show detailed view of the latest assessment
            console.log('🔍 === DETAILED VIEW OF LATEST ASSESSMENT ===');
            const latestAssessment = await ProfileAssessment.findOne().sort({ createdAt: -1 });
            console.log('📊 Complete Assessment Data:');
            console.log(JSON.stringify(latestAssessment, null, 2));
        } else {
            console.log('❌ No Profile Assessments found in database');
        }
        
        // Check Client Accounts
        console.log('\n👥 === CLIENT ACCOUNTS ===');
        const clientCount = await ClientAccount.countDocuments();
        console.log(`📊 Total Client Accounts: ${clientCount}`);
        
        if (clientCount > 0) {
            console.log('\n📄 Latest 5 Client Accounts:');
            const clients = await ClientAccount.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('full_name email createdAt account_status');
            
            clients.forEach((client, index) => {
                console.log(`${index + 1}. ${client.full_name} (${client.email})`);
                console.log(`   Status: ${client.account_status} | Created: ${client.createdAt}`);
                console.log('');
            });
        } else {
            console.log('❌ No Client Accounts found in database');
        }
        
        // Check database stats
        console.log('\n📈 === DATABASE STATISTICS ===');
        const stats = await mongoose.connection.db.stats();
        console.log(`📊 Database Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📊 Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📊 Collections: ${stats.collections}`);
        console.log(`📊 Objects: ${stats.objects}`);
        
        // Test creating a new profile assessment
        console.log('\n🧪 === TESTING NEW PROFILE ASSESSMENT ===');
        try {
            const testAssessment = new ProfileAssessment({
                client_name: 'Debug Test User',
                client_email: 'debug.test@example.com',
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
            console.log('✅ Test assessment created successfully!');
            console.log(`📊 Assessment ID: ${savedAssessment._id}`);
            
            // Verify it was saved
            const verifyCount = await ProfileAssessment.countDocuments();
            console.log(`📊 Total assessments after test: ${verifyCount}`);
            
        } catch (error) {
            console.error('❌ Error creating test assessment:', error.message);
            console.error('❌ Full error:', error);
        }
        
    } catch (error) {
        console.error('💥 MongoDB Debug Error:', error.message);
        console.error('💥 Full error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
        process.exit(0);
    }
}

// Run the debug script
debugMongoDB();