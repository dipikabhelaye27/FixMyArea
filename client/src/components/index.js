/**
 * Centralized Component Barrel Exports
 * Enables clean, modular imports across the application
 */

// Navigation & Layout
export { default as Navbar } from './Navbar';
export { default as Footer } from './Footer';

// Grievances & Reporting
export { default as IssueCard } from './IssueCard';
export { default as IssueDetailModal } from './IssueDetailModal';
export { default as ReportIssueModal } from './ReportIssueModal';
export { default as ResolveIssueModal } from './ResolveIssueModal';
export { default as CitizenVerificationModal } from './CitizenVerificationModal';
export { default as TrackGrievanceModal } from './TrackGrievanceModal';
export { default as WorkOrderModal } from './WorkOrderModal';

// Authority & Operations
export { default as AuthorityDashboard } from './AuthorityDashboard';
export { default as AuthorityJurisdictionMap } from './AuthorityJurisdictionMap';
export { default as AdminAnalytics } from './AdminAnalytics';

// Maps & Feeds
export { default as CivicMap } from './CivicMap';
export { default as CommunityFeed } from './CommunityFeed';
export { default as CommunityStats } from './CommunityStats';

// Informational & Landing
export { default as AboutUs } from './AboutUs';
export { default as WhyChooseUs } from './WhyChooseUs';
export { default as MobileRestrictionModal } from './MobileRestrictionModal';

// Authentication
export { default as LoginPage } from './LoginPage';
export { default as LoginModal } from './LoginModal';
