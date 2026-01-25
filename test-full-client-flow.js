// Test the complete client flow: register -> login -> get assessments
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFullClientFlow() {
  console.log('🧪 Testing Full Client Flow...\n');
  
  try {
    const testEmail = 'newclient@test.com';
    const testPassword = 'TestPassword123';
    
    // 1. Register a new client
    console.log('1. Registering new client...');
    const registerResponse = await fetch('http://localhost:5000/api/client-accounts/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        full_name: 'New Test Client',
        email: testEmail,
        password: testPassword,
        phone: '+1234567890'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);
    
    if (!registerData.success && registerData.error.code !== 'EMAIL_EXISTS') {
      console.log('❌ Registration failed');
      return;
    }
    
    // 2. Login with the client
    console.log('\n2. Logging in client...');
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
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const token = loginData.data.token;
    console.log('✅ Login successful, token received');
    
    // 3. Create a profile assessment for this client
    console.log('\n3. Creating profile assessment...');
    const assessmentData = {
      client_name: 'New Test Client',
      client_email: testEmail,
      client_phone: '+1234567890',
      field_of_expertise: 'Data Science',
      years_of_experience: 7,
      current_location: 'San Francisco, USA',
      criterion_1_awards: 3,
      criterion_2_memberships: 2,
      criterion_3_media: 1,
      criterion_4_judging: 2,
      criterion_5_contributions: 3,
      criterion_6_publications: 3,
      criterion_7_exhibitions: 1,
      criterion_8_leadership: 2,
      criterion_9_salary: 3,
      criterion_10_commercial: 2
    };
    
    const assessmentResponse = await fetch('http://localhost:5000/api/profile-assessments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assessmentData)
    });
    
    const assessmentResult = await assessmentResponse.json();
    console.log('Assessment creation response:', assessmentResult);
    
    // 4. Now test the client assessments endpoint
    console.log('\n4. Testing client assessments endpoint...');
    const clientAssessmentsResponse = await fetch('http://localhost:5000/api/profile-assessments/client', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Client assessments response status:', clientAssessmentsResponse.status);
    const clientAssessmentsData = await clientAssessmentsResponse.json();
    console.log('Client assessments response:', clientAssessmentsData);
    
    if (clientAssessmentsData.success) {
      console.log(`✅ Found ${clientAssessmentsData.count} assessments for client`);
      clientAssessmentsData.data.forEach((assessment, index) => {
        console.log(`  Assessment ${index + 1}:`);
        console.log(`    ID: ${assessment._id}`);
        console.log(`    Score: ${assessment.overall_score}%`);
        console.log(`    Strength: ${assessment.profile_strength}`);
        console.log(`    Created: ${assessment.createdAt}`);
      });
    } else {
      console.log('❌ Failed to get client assessments:', clientAssessmentsData.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testFullClientFlow();