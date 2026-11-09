/**
 * Computes Dynamic Priority Score (0 to 100)
 * Factors:
 * 1. AI Severity (1 to 5) -> 35% weight
 * 2. Citizen Upvotes & Linked Duplicate Reports -> 30% weight
 * 3. SLA Aging / Elapsed Hours -> 20% weight
 * 4. Safety Hazard Level -> 15% weight
 */
const calculatePriorityScore = (issue) => {
  // 1. Severity (1 - 5)
  const severity = issue.severity || 3;
  const severityPoints = (severity / 5) * 35;

  // 2. Citizen Count & Endorsements
  const citizenCount = (issue.upvoteCount || 1) + (issue.linkedReportCount || 0) * 1.5;
  // Cap at 10 endorsements for max 30 points
  const citizenPoints = Math.min(1.0, citizenCount / 8) * 30;

  // 3. Hazard Level
  let hazardPoints = 5;
  if (issue.hazardLevel === 'Critical') hazardPoints = 15;
  else if (issue.hazardLevel === 'High') hazardPoints = 11;
  else if (issue.hazardLevel === 'Medium') hazardPoints = 7;
  else if (issue.hazardLevel === 'Low') hazardPoints = 3;

  // 4. Age / SLA Urgency
  const createdAt = issue.createdAt ? new Date(issue.createdAt) : new Date();
  const hoursPending = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60));
  // Every 24 hours adds 5 urgency points, up to 20 points
  const agePoints = Math.min(20, (hoursPending / 24) * 6);

  const totalScore = Math.round(severityPoints + citizenPoints + hazardPoints + agePoints);
  return Math.min(100, Math.max(10, totalScore));
};

/**
 * Calculates SLA Deadline based on severity
 */
const calculateSlaDeadline = (severity, hazardLevel) => {
  const now = new Date();
  let hours = 48; // default

  if (hazardLevel === 'Critical' || severity === 5) {
    hours = 12; // 12 hours
  } else if (hazardLevel === 'High' || severity === 4) {
    hours = 24; // 24 hours
  } else if (severity === 3) {
    hours = 48; // 48 hours
  } else {
    hours = 72; // 72 hours
  }

  return new Date(now.getTime() + hours * 60 * 60 * 1000);
};

module.exports = {
  calculatePriorityScore,
  calculateSlaDeadline
};

