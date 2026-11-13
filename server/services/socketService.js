const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const initSocket = (server) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  io = new Server(server, {
    cors: {
      origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 15000,
  });

  // JWT Authentication for Sockets
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      // Allow anonymous connection for public read-only issues feed if desired, but tag as unauthenticated
      socket.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'civicfix_jwt_super_secure_secret_key_2026_demo'
      );
      socket.user = decoded;
      next();
    } catch (err) {
      // Continue unauthenticated
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    const userDisplay = socket.user ? `${socket.user.name || socket.user.id} (${socket.user.role})` : 'Guest';
    console.log(`[Socket.IO] Client connected: ${socket.id} - ${userDisplay}`);

    if (socket.user && socket.user.id) {
      // Join user specific room
      socket.join(`user:${socket.user.id}`);
      // Join role specific room
      if (socket.user.role) {
        socket.join(`role:${socket.user.role}`);
      }
    }

    // Join issue detail room for live updates and chat/comments
    socket.on('issue:join', (issueId) => {
      if (issueId) {
        socket.join(`issue:${issueId}`);
      }
    });

    socket.on('issue:leave', (issueId) => {
      if (issueId) {
        socket.leave(`issue:${issueId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};

// Notification helper to send to a specific user
const sendNotificationToUser = (userId, notification) => {
  if (io && userId) {
    io.to(`user:${userId.toString()}`).emit('notification:new', notification);
  }
};

// Event helper to broadcast issue updates
const emitIssueUpdated = (issue) => {
  if (io && issue) {
    // Notify clients viewing this specific issue
    io.to(`issue:${issue._id.toString()}`).emit('issue:updated', issue);
    // Broadcast to global feed
    io.emit('issue:list_update', {
      type: 'UPDATE',
      issueId: issue._id,
      issue,
    });
  }
};

// Event helper when new issue is created
const emitIssueCreated = (issue) => {
  if (io && issue) {
    // Broadcast to admin room and global issue feed
    io.to('role:admin').emit('issue:new_admin_alert', issue);
    io.emit('issue:list_update', {
      type: 'CREATE',
      issueId: issue._id,
      issue,
    });
  }
};

// Event helper when new comment is added
const emitNewComment = (issueId, comment) => {
  if (io && issueId) {
    io.to(`issue:${issueId.toString()}`).emit('comment:new', comment);
  }
};

// Event helper when upvote is toggled
const emitUpvoteUpdated = (issueId, upvotesCount, userHasUpvoted, userId) => {
  if (io && issueId) {
    io.to(`issue:${issueId.toString()}`).emit('issue:upvoted', {
      issueId,
      upvotesCount,
      userHasUpvoted,
      userId,
    });
    io.emit('issue:list_update', {
      type: 'UPVOTE',
      issueId,
      upvotesCount,
    });
  }
};

module.exports = {
  initSocket,
  getIO,
  sendNotificationToUser,
  emitIssueUpdated,
  emitIssueCreated,
  emitNewComment,
  emitUpvoteUpdated,
};
