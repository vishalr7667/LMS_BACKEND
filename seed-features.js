const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course'); // Adjust path as needed

dotenv.config();

const featuresList = [
  '30 hours on-demand video content',
  'Full lifetime access',
  'Access on mobile and desktop',
  'Certificate of completion',
  '14-day money-back guarantee'
];

async function seedFeatures() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB...');

    // Update all courses that don't have features or have empty features
    const courses = await Course.find({
      $or: [
        { features: { $exists: false } },
        { features: { $size: 0 } }
      ]
    });

    console.log(`Found ${courses.length} courses to update.`);

    for (const course of courses) {
      course.features = featuresList;
      await course.save();
      console.log(`Updated features for course: ${course.title}`);
    }

    console.log('Features seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding features:', error);
    process.exit(1);
  }
}

seedFeatures();
