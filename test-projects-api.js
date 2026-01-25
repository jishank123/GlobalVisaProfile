// Test projects API directly
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

async function testProjectsAPI() {
  try {
    console.log('🔐 Logging in as client...');
    
    // Login first
    const loginData = await makeRequest(`${API_BASE}/client-accounts/login`, {
      method: 'POST',
      body: JSON.stringify(testClient)
    });
    
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData);
      return;
    }
    
    const token = loginData.data.token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
    
    // Test projects API
    console.log('\n📊 Testing projects API...');
    const projectsData = await makeRequest(`${API_BASE}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Projects API response:', JSON.stringify(projectsData, null, 2));
    
    if (projectsData.success) {
      console.log(`✅ Projects API successful: ${projectsData.data.length} projects found`);
      projectsData.data.forEach(project => {
        console.log(`  - ${project.project_id}: ${project.service_name} (${project.status})`);
      });
    } else {
      console.error('❌ Projects API failed:', projectsData);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testProjectsAPI();