// Test script to verify dashboard APIs are working
const fetch = require('node-fetch');

async function testAPIs() {
    console.log('🧪 Testing Dashboard APIs...\n');
    
    const baseURL = 'http://localhost:5000';
    
    // Test 1: Client Accounts API
    try {
        console.log('1️⃣ Testing Client Accounts API...');
        const response = await fetch(`${baseURL}/api/client-accounts/all`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('✅ Client Accounts API working');
            console.log(`   Found ${data.data.length} client accounts`);
        } else {
            console.log('❌ Client Accounts API failed:', data.error?.message);
        }
    } catch (error) {
        console.log('❌ Client Accounts API error:', error.message);
    }
    
    // Test 2: Profile Assessments API
    try {
        console.log('\n2️⃣ Testing Profile Assessments API...');
        const response = await fetch(`${baseURL}/api/profile-assessments`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('✅ Profile Assessments API working');
            console.log(`   Found ${data.data.assessments.length} assessments`);
        } else {
            console.log('❌ Profile Assessments API failed:', data.error?.message);
        }
    } catch (error) {
        console.log('❌ Profile Assessments API error:', error.message);
    }
    
    // Test 3: Contact Forms API
    try {
        console.log('\n3️⃣ Testing Contact Forms API...');
        const response = await fetch(`${baseURL}/api/contact`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('✅ Contact Forms API working');
            console.log(`   Found ${data.data.contact_forms.length} contact forms`);
        } else {
            console.log('❌ Contact Forms API failed:', data.error?.message);
        }
    } catch (error) {
        console.log('❌ Contact Forms API error:', error.message);
    }
    
    console.log('\n🎯 API Testing Complete!');
}

// Run the test
testAPIs().catch(console.error);