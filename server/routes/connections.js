const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const connectionController = require('../controllers/connectionController');

router.post('/request', protect, connectionController.sendConnectionRequest);
router.get('/pending', protect, connectionController.getPendingRequests);
router.put('/accept/:connectionId', protect, connectionController.acceptConnectionRequest);
router.put('/decline/:connectionId', protect, connectionController.declineConnectionRequest);
router.get('/my-connections', protect, connectionController.getMyConnections);
router.get('/sent', protect, connectionController.getSentRequests);

module.exports = router;