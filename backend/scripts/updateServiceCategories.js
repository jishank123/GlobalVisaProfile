/**
 * Migration script: Update existing service categories to new values.
 * Assigns categories in order: EB-1A Eligibility, Profile Building, EB-2 NIW,
 * O-1 Visa, Career Coaching, Other (for the 6th).
 * Run: node scripts/updateServiceCategories.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const newCategories = [
  'EB-1A Eligibility',
  'Profile Building',
  'EB-2 NIW',
  'O-1 Visa',
  'Career Coaching',
  'Other'
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const collection = db.collection('services');

  // Fetch all non-deleted services sorted by creation date
  const services = await collection
    .find({ isDeleted: { $ne: true } })
    .sort({ createdAt: 1 })
    .toArray();

  console.log(`Found ${services.length} services`);

  for (let i = 0; i < services.length; i++) {
    const category = newCategories[i] ?? 'Other';
    await collection.updateOne(
      { _id: services[i]._id },
      { $set: { category } }
    );
    console.log(`Updated "${services[i].name || services[i]._id}" → ${category}`);
  }

  console.log('Done.');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
