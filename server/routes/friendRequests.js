import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Send friend request
router.post('/send/:userId', verifyToken, async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.userId;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Check if request already sent
    if (sender.friendRequests.sent.includes(receiverId)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if request already received (pending)
    if (receiver.friendRequests.received.includes(senderId)) {
      return res.status(400).json({ message: 'Friend request already pending' });
    }

    // Add to sent requests of sender
    sender.friendRequests.sent.push(receiverId);
    await sender.save();

    // Add to received requests of receiver
    receiver.friendRequests.received.push(senderId);
    await receiver.save();

    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId.toString()).emit('friend-request-received', {
        from: {
          _id: sender._id,
          name: sender.name,
          avatar: sender.avatar
        }
      });
    }

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: error.message });
  }
});

// Accept friend request
router.post('/accept/:userId', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const requesterId = req.params.userId;

    const currentUser = await User.findById(currentUserId);
    const requester = await User.findById(requesterId);

    if (!requester) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request exists
    if (!currentUser.friendRequests.received.includes(requesterId)) {
      return res.status(400).json({ message: 'No friend request from this user' });
    }

    // Remove from received requests
    currentUser.friendRequests.received = currentUser.friendRequests.received.filter(
      id => id.toString() !== requesterId
    );

    // Remove from requester's sent requests
    requester.friendRequests.sent = requester.friendRequests.sent.filter(
      id => id.toString() !== currentUserId
    );

    // Add to friends list of both users
    currentUser.friends.push(requesterId);
    requester.friends.push(currentUserId);

    await currentUser.save();
    await requester.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(requesterId.toString()).emit('friend-request-accepted', {
        by: {
          _id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar
        }
      });
    }

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: error.message });
  }
});

// Reject/Cancel friend request
router.post('/reject/:userId', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(otherUserId);

    // Remove from both sides (works for both sent and received requests)
    currentUser.friendRequests.sent = currentUser.friendRequests.sent.filter(
      id => id.toString() !== otherUserId
    );
    currentUser.friendRequests.received = currentUser.friendRequests.received.filter(
      id => id.toString() !== otherUserId
    );

    if (otherUser) {
      otherUser.friendRequests.sent = otherUser.friendRequests.sent.filter(
        id => id.toString() !== currentUserId
      );
      otherUser.friendRequests.received = otherUser.friendRequests.received.filter(
        id => id.toString() !== currentUserId
      );
      await otherUser.save();
    }

    await currentUser.save();

    res.json({ message: 'Friend request rejected/cancelled' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: error.message });
  }
});

// Unfriend
router.post('/unfriend/:userId', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const friendId = req.params.userId;

    const currentUser = await User.findById(currentUserId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from friends list
    currentUser.friends = currentUser.friends.filter(
      id => id.toString() !== friendId
    );
    friend.friends = friend.friends.filter(
      id => id.toString() !== currentUserId
    );

    await currentUser.save();
    await friend.save();

    res.json({ message: 'Unfriended successfully' });
  } catch (error) {
    console.error('Error unfriending:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get friend requests (received)
router.get('/requests/received', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests.received', 'name email avatar bio');

    res.json(user.friendRequests.received);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get friend requests (sent)
router.get('/requests/sent', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests.sent', 'name email avatar bio');

    res.json(user.friendRequests.sent);
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get friends list
router.get('/friends', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name email avatar bio isOnline lastSeen');

    res.json(user.friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: error.message });
  }
});

// Check friendship status with a user
router.get('/status/:userId', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const currentUser = await User.findById(currentUserId);

    let status = 'none'; // none, pending_sent, pending_received, friends

    if (currentUser.friends.includes(otherUserId)) {
      status = 'friends';
    } else if (currentUser.friendRequests.sent.includes(otherUserId)) {
      status = 'pending_sent';
    } else if (currentUser.friendRequests.received.includes(otherUserId)) {
      status = 'pending_received';
    }

    res.json({ status });
  } catch (error) {
    console.error('Error checking friend status:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;