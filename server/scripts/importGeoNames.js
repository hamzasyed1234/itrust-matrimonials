const fs = require('fs');
const mongoose = require('mongoose');
const City = require('../models/City');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function importGeoNames() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing cities
    await City.deleteMany({});
    console.log('🗑️  Cleared existing cities');
    
    const cities = [];
    const fileContent = fs.readFileSync(path.join(__dirname, 'cities15000.txt'), 'utf8');
    const lines = fileContent.split('\n');
    
    console.log(`📖 Reading ${lines.length} cities...`);
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const fields = line.split('\t');
      const name = fields[1];
      const country = fields[8];
      const population = parseInt(fields[14]) || 0;
      const latitude = parseFloat(fields[4]);
      const longitude = parseFloat(fields[5]);
      
      if (name && country && population >= 15000) {
        cities.push({
          name: name,
          country: country,
          displayName: `${name}, ${country}`,
          population: population,
          verified: true,
          latitude: latitude,
          longitude: longitude
        });
      }
    }
    
    console.log(`💾 Inserting ${cities.length} cities...`);
    
    // Insert in batches
    const batchSize = 1000;
    for (let i = 0; i < cities.length; i += batchSize) {
      const batch = cities.slice(i, i + batchSize);
      await City.insertMany(batch);
      console.log(`   ✓ Inserted ${Math.min(i + batchSize, cities.length)}/${cities.length}`);
    }
    
    console.log(`\n✅ Successfully inserted ${cities.length} cities!`);
    
    console.log('\n📊 Sample cities:');
    const samples = await City.find().limit(10).sort({ population: -1 });
    samples.forEach(city => {
      console.log(`   - ${city.displayName} (pop: ${city.population.toLocaleString()})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

importGeoNames();