require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Issue = require('../models/Issue');
const Department = require('../models/Department');
const User = require('../models/User');

const staffData = [
  // ==========================================
  // 1. ALANDI MUNICIPAL COUNCIL (PUNE DISTRICT)
  // ==========================================
  {
    name: 'Shri Vikram Shinde',
    email: 'admin@fixmyarea.gov',
    password: 'admin123',
    role: 'admin',
    department: 'All',
    designation: 'Chief Municipal Commissioner & Executive Admin',
    city: 'Alandi',
    district: 'Pune',
    state: 'Maharashtra',
    municipality: 'Alandi Municipal Council',
    ward: 'Alandi Municipal Council (All Wards)'
  },
  {
    name: 'Er. Rajesh Kulkarni',
    email: 'roads@fixmyarea.gov',
    password: 'officer123',
    role: 'officer',
    department: 'Roads & Infrastructure',
    designation: 'Executive Road Infrastructure Engineer (Alandi)',
    city: 'Alandi',
    district: 'Pune',
    state: 'Maharashtra',
    municipality: 'Alandi Municipal Council',
    ward: 'Ward 1 - Temple & Ghat'
  },
  {
    name: 'Dr. Sunita Deshmukh',
    email: 'waste@fixmyarea.gov',
    password: 'officer123',
    role: 'officer',
    department: 'Solid Waste Management',
    designation: 'Chief Sanitation & Waste Management Inspector (Alandi)',
    city: 'Alandi',
    district: 'Pune',
    state: 'Maharashtra',
    municipality: 'Alandi Municipal Council',
    ward: 'Ward 2 - Dehu Phata'
  },
  {
    name: 'Er. Anil Patil',
    email: 'water@fixmyarea.gov',
    password: 'officer123',
    role: 'officer',
    department: 'Water & Sewerage',
    designation: 'Superintendent Water Works & Drainage Engineer (Alandi)',
    city: 'Alandi',
    district: 'Pune',
    state: 'Maharashtra',
    municipality: 'Alandi Municipal Council',
    ward: 'Ward 3 - Markal Road'
  },
  {
    name: 'Er. Meera Nair',
    email: 'electrical@fixmyarea.gov',
    password: 'officer123',
    role: 'officer',
    department: 'Electrical & Streetlighting',
    designation: 'Senior Municipal Electrical Engineer (Alandi)',
    city: 'Alandi',
    district: 'Pune',
    state: 'Maharashtra',
    municipality: 'Alandi Municipal Council',
    ward: 'Ward 4 - Charholi / Pune Road'
  },

  // ==========================================
  // 2. WARDHA MUNICIPAL COUNCIL (WARDHA DISTRICT)
  // ==========================================
  {
    name: 'Shri Rameshwar Thakre',
    email: 'wardha.admin@fixmyarea.gov',
    password: 'admin123',
    role: 'admin',
    department: 'All',
    designation: 'Chief Municipal Officer (CMO), Wardha Municipal Council',
    city: 'Wardha',
    district: 'Wardha',
    state: 'Maharashtra',
    municipality: 'Wardha Municipal Council',
    ward: 'Wardha Municipal Council (All Wards)'
  },
  {
    name: 'Dr. Pradeep Wankhede',
    email: 'wardha.waste@fixmyarea.gov',
    password: 'officer123',
    role: 'officer',
    department: 'Solid Waste Management',
    designation: 'Chief Sanitary Inspector & SWM In-Charge (Wardha)',
    city: 'Wardha',
    district: 'Wardha',
    state: 'Maharashtra',
    municipality: 'Wardha Municipal Council',
    ward: 'Ward 1 - Sevagram Road Zone'
  },
  {
    name: 'Er. Nitin Deshpande',
    email: 'wardha.roads@fixmyarea.gov',
    password: 'officer123',
    role: 'officer',
    department: 'Roads & Infrastructure',
    designation: 'Executive PWD Engineer (Wardha)',
    city: 'Wardha',
    district: 'Wardha',
    state: 'Maharashtra',
    municipality: 'Wardha Municipal Council',
    ward: 'Ward 3 - Station & Bachelor Road'
  },
  {
    name: 'Er. Sandeep Bhende',
    email: 'wardha.water@fixmyarea.gov',
    password: 'officer123',
    role: 'officer',
    department: 'Water & Sewerage',
    designation: 'Superintendent Water Works Engineer (Wardha)',
    city: 'Wardha',
    district: 'Wardha',
    state: 'Maharashtra',
    municipality: 'Wardha Municipal Council',
    ward: 'Ward 5 - Subhash Nagar & Ramnagar'
  },

  // ==========================================
  // 3. APEX DIRECTORATE (PAN-INDIA OVERVIEW)
  // ==========================================
  {
    name: 'Dr. Arvind Joshi, IAS',
    email: 'director@fixmyarea.gov',
    password: 'admin123',
    role: 'admin',
    department: 'All',
    designation: 'Director General of Municipal Administration (Pan-India Directorate)',
    city: 'All',
    district: 'All',
    state: 'India',
    municipality: 'All Municipalities (Pan-India)',
    ward: 'National & State Overview'
  }
];

const departmentsData = [
  {
    name: 'Roads & Infrastructure',
    code: 'ENGG-ROADS',
    headOfficer: 'Er. Rajesh Kulkarni',
    phone: '020-27185011',
    color: '#0284c7',
    categoriesHandled: ['Roads & Potholes', 'Public Infrastructure']
  },
  {
    name: 'Solid Waste Management',
    code: 'SWM-ENV',
    headOfficer: 'Dr. Sunita Deshmukh',
    phone: '020-27185012',
    color: '#10b981',
    categoriesHandled: ['Solid Waste & Garbage']
  },
  {
    name: 'Water & Sewerage',
    code: 'HYD-WATER',
    headOfficer: 'Er. Anil Patil',
    phone: '020-27185013',
    color: '#3b82f6',
    categoriesHandled: ['Water Supply & Drainage']
  },
  {
    name: 'Electrical & Streetlighting',
    code: 'ELEC-POWER',
    headOfficer: 'Er. Meera Nair',
    phone: '020-27185014',
    color: '#f59e0b',
    categoriesHandled: ['Streetlights & Electricity']
  }
];

