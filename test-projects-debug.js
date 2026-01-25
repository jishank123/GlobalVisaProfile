// Debug projects API specifically
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testProjectsDebug() {
    console.log('📊 === DEBUGGING PROJECTS API ===\n');
    
    try {
        // Login as client
        const loginResponse = await axios.post(`${API_BASE}/client-accounts/login`, {
            email: 'client@test.com',
            password: 'client123'
        });
        
        const token = loginResponse.data.data.token;
        const userInfo = loginResponse.data.data.client;
        
        console.log('👤 Logged in user:', {
            id: userInfo._id,
            email: userInfo.email,
            role: userInfo.role
        });
        
        // Test projects API with detailed logging
        console.log('\n📊 Testing projects API...');
        try {
            const projectsResponse = await axios.get(`${API_BASE}/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('✅ Projects API response:', {
                success: projectsResponse.data.success,
                count: projectsResponse.data.count,
                total: projectsResponse.data.total,
                dataLength: projectsResponse.data.data?.length || 0
            });
            
            if (projectsResponse.data.data?.length > 0) {
                console.log('📊 First project:', projectsResponse.data.data[0]);
            } else {
                console.log('❌ No projects returned');
            }
            
        } catch (error) {
            console.log('❌ Projects API error:', error.response?.data || error.message);
        }
        
        // Test if we can access projects directly by client ID
        console.log('\n🔍 Testing direct client lookup...');
        try {
            // We know from debug that client ID is 69760c6224177e8d6be1efb6
            const directResponse = await axios.get(`${API_BASE}/projects?client=69760c6224177e8d6be1efb6`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('✅ Direct client query response:', {
                success: directResponse.data.success,
                count: directResponse.data.count,
                total: directResponse.data.total
            });
            
        } catch (error) {
            console.log('❌ Direct client query error:', error.response?.data || error.message);
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.response?.data || error.message);
    }
}

testProjectsDebug().catch(console.error);