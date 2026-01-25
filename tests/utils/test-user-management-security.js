/**
 * Test User Management Security Features
 * Tests admin protection, role assignment, and add new user functionality
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test admin credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@gmail.com',
    password: 'admin@#A'
};

let adminToken = null;

// Helper function to login as admin
async function loginAsAdmin() {
    try {
        console.log('🔐 Logging in as admin...');
        
        const response = await axios.post(`${API_BASE_URL}/client-accounts/login`, ADMIN_CREDENTIALS);
        
        if (response.data.success) {
            adminToken = response.data.token;
            console.log('✅ Admin login successful');
            return true;
        } else {
            console.error('❌ Admin login failed:', response.data.error);
            return false;
        }
    } catch (error) {
        console.error('💥 Admin login error:', error.response?.data || error.message);
        return false;
    }
}

// Test 1: Get all users
async function testGetUsers() {
    console.log('\n📋 TEST 1: Get all users');
    
    try {
        const response = await axios.get(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            console.log('✅ Users retrieved successfully');
            console.log(`📊 Total users: ${response.data.data.length}`);
            
            // Show admin users (should be protected)
            const adminUsers = response.data.data.filter(user => user.role === 'admin');
            console.log(`🛡️ Admin users found: ${adminUsers.length}`);
            adminUsers.forEach(admin => {
                console.log(`   - ${admin.email} (ID: ${admin._id})`);
            });
            
            return response.data.data;
        } else {
            console.error('❌ Failed to get users:', response.data.error);
            return null;
        }
    } catch (error) {
        console.error('💥 Error getting users:', error.response?.data || error.message);
        return null;
    }
}

// Test 2: Try to create a new user
async function testCreateUser() {
    console.log('\n➕ TEST 2: Create new user');
    
    const newUser = {
        first_name: 'Test',
        last_name: 'User',
        email: `test.user.${Date.now()}@example.com`,
        password: 'testpassword123',
        role: 'client',
        phone: '+1234567890',
        company: 'Test Company',
        country: 'USA'
    };
    
    try {
        const response = await axios.post(`${API_BASE_URL}/users`, newUser, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            console.log('✅ User created successfully');
            console.log(`👤 New user: ${newUser.email} (Role: ${newUser.role})`);
            return response.data.data;
        } else {
            console.error('❌ Failed to create user:', response.data.error);
            return null;
        }
    } catch (error) {
        console.error('💥 Error creating user:', error.response?.data || error.message);
        return null;
    }
}

// Test 3: Try to update admin role (should fail)
async function testAdminRoleProtection(users) {
    console.log('\n🛡️ TEST 3: Admin role protection');
    
    const adminUser = users.find(user => user.role === 'admin');
    if (!adminUser) {
        console.log('⚠️ No admin user found to test');
        return;
    }
    
    try {
        const response = await axios.patch(`${API_BASE_URL}/users/${adminUser._id}`, {
            role: 'client'
        }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('❌ SECURITY ISSUE: Admin role change was allowed!');
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response?.status === 403) {
            console.log('✅ Admin role protection working - change blocked');
            console.log(`🔒 Error: ${error.response.data.error.message}`);
        } else {
            console.error('💥 Unexpected error:', error.response?.data || error.message);
        }
    }
}

// Test 4: Try to delete admin (should fail)
async function testAdminDeleteProtection(users) {
    console.log('\n🛡️ TEST 4: Admin delete protection');
    
    const adminUser = users.find(user => user.role === 'admin');
    if (!adminUser) {
        console.log('⚠️ No admin user found to test');
        return;
    }
    
    try {
        const response = await axios.delete(`${API_BASE_URL}/users/${adminUser._id}`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('❌ SECURITY ISSUE: Admin deletion was allowed!');
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response?.status === 403) {
            console.log('✅ Admin delete protection working - deletion blocked');
            console.log(`🔒 Error: ${error.response.data.error.message}`);
        } else {
            console.error('💥 Unexpected error:', error.response?.data || error.message);
        }
    }
}

// Test 5: Update a regular user role (should work)
async function testRegularUserRoleUpdate(users) {
    console.log('\n✏️ TEST 5: Regular user role update');
    
    const regularUser = users.find(user => user.role !== 'admin');
    if (!regularUser) {
        console.log('⚠️ No regular user found to test');
        return;
    }
    
    const originalRole = regularUser.role;
    const newRole = originalRole === 'client' ? 'lead_manager' : 'client';
    
    try {
        const response = await axios.patch(`${API_BASE_URL}/users/${regularUser._id}`, {
            role: newRole
        }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            console.log('✅ Regular user role updated successfully');
            console.log(`👤 User: ${regularUser.email}`);
            console.log(`🔄 Role changed: ${originalRole} → ${newRole}`);
            
            // Change it back
            await axios.patch(`${API_BASE_URL}/users/${regularUser._id}`, {
                role: originalRole
            }, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`🔄 Role restored: ${newRole} → ${originalRole}`);
        } else {
            console.error('❌ Failed to update user role:', response.data.error);
        }
    } catch (error) {
        console.error('💥 Error updating user role:', error.response?.data || error.message);
    }
}

// Main test function
async function runTests() {
    console.log('🧪 === USER MANAGEMENT SECURITY TESTS ===\n');
    
    // Step 1: Login as admin
    const loginSuccess = await loginAsAdmin();
    if (!loginSuccess) {
        console.log('❌ Cannot proceed without admin login');
        return;
    }
    
    // Step 2: Get all users
    const users = await testGetUsers();
    if (!users) {
        console.log('❌ Cannot proceed without user data');
        return;
    }
    
    // Step 3: Test create new user
    await testCreateUser();
    
    // Step 4: Test admin role protection
    await testAdminRoleProtection(users);
    
    // Step 5: Test admin delete protection
    await testAdminDeleteProtection(users);
    
    // Step 6: Test regular user role update
    await testRegularUserRoleUpdate(users);
    
    console.log('\n✅ === ALL TESTS COMPLETED ===');
}

// Run tests
runTests().catch(error => {
    console.error('💥 Test suite failed:', error);
});