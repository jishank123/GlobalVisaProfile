// Direct API test for authentication
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testRegistration() {
    console.log('\n=== Testing Registration ===');
    
    const userData = {
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        password: 'TestPass123'
    };
    
    try {
        const response = await fetch(`${API_BASE}/client-accounts/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
        
        if (data.success) {
            console.log('✅ Registration successful');
            return data.data.token;
        } else {
            console.log('❌ Registration failed:', data.error?.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Registration error:', error.message);
        return null;
    }
}

async function testLogin() {
    console.log('\n=== Testing Login ===');
    
    const loginData = {
        email: 'test@example.com',
        password: 'TestPass123'
    };
    
    try {
        const response = await fetch(`${API_BASE}/client-accounts/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
        
        if (data.success) {
            console.log('✅ Login successful');
            return data.data.token;
        } else {
            console.log('❌ Login failed:', data.error?.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Login error:', error.message);
        return null;
    }
}

async function testCheckUser() {
    console.log('\n=== Testing Check User ===');
    
    try {
        const response = await fetch(`${API_BASE}/client-accounts/check-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'test@example.com' })
        });
        
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
        
        if (data.success) {
            console.log('✅ Check user successful');
            console.log('User exists:', data.data.exists);
        } else {
            console.log('❌ Check user failed:', data.error?.message);
        }
    } catch (error) {
        console.error('❌ Check user error:', error.message);
    }
}

async function runTests() {
    console.log('🧪 Starting Authentication Tests...');
    
    // First check if user exists
    await testCheckUser();
    
    // Try registration
    const regToken = await testRegistration();
    
    // Try login
    const loginToken = await testLogin();
    
    console.log('\n=== Test Summary ===');
    console.log('Registration token:', regToken ? 'SUCCESS' : 'FAILED');
    console.log('Login token:', loginToken ? 'SUCCESS' : 'FAILED');
}

runTests().catch(console.error);