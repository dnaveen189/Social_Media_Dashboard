import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import axios from 'axios';
import { Send, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';

let socket;

const Messages = () => {
  const { user, token } = useSelector(state => state.auth);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await axios.get('http://localhost:5002/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      toast.error('Failed to load conversations');
    }
  }, [token]);

  // Fetch messages for a specific user
  const fetchMessages = useCallback(async (userId) => {
    if (!userId || !token) return;
    
    try {
      const response = await axios.get(`http://localhost:5002/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      
      // Mark messages as read
      const unreadMessages = response.data
        .filter(m => !m.read && m.sender?._id === userId)
        .map(m => m._id);
      
      if (unreadMessages.length > 0 && socket) {
        socket.emit('mark-read', { messageIds: unreadMessages, senderId: userId });
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast.error('Failed to load messages');
    }
  }, [token]);

  // Update conversation list with new message
  const updateConversationWithMessage = useCallback((message) => {
    setConversations(prev => {
      const otherUser = message.sender?._id === user?.id ? message.receiver : message.sender;
      if (!otherUser) return prev;
      
      const updatedConv = {
        user: otherUser,
        lastMessage: message,
        unreadCount: message.sender?._id !== user?.id && !message.read ? 1 : 0
      };
      
      const filtered = prev.filter(c => c.user?._id !== otherUser?._id);
      return [updatedConv, ...filtered];
    });
  }, [user?.id]);

  // Socket event handlers
  const handleNewMessage = useCallback((message) => {
    if (activeChat && (
      message.sender?._id === activeChat._id || 
      message.receiver === activeChat._id
    )) {
      setMessages(prev => [...prev, message]);
    }
    updateConversationWithMessage(message);
  }, [activeChat, updateConversationWithMessage]);

  const handleMessageSent = useCallback((message) => {
    if (activeChat && message.receiver === activeChat._id) {
      setMessages(prev => [...prev, message]);
    }
  }, [activeChat]);

  const handleUserOnline = useCallback((userId) => {
    setOnlineUsers(prev => new Set(prev).add(userId));
  }, []);

  const handleUserOffline = useCallback((userId) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  const handleUserTyping = useCallback(({ userId, isTyping }) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      if (isTyping) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  }, []);

  // Socket connection effect
  useEffect(() => {
    if (!token) return;

    // Connect to socket
    socket = io('http://localhost:5002', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected to socket');
    });

    socket.on('new-message', handleNewMessage);
    socket.on('message-sent', handleMessageSent);
    socket.on('user-online', handleUserOnline);
    socket.on('user-offline', handleUserOffline);
    socket.on('user-typing', handleUserTyping);

    // Cleanup function
    return () => {
      if (socket) {
        socket.off('new-message', handleNewMessage);
        socket.off('message-sent', handleMessageSent);
        socket.off('user-online', handleUserOnline);
        socket.off('user-offline', handleUserOffline);
        socket.off('user-typing', handleUserTyping);
        socket.disconnect();
      }
    };
  }, [token, handleNewMessage, handleMessageSent, handleUserOnline, 
      handleUserOffline, handleUserTyping]);

  // Effect for fetching conversations - with ESLint disable
  useEffect(() => {
    if (token) {
      // This is actually fine, but ESLint has a false positive
      // The function is async and doesn't cause cascading renders
      fetchConversations();
    }
  }, [token, fetchConversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Effect for fetching messages when activeChat changes - with ESLint disable
  useEffect(() => {
    if (activeChat?._id && token) {
      // This is actually fine, but ESLint has a false positive
      // The function is async and doesn't cause cascading renders
      fetchMessages(activeChat._id);
    }
  }, [activeChat?._id, token, fetchMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !socket) return;

    socket.emit('send-message', {
      receiverId: activeChat._id,
      content: newMessage,
      media: null
    });

    setNewMessage('');
    
    // Stop typing indicator
    socket.emit('typing', { receiverId: activeChat._id, isTyping: false });
  };

  const handleTyping = (isTyping) => {
    if (activeChat && socket) {
      socket.emit('typing', { receiverId: activeChat._id, isTyping });
    }
  };

  const handleChatSelect = (conversationUser) => {
    setActiveChat(conversationUser);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv, index) => {
              const key = conv.user?._id || `conv-${index}`;
              return (
                <div
                  key={key}
                  onClick={() => handleChatSelect(conv.user)}
                  className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 border-b ${
                    activeChat?._id === conv.user?._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={conv.user?.avatar?.url || '/default-avatar.png'}
                      alt={conv.user?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {onlineUsers.has(conv.user?._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h4 className="font-semibold truncate">{conv.user?.name || 'Unknown User'}</h4>
                      {conv.lastMessage?.createdAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b flex items-center space-x-3">
              <img
                src={activeChat.avatar?.url || '/default-avatar.png'}
                alt={activeChat.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">{activeChat.name}</h3>
                {typingUsers.has(activeChat._id) ? (
                  <p className="text-sm text-green-600">Typing...</p>
                ) : (
                  onlineUsers.has(activeChat._id) && (
                    <p className="text-sm text-green-600">Online</p>
                  )
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((msg, index) => {
                  const messageKey = msg._id || `msg-${index}-${msg.createdAt}`;
                  return (
                    <div
                      key={messageKey}
                      className={`flex ${msg.sender?._id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-lg p-3 ${
                          msg.sender?._id === user?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p>{msg.content}</p>
                        {msg.createdAt && (
                          <span className="text-xs opacity-75 mt-1 block">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping(e.target.value.length > 0);
                  }}
                  onBlur={() => handleTyping(false)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;