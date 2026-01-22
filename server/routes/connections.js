const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const connectionController = require('../controllers/connectionController');

// Get connection statuses - NEW
router.get('/status', protect, connectionController.getConnectionStatuses);

// Send connection request
router.post('/request', protect, connectionController.sendConnectionRequest);

// Get pending connection requests (received)
router.get('/pending', protect, connectionController.getPendingRequests);

// Accept connection request
router.put('/accept/:connectionId', protect, connectionController.acceptConnectionRequest);

// Decline connection request
router.put('/decline/:connectionId', protect, connectionController.declineConnectionRequest);

// Get all accepted connections
router.get('/my-connections', protect, connectionController.getMyConnections);

// Get sent connection requests
router.get('/sent', protect, connectionController.getSentRequests);

module.exports = router;