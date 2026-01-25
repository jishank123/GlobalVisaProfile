// Check leads in database
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const Lead = require('./backend/models/Lead');
const User = require('./backend/models/User');

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

async function checkLeads() {
    try {
        console.log('🔍 === CHECKING LEADS IN DATABASE ===\n');
        
        // Check total leads
        const totalLeads = await Lead.countDocuments();
        console.log('📊 Total leads in database:', totalLeads);
        
        if (totalLeads === 0) {
            console.log('❌ No leads found. Running seed script might be needed.');
        } else {
            // Check lead managers
            const leadManagers = await User.find({ role: 'lead_manager' });
            console.log('👥 Lead managers found:', leadManagers.length);
            
            for (const manager of leadManagers) {
                const assignedLeads = await Lead.countDocuments({ assignedTo: manager._id });
                console.log(`   - ${manager.name} (${manager.email}): ${assignedLeads} leads`);
            }
            
            // Show sample leads
            const sampleLeads = await Lead.find().limit(3).populate('assignedTo', 'name email');
            console.log('\n📋 Sample leads:');
            sampleLeads.forEach(lead => {
                console.log(`   - ${lead.firstName} ${lead.lastName} (${lead.email}) - Status: ${lead.status} - Assigned to: ${lead.assignedTo?.name || 'Unassigned'}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
}

checkLeads();