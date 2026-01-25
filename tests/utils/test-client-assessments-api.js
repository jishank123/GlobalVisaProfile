/**
 * Test script to check client assessments API
 */

const fetch = require('node-fetch');

async function testClientAssessmentsAPI() {
    console.log('🧪 Testing Client Assessments API...');
    
    try {
        // Test without authentication first
        console.log('\n1. Testing GET /api/profile-assessments (all assessments)');
        const allAssessmentsResponse = await fetch('http://localhost:5000/api/profile-assessments');
        console.log('Status:', allAssessmentsResponse.status);
        
        if (allAssessmentsResponse.ok) {
            const allData = await allAssessmentsResponse.json();
            console.log('All assessments count:', allData.data?.assessments?.length || 0);
            
            if (allData.data?.assessments?.length > 0) {
                console.log('Sample assessment:', {
                    id: allData.data.assessments[0]._id,
                    client_name: allData.data.assessments[0].client_name,
                    client_email: allData.data.assessments[0].client_email,
                    overall_score: allData.data.assessments[0].overall_score,
                    created: allData.data.assessments[0].createdAt
                });
            }
        } else {
            console.log('Error response:', await allAssessmentsResponse.text());
        }
        
        // Test client-specific endpoint (this will fail without auth, but we can see the error)
        console.log('\n2. Testing GET /api/profile-assessments/client (without auth)');
        const clientAssessmentsResponse = await fetch('http://localhost:5000/api/profile-assessments/client');
        console.log('Status:', clientAssessmentsResponse.status);
        console.log('Response:', await clientAssessmentsResponse.text());
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testClientAssessmentsAPI();