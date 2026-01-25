// Test admin dashboard forms and leads management
const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:5000/api';

// Test admin credentials
const testAdmin = {
  email: 'admin@gmail.com',
  password: 'admin123'
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

async function testAdminFormsAndLeads() {
  try {
    console.log('🔐 === ADMIN FORMS & LEADS MANAGEMENT TEST ===\n');
    
    console.log('🔐 Step 1: Admin Login...');
    const loginData = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(testAdmin)
    });
    
    if (!loginData.success) {
      console.error('❌ Admin login failed:', loginData);
      return;
    }
    
    const token = loginData.data.token;
    console.log('✅ Admin login successful');
    console.log('👤 Admin:', loginData.data.user.email);
    
    // Test contact forms API
    console.log('\n📧 Step 2: Testing Contact Forms API...');
    const contactFormsData = await makeRequest(`${API_BASE}/contact`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (contactFormsData.success) {
      console.log(`✅ Contact Forms API successful: ${contactFormsData.data.contact_forms?.length || 0} forms`);
      if (contactFormsData.data.contact_forms?.length > 0) {
        console.log('📧 Sample contact form:', {
          name: contactFormsData.data.contact_forms[0].name,
          email: contactFormsData.data.contact_forms[0].email,
          status: contactFormsData.data.contact_forms[0].status
        });
      }
    } else {
      console.error('❌ Contact Forms API failed:', contactFormsData);
    }
    
    // Test profile assessments API
    console.log('\n📊 Step 3: Testing Profile Assessments API...');
    const assessmentsData = await makeRequest(`${API_BASE}/profile-assessments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (assessmentsData.success) {
      console.log(`✅ Profile Assessments API successful: ${assessmentsData.data.assessments?.length || 0} assessments`);
      if (assessmentsData.data.assessments?.length > 0) {
        console.log('📊 Sample assessment:', {
          name: assessmentsData.data.assessments[0].client_name,
          email: assessmentsData.data.assessments[0].client_email,
          score: assessmentsData.data.assessments[0].overall_score
        });
      }
    } else {
      console.error('❌ Profile Assessments API failed:', assessmentsData);
    }
    
    // Test appointments API
    console.log('\n📅 Step 4: Testing Appointments API...');
    const appointmentsData = await makeRequest(`${API_BASE}/appointments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (appointmentsData.success) {
      console.log(`✅ Appointments API successful: ${appointmentsData.data.appointments?.length || 0} appointments`);
      if (appointmentsData.data.appointments?.length > 0) {
        console.log('📅 Sample appointment:', {
          name: appointmentsData.data.appointments[0].name,
          email: appointmentsData.data.appointments[0].email,
          status: appointmentsData.data.appointments[0].status
        });
      }
    } else {
      console.error('❌ Appointments API failed:', appointmentsData);
    }
    
    // Test leads API
    console.log('\n👥 Step 5: Testing Leads API...');
    const leadsData = await makeRequest(`${API_BASE}/leads`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (leadsData.success) {
      console.log(`✅ Leads API successful: ${leadsData.data?.length || 0} leads`);
      if (leadsData.data?.length > 0) {
        console.log('👥 Sample lead:', {
          name: `${leadsData.data[0].firstName} ${leadsData.data[0].lastName}`,
          email: leadsData.data[0].email,
          status: leadsData.data[0].status,
          assignedTo: leadsData.data[0].assignedTo?.email || 'Unassigned'
        });
      }
    } else {
      console.error('❌ Leads API failed:', leadsData);
    }
    
    // Test lead statistics
    console.log('\n📈 Step 6: Testing Lead Statistics API...');
    const leadStatsData = await makeRequest(`${API_BASE}/leads/stats/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (leadStatsData.success) {
      console.log('✅ Lead Statistics API successful');
      console.log('📈 Lead Stats:', {
        total: leadStatsData.data.total,
        qualified: leadStatsData.data.qualifiedCount,
        conversionRate: leadStatsData.data.conversionRate + '%',
        newThisWeek: leadStatsData.data.newThisWeek
      });
    } else {
      console.error('❌ Lead Statistics API failed:', leadStatsData);
    }
    
    // Test creating a lead (should work for admin)
    console.log('\n➕ Step 7: Testing Lead Creation (Admin)...');
    const newLeadData = {
      firstName: 'Test',
      lastName: 'Lead',
      email: 'testlead@example.com',
      phone: '+1234567890',
      university: 'Test University',
      country: 'USA',
      source: 'admin_created',
      priority: 'medium',
      notes: 'Test lead created by admin'
    };
    
    const createLeadResponse = await makeRequest(`${API_BASE}/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newLeadData)
    });
    
    if (createLeadResponse.success) {
      console.log('✅ Admin can create leads successfully');
      console.log('➕ Created lead:', {
        id: createLeadResponse.data._id,
        name: `${createLeadResponse.data.firstName} ${createLeadResponse.data.lastName}`,
        assignedTo: createLeadResponse.data.assignedTo?.email || 'Unassigned'
      });
    } else {
      console.error('❌ Admin lead creation failed:', createLeadResponse);
    }
    
    console.log('\n🎉 === ADMIN FORMS & LEADS TEST COMPLETED ===');
    console.log('✅ Admin dashboard should now have:');
    console.log('  - Forms Management section with Contact Forms, Assessments, and Appointments');
    console.log('  - Lead Management section with lead assignment capabilities');
    console.log('  - Only admins can create and assign leads');
    console.log('  - Lead managers can only view and manage their assigned leads');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAdminFormsAndLeads();