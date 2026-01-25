// Test payments API directly
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

async function testPaymentsAPI() {
  try {
    console.log('🔐 Logging in as client...');
    
    // Login first
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
    
    // Test payments API
    console.log('\n💳 Testing payments API...');
    const paymentsData = await makeRequest(`${API_BASE}/payments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Payments API response:', JSON.stringify(paymentsData, null, 2));
    
    if (paymentsData.success) {
      console.log(`✅ Payments API successful: ${paymentsData.data.length} payments found`);
      paymentsData.data.forEach(payment => {
        console.log(`  - ${payment.invoice_number}: $${payment.amount} (${payment.status})`);
      });
    } else {
      console.error('❌ Payments API failed:', paymentsData);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testPaymentsAPI();