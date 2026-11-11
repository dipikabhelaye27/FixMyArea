const Issue = require('../models/Issue');
const { uploadToCloudinaryOrLocal, uploadDir } = require('../config/cloudinary');
const { analyzeCivicIssueImage, verifyResolutionProof } = require('../services/aiService');
const { findNearbyDuplicates, linkReportToMaster, resolveJurisdiction } = require('../services/geoService');
const { calculatePriorityScore, calculateSlaDeadline } = require('../services/priorityService');
const path = require('path');
const fs = require('fs');

/**
 * Map category to responsible civic department
 */
const getDepartmentForCategory = (category) => {
  switch (category) {
    case 'Roads & Potholes':
      return 'Roads & Infrastructure';
    case 'Solid Waste & Garbage':
      return 'Solid Waste Management';
    case 'Water Supply & Drainage':
      return 'Water & Sewerage';
    case 'Streetlights & Electricity':
      return 'Electrical & Streetlighting';
    case 'Public Infrastructure':
      return 'Public Works & Parks';
    default:
      return 'General Municipal Services';
  }
};

/**
 * Step 1: Pre-check for duplicate issues nearby before submitting
 */
const checkDuplicates = async (req, res) => {
  try {
    const { longitude, latitude, category } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ success: false, message: 'Coordinates required' });
    }

    const duplicates = await findNearbyDuplicates(longitude, latitude, category, 100);
    res.json({
      success: true,
      hasDuplicates: duplicates.length > 0,
      duplicates
    });
  } catch (error) {
    console.error('Error in checkDuplicates:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Step 2: Create a new Civic Issue report with AI vision inspection
 */
const createIssue = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Issue photo is required' });
    }

    const {
      title,
      description = '',
      voiceDescription = '',
      originalVoiceText = '',
      category,
      longitude,
      latitude,
      address = 'Civic Area',
      city,
      district,
      state,
      municipality,
      landmark = '',
      ward = 'Ward 1 - Central Zone',
      citizenName = 'Citizen',
      citizenPhone = '',
      citizenEmail = '',
      citizenId = `cit-${Date.now()}`
    } = req.body;

    const localFilePath = file.path;
    const effectiveVoiceText = voiceDescription || originalVoiceText || description || '';

    // 1. Run Multimodal AI Vision & Multilingual Voice Translation on photo + voice note
    const aiResult = await analyzeCivicIssueImage(localFilePath, effectiveVoiceText);

    // 2. Upload to Cloudinary (or local fallback)
    const imageUrl = await uploadToCloudinaryOrLocal(localFilePath);

    // 3. Resolve department and category automatically from AI (no manual citizen input required)
    const finalDepartment = aiResult.assignedDepartment || getDepartmentForCategory(aiResult.detectedCategory);
    const finalCategory = aiResult.detectedCategory || (category && category !== 'Other' ? category : 'Roads & Potholes');
    const finalTitle = aiResult.title || title || 'Reported Civic Issue';
    const finalDescription = aiResult.translatedEnglishText || aiResult.aiSummary || effectiveVoiceText;
    const severity = aiResult.severity || 3;
    const hazardLevel = aiResult.hazardLevel || 'Medium';

    // 4. Calculate SLA deadline and resolve municipal jurisdiction
    const slaDeadline = calculateSlaDeadline(severity, hazardLevel);
    const targetLng = parseFloat(longitude) || 73.8981;
    const targetLat = parseFloat(latitude) || 18.6772;
    const jurisdiction = resolveJurisdiction(targetLat, targetLng, address, { city, district, state, municipality });

    // 5. AUTOMATIC DEDUPLICATION & MULTI-REPORTER MERGE
    // Check if an identical issue in the same category is already active nearby (within 300m)
    const nearbyDuplicates = await findNearbyDuplicates(targetLng, targetLat, finalCategory, 300);

    if (nearbyDuplicates && nearbyDuplicates.length > 0) {
      const match = nearbyDuplicates[0];
      const existingIssue = await Issue.findById(match._id);

      if (existingIssue) {
        // Initialize coReporters if missing
        if (!existingIssue.coReporters) {
          existingIssue.coReporters = [];
        }

        const coReporterName = citizenName && citizenName !== 'Citizen' ? citizenName : 'Co-Reporting Citizen';

        // Add this new reporter to coReporters
        existingIssue.coReporters.push({
          name: coReporterName,
          phone: citizenPhone || '',
          reportedAt: new Date(),
          voiceNote: effectiveVoiceText || 'Reported same problem via voice note',
          imageUrl: imageUrl,
          note: finalDescription
        });

        // Update reporters count: original reporter (1) + all co-reporters
        existingIssue.reportersCount = 1 + existingIssue.coReporters.length;

        // Boost community upvotes
        existingIssue.upvoteCount = (existingIssue.upvoteCount || 1) + 1;

        // Boost priority score because multiple independent citizens reported the same defect!
        const boostedPriority = Math.min(99, Math.max(existingIssue.priorityScore || 50, 65) + (existingIssue.coReporters.length * 8));
        existingIssue.priorityScore = boostedPriority;

        // Add to timeline
        existingIssue.timeline.push({
          status: existingIssue.status,
          timestamp: new Date(),
          updatedBy: `${coReporterName} (Citizen)`,
          comment: `Identical complaint reported nearby and consolidated by AI Deduplication. Now confirmed by ${existingIssue.reportersCount} citizens. Repair urgency boosted to Priority ${existingIssue.priorityScore}/100.`
        });

        const savedMerged = await existingIssue.save();

        // Broadcast real-time update to all active feeds & authority dashboard
        const io = req.app.get('io');
        if (io) {
          io.emit('issue:updated', savedMerged);
          io.emit('issue:merged', {
            masterId: savedMerged._id,
            reportersCount: savedMerged.reportersCount,
            issue: savedMerged
          });
        }

        return res.status(200).json({
          success: true,
          isDuplicate: true,
          isMerged: true,
          message: `Active ${finalCategory} issue already registered at this location! Your report was merged with ticket #${savedMerged._id.toString().slice(-4).toUpperCase()} to amplify municipal urgency (Now backed by ${savedMerged.reportersCount} citizens).`,
          reportersCount: savedMerged.reportersCount,
          issue: savedMerged
        });
      }
    }

    const initialIssue = new Issue({
      title: finalTitle,
      description: finalDescription,
      originalVoiceText: aiResult.originalVoiceText || effectiveVoiceText || 'Voice note recorded',
      detectedLanguage: aiResult.detectedLanguage || 'Marathi',
      translatedEnglishText: aiResult.translatedEnglishText || finalDescription,
      category: finalCategory,
      subCategory: aiResult.subCategory || 'General',
      location: {
        type: 'Point',
        coordinates: [targetLng, targetLat]
      },
      address,
      city: jurisdiction.city,
      district: jurisdiction.district,
      state: jurisdiction.state,
      municipality: jurisdiction.municipality,
      landmark: landmark || (aiResult.subCategory ? `Near ${aiResult.subCategory} site` : ''),
      ward,
      imageUrl,
      status: 'Reported',
      severity,
      hazardLevel,
      aiAnalysis: aiResult,
      department: finalDepartment,
      reportersCount: 1,
      coReporters: [],
      reportedBy: {
        name: citizenName,
        phone: citizenPhone,
        email: citizenEmail,
        citizenId
      },
      upvotes: [{ citizenId, timestamp: new Date() }],
      upvoteCount: 1,
      slaDeadline,
      timeline: [
        {
          status: 'Reported',
          timestamp: new Date(),
          updatedBy: `${citizenName} (Citizen)`,
          comment: `Reported with photo and voice note in ${aiResult.detectedLanguage || 'local language'}.`
        },
        {
          status: 'AI Triage',
          timestamp: new Date(),
          updatedBy: 'FixMyArea AI Engine',
          comment: `AI translated voice to English and auto-routed issue to ${finalDepartment} (${severity}/5 Severity, ${hazardLevel} Hazard).`
        }
      ]
    });

    initialIssue.priorityScore = calculatePriorityScore(initialIssue);
    const savedIssue = await initialIssue.save();

    // Broadcast to real-time clients (Authority dashboard and live map)
    const io = req.app.get('io');
    if (io) {
      io.emit('issue:created', savedIssue);
    }

    res.status(201).json({
      success: true,
      message: 'Issue reported and analyzed by AI successfully',
      issue: savedIssue
    });

  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all issues with rich filtering, search and sorting
 */
const getIssues = async (req, res) => {
  try {
    const {
      status,
      category,
      department,
      ward,
      city,
      municipality,
      search,
      sortBy = 'priority', // 'priority' | 'recent' | 'upvotes'
      onlyMasters = 'false'
    } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (department && department !== 'All') {
      query.department = department;
    }
    if (ward && ward !== 'All') {
      query.ward = ward;
    }
    if (city && city !== 'All') {
      query.city = city;
    }
    if (municipality && municipality !== 'All') {
      query.municipality = municipality;
    }
    if (onlyMasters === 'true') {
      query.masterIssueId = null;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'reportedBy.name': { $regex: search, $options: 'i' } }
      ];
    }

    let sort = { priorityScore: -1, createdAt: -1 };
    if (sortBy === 'recent') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'upvotes') {
      sort = { upvoteCount: -1 };
    }

    const issues = await Issue.find(query)
      .sort(sort)
      .populate('linkedReports', 'title imageUrl status createdAt')
      .lean();

    res.json({
      success: true,
      count: issues.length,
      issues
    });
  } catch (error) {
    console.error('Error in getIssues:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get a single issue by ID
 */
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('linkedReports')
      .populate('masterIssueId');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Citizen upvotes / endorses an issue ("Me Too" button)
 */
const upvoteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { citizenId = `cit-${Date.now()}` } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const alreadyUpvoted = issue.upvotes.some(u => u.citizenId === citizenId);
    if (alreadyUpvoted) {
      return res.status(400).json({
        success: false,
        message: 'You have already endorsed this issue'
      });
    }

    issue.upvotes.push({ citizenId, timestamp: new Date() });
    issue.upvoteCount = issue.upvotes.length;

    // Recalculate dynamic priority
    issue.priorityScore = calculatePriorityScore(issue);

    await issue.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('issue:upvoted', { issueId: issue._id, upvoteCount: issue.upvoteCount, priorityScore: issue.priorityScore });
    }

    res.json({
      success: true,
      message: 'Endorsement added successfully',
      upvoteCount: issue.upvoteCount,
      priorityScore: issue.priorityScore
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Authority updates issue status (e.g., 'Reported' -> 'Verified' -> 'In Progress')
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, officerName = 'Municipal Officer', comment = '', workerName, workerPhone } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    issue.status = status;
    if (workerName) {
      issue.assignedWorker = {
        name: workerName,
        phone: workerPhone || '',
        assignedAt: new Date()
      };
    }

    issue.timeline.push({
      status,
      timestamp: new Date(),
      updatedBy: officerName,
      comment: comment || `Status updated to ${status}`
    });

    // If master issue, also sync linked children
    if (issue.linkedReports && issue.linkedReports.length > 0) {
      await Issue.updateMany(
        { _id: { $in: issue.linkedReports } },
        {
          $set: { status },
          $push: {
            timeline: {
              status,
              timestamp: new Date(),
              updatedBy: officerName,
              comment: `Updated via Master Issue: ${comment}`
            }
          }
        }
      );
    }

    await issue.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('issue:status_updated', issue);
    }

    res.json({ success: true, message: 'Status updated successfully', issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Authority marks issue as RESOLVED with photographic evidence
 * Automatically triggers AI Before/After Audit!
 */
const resolveIssueWithProof = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    const { resolutionNotes = '', officerName = 'Field Supervisor' } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Resolution proof photo is required' });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const localAfterPath = file.path;

    // Upload After Photo
    const afterImageUrl = await uploadToCloudinaryOrLocal(localAfterPath);

    // AI Auditing: Compare Before Photo with After Photo
    // Note: If before image is a local upload path, resolve path
    let localBeforePath = null;
    if (issue.imageUrl && issue.imageUrl.startsWith('/uploads/')) {
      const fileName = path.basename(issue.imageUrl);
      const tempPath = path.join(uploadDir, fileName);
      const repoPath = path.join(__dirname, '../../uploads', fileName);
      if (fs.existsSync(tempPath)) {
        localBeforePath = tempPath;
      } else if (fs.existsSync(repoPath)) {
        localBeforePath = repoPath;
      }
    }

    const aiAudit = await verifyResolutionProof(
      localBeforePath || localAfterPath, // fallback to after if before path not local
      localAfterPath,
      issue.category
    );

    issue.status = 'Resolved';
    issue.resolutionProof = {
      afterImageUrl,
      resolvedAt: new Date(),
      resolvedBy: officerName,
      resolutionNotes,
      aiVerificationScore: aiAudit.aiVerificationScore || 85,
      aiVerificationNotes: aiAudit.aiVerificationNotes || 'Restoration work visually validated.',
      aiVerificationPass: aiAudit.aiVerificationPass !== undefined ? aiAudit.aiVerificationPass : true
    };

    issue.timeline.push({
      status: 'Resolved',
      timestamp: new Date(),
      updatedBy: officerName,
      comment: `Issue marked resolved. Proof photo submitted. ${resolutionNotes}`
    });

    issue.timeline.push({
      status: 'AI Audit Verification',
      timestamp: new Date(),
      updatedBy: 'FixMyArea AI Audit Bot',
      comment: `Visual comparison score: ${issue.resolutionProof.aiVerificationScore}%. ${issue.resolutionProof.aiVerificationNotes}`
    });

    // Also mark linked reports as resolved
    if (issue.linkedReports && issue.linkedReports.length > 0) {
      await Issue.updateMany(
        { _id: { $in: issue.linkedReports } },
        {
          $set: {
            status: 'Resolved',
            'resolutionProof.afterImageUrl': afterImageUrl,
            'resolutionProof.resolvedAt': new Date(),
            'resolutionProof.resolvedBy': officerName,
            'resolutionProof.resolutionNotes': resolutionNotes
          }
        }
      );
    }

    await issue.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('issue:resolved', issue);
    }

    res.json({
      success: true,
      message: 'Issue marked resolved with AI verification audit',
      issue
    });

  } catch (error) {
    console.error('Error resolving issue:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Citizen Verification: "Was it actually fixed?" (Confirm or Reopen)
 */
const verifyResolutionCitizen = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmed, comment = '', rating = 5, citizenName = 'Citizen' } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const isConfirmed = confirmed === true || confirmed === 'true';

    issue.citizenVerification = {
      isVerified: true,
      status: isConfirmed ? 'Confirmed' : 'Reopened',
      comment,
      rating: parseInt(rating) || 5,
      verifiedAt: new Date()
    };

    if (isConfirmed) {
      issue.status = 'Citizen Confirmed';
      issue.timeline.push({
        status: 'Citizen Confirmed',
        timestamp: new Date(),
        updatedBy: `${citizenName} (Citizen)`,
        comment: `Citizen verified problem is fixed! Rating: ${rating}/5 ⭐. Feedback: "${comment || 'Verified fixed'}"`
      });
    } else {
      issue.status = 'Reopened';
      issue.timeline.push({
        status: 'Reopened by Citizen',
        timestamp: new Date(),
        updatedBy: `${citizenName} (Citizen)`,
        comment: `Citizen disputed resolution: "${comment || 'Problem is not properly fixed.'}". Sent back for urgent action.`
      });
      // Boost priority when reopened
      issue.priorityScore = Math.min(100, issue.priorityScore + 25);
    }

    await issue.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('issue:verified', issue);
    }

    res.json({
      success: true,
      message: isConfirmed ? 'Resolution confirmed by citizen' : 'Issue reopened by citizen',
      issue
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Link/Merge a duplicate complaint into a master issue
 */
const mergeIssues = async (req, res) => {
  try {
    const { masterId, childId, citizenId } = req.body;
    const master = await linkReportToMaster(masterId, childId, citizenId);

    const io = req.app.get('io');
    if (io) {
      io.emit('issue:consolidated', { masterId, childId });
    }

    res.json({ success: true, message: 'Reports consolidated successfully', master });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Add a community comment to an issue
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { author = 'Citizen', text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty' });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const newEntry = {
      status: issue.status,
      timestamp: new Date(),
      updatedBy: author.trim(),
      comment: text.trim()
    };

    issue.timeline.push(newEntry);
    await issue.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('issue:comment_added', { issueId: id, comment: newEntry, timeline: issue.timeline });
    }

    res.json({
      success: true,
      message: 'Comment posted',
      comment: newEntry,
      timeline: issue.timeline
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};

