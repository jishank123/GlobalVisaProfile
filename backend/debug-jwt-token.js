// Debug JWT token to see what user info it contains
const jwt = require('jsonwebtoken');

// Token from the test
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NzYwMDExYzIxNjhiMzkxNzQyZmUyZCIsImlhdCI6MTc2OTM0NTA3MCwiZXhwIjoxNzY5NDMxNDcwfQ.z6nhvaCUkDtnAqSKTedt5Bqzbcim00_oqoRStF9XRDQ';

try {
  // Decode without verification to see payload
  const decoded = jwt.decode(token);
  console.log('🔍 JWT Token payload:', decoded);
  
  // The ID in the token
  console.log('👤 User ID from token:', decoded.id);
  
} catch (error) {
  console.error('❌ Error decoding token:', error);
}