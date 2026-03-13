const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const auth = require('../middleware/auth');

// Protected routes
router.post('/report', auth, issueController.reportIssue);
router.post('/verify', auth, issueController.verifyIssue);
router.get('/nearby', auth, issueController.getNearbyIssues);
router.get('/my-reports', auth, issueController.getMyReports);
router.get('/stats', issueController.getIssueStats);
router.put('/:issueId', auth, issueController.updateIssue);

module.exports = router;
