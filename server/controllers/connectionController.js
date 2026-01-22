const User = require('../models/User');
const Connection = require('../models/Connection');

// Send connection request
exports.sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
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

    // REMOVED: Match limit checks for sender and receiver

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
    .populate('sender', '-password -email -phoneNumber') // Hide phone until accepted
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

    // REMOVED: Match limit check for receiver

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

// Get all connections (accepted matches) - WITH PHONE NUMBERS
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
    .populate('sender', '-password -email') // Include phoneNumber for accepted matches
    .populate('receiver', '-password -email') // Include phoneNumber for accepted matches
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
    .populate('receiver', '-password -email -phoneNumber') // Hide phone until accepted
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

// NEW: Get connection statuses for all users the current user has interacted with
exports.getConnectionStatuses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all connections where the user is either sender or receiver
    const connections = await Connection.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    }).select('sender receiver status');

    // Map connections to status objects
    const statuses = connections.map(connection => {
      // Determine the other user's ID
      const otherUserId = connection.sender.toString() === userId 
        ? connection.receiver.toString() 
        : connection.sender.toString();

      // Map status to frontend-friendly names
      let status;
      if (connection.status === 'accepted') {
        status = 'matched';
      } else if (connection.status === 'declined') {
        status = 'declined';
      } else if (connection.status === 'pending') {
        status = 'pending';
      } else {
        status = connection.status;
      }

      return {
        userId: otherUserId,
        status: status
      };
    });

    res.json({
      success: true,
      statuses: statuses
    });

  } catch (error) {
    console.error('Error fetching connection statuses:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching connection statuses',
      error: error.message 
    });
  }
};