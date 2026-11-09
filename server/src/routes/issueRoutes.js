const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const {
  checkDuplicates,
  createIssue,
  getIssues,
  getIssueById,
  upvoteIssue,
  updateStatus,
  resolveIssueWithProof,
  verifyResolutionCitizen,
  mergeIssues,
  addComment
} = require('../controllers/issueController');

// Duplicate checking
router.get('/check-duplicates', checkDuplicates);

// Core Issue CRUD & Endorsements
router.get('/', getIssues);
router.get('/:id', getIssueById);
router.post('/', upload.single('image'), createIssue);
router.post('/:id/upvote', upvoteIssue);
router.post('/:id/comment', addComment);

// Authority Workflow
router.patch('/:id/status', updateStatus);
router.post('/:id/resolve', upload.single('afterImage'), resolveIssueWithProof);
router.post('/merge', mergeIssues);

// Citizen Verification Loop
router.post('/:id/verify', verifyResolutionCitizen);

module.exports = router;

