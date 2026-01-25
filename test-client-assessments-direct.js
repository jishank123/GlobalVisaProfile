// Test the client assessments API endpoint directly
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testClientAssessmentsAPI() {
  console.log('🧪 Testing Client Assessments API...\n');
  
  try {
    // First, let's try to login with a test client account
    console.log('1. Testing client login...');
    const loginResponse = await fetch('http://localhost:5000/api/client-accounts/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.log('❌ Login failed, trying to register first...');
      
      // Try to register
      const registerResponse = await fetch('http://localhost:5000/api/client-accounts/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: 'Test Client',
          email: 'test@example.com',
          password: 'Password123',
          phone: '+1234567890'
        })
      });
      
      const registerData = await registerResponse.json();
      console.log('Register response:', registerData);
      
      if (!registerData.success) {
        console.log('❌ Registration also failed. Trying with existing data...');
        return;
      }
      
      // Try login again
      const loginResponse2 = await fetch('http://localhost:5000/api/client-accounts/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123'
        })
      });
      
      const loginData2 = await loginResponse2.json();
      console.log('Second login response:', loginData2);
      
      if (!loginData2.success) {
        console.log('❌ Still cannot login');
        return;
      }
      
      var token = loginData2.data.token;
    } else {
      var token = loginData.data.token;
    }
    
    console.log('✅ Login successful, token:', token ? 'Present' : 'Missing');
    
    // Now test the client assessments endpoint
    console.log('\n2. Testing client assessments endpoint...');
    const assessmentsResponse = await fetch('http://localhost:5000/api/profile-assessments/client', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Assessments response status:', assessmentsResponse.status);
    const assessmentsData = await assessmentsResponse.json();
    console.log('Assessments response:', assessmentsData);
    
    // Also test the general profile assessments endpoint to see what's in the database
    console.log('\n3. Testing general profile assessments endpoint...');
    const allAssessmentsResponse = await fetch('http://localhost:5000/api/profile-assessments', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('All assessments response status:', allAssessmentsResponse.status);
    const allAssessmentsData = await allAssessmentsResponse.json();
    console.log('All assessments response:', allAssessmentsData);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testClientAssessmentsAPI();