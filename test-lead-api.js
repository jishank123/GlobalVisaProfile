// Test lead manager API endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testLeadManagerAPI() {
    console.log('🎯 === TESTING LEAD MANAGER API ===\n');
    
    try {
        // Login as lead manager
        console.log('🔐 Logging in as lead manager...');
        const loginResponse = await axios.post(`${API_BASE}/client-accounts/login`, {
            email: 'lead@manager.com',
            password: 'manager123'
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Lead manager login failed');
            return;
        }
        
        const token = loginResponse.data.data.token;
        console.log('✅ Lead manager login successful');
        
        // Test lead stats endpoint
        console.log('\n📊 Testing lead stats endpoint...');
        const statsResponse = await axios.get(`${API_BASE}/leads/stats/summary`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (statsResponse.data.success) {
            console.log('✅ Lead stats endpoint working');
            console.log('📊 Stats:', statsResponse.data.data);
        } else {
            console.log('❌ Lead stats failed:', statsResponse.data.error?.message);
        }
        
        // Test leads list endpoint
        console.log('\n🎯 Testing leads list endpoint...');
        const leadsResponse = await axios.get(`${API_BASE}/leads`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (leadsResponse.data.success) {
            console.log('✅ Leads list endpoint working');
            console.log('📊 Leads count:', leadsResponse.data.data.length);
            console.log('📊 Total leads:', leadsResponse.data.total);
        } else {
            console.log('❌ Leads list failed:', leadsResponse.data.error?.message);
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.response?.data?.error?.message || error.message);
    }
    
    console.log('\n🎯 === LEAD MANAGER API TEST COMPLETED ===');
}

testLeadManagerAPI().catch(console.error);