// 20 Authentic, Diverse Civic Issues across Categories, Wards & Statuses
const alandiSampleIssues = [
  // 1. Roads & Potholes - In Progress
  {
    title: 'Deep Asphalt Pothole on Pradakshina Marg near Temple Gate 2',
    description: 'Large surface cavity in asphalt road causing sudden braking and two-wheeler skidding near Sant Dnyaneshwar Maharaj Temple approach.',
    category: 'Roads & Potholes',
    subCategory: 'Road Surface Defect',
    location: { type: 'Point', coordinates: [73.8985, 18.6775] },
    address: 'Near Gate No. 2, Pradakshina Road, Alandi Devachi, Pune 412105',
    ward: 'Ward 1 - Temple & Ghat',
    imageUrl: '/issues/pothole-1.jpg',
    status: 'In Progress',
    severity: 5,
    hazardLevel: 'Critical',
    priorityScore: 94,
    department: 'Roads & Infrastructure',
    assignedWorker: {
      name: 'Santosh Gaikwad (Alandi PWD Road Maintenance Unit)',
      phone: '+91 98220 44123',
      assignedAt: new Date(Date.now() - 3600000 * 6)
    },
    upvotes: [{ citizenId: 'cit-1' }, { citizenId: 'cit-2' }, { citizenId: 'cit-3' }, { citizenId: 'cit-4' }, { citizenId: 'cit-5' }],
    upvoteCount: 5,
    slaDeadline: new Date(Date.now() + 3600000 * 6),
    aiAnalysis: {
      detectedCategory: 'Roads & Potholes',
      confidence: 0.96,
      severity: 5,
      hazardLevel: 'Critical',
      detectedHazards: ['Two-wheeler skid hazard during pilgrim rush', 'Traffic bottleneck'],
      estimatedTurnaroundHours: 12,
      aiSummary: 'Severe cavity in bitumen wear course. Cold-mix asphalt filling and mechanical roller compaction required.'
    }
  },

  // 2. Solid Waste & Garbage - Reported
  {
    title: 'Solid Waste Accumulation near Indrayani River Ghat Steps',
    description: 'Floral offerings, plastic bags, and community waste overflowing onto the pedestrian pathway leading to the holy river ghat.',
    category: 'Solid Waste & Garbage',
    subCategory: 'Waste Overflow',
    location: { type: 'Point', coordinates: [73.8962, 18.6758] },
    address: 'Indrayani River Ghat Road, Near Bhaktaniwas, Alandi, Pune 412105',
    ward: 'Ward 1 - Temple & Ghat',
    imageUrl: '/issues/garbage-1.jpg',
    status: 'Reported',
    severity: 4,
    hazardLevel: 'High',
    priorityScore: 82,
    department: 'Solid Waste Management',
    upvotes: [{ citizenId: 'cit-6' }, { citizenId: 'cit-7' }, { citizenId: 'cit-8' }],
    upvoteCount: 3,
    slaDeadline: new Date(Date.now() + 3600000 * 18),
    aiAnalysis: {
      detectedCategory: 'Solid Waste & Garbage',
      confidence: 0.94,
      severity: 4,
      hazardLevel: 'High',
      detectedHazards: ['Riverbank contamination', 'Pedestrian walkway obstruction'],
      estimatedTurnaroundHours: 24,
      aiSummary: 'Solid waste container overflow on public ghat approach. Tipper truck dispatch requested.'
    }
  },

  // 3. Water Supply & Drainage - Resolved
  {
    title: 'High-Pressure Underground Water Pipeline Breach on Dehu Phata Road',
    description: 'Piped water main fractured under footpath, causing freshwater geyser and washing away road sub-base near commercial shops.',
    category: 'Water Supply & Drainage',
    subCategory: 'Main Pipeline Fracture',
    location: { type: 'Point', coordinates: [73.8924, 18.6742] },
    address: 'Opposite State Bank of India, Dehu Phata, Alandi, Pune 412105',
    ward: 'Ward 2 - Dehu Phata',
    imageUrl: '/issues/water-1.jpg',
    status: 'Resolved',
    severity: 5,
    hazardLevel: 'Critical',
    priorityScore: 91,
    department: 'Water & Sewerage',
    upvotes: [{ citizenId: 'cit-9' }, { citizenId: 'cit-10' }, { citizenId: 'cit-11' }, { citizenId: 'cit-12' }],
    upvoteCount: 4,
    resolutionProof: {
      afterImageUrl: '/issues/resolved-water-1.jpg',
      resolvedAt: new Date(Date.now() - 3600000 * 4),
      resolvedBy: 'Er. Anil Patil (Water Dept)',
      resolutionNotes: 'Excavated 1.2m depth, clamped ruptured 150mm DI pipe, backfilled with gravel and restored surface pressure.',
      aiVerificationScore: 96,
      aiVerificationNotes: 'Computer vision confirms pipeline sealed, zero surface ponding, roadway cleared.',
      aiVerificationPass: true
    },
    citizenVerification: {
      isVerified: false,
      status: 'Pending',
      comment: '',
      verifiedAt: null
    },
    aiAnalysis: {
      detectedCategory: 'Water Supply & Drainage',
      confidence: 0.97,
      severity: 5,
      hazardLevel: 'Critical',
      detectedHazards: ['Potable water loss estimated at 1200L/hr', 'Sub-base erosion risking road collapse'],
      estimatedTurnaroundHours: 8,
      aiSummary: 'Major distribution pipeline rupture. Emergency isolation valve shutoff executed.'
    }
  },

  // 4. Streetlights & Electricity - Citizen Confirmed
  {
    title: 'Non-Functional Streetlight Column on Alandi-Markal Road',
    description: 'Streetlight column not illuminating, resulting in total darkness along a 150-meter stretch near the APMC market junction.',
    category: 'Streetlights & Electricity',
    subCategory: 'Luminaire Malfunction',
    location: { type: 'Point', coordinates: [73.9030, 18.6795] },
    address: 'Near APMC Market Gate, Alandi-Markal Road, Pune 412105',
    ward: 'Ward 3 - Markal Road',
    imageUrl: '/issues/electrical-1.jpg',
    status: 'Citizen Confirmed',
    severity: 4,
    hazardLevel: 'High',
    priorityScore: 88,
    department: 'Electrical & Streetlighting',
    upvotes: [{ citizenId: 'cit-13' }, { citizenId: 'cit-14' }, { citizenId: 'cit-15' }],
    upvoteCount: 3,
    resolutionProof: {
      afterImageUrl: '/issues/resolved-electrical-1.jpg',
      resolvedAt: new Date(Date.now() - 3600000 * 24),
      resolvedBy: 'Er. Meera Nair (Electrical)',
      resolutionNotes: 'Replaced faulty driver unit and installed new 90W LED luminaire. Cable insulation verified.',
      aiVerificationScore: 98,
      aiVerificationNotes: 'Night-time verification confirms luminaire functioning with uniform illumination on roadway.',
      aiVerificationPass: true
    },
    citizenVerification: {
      isVerified: true,
      status: 'Confirmed',
      comment: 'Repaired within 24 hours. The entire market junction is well-lit and safe for night commuters.',
      rating: 5,
      verifiedAt: new Date(Date.now() - 3600000 * 12)
    },
    aiAnalysis: {
      detectedCategory: 'Streetlights & Electricity',
      confidence: 0.95,
      severity: 4,
      hazardLevel: 'High',
      detectedHazards: ['Zero illumination causing night collision risk', 'Pedestrian security issue'],
      estimatedTurnaroundHours: 24,
      aiSummary: 'Defective street illumination pole on arterial connecting road.'
    }
  },

  // 5. Roads & Potholes - Reported
  {
    title: 'Severe Asphalt Surface Rutting & Broken Curb on Charholi Phata',
    description: 'Heavy truck traffic has crushed the road shoulder, creating a dangerous 8-inch elevation difference between lane and dirt edge.',
    category: 'Roads & Potholes',
    subCategory: 'Shoulder Drop-off',
    location: { type: 'Point', coordinates: [73.9110, 18.6690] },
    address: 'Charholi Phata Junction, Alandi-Pune Highway, Pune 412105',
    ward: 'Ward 4 - Charholi / Pune Road',
    imageUrl: '/issues/pothole-2.jpg',
    status: 'Reported',
    severity: 4,
    hazardLevel: 'High',
    priorityScore: 79,
    department: 'Roads & Infrastructure',
    upvotes: [{ citizenId: 'cit-16' }, { citizenId: 'cit-17' }],
    upvoteCount: 2,
    slaDeadline: new Date(Date.now() + 3600000 * 24),
    aiAnalysis: {
      detectedCategory: 'Roads & Potholes',
      confidence: 0.93,
      severity: 4,
      hazardLevel: 'High',
      detectedHazards: ['Vehicle overturn hazard on high-speed descent', 'Unstable road edge'],
      estimatedTurnaroundHours: 36,
      aiSummary: 'Damaged road edge requiring shoulder reinforcement and hot bituminous patch.'
    }
  },

  // 6. Solid Waste & Garbage - In Progress
  {
    title: 'Overflowing Community Dustbins & Stray Animals near Weekly Market Yard',
    description: 'Commercial vegetable and fruit waste scattered over 40-meter radius. Stray cattle obstructing road and foul stench spreading.',
    category: 'Solid Waste & Garbage',
    subCategory: 'Market Waste Overflow',
    location: { type: 'Point', coordinates: [73.9015, 18.6740] },
    address: 'Athavade Bazaar Ground, Near Old Bus Stand, Alandi, Pune 412105',
    ward: 'Ward 2 - Dehu Phata',
    imageUrl: '/issues/garbage-2.jpg',
    status: 'In Progress',
    severity: 4,
    hazardLevel: 'High',
    priorityScore: 84,
    department: 'Solid Waste Management',
    assignedWorker: {
      name: 'Vikas Jadhav (Sanitation Lead, SWM Division)',
      phone: '+91 97654 32189',
      assignedAt: new Date(Date.now() - 3600000 * 3)
    },
    upvotes: [{ citizenId: 'cit-18' }, { citizenId: 'cit-19' }, { citizenId: 'cit-20' }, { citizenId: 'cit-21' }],
    upvoteCount: 4,
    slaDeadline: new Date(Date.now() + 3600000 * 12),
    aiAnalysis: {
      detectedCategory: 'Solid Waste & Garbage',
      confidence: 0.96,
      severity: 4,
      hazardLevel: 'High',
      detectedHazards: ['Vector disease breeding ground', 'Pedestrian traffic blockage'],
      estimatedTurnaroundHours: 12,
      aiSummary: 'Compactor vehicle and disinfection crew dispatched for thorough perimeter cleaning.'
    }
  },

  // 7. Water Supply & Drainage - Reported
  {
    title: 'Choked Stormwater Drain Causing Road Waterlogging at Kelgaon Phata',
    description: 'Silt and plastic waste blocking open concrete culvert. Grey water backing up onto vehicular road creating knee-deep stagnant pool.',
    category: 'Water Supply & Drainage',
    subCategory: 'Culvert Blockage',
    location: { type: 'Point', coordinates: [73.8890, 18.6820] },
    address: 'Kelgaon Road Crossing, Near Gram Panchayat Gate, Alandi Rural, Pune 412105',
    ward: 'Ward 3 - Markal Road',
    imageUrl: '/issues/water-2.jpg',
    status: 'Reported',
    severity: 3,
    hazardLevel: 'Medium',
    priorityScore: 72,
    department: 'Water & Sewerage',
    upvotes: [{ citizenId: 'cit-22' }, { citizenId: 'cit-23' }],
    upvoteCount: 2,
    slaDeadline: new Date(Date.now() + 3600000 * 30),
    aiAnalysis: {
      detectedCategory: 'Water Supply & Drainage',
      confidence: 0.91,
      severity: 3,
      hazardLevel: 'Medium',
      detectedHazards: ['Mosquito larval breeding', 'Roadway flooding'],
      estimatedTurnaroundHours: 24,
      aiSummary: 'Mechanical suction excavator required to de-silt 35 meters of culvert.'
    }
  },

  // 8. Streetlights & Electricity - In Progress
  {
    title: 'Exposed Live Wires on Open Municipal Junction Box near ZP School',
    description: 'Damaged metal door on electrical feeder pillar exposing live terminals at children eye level outside primary school campus.',
    category: 'Streetlights & Electricity',
    subCategory: 'Electrical Hazard',
    location: { type: 'Point', coordinates: [73.8990, 18.6720] },
    address: 'Opposite Zilla Parishad Primary School, Gopalpura, Alandi, Pune 412105',
    ward: 'Ward 1 - Temple & Ghat',
    imageUrl: '/issues/electrical-2.jpg',
    status: 'In Progress',
    severity: 5,
    hazardLevel: 'Critical',
    priorityScore: 98,
    department: 'Electrical & Streetlighting',
    assignedWorker: {
      name: 'Ramesh Shinde (Emergency Power Line Inspector)',
      phone: '+91 98901 23456',
      assignedAt: new Date(Date.now() - 3600000 * 1)
    },
    upvotes: [{ citizenId: 'cit-24' }, { citizenId: 'cit-25' }, { citizenId: 'cit-26' }, { citizenId: 'cit-27' }, { citizenId: 'cit-28' }, { citizenId: 'cit-29' }],
    upvoteCount: 6,
    slaDeadline: new Date(Date.now() + 3600000 * 2),
    aiAnalysis: {
      detectedCategory: 'Streetlights & Electricity',
      confidence: 0.99,
      severity: 5,
      hazardLevel: 'Critical',
      detectedHazards: ['Direct electrocution risk to pedestrians & school children', 'Fire hazard in dry grass'],
      estimatedTurnaroundHours: 4,
      aiSummary: 'Critical emergency safety alert. Immediate lock-out, terminal insulation and metal door replacement mandatory.'
    }
  },

  // 9. Public Infrastructure - Resolved
  {
    title: 'Collapsed Pedestrian Safety Railing along Indrayani Bridge Approach',
    description: 'Corroded cast-iron barrier collapsed into river embankment, leaving a 12-foot unguarded drop for walking pilgrims.',
    category: 'Public Infrastructure',
    subCategory: 'Safety Barrier Failure',
    location: { type: 'Point', coordinates: [73.8970, 18.6765] },
    address: 'Indrayani Old Stone Bridge, North Abutment, Alandi, Pune 412105',
    ward: 'Ward 1 - Temple & Ghat',
    imageUrl: '/issues/infrastructure-1.jpg',
    status: 'Resolved',
    severity: 5,
    hazardLevel: 'Critical',
    priorityScore: 93,
    department: 'Roads & Infrastructure',
    upvotes: [{ citizenId: 'cit-30' }, { citizenId: 'cit-31' }, { citizenId: 'cit-32' }, { citizenId: 'cit-33' }],
    upvoteCount: 4,
    resolutionProof: {
      afterImageUrl: '/issues/resolved-infrastructure-1.jpg',
      resolvedAt: new Date(Date.now() - 3600000 * 5),
      resolvedBy: 'Er. Rajesh Kulkarni (Executive Engineer)',
      resolutionNotes: 'Fabricated and anchored heavy-gauge galvanized steel handrails into reinforced concrete base.',
      aiVerificationScore: 97,
      aiVerificationNotes: 'Visual inspection confirms continuous structural barrier installed with concrete anchors.',
      aiVerificationPass: true
    },
    citizenVerification: {
      isVerified: false,
      status: 'Pending',
      comment: '',
      verifiedAt: null
    },
    aiAnalysis: {
      detectedCategory: 'Public Infrastructure',
      confidence: 0.95,
      severity: 5,
      hazardLevel: 'Critical',
      detectedHazards: ['Fall from height risk', 'Crowd surge hazard during festivals'],
      estimatedTurnaroundHours: 24,
      aiSummary: 'Bridge walkway railing structural failure. Emergency barriering and welding repair completed.'
    }
  },

  // 10. Public Infrastructure - Citizen Confirmed
  {
    title: 'Damaged Concrete Bus Shelter Roof with Hanging Sheet at Vadmukhwadi',
    description: 'Broken asbestos ceiling sheet hanging dangerously over the passenger waiting bench, flapping in gusty winds.',
    category: 'Public Infrastructure',
    subCategory: 'Transit Shelter Defect',
    location: { type: 'Point', coordinates: [73.9055, 18.6640] },
    address: 'Vadmukhwadi PMPML Bus Stop, Alandi Road, Pune 412105',
    ward: 'Ward 4 - Charholi / Pune Road',
    imageUrl: '/issues/infrastructure-2.jpg',
    status: 'Citizen Confirmed',
    severity: 4,
    hazardLevel: 'High',
    priorityScore: 86,
    department: 'Roads & Infrastructure',
    upvotes: [{ citizenId: 'cit-34' }, { citizenId: 'cit-35' }, { citizenId: 'cit-36' }],
    upvoteCount: 3,
    resolutionProof: {
      afterImageUrl: '/issues/resolved-infrastructure-2.jpg',
      resolvedAt: new Date(Date.now() - 3600000 * 36),
      resolvedBy: 'Er. Rajesh Kulkarni (PWD)',
      resolutionNotes: 'Dismantled fractured sheet, reinforced steel purlins, and installed modern pre-coated galvanised metal roof profile.',
      aiVerificationScore: 99,
      aiVerificationNotes: 'Passenger waiting area fully covered, weather-sealed, and debris cleared.',
      aiVerificationPass: true
    },
    citizenVerification: {
      isVerified: true,
      status: 'Confirmed',
      comment: 'Excellent quick response. Senior citizens and school students now wait for bus safely even during rains.',
      rating: 5,
      verifiedAt: new Date(Date.now() - 3600000 * 18)
    },
    aiAnalysis: {
      detectedCategory: 'Public Infrastructure',
      confidence: 0.94,
      severity: 4,
      hazardLevel: 'High',
      detectedHazards: ['Falling structural debris', 'Loss of commuter shelter'],
      estimatedTurnaroundHours: 36,
      aiSummary: 'Bus shelter overhead hazard resolved with new galvanized roof installation.'
    }
  },

  // 11. Roads & Potholes - Citizen Confirmed
  {
    title: 'Sunken Paver Blocks & Tripping Hazard outside Sant Namdev Maharaj Math',
    description: 'Uneven settling of interlocking concrete blocks on pedestrian walkway causing elderly devotees to trip and fall.',
    category: 'Roads & Potholes',
    subCategory: 'Pedestrian Pavement',
    location: { type: 'Point', coordinates: [73.8995, 18.6750] },
    address: 'Namdev Math Lane, Near Vitthal Mandir, Alandi, Pune 412105',
    ward: 'Ward 1 - Temple & Ghat',
    imageUrl: '/issues/pothole-3.jpg',
    status: 'Citizen Confirmed',
    severity: 3,
    hazardLevel: 'Medium',
    priorityScore: 75,
    department: 'Roads & Infrastructure',
    upvotes: [{ citizenId: 'cit-37' }, { citizenId: 'cit-38' }, { citizenId: 'cit-39' }, { citizenId: 'cit-40' }],
    upvoteCount: 4,
    resolutionProof: {
      afterImageUrl: '/issues/resolved-pothole-3.jpg',
      resolvedAt: new Date(Date.now() - 3600000 * 48),
      resolvedBy: 'Road Maintenance Crew 2',
      resolutionNotes: 'Removed sunken blocks, leveled bed with quarry dust and sand, re-laid 80mm heavy duty pavers with edge locking.',
      aiVerificationScore: 97,
      aiVerificationNotes: 'Pavement plane fully restored with zero elevation difference.',
      aiVerificationPass: true
    },
    citizenVerification: {
      isVerified: true,
      status: 'Confirmed',
      comment: 'Very smooth finish. Temple trust elders are extremely pleased with the prompt work.',
      rating: 5,
      verifiedAt: new Date(Date.now() - 3600000 * 20)
    },
    aiAnalysis: {
      detectedCategory: 'Roads & Potholes',
      confidence: 0.92,
      severity: 3,
      hazardLevel: 'Medium',
      detectedHazards: ['Pedestrian tripping injury risk'],
      estimatedTurnaroundHours: 24,
      aiSummary: 'Paver block relaying and sub-base leveling completed.'
    }
  },

  // 12. Solid Waste & Garbage - Citizen Confirmed
  {
    title: 'Illegal Plastic Dumping & Smoldering Fire on Markal Road Bypass',
    description: 'Heaps of industrial packing foam and municipal plastic waste dumped by the roadside with toxic smoke spreading.',
    category: 'Solid Waste & Garbage',
    subCategory: 'Illegal Dumping & Burn',
    location: { type: 'Point', coordinates: [73.9080, 18.6810] },
    address: 'Survey No. 44, Markal Road Industrial Corridor, Alandi, Pune 412105',
    ward: 'Ward 3 - Markal Road',
    imageUrl: '/issues/garbage-3.jpg',
    status: 'Citizen Confirmed',
    severity: 5,
    hazardLevel: 'Critical',
    priorityScore: 95,
    department: 'Solid Waste Management',
    upvotes: [{ citizenId: 'cit-41' }, { citizenId: 'cit-42' }, { citizenId: 'cit-43' }, { citizenId: 'cit-44' }, { citizenId: 'cit-45' }],
    upvoteCount: 5,
    resolutionProof: {
      afterImageUrl: '/issues/resolved-garbage-3.jpg',
      resolvedAt: new Date(Date.now() - 3600000 * 30),
      resolvedBy: 'Dr. Sunita Deshmukh (Sanitation Inspector)',
      resolutionNotes: 'Fire extinguished immediately with water tanker, 4 truckloads of debris cleared to designated processing plant, No-Dumping warning board erected.',
      aiVerificationScore: 98,
      aiVerificationNotes: 'Area fully cleared, soil cleared of ash, zero smoke or waste detected.',
      aiVerificationPass: true
    },
    citizenVerification: {
      isVerified: true,
      status: 'Confirmed',
      comment: 'Huge relief! The toxic smoke stopped within 2 hours of complaint. Excellent municipal enforcement.',
      rating: 5,
      verifiedAt: new Date(Date.now() - 3600000 * 14)
    },
    aiAnalysis: {
      detectedCategory: 'Solid Waste & Garbage',
      confidence: 0.98,
      severity: 5,
      hazardLevel: 'Critical',
      detectedHazards: ['Toxic air emission & respiratory hazard', 'Wildfire spread risk'],
      estimatedTurnaroundHours: 6,
      aiSummary: 'Critical waste burning reported and cleared under municipal pollution control protocol.'
    }
  },

  // 13. Water Supply & Drainage - In Progress
  {
    title: 'Broken Sewage Chamber Overflowing into Roadside Gutter near Vitthal Mandir',
    description: 'Underground sewerage line blocked with solid rags causing contaminated effluent to overflow onto public thoroughfare.',
    category: 'Water Supply & Drainage',
    subCategory: 'Sewer Line Surcharging',
    location: { type: 'Point', coordinates: [73.8965, 18.6735] },
    address: 'Vitthal Mandir Marg, Near Sant Tukaram Chowk, Alandi, Pune 412105',
    ward: 'Ward 1 - Temple & Ghat',
    imageUrl: '/issues/water-3.jpg',
    status: 'In Progress',
    severity: 4,
    hazardLevel: 'High',
    priorityScore: 89,
    department: 'Water & Sewerage',
    assignedWorker: {
      name: 'Pravin Bhosale (Sanitary Sewer Squad)',
      phone: '+91 94220 56789',
      assignedAt: new Date(Date.now() - 3600000 * 2)
    },
    upvotes: [{ citizenId: 'cit-46' }, { citizenId: 'cit-47' }, { citizenId: 'cit-48' }],
    upvoteCount: 3,
    slaDeadline: new Date(Date.now() + 3600000 * 10),
    aiAnalysis: {
      detectedCategory: 'Water Supply & Drainage',
      confidence: 0.95,
      severity: 4,
      hazardLevel: 'High',
      detectedHazards: ['Public health disease transmission', 'Groundwater contamination'],
      estimatedTurnaroundHours: 12,
      aiSummary: 'High-velocity jetting machine deployed to clear root intrusion and restore chamber flow.'
    }
  },

  // 14. Streetlights & Electricity - Resolved
  {
    title: 'Tilted Low-Tension Electrical Pole Leaning on Tree Branches at Wadmukhwadi',
    description: 'Post-monsoon soil erosion caused heavy steel tubular pole to tilt at 30-degree angle with overhead insulated conductors.',
    category: 'Streetlights & Electricity',
    subCategory: 'Unstable Infrastructure',
    location: { type: 'Point', coordinates: [73.9040, 18.6660] },
    address: 'Wadmukhwadi Gaothan Road, Alandi Link, Pune 412105',
    ward: 'Ward 4 - Charholi / Pune Road',
    imageUrl: '/issues/electrical-3.jpg',
    status: 'Resolved',
    severity: 4,
    hazardLevel: 'High',
    priorityScore: 87,
    department: 'Electrical & Streetlighting',
    upvotes: [{ citizenId: 'cit-49' }, { citizenId: 'cit-50' }, { citizenId: 'cit-51' }],
    upvoteCount: 3,
    resolutionProof: {
      afterImageUrl: '/issues/resolved-electrical-3.jpg',
      resolvedAt: new Date(Date.now() - 3600000 * 6),
      resolvedBy: 'Er. Meera Nair (Electrical)',
      resolutionNotes: 'Crane positioned, pole straightened, poured M25 concrete foundation collar with stay-wire anchors.',
      aiVerificationScore: 95,
      aiVerificationNotes: 'Pole plumb verified at 90 degrees with solid concrete footing and safe clearance from trees.',
      aiVerificationPass: true
    },
    citizenVerification: {
      isVerified: false,
      status: 'Pending',
      comment: '',
      verifiedAt: null
    },
    aiAnalysis: {
      detectedCategory: 'Streetlights & Electricity',
      confidence: 0.96,
      severity: 4,
      hazardLevel: 'High',
      detectedHazards: ['Risk of line snapping and road blockage', 'Conductor contact with green branches'],
      estimatedTurnaroundHours: 18,
      aiSummary: 'Pole realignment and foundation re-concreting completed successfully.'
    }
  },

  // 15. Public Infrastructure - In Progress
  {
    title: 'Missing Cast-Iron Manhole Cover on Busy Pedestrian Crossing at Shivaji Chowk',
    description: 'Open 3-foot deep drain opening left uncovered after municipal desilting, creating an open trap for night walkers and bikes.',
    category: 'Public Infrastructure',
    subCategory: 'Open Manhole Hazard',
    location: { type: 'Point', coordinates: [73.8992, 18.6760] },
    address: 'Shivaji Chowk Junction, Main Market Road, Alandi, Pune 412105',
    ward: 'Ward 1 - Temple & Ghat',
    imageUrl: '/issues/infrastructure-3.jpg',
    status: 'In Progress',
    severity: 5,
    hazardLevel: 'Critical',
    priorityScore: 99,
    department: 'Roads & Infrastructure',
    assignedWorker: {
      name: 'Er. Rajesh Kulkarni & Rapid Safety Team',
      phone: '+91 98220 44123',
      assignedAt: new Date(Date.now() - 3600000 * 1)
    },
    upvotes: [{ citizenId: 'cit-52' }, { citizenId: 'cit-53' }, { citizenId: 'cit-54' }, { citizenId: 'cit-55' }, { citizenId: 'cit-56' }, { citizenId: 'cit-57' }, { citizenId: 'cit-58' }],
    upvoteCount: 7,
    slaDeadline: new Date(Date.now() + 3600000 * 2),
    aiAnalysis: {
      detectedCategory: 'Public Infrastructure',
      confidence: 0.99,
      severity: 5,
      hazardLevel: 'Critical',
      detectedHazards: ['Fatal fall trap for pedestrians & two-wheelers in low light', 'Immediate life safety threat'],
      estimatedTurnaroundHours: 4,
      aiSummary: 'Red safety barricade placed around opening. Heavy-duty SFRC circular manhole cover being installed.'
    }
  },

  // 16. Roads & Potholes - Reported
  {
    title: 'Gravel Scatter & Bitumen Stripping on Alandi-Chakan Industrial Connector',
    description: 'Loose stone chips and stripped bitumen layer causing braking instability for commercial trucks and motorcycles.',
    category: 'Roads & Potholes',
    subCategory: 'Loose Aggregate Hazard',
    location: { type: 'Point', coordinates: [73.8870, 18.6850] },
    address: 'Chakan Link Road, Near MIDC Phase 2 Crossing, Alandi, Pune 412105',
    ward: 'Ward 3 - Markal Road',
    imageUrl: '/issues/pothole-4.jpg',
    status: 'Reported',
    severity: 3,
    hazardLevel: 'Medium',
    priorityScore: 71,
    department: 'Roads & Infrastructure',
    upvotes: [{ citizenId: 'cit-59' }, { citizenId: 'cit-60' }],
    upvoteCount: 2,
    slaDeadline: new Date(Date.now() + 3600000 * 48),
    aiAnalysis: {
      detectedCategory: 'Roads & Potholes',
      confidence: 0.91,
      severity: 3,
      hazardLevel: 'Medium',
      detectedHazards: ['Two-wheeler skid risk', 'Windshield damage from flying gravel'],
      estimatedTurnaroundHours: 48,
      aiSummary: 'Surface re-profiling with micro-surfacing emulsion required.'
    }
  },

  // 17. Solid Waste & Garbage - Reported
  {
    title: 'Clogged Municipal Trash Bin with Animal Incursion at Gopalpura Chowk',
    description: 'Lids broken off community 1100L waste bin, waste spilling onto adjacent primary health center boundary wall.',
    category: 'Solid Waste & Garbage',
    subCategory: 'Damaged Receptacle',
    location: { type: 'Point', coordinates: [73.9010, 18.6730] },
    address: 'Near Primary Health Center, Gopalpura Road, Alandi, Pune 412105',
    ward: 'Ward 2 - Dehu Phata',
    imageUrl: '/issues/garbage-4.jpg',
    status: 'Reported',
    severity: 3,
    hazardLevel: 'Medium',
    priorityScore: 70,
    department: 'Solid Waste Management',
    upvotes: [{ citizenId: 'cit-61' }],
    upvoteCount: 1,
    slaDeadline: new Date(Date.now() + 3600000 * 36),
    aiAnalysis: {
      detectedCategory: 'Solid Waste & Garbage',
      confidence: 0.92,
      severity: 3,
      hazardLevel: 'Medium',
      detectedHazards: ['Unhygienic perimeter near medical clinic'],
      estimatedTurnaroundHours: 24,
      aiSummary: 'Replace damaged bin with new wheeled HDPE container.'
    }
  },

  // 18. Water Supply & Drainage - Resolved
  {
    title: 'Drinking Water Standpost Tap Leakage Wasting Hundreds of Litres Daily',
    description: 'Brass bibcock valve broken off public drinking standpost, water running continuously into dirt gutter.',
    category: 'Water Supply & Drainage',
    subCategory: 'Standpost Malfunction',
    location: { type: 'Point', coordinates: [73.8975, 18.6780] },
    address: 'Near Municipal Library, Ward 1, Alandi, Pune 412105',
    ward: 'Ward 1 - Temple & Ghat',
    imageUrl: '/issues/water-4.jpg',
    status: 'Resolved',
    severity: 3,
    hazardLevel: 'Medium',
    priorityScore: 68,
    department: 'Water & Sewerage',
    upvotes: [{ citizenId: 'cit-62' }, { citizenId: 'cit-63' }],
    upvoteCount: 2,
    resolutionProof: {
      afterImageUrl: '/issues/resolved-water-4.jpg',
      resolvedAt: new Date(Date.now() - 3600000 * 8),
      resolvedBy: 'Er. Anil Patil (Water Dept)',
      resolutionNotes: 'Installed heavy-duty self-closing brass push-tap with anti-theft ring. Waste pipe directed to tree basin.',
      aiVerificationScore: 96,
      aiVerificationNotes: 'Water valve closed, zero leakage detected, clean drainage apron.',
      aiVerificationPass: true
    },
    citizenVerification: {
      isVerified: false,
      status: 'Pending',
      comment: '',
      verifiedAt: null
    },
    aiAnalysis: {
      detectedCategory: 'Water Supply & Drainage',
      confidence: 0.94,
      severity: 3,
      hazardLevel: 'Medium',
      detectedHazards: ['Continuous municipal water wastage'],
      estimatedTurnaroundHours: 12,
      aiSummary: 'Fitted self-closing water conservation tap mechanism.'
    }
  },

  // 19. Streetlights & Electricity - Reported
  {
    title: 'High-Mast Floodlight Outage at Alandi Central Bus Station',
    description: 'All 6 luminaires on the 20-meter central high-mast tower went dark, leaving long-distance state transport buses and passengers in dark.',
    category: 'Streetlights & Electricity',
    subCategory: 'High-Mast Tower Failure',
    location: { type: 'Point', coordinates: [73.8998, 18.6745] },
    address: 'MSRTC Bus Depot Terminal, Alandi, Pune 412105',
    ward: 'Ward 2 - Dehu Phata',
    imageUrl: '/issues/electrical-4.jpg',
    status: 'Reported',
    severity: 4,
    hazardLevel: 'High',
    priorityScore: 85,
    department: 'Electrical & Streetlighting',
    upvotes: [{ citizenId: 'cit-64' }, { citizenId: 'cit-65' }, { citizenId: 'cit-66' }, { citizenId: 'cit-67' }],
    upvoteCount: 4,
    slaDeadline: new Date(Date.now() + 3600000 * 18),
    aiAnalysis: {
      detectedCategory: 'Streetlights & Electricity',
      confidence: 0.97,
      severity: 4,
      hazardLevel: 'High',
      detectedHazards: ['Transit hub safety risk for women & elderly passengers', 'Bus maneuvering hazard'],
      estimatedTurnaroundHours: 12,
      aiSummary: 'Tripped timer contactor switch or main MCB failure in control cabinet.'
    }
  },

  // 20. Public Infrastructure - Reported
  {
    title: 'Broken Stone Paving Slabs on Indrayani River Bathing Ghat',
    description: 'Cracked basalt slabs creating sharp edges where barefoot pilgrims step down to enter the holy river.',
    category: 'Public Infrastructure',
    subCategory: 'Ghat Masonry Damage',
    location: { type: 'Point', coordinates: [73.8958, 18.6762] },
    address: 'Siddhabett Ghat Steps, Indrayani Riverbank, Alandi, Pune 412105',
    ward: 'Ward 1 - Temple & Ghat',
    imageUrl: '/issues/infrastructure-4.jpg',
    status: 'Reported',
    severity: 4,
    hazardLevel: 'High',
    priorityScore: 81,
    department: 'Roads & Infrastructure',
    upvotes: [{ citizenId: 'cit-68' }, { citizenId: 'cit-69' }, { citizenId: 'cit-70' }],
    upvoteCount: 3,
    slaDeadline: new Date(Date.now() + 3600000 * 36),
    aiAnalysis: {
      detectedCategory: 'Public Infrastructure',
      confidence: 0.93,
      severity: 4,
      hazardLevel: 'High',
      detectedHazards: ['Foot laceration injuries to barefoot pilgrims', 'Slip into deep river current'],
      estimatedTurnaroundHours: 36,
      aiSummary: 'Masonry restoration with cement mortar and dressed basalt flagstones.'
    }
  }
];

