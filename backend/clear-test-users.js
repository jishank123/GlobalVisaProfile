const mongoose = require('mongoose');
const ClientAccount = require('./models/ClientAccount');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/academic_erp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function clearTestUsers() {
  try {
    console.log('🧹 Clearing test users...');
    
    // Remove test users
    const result = await ClientAccount.deleteMany({
      email: { $in: ['test@example.com', 'john@example.com', 'jane@example.com'] }
    });
    
    console.log(`🗑️ Removed ${result.deletedCount} test users`);
    
    // Count remaining users
    const totalUsers = await ClientAccount.countDocuments();
    console.log(`👥 Total users remaining: ${totalUsers}`);
    
  } catch (error) {
    console.error('💥 Error clearing test users:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

clearTestUsers();