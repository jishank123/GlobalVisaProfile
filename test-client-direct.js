// Test client data access directly
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testClientDirect() {
    console.log('🔍 === TESTING CLIENT DATA ACCESS ===\n');
    
    try {
        // Test 1: Login as client
        console.log('🔐 Testing client login...');
        const loginResponse = await axios.post(`${API_BASE}/client-accounts/login`, {
            email: 'client@test.com',
            password: 'client123'
        });
        
        console.log('📊 Login response:', {
            success: loginResponse.data.success,
            hasToken: !!loginResponse.data.data?.token,
            clientInfo: loginResponse.data.data?.client,
            redirectTo: loginResponse.data.data?.redirectTo
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Client login failed');
            return;
        }
        
        const token = loginResponse.data.data.token;
        const clientInfo = loginResponse.data.data.client;
        
        console.log('✅ Client login successful');
        console.log('👤 Client info:', {
            id: clientInfo._id,
            email: clientInfo.email,
            name: clientInfo.full_name,
            role: clientInfo.role
        });
        
        // Test 2: Try to access projects directly (might need different auth)
        console.log('\n📊 Testing projects access...');
        try {
            const projectsResponse = await axios.get(`${API_BASE}/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('✅ Projects API response:', {
                success: projectsResponse.data.success,
                count: projectsResponse.data.data?.length || 0
            });
            
            if (projectsResponse.data.data?.length > 0) {
                console.log('📊 First project:', projectsResponse.data.data[0]);
            }
        } catch (error) {
            console.log('❌ Projects API error:', error.response?.data?.error?.message || error.message);
        }
        
        // Test 3: Try to access payments directly
        console.log('\n💳 Testing payments access...');
        try {
            const paymentsResponse = await axios.get(`${API_BASE}/payments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('✅ Payments API response:', {
                success: paymentsResponse.data.success,
                count: paymentsResponse.data.data?.length || 0
            });
            
            if (paymentsResponse.data.data?.length > 0) {
                console.log('💳 First payment:', paymentsResponse.data.data[0]);
            }
        } catch (error) {
            console.log('❌ Payments API error:', error.response?.data?.error?.message || error.message);
        }
        
        // Test 4: Check what type of user this token represents
        console.log('\n🔍 Testing token type...');
        try {
            // Try user endpoints
            const userResponse = await axios.get(`${API_BASE}/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ User profile accessible - this is a user token');
        } catch (error) {
            console.log('❌ User profile not accessible:', error.response?.status);
        }
        
        try {
            // Try client endpoints
            const clientResponse = await axios.get(`${API_BASE}/client-accounts/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Client profile accessible - this is a client token');
        } catch (error) {
            console.log('❌ Client profile not accessible:', error.response?.status, error.response?.data?.error?.message);
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.response?.data || error.message);
    }
}

testClientDirect().catch(console.error);