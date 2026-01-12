const User = require('../models/User');
const Connection = require('../models/Connection');

// Send connection request
exports.sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    // Accept both recipientId and receiverId for flexibility
    const { receiverId, recipientId } = req.body;
    const targetId = receiverId || recipientId;

    console.log('🔍 Sending connection request');
    console.log('🔍 Sender ID:', senderId);
    console.log('🔍 Recipient ID:', targetId);

    if (!targetId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    if (senderId === targetId) {
      return res.status(400).json({ message: 'You cannot send a request to yourself' });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(targetId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check sender's match limit
    const senderAcceptedMatches = await Connection.countDocuments({
      $or: [
        { sender: senderId, status: 'accepted' },
        { receiver: senderId, status: 'accepted' }
      ]
    });

    if (senderAcceptedMatches >= 3) {
      return res.status(400).json({ 
        message: 'You have reached the maximum of 3 matches' 
      });
    }

    // Check receiver's match limit
    const receiverAcceptedMatches = await Connection.countDocuments({
      $or: [
        { sender: targetId, status: 'accepted' },
        { receiver: targetId, status: 'accepted' }
      ]
    });

    if (receiverAcceptedMatches >= 3) {
      return res.status(400).json({ 
        message: 'This user has reached their maximum matches' 
      });
    }

    // Check for existing connection
    const existingConnection = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: targetId },
        { sender: targetId, receiver: senderId }
      ]
    });

    if (existingConnection) {
      if (existingConnection.status === 'pending') {
        return res.status(400).json({ 
          message: 'A connection request is already pending' 
        });
      } else if (existingConnection.status === 'accepted') {
        return res.status(400).json({ 
          message: 'You are already connected with this user' 
        });
      } else if (existingConnection.status === 'declined') {
        return res.status(400).json({ 
          message: 'Connection request was previously declined' 
        });
      }
    }

    // Create new connection
    const newConnection = new Connection({
      sender: senderId,
      receiver: targetId,
      status: 'pending'
    });

    await newConnection.save();

    // Update receiver's pending count
    await User.findByIdAndUpdate(targetId, {
      $inc: { pendingMatchRequests: 1 }
    });

    console.log('✅ Connection request sent successfully');

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      connection: newConnection
    });

  } catch (error) {
    console.error('❌ Error sending connection request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while sending connection request' 
    });
  }
};

// Get pending connection requests (received)
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const pendingRequests = await Connection.find({
      receiver: userId,
      status: 'pending'
    })
    .populate('sender', '-password -email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests: pendingRequests,
      count: pendingRequests.length
    });

  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching requests' 
    });
  }
};

// Accept connection request
exports.acceptConnectionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { connectionId } = req.params;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    if (connection.receiver.toString() !== userId) {
      return res.status(403).json({ 
        message: 'You are not authorized to accept this request' 
      });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ 
        message: 'This request has already been processed' 
      });
    }

    const receiverMatches = await Connection.countDocuments({
      $or: [
        { sender: userId, status: 'accepted' },
        { receiver: userId, status: 'accepted' }
      ]
    });

    if (receiverMatches >= 3) {
      return res.status(400).json({ 
        message: 'You have reached the maximum of 3 matches' 
      });
    }

    connection.status = 'accepted';
    await connection.save();

    await User.findByIdAndUpdate(userId, {
      $inc: { matchCount: 1, pendingMatchRequests: -1 }
    });
    await User.findByIdAndUpdate(connection.sender, {
      $inc: { matchCount: 1 }
    });

    res.json({
      success: true,
      message: 'Connection accepted successfully',
      connection: connection
    });

  } catch (error) {
    console.error('Error accepting connection:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while accepting connection' 
    });
  }
};

// Decline connection request
exports.declineConnectionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { connectionId } = req.params;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    if (connection.receiver.toString() !== userId) {
      return res.status(403).json({ 
        message: 'You are not authorized to decline this request' 
      });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ 
        message: 'This request has already been processed' 
      });
    }

    connection.status = 'declined';
    await connection.save();

    await User.findByIdAndUpdate(userId, {
      $inc: { pendingMatchRequests: -1 }
    });

    res.json({
      success: true,
      message: 'Connection declined',
      connection: connection
    });

  } catch (error) {
    console.error('Error declining connection:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while declining connection' 
    });
  }
};

// Get all connections (accepted matches)
exports.getMyConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const connections = await Connection.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ],
      status: 'accepted'
    })
    .populate('sender', '-password -email')
    .populate('receiver', '-password -email')
    .sort({ updatedAt: -1 });

    const formattedConnections = connections.map(conn => {
      const otherUser = conn.sender._id.toString() === userId 
        ? conn.receiver 
        : conn.sender;
      
      return {
        connectionId: conn._id,
        user: otherUser,
        connectedAt: conn.updatedAt
      };
    });

    res.json({
      success: true,
      connections: formattedConnections,
      count: formattedConnections.length
    });

  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching connections' 
    });
  }
};

// Get sent connection requests
exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const sentRequests = await Connection.find({
      sender: userId
    })
    .populate('receiver', '-password -email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests: sentRequests,
      count: sentRequests.length
    });

  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching sent requests' 
    });
  }
};