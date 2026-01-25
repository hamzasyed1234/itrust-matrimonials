const User = require('../models/User');
const axios = require('axios');
const City = require('../models/City');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Update profile (Phase 2) - NO PROFILE PICTURE UPLOAD
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // NOTE: Profile picture is assigned randomly on registration and cannot be changed

    // Update profile fields (only if provided and not empty string 'undefined')
    if (req.body.ethnicity !== undefined && req.body.ethnicity !== '' && req.body.ethnicity !== 'undefined') {
      user.ethnicity = req.body.ethnicity;
    }
    if (req.body.height !== undefined && req.body.height !== '' && req.body.height !== 'undefined') {
      user.height = req.body.height;
    }
    if (req.body.birthPlace !== undefined && req.body.birthPlace !== '' && req.body.birthPlace !== 'undefined') {
      user.birthPlace = req.body.birthPlace;
    }
    if (req.body.currentLocation !== undefined && req.body.currentLocation !== '' && req.body.currentLocation !== 'undefined') {
      user.currentLocation = req.body.currentLocation;
    }
    
    // Residency Status
    if (req.body.residencyStatus !== undefined && req.body.residencyStatus !== '' && req.body.residencyStatus !== 'undefined') {
      user.residencyStatus = req.body.residencyStatus;
    }
    
    if (req.body.profession !== undefined && req.body.profession !== '' && req.body.profession !== 'undefined') {
      user.profession = req.body.profession;
    }
    if (req.body.education !== undefined && req.body.education !== '' && req.body.education !== 'undefined') {
      user.education = req.body.education;
    }
    
    if (req.body.maritalStatus !== undefined && req.body.maritalStatus !== '' && req.body.maritalStatus !== 'undefined') {
      user.maritalStatus = req.body.maritalStatus;
    }

    // Update phone number
    if (req.body.phoneNumber !== undefined && req.body.phoneNumber !== 'undefined') {
      user.phoneNumber = req.body.phoneNumber.trim();
    }

    // Handle languages separately (it's an array)
    if (req.body.languages) {
      try {
        const parsedLanguages = JSON.parse(req.body.languages);
        if (Array.isArray(parsedLanguages)) {
          user.languages = parsedLanguages.filter(lang => lang && lang.trim() !== '');
        }
      } catch (e) {
        console.error('Error parsing languages:', e);
      }
    }

    // Handle custom fields (optional fields like complexion, etc.)
    if (req.body.customFields) {
      try {
        const parsedCustomFields = JSON.parse(req.body.customFields);
        user.customFields = parsedCustomFields;
      } catch (e) {
        console.error('Error parsing custom fields:', e);
      }
    }
    
    // Handle tags
    if (req.body.tags) {
      try {
        const parsedTags = JSON.parse(req.body.tags);
        if (Array.isArray(parsedTags)) {
          // Filter out empty tags and limit to 10 tags, 20 chars each
          user.tags = parsedTags
            .filter(tag => tag && tag.trim() !== '')
            .map(tag => tag.trim().substring(0, 20))
            .slice(0, 10);
        }
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }
    
    // Check if ALL required fields are completed
    const requiredFields = [
      'ethnicity',
      'height',
      'birthPlace',
      'currentLocation',
      'residencyStatus',
      'profession',
      'education',
      'maritalStatus',
      'phoneNumber'
    ];

    const allFieldsCompleted = requiredFields.every(field => {
      const value = user[field];
      // Check for null, undefined, empty string, or whitespace-only string
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      return true;
    });

    // Also check that languages array has at least one language
    const hasLanguages = Array.isArray(user.languages) && 
                         user.languages.length > 0 && 
                         user.languages.some(lang => lang && lang.trim() !== '');

    // Mark profile as completed only if ALL required fields are filled
    user.profileCompleted = allFieldsCompleted && hasLanguages;

    await user.save();

    // Return updated user without password
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Server error updating profile',
      error: error.message 
    });
  }
};

// ✅ UPDATED: Search cities with database-first approach and API fallback
// Now accepts optional 'country' parameter to filter cities by country
exports.searchCities = async (req, res) => {
  try {
    const { query, country } = req.query; // ✅ ADDED: country parameter
    
    if (!query || query.length < 2) {
      return res.json({ cities: [] });
    }
    
    // STEP 1: Search our database first (FAST)
    const searchRegex = new RegExp(`^${query}`, 'i');
    
    // ✅ ADDED: Build search conditions with optional country filter
    const searchConditions = {
      $or: [
        { name: searchRegex },
        { displayName: searchRegex }
      ]
    };
    
    // ✅ ADDED: Filter by country if provided
    if (country) {
      searchConditions.country = country;
    }
    
    // ✅ UPDATED: Use searchConditions instead of inline query
    let cities = await City.find(searchConditions)
      .sort({ population: -1 })
      .limit(10)
      .select('displayName')
      .lean();
    
    // STEP 2: If we have results, return them immediately
    if (cities.length > 0) {
      // ✅ UPDATED: Log now includes country filter if present
      console.log(`🔍 Search query: "${query}"${country ? ` | Country: ${country}` : ''} | Results: ${cities.length} | Source: database`);
      return res.json({ 
        cities: cities.map(c => ({
          value: c.displayName,
          label: c.displayName
        })),
        source: 'database'
      });
    }
    
    // STEP 3: Only if no results, try external API as fallback (OPTIONAL)
    try {
      const geoapifyKey = process.env.GEOAPIFY_API_KEY;
      
      if (geoapifyKey) {
        const response = await axios.get(
          `https://api.geoapify.com/v1/geocode/autocomplete`,
          {
            params: {
              text: query,
              type: 'city',
              limit: 5,
              apiKey: geoapifyKey
            },
            timeout: 2000
          }
        );
        
        const apiCities = response.data.features.map(feature => {
          const city = feature.properties.city || feature.properties.name;
          const country = feature.properties.country;
          const displayName = `${city}, ${country}`;
          
          // Cache to database for future searches
          City.create({
            name: city,
            country: country,
            displayName: displayName,
            population: feature.properties.population || 0,
            verified: false,
            latitude: feature.properties.lat,
            longitude: feature.properties.lon
          }).catch(err => console.error('Error caching city:', err));
          
          return {
            value: displayName,
            label: displayName
          };
        });
        
        console.log(`🔍 Search query: "${query}" | Results: ${apiCities.length} | Source: api`);
        return res.json({ cities: apiCities, source: 'api' });
      }
    } catch (apiError) {
      console.error('API fallback failed:', apiError.message);
    }
    
    // STEP 4: No results from either source
    console.log(`🔍 Search query: "${query}" | Results: 0 | Source: none`);
    return res.json({ cities: [], source: 'none' });
    
  } catch (error) {
    console.error('Error searching cities:', error);
    res.status(500).json({ message: 'Error searching cities' });
  }
};

// ✅ NEW: Get unique countries from database
exports.getCountries = async (req, res) => {
  try {
    const { countryMap } = require('../utils/countries');
    
    // Get all unique country codes from City collection
    const countryCodes = await City.find({}).distinct('country');
    
    // Map country codes to full names and format for Select dropdown
    const countries = countryCodes
      .map(code => ({
        value: code,
        label: countryMap[code] || code
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    
    res.json({ countries });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ message: 'Error fetching countries', error: error.message });
  }
};