// 5 Authentic Wardha Civic Issues to demonstrate multi-jurisdiction pan-India isolation
const wardhaSampleIssues = [
  {
    title: 'Severe Municipal Waste Dump Overflow near Bajaj Square, Sevagram Road',
    description: 'Heavy overflow of unsegregated organic waste and commercial refuse blocking pedestrian walkway on Sevagram Road, emitting foul odour.',
    category: 'Solid Waste & Garbage',
    subCategory: 'Overflowing Public Dumpster',
    location: { type: 'Point', coordinates: [78.6022, 20.7453] },
    address: 'Near Bajaj Square, Sevagram Road, Wardha, Maharashtra 442001',
    city: 'Wardha',
    district: 'Wardha',
    state: 'Maharashtra',
    municipality: 'Wardha Municipal Council',
    ward: 'Ward 1 - Sevagram Road Zone',
    imageUrl: '/issues/garbage-1.jpg',
    status: 'In Progress',
    severity: 4,
    hazardLevel: 'High',
    priorityScore: 88,
    department: 'Solid Waste Management',
    assignedWorker: {
      name: 'Vilas Ramteke (Wardha SWM Field Squad)',
      phone: '+91 94221 88401',
      assignedAt: new Date(Date.now() - 3600000 * 6)
    },
    reportedBy: { name: 'Manoj Deshmukh', phone: '+91 98901 22334', email: 'manoj.wardha@gmail.com' },
    upvotes: [{ citizenId: 'cit-w1' }, { citizenId: 'cit-w2' }, { citizenId: 'cit-w3' }],
    upvoteCount: 3,
    slaDeadline: new Date(Date.now() + 3600000 * 18),
    aiAnalysis: {
      detectedCategory: 'Solid Waste & Garbage',
      confidence: 0.94,
      severity: 4,
      hazardLevel: 'High',
      detectedHazards: ['Stray animal scavengers spreading refuse', 'Blockage of surface storm drain'],
      estimatedTurnaroundHours: 24,
      aiSummary: 'Dispatch Wardha Municipal Council compacting tipper truck for immediate site clearance.'
    }
  },
  {
    title: 'Deep Bitumen Pothole Crater on Bachelor Road near Wardha Railway Junction',
    description: 'Deep road surface crater causing severe two-wheeler hazards and traffic gridlock on the main Bachelor Road railway approach.',
    category: 'Roads & Potholes',
    subCategory: 'Road Surface Defect',
    location: { type: 'Point', coordinates: [78.5980, 20.7485] },
    address: 'Opposite Railway Overbridge, Bachelor Road, Wardha, Maharashtra 442001',
    city: 'Wardha',
    district: 'Wardha',
    state: 'Maharashtra',
    municipality: 'Wardha Municipal Council',
    ward: 'Ward 3 - Station & Bachelor Road',
    imageUrl: '/issues/pothole-1.jpg',
    status: 'Reported',
    severity: 4,
    hazardLevel: 'High',
    priorityScore: 84,
    department: 'Roads & Infrastructure',
    assignedWorker: { name: '', phone: '' },
    reportedBy: { name: 'Pooja Kale', phone: '+91 97654 33211', email: 'pooja.wardha@gmail.com' },
    upvotes: [{ citizenId: 'cit-w4' }, { citizenId: 'cit-w5' }],
    upvoteCount: 2,
    slaDeadline: new Date(Date.now() + 3600000 * 24),
    aiAnalysis: {
      detectedCategory: 'Roads & Potholes',
      confidence: 0.96,
      severity: 4,
      hazardLevel: 'High',
      detectedHazards: ['Sudden vehicular swerving', 'Suspension damage and rider falls'],
      estimatedTurnaroundHours: 24,
      aiSummary: 'Cold-mix bitumen patch compaction required urgently by Wardha PWD unit.'
    }
  },
  {
    title: 'Main Underground Drinking Water Pipeline Leakage at Subhash Nagar Road',
    description: 'Pressurized municipal drinking water main burst flooding street and wasting thousands of liters of treated potable water.',
    category: 'Water Supply & Drainage',
    subCategory: 'Pipeline Fracture',
    location: { type: 'Point', coordinates: [78.6090, 20.7380] },
    address: 'Near Water Tank, Subhash Nagar, Wardha, Maharashtra 442001',
    city: 'Wardha',
    district: 'Wardha',
    state: 'Maharashtra',
    municipality: 'Wardha Municipal Council',
    ward: 'Ward 5 - Subhash Nagar & Ramnagar',
    imageUrl: '/issues/water-1.jpg',
    status: 'Verified',
    severity: 4,
    hazardLevel: 'High',
    priorityScore: 86,
    department: 'Water & Sewerage',
    assignedWorker: { name: 'Awaiting Pipeline Crew', phone: '' },
    reportedBy: { name: 'Sunil Wadhwa', phone: '+91 94228 11990', email: 'sunil.w@gmail.com' },
    upvotes: [{ citizenId: 'cit-w6' }, { citizenId: 'cit-w7' }, { citizenId: 'cit-w8' }, { citizenId: 'cit-w9' }],
    upvoteCount: 4,
    slaDeadline: new Date(Date.now() + 3600000 * 16),
    aiAnalysis: {
      detectedCategory: 'Water Supply & Drainage',
      confidence: 0.95,
      severity: 4,
      hazardLevel: 'High',
      detectedHazards: ['Severe drinking water wastage', 'Subsurface road erosion'],
      estimatedTurnaroundHours: 16,
      aiSummary: 'Isolate Wardha Section 5 feeder valve and weld collar on ruptured 150mm cast pipe.'
    }
  },
  {
    title: 'Non-Functional High-Mast Streetlight Cluster at Dhantoli Chowk',
    description: 'Blackout on crucial four-way junction at Dhantoli Chowk due to burnt transformer connection in public lighting pole.',
    category: 'Streetlights & Electricity',
    subCategory: 'Junction Dark Zone',
    location: { type: 'Point', coordinates: [78.6140, 20.7410] },
    address: 'Dhantoli Chowk Junction, Wardha, Maharashtra 442001',
    city: 'Wardha',
    district: 'Wardha',
    state: 'Maharashtra',
    municipality: 'Wardha Municipal Council',
    ward: 'Ward 7 - Dhantoli Commercial Hub',
    imageUrl: '/issues/electrical-1.jpg',
    status: 'In Progress',
    severity: 3,
    hazardLevel: 'Medium',
    priorityScore: 74,
    department: 'Electrical & Streetlighting',
    assignedWorker: {
      name: 'Gajanan Gawande (Wardha Power Crew)',
      phone: '+91 98223 55102',
      assignedAt: new Date(Date.now() - 3600000 * 4)
    },
    reportedBy: { name: 'Archana Joshi', phone: '+91 98811 77223', email: 'archana.j@gmail.com' },
    upvotes: [{ citizenId: 'cit-w10' }],
    upvoteCount: 1,
    slaDeadline: new Date(Date.now() + 3600000 * 20),
    aiAnalysis: {
      detectedCategory: 'Streetlights & Electricity',
      confidence: 0.92,
      severity: 3,
      hazardLevel: 'Medium',
      detectedHazards: ['Nighttime collision risk for cyclists and pedestrians'],
      estimatedTurnaroundHours: 24,
      aiSummary: 'Replace 70W LED driver assembly and reset timer contactor switch.'
    }
  },
  {
    title: 'Collapsed Masonry Footpath Slab & Drain Exposure at Shivaji Square',
    description: 'Broken concrete paver slabs above stormwater drain creating open trap hazard for school children and senior citizens.',
    category: 'Public Infrastructure',
    subCategory: 'Footpath Collapse',
    location: { type: 'Point', coordinates: [78.6045, 20.7440] },
    address: 'Near Mahatma Gandhi Statue, Shivaji Square, Wardha, Maharashtra 442001',
    city: 'Wardha',
    district: 'Wardha',
    state: 'Maharashtra',
    municipality: 'Wardha Municipal Council',
    ward: 'Ward 2 - Shivaji Square Heritage Zone',
    imageUrl: '/issues/infrastructure-1.jpg',
    status: 'Resolved',
    severity: 3,
    hazardLevel: 'Medium',
    priorityScore: 55,
    department: 'Roads & Infrastructure',
    assignedWorker: {
      name: 'Ashok Ingle',
      phone: '+91 98902 44101',
      assignedAt: new Date(Date.now() - 3600000 * 40)
    },
    resolutionProof: {
      afterImageUrl: '/issues/resolved-infrastructure-1.jpg',
      resolvedAt: new Date(Date.now() - 3600000 * 8),
      resolvedBy: 'Er. Nitin Deshpande (Executive PWD Engineer, Wardha)',
      resolutionNotes: 'Reinforced concrete precast cover slabs installed and sealed with cement grout.'
    },
    reportedBy: { name: 'Dinesh Patil', phone: '+91 94220 33118', email: 'dinesh.p@gmail.com' },
    upvotes: [{ citizenId: 'cit-w11' }, { citizenId: 'cit-w12' }],
    upvoteCount: 2,
    slaDeadline: new Date(Date.now() - 3600000 * 10),
    aiAnalysis: {
      detectedCategory: 'Public Infrastructure',
      confidence: 0.94,
      severity: 3,
      hazardLevel: 'Medium',
      detectedHazards: ['Pedestrian slip and fall into open masonry drain'],
      estimatedTurnaroundHours: 36,
      aiSummary: 'Precast slab replacement completed by Wardha civil contractors.'
    }
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('Database connected, proceeding with seeding...');

    // Replace staff accounts with Alandi Pune and Wardha municipal context
    await User.deleteMany({});
    await User.insertMany(staffData);
    console.log(`Seeded ${staffData.length} Municipal Staff accounts (Alandi, Wardha & Pan-India)`);

    // Replace departments
    await Department.deleteMany({});
    await Department.insertMany(departmentsData);
    console.log('Seeded Municipal Departments');

    // Prepare Alandi sample issues with explicit jurisdiction fields
    const alandiPrepared = alandiSampleIssues.map(i => ({
      ...i,
      city: 'Alandi',
      district: 'Pune',
      state: 'Maharashtra',
      municipality: 'Alandi Municipal Council'
    }));

    // Combine all issues
    const allSampleIssues = [...alandiPrepared, ...wardhaSampleIssues];

    await Issue.deleteMany({});
    await Issue.insertMany(allSampleIssues);
    console.log(`Successfully seeded ${allSampleIssues.length} diverse civic issues (${alandiPrepared.length} Alandi + ${wardhaSampleIssues.length} Wardha)!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
