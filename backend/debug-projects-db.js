// Debug projects in database directly
const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('./models/Project');
const Client = require('./models/Client');

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

const debugProjectsDB = async () => {
  try {
    console.log('📊 === DEBUGGING PROJECTS IN DATABASE ===\n');
    
    // Find the client record
    const client = await Client.findOne({ email: 'client@test.com' });
    console.log('🏢 Client record:', {
      id: client._id,
      name: client.name,
      email: client.email
    });
    
    // Find all projects
    const allProjects = await Project.find({});
    console.log('📊 Total projects in database:', allProjects.length);
    
    // Find projects for this specific client
    const clientProjects = await Project.find({ client: client._id });
    console.log('📊 Projects for this client:', clientProjects.length);
    
    if (clientProjects.length > 0) {
      console.log('\n📊 Client projects:');
      clientProjects.forEach(project => {
        console.log(`  - ${project.project_id}: ${project.service_name} (${project.status})`);
        console.log(`    Client ID: ${project.client}`);
        console.log(`    Service ID: ${project.service}`);
      });
    }
    
    // Check if there are projects with different client IDs
    if (allProjects.length > 0) {
      console.log('\n📊 All projects in database:');
      allProjects.forEach(project => {
        console.log(`  - ${project.project_id}: ${project.service_name} (${project.status})`);
        console.log(`    Client ID: ${project.client}`);
        console.log(`    Matches our client: ${project.client.toString() === client._id.toString()}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

debugProjectsDB();