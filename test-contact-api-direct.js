/**
 * Direct API test for contact form submission
 * Tests the /api/contact endpoint directly
 */

const testContactFormAPI = async () => {
    console.log('\n🧪 === DIRECT CONTACT FORM API TEST ===');
    console.log('📅 Test started at:', new Date().toISOString());
    
    const testData = {
        name: 'John Doe Test',
        email: 'john.doe.test@example.com',
        phone: '+1-555-123-4567',
        visa_type: 'eb1a',
        message: 'This is a test message for the contact form API. I am testing the enhanced logging functionality to ensure that data is properly stored in the database and all logging is working correctly.'
    };
    
    console.log('📊 Test data:', testData);
    
    try {
        console.log('🌐 Making API request to http://localhost:5000/api/contact');
        
        const response = await fetch('http://localhost:5000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('🌐 Response status:', response.status);
        console.log('🌐 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ === API TEST SUCCESSFUL ===');
            console.log('✅ Response data:', result);
            
            if (result.success) {
                console.log('✅ Contact form submission successful!');
                console.log('✅ Submission ID:', result.data?.submission_id);
                console.log('✅ Reference Number:', result.data?.reference_number);
                console.log('✅ Status:', result.data?.status);
                console.log('✅ Priority:', result.data?.priority);
            } else {
                console.log('❌ API returned success: false');
                console.log('❌ Error:', result.error);
            }
        } else {
            const errorText = await response.text();
            console.error('❌ === API TEST FAILED ===');
            console.error('❌ Status:', response.status);
            console.error('❌ Status Text:', response.statusText);
            console.error('❌ Error Response:', errorText);
        }
        
    } catch (error) {
        console.error('💥 === API TEST ERROR ===');
        console.error('💥 Error Type:', error.name);
        console.error('💥 Error Message:', error.message);
        console.error('💥 Full Error:', error);
    }
    
    console.log('🧪 === DIRECT CONTACT FORM API TEST COMPLETED ===\n');
};

// Run the test
testContactFormAPI();