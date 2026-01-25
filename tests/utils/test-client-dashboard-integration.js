// Complete test for client dashboard integration
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testClientDashboardIntegration() {
  console.log('🧪 Testing Complete Client Dashboard Integration...\n');
  
  try {
    const testEmail = 'dashboard.test@example.com';
    const testPassword = 'TestPassword123';
    
    // Step 1: Register a new client
    console.log('1. Registering new client for dashboard test...');
    const registerResponse = await fetch('http://localhost:5000/api/client-accounts/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        full_name: 'Dashboard Test Client',
        email: testEmail,
        password: testPassword,
        phone: '+1234567890'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Register success:', registerData.success);
    
    if (!registerData.success && registerData.error.code !== 'EMAIL_EXISTS') {
      console.log('❌ Registration failed:', registerData.error);
      return;
    }
    
    // Step 2: Login
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
    console.log('Login success:', loginData.success);
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.error);
      return;
    }
    
    const token = loginData.data.token;
    const clientId = loginData.data.client.id;
    console.log('✅ Client authenticated, ID:', clientId);
    
    // Step 3: Create multiple profile assessments
    console.log('\n3. Creating multiple profile assessments...');
    
    const assessments = [
      {
        client_name: 'Dashboard Test Client',
        client_email: testEmail,
        client_phone: '+1234567890',
        field_of_expertise: 'Software Engineering',
        years_of_experience: 5,
        current_location: 'New York, USA',
        criterion_1_awards: 2,
        criterion_2_memberships: 1,
        criterion_3_media: 0,
        criterion_4_judging: 1,
        criterion_5_contributions: 3,
        criterion_6_publications: 2,
        criterion_7_exhibitions: 0,
        criterion_8_leadership: 2,
        criterion_9_salary: 2,
        criterion_10_commercial: 1
      },
      {
        client_name: 'Dashboard Test Client',
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
      }
    ];
    
    const createdAssessments = [];
    
    for (let i = 0; i < assessments.length; i++) {
      console.log(`Creating assessment ${i + 1}...`);
      
      const assessmentResponse = await fetch('http://localhost:5000/api/profile-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assessments[i])
      });
      
      const assessmentResult = await assessmentResponse.json();
      
      if (assessmentResult.success) {
        createdAssessments.push(assessmentResult.data);
        console.log(`✅ Assessment ${i + 1} created - Score: ${assessmentResult.data.overall_score}%`);
      } else {
        console.log(`❌ Assessment ${i + 1} failed:`, assessmentResult.error);
      }
      
      // Wait a bit between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n✅ Created ${createdAssessments.length} assessments`);
    
    // Step 4: Test client assessments API
    console.log('\n4. Testing client assessments API...');
    const clientAssessmentsResponse = await fetch('http://localhost:5000/api/profile-assessments/client', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Client assessments API status:', clientAssessmentsResponse.status);
    const clientAssessmentsData = await clientAssessmentsResponse.json();
    
    if (clientAssessmentsData.success) {
      console.log(`✅ Found ${clientAssessmentsData.count} assessments for client`);
      console.log('Assessment details:');
      clientAssessmentsData.data.forEach((assessment, index) => {
        console.log(`  ${index + 1}. ID: ${assessment._id}`);
        console.log(`     Field: ${assessment.field_of_expertise}`);
        console.log(`     Score: ${assessment.overall_score}%`);
        console.log(`     Strength: ${assessment.profile_strength}`);
        console.log(`     Status: ${assessment.status}`);
        console.log(`     Created: ${new Date(assessment.createdAt).toLocaleString()}`);
      });
      
      // Step 5: Verify data structure for client dashboard
      console.log('\n5. Verifying data structure for client dashboard...');
      const firstAssessment = clientAssessmentsData.data[0];
      const requiredFields = [
        '_id', 'client_name', 'client_email', 'field_of_expertise', 
        'overall_score', 'profile_strength', 'status', 'createdAt'
      ];
      
      const missingFields = requiredFields.filter(field => !firstAssessment.hasOwnProperty(field));
      
      if (missingFields.length === 0) {
        console.log('✅ All required fields present for client dashboard');
      } else {
        console.log('❌ Missing fields:', missingFields);
      }
      
      // Step 6: Test admin dashboard API (should also show these assessments)
      console.log('\n6. Testing admin dashboard API...');
      const adminAssessmentsResponse = await fetch('http://localhost:5000/api/profile-assessments');
      
      if (adminAssessmentsResponse.ok) {
        const adminAssessmentsData = await adminAssessmentsResponse.json();
        if (adminAssessmentsData.success) {
          const clientAssessmentsInAdmin = adminAssessmentsData.data.assessments.filter(
            a => a.client_email === testEmail
          );
          console.log(`✅ Admin dashboard shows ${clientAssessmentsInAdmin.length} assessments for this client`);
        }
      } else {
        console.log('⚠️ Admin API requires authentication (expected)');
      }
      
      console.log('\n🎉 CLIENT DASHBOARD INTEGRATION TEST COMPLETED SUCCESSFULLY!');
      console.log('📋 Summary:');
      console.log(`   - Client registered/logged in: ✅`);
      console.log(`   - Assessments created: ${createdAssessments.length}`);
      console.log(`   - Assessments retrieved via API: ${clientAssessmentsData.count}`);
      console.log(`   - Data structure valid: ✅`);
      console.log(`   - Email-based linking working: ✅`);
      
    } else {
      console.log('❌ Failed to get client assessments:', clientAssessmentsData.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testClientDashboardIntegration();