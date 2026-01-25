// Test script to verify admin login functionality
const fetch = require('node-fetch');

async function testAdminLogin() {
    console.log('🧪 Testing Admin Login...\n');
    
    const baseURL = 'http://localhost:5000';
    
    try {
        console.log('🔑 Testing admin credentials (admin/admin)...');
        
        const response = await fetch(`${baseURL}/api/client-accounts/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin',
                password: 'admin'
            })
        });
        
        const data = await response.json();
        
        console.log('📨 Response Status:', response.status);
        console.log('📨 Response Data:', JSON.stringify(data, null, 2));
        
        if (response.ok && data.success && data.isAdmin) {
            console.log('✅ Admin login test PASSED!');
            console.log('✅ Admin token generated:', data.data.token ? 'YES' : 'NO');
            console.log('✅ Redirect URL:', data.data.redirectTo);
        } else {
            console.log('❌ Admin login test FAILED');
        }
        
    } catch (error) {
        console.log('❌ Admin login test ERROR:', error.message);
    }
    
    // Test regular client login (should fail for non-existent user)
    try {
        console.log('\n👤 Testing regular client credentials...');
        
        const response = await fetch(`${baseURL}/api/client-accounts/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        
        const data = await response.json();
        
        console.log('📨 Response Status:', response.status);
        console.log('📨 Response Data:', JSON.stringify(data, null, 2));
        
        if (!response.ok) {
            console.log('✅ Regular client login correctly failed for non-existent user');
        } else {
            console.log('⚠️ Regular client login unexpectedly succeeded');
        }
        
    } catch (error) {
        console.log('❌ Regular client login test ERROR:', error.message);
    }
    
    console.log('\n🎯 Admin Login Test Complete!');
}

// Run the test
testAdminLogin().catch(console.error);