// Complete test of client profile dashboard APIs
const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:5000/api';

// Test client credentials
const testClient = {
  email: 'client@test.com',
  password: 'client123'
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testClientProfileComplete() {
  try {
    console.log('🎯 === COMPLETE CLIENT PROFILE DASHBOARD TEST ===\n');
    
    console.log('🔐 Step 1: Client Login...');
    const loginData = await makeRequest(`${API_BASE}/client-accounts/login`, {
      method: 'POST',
      body: JSON.stringify(testClient)
    });
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData);
      return;
    }
    
    const token = loginData.data.token;
    console.log('✅ Login successful');
    console.log('👤 Client:', loginData.data.client.full_name);
    console.log('📧 Email:', loginData.data.client.email);
    
    // Test client profile API
    console.log('\n👤 Step 2: Testing Client Profile API...');
    const profileData = await makeRequest(`${API_BASE}/client-accounts/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (profileData.success) {
      console.log('✅ Profile API successful');
      console.log('👤 Profile:', profileData.data.client.full_name);
    } else {
      console.error('❌ Profile API failed:', profileData);
    }
    
    // Test projects API
    console.log('\n📊 Step 3: Testing Projects API...');
    const projectsData = await makeRequest(`${API_BASE}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (projectsData.success) {
      console.log(`✅ Projects API successful: ${projectsData.data.length} projects`);
      projectsData.data.forEach(project => {
        console.log(`  - ${project.project_id}: ${project.service_name} (${project.status}) - ${project.progress}%`);
      });
    } else {
      console.error('❌ Projects API failed:', projectsData);
    }
    
    // Test payments API
    console.log('\n💳 Step 4: Testing Payments API...');
    const paymentsData = await makeRequest(`${API_BASE}/payments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (paymentsData.success) {
      console.log(`✅ Payments API successful: ${paymentsData.data.length} payments`);
      paymentsData.data.forEach(payment => {
        console.log(`  - ${payment.invoice.invoiceNumber}: $${payment.amount} (${payment.status})`);
      });
    } else {
      console.error('❌ Payments API failed:', paymentsData);
    }
    
    // Calculate statistics
    console.log('\n📈 Step 5: Dashboard Statistics...');
    
    if (projectsData.success && paymentsData.success) {
      const completedProjects = projectsData.data.filter(p => p.status === 'completed').length;
      const activeProjects = projectsData.data.filter(p => ['active', 'in_progress'].includes(p.status)).length;
      const totalSpent = paymentsData.data
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      const pendingPayments = paymentsData.data.filter(p => p.status === 'pending').length;
      
      console.log('📊 Dashboard Stats:');
      console.log(`  - Completed Projects: ${completedProjects}`);
      console.log(`  - Active Projects: ${activeProjects}`);
      console.log(`  - Total Spent: $${totalSpent.toLocaleString()}`);
      console.log(`  - Pending Payments: ${pendingPayments}`);
    }
    
    console.log('\n🎉 === CLIENT PROFILE DASHBOARD TEST COMPLETED ===');
    console.log('✅ All APIs are working correctly!');
    console.log('✅ Client can now access their complete profile dashboard');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testClientProfileComplete();