const mongoose = require('mongoose');
const City = require('../models/City');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Comprehensive list of major world cities
const cities = [
  // INDIA - Major Cities
  { name: 'Mumbai', country: 'India', displayName: 'Mumbai, India', population: 20411000 },
  { name: 'Delhi', country: 'India', displayName: 'Delhi, India', population: 30291000 },
  { name: 'Bangalore', country: 'India', displayName: 'Bangalore, India', population: 12327000 },
  { name: 'Hyderabad', country: 'India', displayName: 'Hyderabad, India', population: 10004000 },
  { name: 'Ahmedabad', country: 'India', displayName: 'Ahmedabad, India', population: 8059000 },
  { name: 'Chennai', country: 'India', displayName: 'Chennai, India', population: 10971000 },
  { name: 'Kolkata', country: 'India', displayName: 'Kolkata, India', population: 14850000 },
  { name: 'Pune', country: 'India', displayName: 'Pune, India', population: 6630000 },
  { name: 'Surat', country: 'India', displayName: 'Surat, India', population: 6081000 },
  { name: 'Jaipur', country: 'India', displayName: 'Jaipur, India', population: 3460000 },
  { name: 'Lucknow', country: 'India', displayName: 'Lucknow, India', population: 3382000 },
  { name: 'Kanpur', country: 'India', displayName: 'Kanpur, India', population: 3067000 },
  { name: 'Nagpur', country: 'India', displayName: 'Nagpur, India', population: 2968000 },
  { name: 'Indore', country: 'India', displayName: 'Indore, India', population: 2597000 },
  { name: 'Thane', country: 'India', displayName: 'Thane, India', population: 2172000 },
  { name: 'Bhopal', country: 'India', displayName: 'Bhopal, India', population: 2037000 },
  { name: 'Visakhapatnam', country: 'India', displayName: 'Visakhapatnam, India', population: 2036000 },
  { name: 'Patna', country: 'India', displayName: 'Patna, India', population: 2046000 },
  { name: 'Vadodara', country: 'India', displayName: 'Vadodara, India', population: 1817000 },
  { name: 'Ghaziabad', country: 'India', displayName: 'Ghaziabad, India', population: 1729000 },

  // UNITED STATES - Major Cities
  { name: 'New York', country: 'United States', displayName: 'New York, United States', population: 8336000 },
  { name: 'Los Angeles', country: 'United States', displayName: 'Los Angeles, United States', population: 3979000 },
  { name: 'Chicago', country: 'United States', displayName: 'Chicago, United States', population: 2693000 },
  { name: 'Houston', country: 'United States', displayName: 'Houston, United States', population: 2320000 },
  { name: 'Phoenix', country: 'United States', displayName: 'Phoenix, United States', population: 1680000 },
  { name: 'Philadelphia', country: 'United States', displayName: 'Philadelphia, United States', population: 1584000 },
  { name: 'San Antonio', country: 'United States', displayName: 'San Antonio, United States', population: 1547000 },
  { name: 'San Diego', country: 'United States', displayName: 'San Diego, United States', population: 1423000 },
  { name: 'Dallas', country: 'United States', displayName: 'Dallas, United States', population: 1343000 },
  { name: 'San Jose', country: 'United States', displayName: 'San Jose, United States', population: 1021000 },
  { name: 'Austin', country: 'United States', displayName: 'Austin, United States', population: 978000 },
  { name: 'Seattle', country: 'United States', displayName: 'Seattle, United States', population: 753000 },
  { name: 'Denver', country: 'United States', displayName: 'Denver, United States', population: 716000 },
  { name: 'Boston', country: 'United States', displayName: 'Boston, United States', population: 692000 },
  { name: 'Miami', country: 'United States', displayName: 'Miami, United States', population: 467000 },

  // CANADA - Major Cities
  { name: 'Toronto', country: 'Canada', displayName: 'Toronto, Canada', population: 2930000 },
  { name: 'Montreal', country: 'Canada', displayName: 'Montreal, Canada', population: 1780000 },
  { name: 'Vancouver', country: 'Canada', displayName: 'Vancouver, Canada', population: 675000 },
  { name: 'Calgary', country: 'Canada', displayName: 'Calgary, Canada', population: 1336000 },
  { name: 'Edmonton', country: 'Canada', displayName: 'Edmonton, Canada', population: 981000 },
  { name: 'Ottawa', country: 'Canada', displayName: 'Ottawa, Canada', population: 994000 },
  { name: 'Winnipeg', country: 'Canada', displayName: 'Winnipeg, Canada', population: 749000 },

  // UNITED KINGDOM - Major Cities
  { name: 'London', country: 'United Kingdom', displayName: 'London, United Kingdom', population: 9002000 },
  { name: 'Birmingham', country: 'United Kingdom', displayName: 'Birmingham, United Kingdom', population: 1141000 },
  { name: 'Manchester', country: 'United Kingdom', displayName: 'Manchester, United Kingdom', population: 547000 },
  { name: 'Leeds', country: 'United Kingdom', displayName: 'Leeds, United Kingdom', population: 793000 },
  { name: 'Glasgow', country: 'United Kingdom', displayName: 'Glasgow, United Kingdom', population: 633000 },
  { name: 'Liverpool', country: 'United Kingdom', displayName: 'Liverpool, United Kingdom', population: 494000 },
  { name: 'Edinburgh', country: 'United Kingdom', displayName: 'Edinburgh, United Kingdom', population: 524000 },

  // PAKISTAN - Major Cities
  { name: 'Karachi', country: 'Pakistan', displayName: 'Karachi, Pakistan', population: 16094000 },
  { name: 'Lahore', country: 'Pakistan', displayName: 'Lahore, Pakistan', population: 11126000 },
  { name: 'Islamabad', country: 'Pakistan', displayName: 'Islamabad, Pakistan', population: 1095000 },
  { name: 'Rawalpindi', country: 'Pakistan', displayName: 'Rawalpindi, Pakistan', population: 2098000 },
  { name: 'Faisalabad', country: 'Pakistan', displayName: 'Faisalabad, Pakistan', population: 3204000 },

  // BANGLADESH - Major Cities
  { name: 'Dhaka', country: 'Bangladesh', displayName: 'Dhaka, Bangladesh', population: 21006000 },
  { name: 'Chittagong', country: 'Bangladesh', displayName: 'Chittagong, Bangladesh', population: 2592000 },
  { name: 'Khulna', country: 'Bangladesh', displayName: 'Khulna, Bangladesh', population: 663000 },

  // UAE - Major Cities
  { name: 'Dubai', country: 'United Arab Emirates', displayName: 'Dubai, United Arab Emirates', population: 3331000 },
  { name: 'Abu Dhabi', country: 'United Arab Emirates', displayName: 'Abu Dhabi, United Arab Emirates', population: 1483000 },
  { name: 'Sharjah', country: 'United Arab Emirates', displayName: 'Sharjah, United Arab Emirates', population: 1405000 },

  // SAUDI ARABIA - Major Cities
  { name: 'Riyadh', country: 'Saudi Arabia', displayName: 'Riyadh, Saudi Arabia', population: 7538000 },
  { name: 'Jeddah', country: 'Saudi Arabia', displayName: 'Jeddah, Saudi Arabia', population: 4078000 },
  { name: 'Mecca', country: 'Saudi Arabia', displayName: 'Mecca, Saudi Arabia', population: 2078000 },
  { name: 'Medina', country: 'Saudi Arabia', displayName: 'Medina, Saudi Arabia', population: 1512000 },

  // AUSTRALIA - Major Cities
  { name: 'Sydney', country: 'Australia', displayName: 'Sydney, Australia', population: 5312000 },
  { name: 'Melbourne', country: 'Australia', displayName: 'Melbourne, Australia', population: 5078000 },
  { name: 'Brisbane', country: 'Australia', displayName: 'Brisbane, Australia', population: 2514000 },
  { name: 'Perth', country: 'Australia', displayName: 'Perth, Australia', population: 2085000 },

  // CHINA - Major Cities
  { name: 'Shanghai', country: 'China', displayName: 'Shanghai, China', population: 27058000 },
  { name: 'Beijing', country: 'China', displayName: 'Beijing, China', population: 20463000 },
  { name: 'Guangzhou', country: 'China', displayName: 'Guangzhou, China', population: 13859000 },
  { name: 'Shenzhen', country: 'China', displayName: 'Shenzhen, China', population: 12528000 },
];

async function seedCities() {
  try {
    // Changed MONGO_URI to MONGODB_URI to match your .env
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing cities
    await City.deleteMany({});
    console.log('🗑️  Cleared existing cities');
    
    // Insert cities
    await City.insertMany(cities);
    console.log(`✅ Successfully inserted ${cities.length} cities`);
    
    console.log('\n📊 Sample cities:');
    const samples = await City.find().limit(5).sort({ population: -1 });
    samples.forEach(city => {
      console.log(`   - ${city.displayName} (pop: ${city.population.toLocaleString()})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding cities:', error);
    process.exit(1);
  }
}

seedCities();