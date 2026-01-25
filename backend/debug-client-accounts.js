// Debug client accounts in database
const mongoose = require('mongoose');
require('dotenv').config();

const ClientAccount = require('./models/ClientAccount');
const Client = require('./models/Client');

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

const debugClientAccounts = async () => {
  try {
    console.log('📊 === DEBUGGING CLIENT ACCOUNTS ===\n');
    
    // Find all client accounts
    const clientAccounts = await ClientAccount.find({});
    console.log('📊 Total ClientAccounts in database:', clientAccounts.length);
    
    if (clientAccounts.length > 0) {
      console.log('\n📊 ClientAccounts:');
      clientAccounts.forEach(account => {
        console.log(`  - ${account._id}: ${account.email} (${account.full_name})`);
      });
    }
    
    // Find all clients
    const clients = await Client.find({});
    console.log('\n📊 Total Clients in database:', clients.length);
    
    if (clients.length > 0) {
      console.log('\n📊 Clients:');
      clients.forEach(client => {
        console.log(`  - ${client._id}: ${client.email} (${client.name})`);
      });
    }
    
    // Check for client@test.com specifically
    const testClientAccount = await ClientAccount.findOne({ email: 'client@test.com' });
    const testClient = await Client.findOne({ email: 'client@test.com' });
    
    console.log('\n🔍 Test client lookup:');
    console.log('ClientAccount for client@test.com:', testClientAccount ? testClientAccount._id : 'NOT FOUND');
    console.log('Client for client@test.com:', testClient ? testClient._id : 'NOT FOUND');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

debugClientAccounts();