// Debug JWT token structure
const jwt = require('jsonwebtoken');

// Token from the test (truncated in logs, but let's use a fresh one)
async function debugToken() {
  console.log('🔍 Debugging JWT Token Structure...\n');
  
  try {
    // First, let's create a test token like the system does
    const testClientId = '6974d5c1a46a99056255f089';
    
    // Create token the same way the system does
    const token = jwt.sign(
      { id: testClientId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('Generated token:', token);
    
    // Decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded token:', decoded);
    
    // Check what fields are available
    console.log('Token fields:');
    console.log('- id:', decoded.id);
    console.log('- user_id:', decoded.user_id);
    console.log('- iat:', decoded.iat);
    console.log('- exp:', decoded.exp);
    
  } catch (error) {
    console.error('❌ Token debug error:', error);
  }
}

debugToken();