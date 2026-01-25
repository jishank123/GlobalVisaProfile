// Fix duplicate client records
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const ClientAccount = require('./models/ClientAccount');
const Client = require('./models/Client');

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

const fixDuplicateClient = async () => {
  try {
    console.log('🔧 === FIXING DUPLICATE CLIENT RECORDS ===\n');
    
    // Find the duplicate User record
    const duplicateUser = await User.findOne({ email: 'client@test.com' });
    console.log('🔍 Found duplicate User:', duplicateUser ? duplicateUser._id : 'NOT FOUND');
    
    // Find the ClientAccount record
    const clientAccount = await ClientAccount.findOne({ email: 'client@test.com' });
    console.log('🔍 Found ClientAccount:', clientAccount ? clientAccount._id : 'NOT FOUND');
    
    // Find the Client record
    const client = await Client.findOne({ email: 'client@test.com' });
    console.log('🔍 Found Client:', client ? client._id : 'NOT FOUND');
    
    if (duplicateUser) {
      console.log('🗑️ Removing duplicate User record...');
      await User.findByIdAndDelete(duplicateUser._id);
      console.log('✅ Duplicate User record removed');
    }
    
    console.log('\n✅ Fix completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

fixDuplicateClient();