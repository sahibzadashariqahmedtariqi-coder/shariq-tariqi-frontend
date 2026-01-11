import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function checkUsage() {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('\n========================================');
    console.log('       📊 USAGE STATISTICS REPORT       ');
    console.log('========================================\n');

    // MongoDB Stats
    const stats = await conn.connection.db.stats();
    const collections = await conn.connection.db.listCollections().toArray();
    
    console.log('🗄️  MONGODB ATLAS (Free Tier: 512 MB)');
    console.log('----------------------------------------');
    console.log(`   Database Name:    ${stats.db}`);
    console.log(`   Storage Used:     ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Data Size:        ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Index Size:       ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    const totalMB = (stats.storageSize + stats.indexSize) / 1024 / 1024;
    const remainingMB = 512 - totalMB;
    const percentUsed = (totalMB / 512 * 100).toFixed(1);
    console.log(`   Total Used:       ${totalMB.toFixed(2)} MB`);
    console.log(`   Remaining:        ${remainingMB.toFixed(2)} MB`);
    console.log(`   Usage:            ${percentUsed}% of 512 MB`);
    console.log(`   Collections:      ${stats.collections}`);
    console.log(`   Total Documents:  ${stats.objects}`);
    
    // List all collections with document counts
    console.log('\n   📁 Collections:');
    for (const coll of collections) {
      const count = await conn.connection.db.collection(coll.name).countDocuments();
      console.log(`      - ${coll.name}: ${count} documents`);
    }

    // Cloudinary Stats
    console.log('\n\n☁️  CLOUDINARY (Free Tier: 25 Credits/month)');
    console.log('----------------------------------------');
    
    try {
      const usage = await cloudinary.api.usage();
      
      console.log(`   Plan:             ${usage.plan || 'Free'}`);
      console.log(`   Credits Used:     ${usage.credits?.used || 0}`);
      console.log(`   Credits Limit:    ${usage.credits?.limit || 25}`);
      console.log(`   Credits Remaining: ${(usage.credits?.limit || 25) - (usage.credits?.used || 0)}`);
      console.log(`   Usage %:          ${usage.credits?.used_percent || 0}%`);
      console.log(`   Storage Used:     ${((usage.storage?.usage || 0) / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Bandwidth Used:   ${((usage.bandwidth?.usage || 0) / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Transformations:  ${usage.transformations?.usage || 0}`);
      console.log(`   Total Resources:  ${usage.resources || 0}`);
      console.log(`   Derived Resources: ${usage.derived_resources || 0}`);
    } catch (cloudErr) {
      console.log('   ⚠️  Could not fetch Cloudinary stats');
      console.log(`   Error: ${cloudErr.message}`);
    }

    console.log('\n========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsage();
