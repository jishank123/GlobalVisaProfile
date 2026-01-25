// Simple test to debug client authentication
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSimpleAuth() {
  console.log('🧪 Testing Simple Client Auth...\n');
  
  try {
    // Use the existing client we created
    const testEmail = 'newclient@test.com';
    const testPassword = 'TestPassword123';
    
    // Login
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://localhost:5000/api/client-accounts/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login success:', loginData.success);
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.error);
      return;
    }
    
    const token = loginData.data.token;
    console.log('Token received:', token ? 'YES' : 'NO');
    console.log('Client ID:', loginData.data.client.id);
    
    // Test the client assessments endpoint with detailed logging
    console.log('\n2. Testing client assessments endpoint...');
    console.log('Making request to: http://localhost:5000/api/profile-assessments/client');
    console.log('Authorization header:', `Bearer ${token.substring(0, 20)}...`);
    
    const assessmentsResponse = await fetch('http://localhost:5000/api/profile-assessments/client', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', assessmentsResponse.status);
    console.log('Response headers:', Object.fromEntries(assessmentsResponse.headers.entries()));
    
    const assessmentsData = await assessmentsResponse.json();
    console.log('Response data:', assessmentsData);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSimpleAuth();