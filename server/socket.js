import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/Message.js';

const onlineUsers = new Map();

export const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name}`);
    
    // Update user online status
    onlineUsers.set(socket.user._id.toString(), socket.id);
    socket.broadcast.emit('user-online', socket.user._id);
    
    // Update user in database
    User.findByIdAndUpdate(socket.user._id, { isOnline: true, lastSeen: Date.now() });

    // Join user to their personal room
    socket.join(socket.user._id.toString());

    // Handle private messaging
    socket.on('send-message', async (data) => {
      try {
        const { receiverId, content, media } = data;
        
        const message = new Message({
          sender: socket.user._id,
          receiver: receiverId,
          content,
          media
        });
        await message.save();
        await message.populate('sender', 'name avatar');

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new-message', message);
        }
        
        socket.emit('message-sent', message);
      } catch (error) {
        socket.emit('message-error', { error: error.message });
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ receiverId, isTyping }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-typing', {
          userId: socket.user._id,
          isTyping
        });
      }
    });

    // Handle read receipts
    socket.on('mark-read', async ({ messageIds, senderId }) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { read: true }
        );
        
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages-read', { messageIds });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle friend request events (for real-time notifications)
    socket.on('friend-request-sent', (data) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('friend-request-received', {
          from: {
            _id: socket.user._id,
            name: socket.user.name,
            avatar: socket.user.avatar
          }
        });
      }
    });

    socket.on('friend-request-accepted', (data) => {
      const requesterSocketId = onlineUsers.get(data.requesterId);
      if (requesterSocketId) {
        io.to(requesterSocketId).emit('friend-request-accepted', {
          by: {
            _id: socket.user._id,
            name: socket.user.name,
            avatar: socket.user.avatar
          }
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name}`);
      onlineUsers.delete(socket.user._id.toString());
      
      User.findByIdAndUpdate(socket.user._id, { isOnline: false, lastSeen: Date.now() });
      
      socket.broadcast.emit('user-offline', socket.user._id);
    });
  });
};