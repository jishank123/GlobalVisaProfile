const https = require('https');
const http = require('http');
const url = require('url');

const API_BASE = 'http://localhost:5000/api';
const TEST_TOKEN = 'demo-token';

async function testEndpoint(endpoint, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        try {
            console.log(`\n🧪 Testing ${method} ${endpoint}`);
            
            const fullUrl = `${API_BASE}${endpoint}`;
            const parsedUrl = url.parse(fullUrl);
            
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port,
                path: parsedUrl.path,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TEST_TOKEN}`
                }
            };
            
            const req = http.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
                        console.log(`   Response:`, JSON.stringify(jsonData, null, 2));
                        resolve({ status: res.statusCode, data: jsonData });
                    } catch (parseError) {
                        console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
                        console.log(`   Response: ${data}`);
                        resolve({ status: res.statusCode, data: data });
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error(`   ❌ Error:`, error.message);
                resolve({ error: error.message });
            });
            
            if (body) {
                req.write(JSON.stringify(body));
            }
            
            req.end();
        } catch (error) {
            console.error(`   ❌ Error:`, error.message);
            resolve({ error: error.message });
        }
    });
}

async function runTests() {
    console.log('🚀 Starting Backend API Tests\n');
    console.log('=' .repeat(50));
    
    // Test services endpoints
    console.log('\n📋 SERVICES ENDPOINTS');
    await testEndpoint('/services/public');
    await testEndpoint('/services'); // Should require admin auth
    
    // Test payments endpoints
    console.log('\n💳 PAYMENTS ENDPOINTS');
    await testEndpoint('/payments');
    await testEndpoint('/payments/pending-verification');
    
    // Test cash payment submission (should fail without proper data)
    console.log('\n💵 CASH PAYMENT SUBMISSION');
    await testEndpoint('/payments/cash-payment', 'POST', {
        service_id: 'test-service',
        service_name: 'Test Service',
        amount: 100,
        payment_date: new Date().toISOString(),
        payment_method: 'cash'
    });
    
    console.log('\n✅ Backend API tests completed!');
}

// Run the tests
runTests().catch(console.error);