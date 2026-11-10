/**
 * Municipal Civic Governance Constants
 * Centralized taxonomy, threshold ratings, and department alignments
 */

export const CIVIC_CATEGORIES = [
  'All',
  'Roads & Potholes',
  'Solid Waste & Garbage',
  'Water Supply & Drainage',
  'Streetlights & Electricity',
  'Public Infrastructure'
];

export const CIVIC_DEPARTMENTS = [
  'All',
  'Roads & Infrastructure',
  'Solid Waste Management',
  'Water & Sewerage',
  'Electrical & Streetlighting'
];

export const ISSUE_STATUSES = {
  REPORTED: 'Reported',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CITIZEN_CONFIRMED: 'Citizen Confirmed'
};

export const PRIORITY_THRESHOLDS = {
  CRITICAL: 85,
  HIGH: 70,
  MEDIUM: 40,
  LOW: 0
};

export const MUNICIPAL_JURISDICTIONS = {
  ALANDI: {
    name: 'Alandi Municipal Council',
    city: 'Alandi',
    district: 'Pune',
    state: 'Maharashtra',
    pin: '412105',
    region: 'PMRDA Region'
  },
  WARDHA: {
    name: 'Wardha Municipal Council',
    city: 'Wardha',
    district: 'Wardha',
    state: 'Maharashtra',
    pin: '442001',
    region: 'Vidarbha Region'
  }
};
