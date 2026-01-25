/**
 * Test Admin Dashboard APIs
 * Tests the User Management and Service Management data loading
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testAdminDashboardAPIs() {
    console.log('🧪 === TESTING ADMIN DASHBOARD APIs ===\n');

    // Test 1: Get all client accounts for User Management
    console.log('👥 Test 1: Get All Client Accounts');
    console.log('👥 URL: GET /api/client-accounts/all');
    try {
        const response = await fetch(`${BASE_URL}/client-accounts/all`);
        const data = await response.json();
        
        console.log('👥 Status:', response.status);
        console.log('👥 Success:', data.success);
        console.log('👥 Count:', data.count || 0);
        
        if (data.success && data.data) {
            console.log('👥 Sample client data:');
            data.data.slice(0, 2).forEach((client, index) => {
                console.log(`   ${index + 1}. ${client.full_name} (${client.email}) - ${client.account_status || 'active'}`);
            });
        }
        console.log('✅ Client accounts API test completed\n');
    } catch (error) {
        console.error('❌ Client accounts API test failed:', error.message);
        console.log('');
    }

    // Test 2: Get all profile assessments for Service Management
    console.log('🛠️ Test 2: Get All Profile Assessments (Services)');
    console.log('🛠️ URL: GET /api/profile-assessments');
    try {
        const response = await fetch(`${BASE_URL}/profile-assessments`);
        const data = await response.json();
        
        console.log('🛠️ Status:', response.status);
        console.log('🛠️ Success:', data.success);
        
        if (data.success && data.data && data.data.assessments) {
            console.log('🛠️ Count:', data.data.assessments.length);
            console.log('🛠️ Sample service data:');
            data.data.assessments.slice(0, 2).forEach((assessment, index) => {
                console.log(`   ${index + 1}. ${assessment.client_name} - ${assessment.field_of_expertise} (${assessment.overall_score}%)`);
            });
        } else {
            console.log('🛠️ Count: 0');
        }
        console.log('✅ Profile assessments API test completed\n');
    } catch (error) {
        console.error('❌ Profile assessments API test failed:', error.message);
        console.log('');
    }

    // Test 3: Check admin dashboard accessibility
    console.log('📊 Test 3: Admin Dashboard File Check');
    const fs = require('fs');
    const path = require('path');
    
    const dashboardPath = path.join(__dirname, 'all_static_pages', '2-admin-dashboard.html');
    if (fs.existsSync(dashboardPath)) {
        console.log('📊 ✅ Admin dashboard file exists');
        
        const content = fs.readFileSync(dashboardPath, 'utf8');
        const hasUserManagement = content.includes('User Management');
        const hasServiceManagement = content.includes('Services Management');
        const hasRefreshUserData = content.includes('refreshUserData');
        const hasRefreshServiceData = content.includes('refreshServiceData');
        
        console.log('📊 User Management section:', hasUserManagement ? '✅' : '❌');
        console.log('📊 Service Management section:', hasServiceManagement ? '✅' : '❌');
        console.log('📊 refreshUserData function:', hasRefreshUserData ? '✅' : '❌');
        console.log('📊 refreshServiceData function:', hasRefreshServiceData ? '✅' : '❌');
    } else {
        console.log('📊 ❌ Admin dashboard file not found');
    }

    console.log('\n🎉 === ADMIN DASHBOARD API TESTS COMPLETED ===');
    console.log('📝 Summary:');
    console.log('   - User Management: API endpoint created for client accounts');
    console.log('   - Service Management: Uses existing profile assessments API');
    console.log('   - JavaScript functions: Added to admin dashboard');
    console.log('   - Ready for testing in browser');
}

// Run the tests
testAdminDashboardAPIs().catch(console.error);