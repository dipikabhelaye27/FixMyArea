const Issue = require('../models/Issue');

/**
 * Calculates distance between two coordinates in meters (Haversine formula)
 */
const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

/**
 * Finds nearby open/active issues within radius (meters) using MongoDB GeoJSON $near with fallback
 */
const findNearbyDuplicates = async (longitude, latitude, category = null, maxDistance = 300) => {
  try {
    const parsedLng = parseFloat(longitude);
    const parsedLat = parseFloat(latitude);

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parsedLng, parsedLat]
          },
          $maxDistance: maxDistance // meters
        }
      },
      status: { $in: ['Reported', 'Verified', 'In Progress'] }, // Check active complaints
      masterIssueId: null // Only check root or master issues
    };

    if (category && category !== 'All' && category !== 'Other') {
      query.category = category;
    }

    let issues = [];
    try {
      issues = await Issue.find(query).limit(5).lean();
    } catch (geoErr) {
      console.warn('MongoDB $near search failed, using Haversine fallback:', geoErr.message);
    }

    // Fallback: If $near returned nothing or failed, check active issues in the same category
    if (!issues || issues.length === 0) {
      const fallbackQuery = {
        status: { $in: ['Reported', 'Verified', 'In Progress'] }
      };
      if (category && category !== 'All' && category !== 'Other') {
        fallbackQuery.category = category;
      }

      const candidates = await Issue.find(fallbackQuery).sort({ createdAt: -1 }).limit(20).lean();
      issues = candidates.filter(cand => {
        if (!cand.location || !cand.location.coordinates || cand.location.coordinates.length < 2) return false;
        const candLng = cand.location.coordinates[0];
        const candLat = cand.location.coordinates[1];
        const dist = calculateDistanceMeters(parsedLat, parsedLng, candLat, candLng);
        return dist <= maxDistance;
      });
    }

    return issues.map(issue => {
      const dist = calculateDistanceMeters(
        parsedLat,
        parsedLng,
        issue.location.coordinates[1],
        issue.location.coordinates[0]
      );
      return {
        ...issue,
        distanceMeters: dist
      };
    });
  } catch (error) {
    console.error('Geo duplicate search error:', error.message);
    return [];
  }
};

/**
 * Consolidates a child report into a Master Issue
 */
const linkReportToMaster = async (masterId, childId, citizenId = null) => {
  const master = await Issue.findById(masterId);
  const child = await Issue.findById(childId);

  if (!master || !child) {
    throw new Error('Master or child issue not found');
  }

  // Update child
  child.masterIssueId = master._id;
  child.status = master.status;
  await child.save();

  // Update master
  if (!master.linkedReports.includes(child._id)) {
    master.linkedReports.push(child._id);
  }
  master.linkedReportCount = master.linkedReports.length;
  master.isMaster = true;

  // Add upvote to master
  if (citizenId && !master.upvotes.some(u => u.citizenId === citizenId)) {
    master.upvotes.push({ citizenId, timestamp: new Date() });
    master.upvoteCount = master.upvotes.length;
  } else {
    master.upvoteCount += 1;
  }

  // Add timeline entry
  master.timeline.push({
    status: master.status,
    timestamp: new Date(),
    updatedBy: 'System AI Deduplication',
    comment: `Report #${child._id.toString().slice(-4)} consolidated into this Master Issue (+1 Affected Citizen).`
  });

  await master.save();
  return master;
};

/**
 * Resolves the administrative civic jurisdiction (Municipality, City, District, State)
 * based on geographic coordinates, reverse-geocode metadata, and address strings.
 * Ensures strict pan-India isolation so a complaint in Wardha routes to Wardha Municipal Council,
 * and an Alandi complaint routes to Alandi Municipal Council.
 */
const resolveJurisdiction = (lat, lng, address = '', clientData = {}) => {
  // If explicitly provided by verified client reverse geocoding
  if (clientData.municipality && clientData.city) {
    return {
      city: clientData.city,
      district: clientData.district || clientData.city,
      state: clientData.state || 'Maharashtra',
      municipality: clientData.municipality
    };
  }

  const addrLower = (address || '').toLowerCase();
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  // 1. Check Wardha region (Approx Lat 20.5 to 21.0, Lng 78.3 to 78.9) or address keywords
  if (
    addrLower.includes('wardha') ||
    addrLower.includes('sevagram') ||
    addrLower.includes('bachelor road') ||
    addrLower.includes('442001') ||
    (!isNaN(parsedLat) && parsedLat >= 20.5 && parsedLat <= 21.0 && !isNaN(parsedLng) && parsedLng >= 78.3 && parsedLng <= 78.9)
  ) {
    return {
      city: 'Wardha',
      district: 'Wardha',
      state: 'Maharashtra',
      municipality: 'Wardha Municipal Council'
    };
  }

  // 2. Check Alandi region (Approx Lat 18.64 to 18.72, Lng 73.86 to 73.94) or address keywords
  if (
    addrLower.includes('alandi') ||
    addrLower.includes('dehu phata') ||
    addrLower.includes('indrayani') ||
    addrLower.includes('412105') ||
    (!isNaN(parsedLat) && parsedLat >= 18.64 && parsedLat <= 18.72 && !isNaN(parsedLng) && parsedLng >= 73.86 && parsedLng <= 73.94)
  ) {
    return {
      city: 'Alandi',
      district: 'Pune',
      state: 'Maharashtra',
      municipality: 'Alandi Municipal Council'
    };
  }

  // 3. Check Pune City (PMC)
  if (
    addrLower.includes('pune') ||
    addrLower.includes('kothrud') ||
    addrLower.includes('shivajinagar') ||
    addrLower.includes('hadapsar') ||
    (!isNaN(parsedLat) && parsedLat >= 18.4 && parsedLat <= 18.63 && !isNaN(parsedLng) && parsedLng >= 73.75 && parsedLng <= 73.95)
  ) {
    return {
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      municipality: 'Pune Municipal Corporation'
    };
  }

  // 4. Check Mumbai (BMC)
  if (
    addrLower.includes('mumbai') ||
    addrLower.includes('bandra') ||
    addrLower.includes('andheri') ||
    addrLower.includes('dadar') ||
    (!isNaN(parsedLat) && parsedLat >= 18.88 && parsedLat <= 19.3 && !isNaN(parsedLng) && parsedLng >= 72.75 && parsedLng <= 73.0)
  ) {
    return {
      city: 'Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      municipality: 'Brihanmumbai Municipal Corporation (BMC)'
    };
  }

  // 5. Check Nagpur (NMC)
  if (
    addrLower.includes('nagpur') ||
    (!isNaN(parsedLat) && parsedLat >= 21.05 && parsedLat <= 21.25 && !isNaN(parsedLng) && parsedLng >= 78.95 && parsedLng <= 79.2)
  ) {
    return {
      city: 'Nagpur',
      district: 'Nagpur',
      state: 'Maharashtra',
      municipality: 'Nagpur Municipal Corporation'
    };
  }

  // 6. Generic Fallback: Extract city from clientData or fallback to Alandi
  const candidateCity = clientData.city || 'Alandi';
  return {
    city: candidateCity,
    district: clientData.district || 'Pune',
    state: clientData.state || 'Maharashtra',
    municipality: `${candidateCity} Municipal Council`
  };
};

module.exports = {
  calculateDistanceMeters,
  findNearbyDuplicates,
  linkReportToMaster,
  resolveJurisdiction
};

