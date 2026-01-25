// Create a test profile assessment for an existing client
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function createTestAssessment() {
  console.log('🧪 Creating test profile assessment...\n');
  
  try {
    // First, let's check what client accounts exist
    console.log('1. Checking existing client accounts...');
    
    // Let's try to create a profile assessment with a known email
    // We'll use an email that might exist from previous tests
    const testEmails = [
      'test@example.com',
      'john.doe@example.com', 
      'client@test.com',
      'demo@client.com'
    ];
    
    for (const email of testEmails) {
      console.log(`\n2. Creating assessment for ${email}...`);
      
      const assessmentData = {
        client_name: 'Test Client',
        client_email: email,
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
      };
      
      const response = await fetch('http://localhost:5000/api/profile-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assessmentData)
      });
      
      const data = await response.json();
      console.log(`Assessment creation response for ${email}:`, data);
      
      if (data.success) {
        console.log(`✅ Successfully created assessment for ${email}`);
        console.log(`Assessment ID: ${data.data.assessment_id}`);
        console.log(`Score: ${data.data.overall_score}%`);
        break; // Stop after first successful creation
      }
    }
    
    // Now let's try to test the client assessments endpoint with different approaches
    console.log('\n3. Testing client assessments endpoint without auth...');
    const noAuthResponse = await fetch('http://localhost:5000/api/profile-assessments/client');
    console.log('No auth response status:', noAuthResponse.status);
    const noAuthData = await noAuthResponse.json();
    console.log('No auth response:', noAuthData);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

createTestAssessment();