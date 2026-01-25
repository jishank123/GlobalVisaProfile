/**
 * Comprehensive System Test
 * Tests all database models and API endpoints
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Test data for different models
const testData = {
  profileAssessment: {
    client_name: 'Test User Profile',
    client_email: 'test.profile@example.com',
    client_phone: '+1-555-0001',
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
    criterion_9_salary: 1,
    criterion_10_commercial: 1
  },
  contactForm: {
    name: 'Test User Contact',
    email: 'test.contact.new@example.com',
    phone: '+1-555-0002',
    visa_type: 'eb1a',
    message: 'This is a test message for the contact form API testing.'
  },
  clientAccount: {
    full_name: 'Test Client Account',
    email: 'test.client@example.com',
    password: 'TestPassword123!',
    phone: '+1-555-0003'
  }
};

// API Test Functions
const apiTests = {
  // Test Profile Assessment API
  async testProfileAssessment() {
    console.log('\n🧪 === TESTING PROFILE ASSESSMENT API ===');
    try {
      const response = await fetch(`${API_BASE_URL}/profile-assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData.profileAssessment)
      });
      
      const result = await response.json();
      console.log('✅ Profile Assessment Status:', response.status);
      console.log('✅ Profile Assessment Response:', result.success ? 'SUCCESS' : 'FAILED');
      if (result.data) {
        console.log('✅ Assessment ID:', result.data.assessment_id);
        console.log('✅ Overall Score:', result.data.overall_score);
      }
      return { endpoint: '/profile-assessments', status: response.status, success: result.success };
    } catch (error) {
      console.error('❌ Profile Assessment Error:', error.message);
      return { endpoint: '/profile-assessments', status: 'ERROR', success: false, error: error.message };
    }
  },

  // Test Contact Form API
  async testContactForm() {
    console.log('\n🧪 === TESTING CONTACT FORM API ===');
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData.contactForm)
      });
      
      const result = await response.json();
      console.log('✅ Contact Form Status:', response.status);
      console.log('✅ Contact Form Response:', result.success ? 'SUCCESS' : 'FAILED');
      if (result.data) {
        console.log('✅ Submission ID:', result.data.submission_id);
        console.log('✅ Reference Number:', result.data.reference_number);
      }
      return { endpoint: '/contact', status: response.status, success: result.success };
    } catch (error) {
      console.error('❌ Contact Form Error:', error.message);
      return { endpoint: '/contact', status: 'ERROR', success: false, error: error.message };
    }
  },

  // Test Client Account Registration
  async testClientAccountRegistration() {
    console.log('\n🧪 === TESTING CLIENT ACCOUNT REGISTRATION ===');
    try {
      const response = await fetch(`${API_BASE_URL}/client-accounts/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData.clientAccount)
      });
      
      const result = await response.json();
      console.log('✅ Client Registration Status:', response.status);
      console.log('✅ Client Registration Response:', result.success ? 'SUCCESS' : 'FAILED');
      if (result.data) {
        console.log('✅ Client ID:', result.data.clientId);
        console.log('✅ Client Email:', result.data.email);
      }
      return { endpoint: '/client-accounts/register', status: response.status, success: result.success };
    } catch (error) {
      console.error('❌ Client Registration Error:', error.message);
      return { endpoint: '/client-accounts/register', status: 'ERROR', success: false, error: error.message };
    }
  },

  // Test Client Account Login
  async testClientAccountLogin() {
    console.log('\n🧪 === TESTING CLIENT ACCOUNT LOGIN ===');
    try {
      const response = await fetch(`${API_BASE_URL}/client-accounts/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testData.clientAccount.email,
          password: testData.clientAccount.password
        })
      });
      
      const result = await response.json();
      console.log('✅ Client Login Status:', response.status);
      console.log('✅ Client Login Response:', result.success ? 'SUCCESS' : 'FAILED');
      if (result.data) {
        console.log('✅ Token Received:', result.data.token ? 'YES' : 'NO');
        console.log('✅ Client Name:', result.data.client?.name);
      }
      return { endpoint: '/client-accounts/login', status: response.status, success: result.success };
    } catch (error) {
      console.error('❌ Client Login Error:', error.message);
      return { endpoint: '/client-accounts/login', status: 'ERROR', success: false, error: error.message };
    }
  },

  // Test Health Check
  async testHealthCheck() {
    console.log('\n🧪 === TESTING HEALTH CHECK ===');
    try {
      const response = await fetch(`http://localhost:5000/health`);
      const result = await response.json();
      console.log('✅ Health Check Status:', response.status);
      console.log('✅ Health Check Response:', result.success ? 'SUCCESS' : 'FAILED');
      console.log('✅ Message:', result.message);
      return { endpoint: '/health', status: response.status, success: result.success };
    } catch (error) {
      console.error('❌ Health Check Error:', error.message);
      return { endpoint: '/health', status: 'ERROR', success: false, error: error.message };
    }
  },

  // Test Debug Endpoint
  async testDebugEndpoint() {
    console.log('\n🧪 === TESTING DEBUG ENDPOINT ===');
    try {
      const response = await fetch(`${API_BASE_URL}/debug/database`);
      const result = await response.json();
      console.log('✅ Debug Status:', response.status);
      console.log('✅ Debug Response:', result.success ? 'SUCCESS' : 'FAILED');
      if (result.data) {
        console.log('✅ Database Name:', result.data.database);
        console.log('✅ Collections:', result.data.collections?.length || 0);
      }
      return { endpoint: '/debug/database', status: response.status, success: result.success };
    } catch (error) {
      console.error('❌ Debug Error:', error.message);
      return { endpoint: '/debug/database', status: 'ERROR', success: false, error: error.message };
    }
  }
};

// Database Model Tests
const modelTests = {
  async testDatabaseConnection() {
    console.log('\n🧪 === TESTING DATABASE CONNECTION ===');
    try {
      const response = await fetch(`${API_BASE_URL}/debug/database`);
      const result = await response.json();
      console.log('✅ Database Connection Status:', response.status);
      console.log('✅ Database Response:', result.success ? 'SUCCESS' : 'FAILED');
      if (result.data) {
        console.log('✅ Database Name:', result.data.database);
        console.log('✅ Connection State:', result.data.readyState);
        console.log('✅ Collections Count:', result.data.collections?.length || 'N/A');
      }
      return { test: 'Database Connection', status: response.status, success: result.success };
    } catch (error) {
      console.error('❌ Database Connection Error:', error.message);
      return { test: 'Database Connection', status: 'ERROR', success: false, error: error.message };
    }
  }
};

// Main Test Runner
async function runComprehensiveTests() {
  console.log('🚀 === COMPREHENSIVE SYSTEM TEST STARTED ===');
  console.log('📅 Test Time:', new Date().toISOString());
  console.log('🌐 API Base URL:', API_BASE_URL);
  
  const results = [];
  
  // Test Database Connection
  results.push(await modelTests.testDatabaseConnection());
  
  // Test Health Check
  results.push(await apiTests.testHealthCheck());
  
  // Test Debug Endpoint
  results.push(await apiTests.testDebugEndpoint());
  
  // Test Profile Assessment
  results.push(await apiTests.testProfileAssessment());
  
  // Test Contact Form
  results.push(await apiTests.testContactForm());
  
  // Test Client Account Registration
  results.push(await apiTests.testClientAccountRegistration());
  
  // Test Client Account Login (after registration)
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  results.push(await apiTests.testClientAccountLogin());
  
  // Generate Summary Report
  console.log('\n📊 === COMPREHENSIVE TEST RESULTS SUMMARY ===');
  console.log('📊 Total Tests:', results.length);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('✅ Successful Tests:', successful);
  console.log('❌ Failed Tests:', failed);
  console.log('📈 Success Rate:', Math.round((successful / results.length) * 100) + '%');
  
  console.log('\n📋 === DETAILED RESULTS ===');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const endpoint = result.endpoint || result.test;
    console.log(`${status} ${index + 1}. ${endpoint} - Status: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n🏁 === COMPREHENSIVE SYSTEM TEST COMPLETED ===');
  
  return results;
}

// Run the tests
runComprehensiveTests().catch(console.error);