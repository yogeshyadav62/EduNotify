import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room for Class-wide notifications
    socket.on('join:class', (classId) => {
      if (classId) {
        const roomName = `class_${classId.toUpperCase().trim()}`;
        socket.join(roomName);
        console.log(`👤 Client ${socket.id} joined class room: ${roomName}`);
      }
    });

    // Join room for Personal notifications
    socket.on('join:student', (studentId) => {
      if (studentId) {
        const roomName = `student_${studentId.toUpperCase().trim()}`;
        socket.join(roomName);
        console.log(`👤 Client ${socket.id} joined student room: ${roomName}`);
      }
    });

    // Join room for Admin dashboard notifications sync
    socket.on('join:admin', () => {
      socket.join('admin');
      console.log(`👤 Admin client ${socket.id} joined admin room`);
    });

    // Handle manual disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return io;
};

// Emit real-time notification to target audience
export const emitNewNotification = (notification) => {
  if (!io) return;

  const payload = {
    id: (notification.id || notification._id || '').toString(),
    title: notification.title,
    description: notification.description,
    facultyName: notification.facultyName,
    category: notification.category,
    dateTime: notification.dateTime,
    targetType: notification.targetType,
    classId: notification.classId,
    studentId: notification.studentId,
    status: notification.status,
    attachmentUrl: notification.attachmentUrl,
    isDelivered: notification.isDelivered,
    isSeen: notification.isSeen,
    deliveredAt: notification.deliveredAt,
    seenAt: notification.seenAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt
  };

  // 1. Emit to admin room so the dashboard updates in real-time
  io.to('admin').emit('notification:new', payload);

  // 2. Emit to specific student or class room
  if (notification.targetType === 'student' && notification.studentId) {
    const targetRoom = `student_${notification.studentId.toUpperCase().trim()}`;
    io.to(targetRoom).emit('notification:new', payload);
    console.log(`📡 Emitted personal notification to room: ${targetRoom}`);
  } else if (notification.targetType === 'class' && notification.classId) {
    const targetRoom = `class_${notification.classId.toUpperCase().trim()}`;
    io.to(targetRoom).emit('notification:new', payload);
    console.log(`📡 Emitted class-wide notification to room: ${targetRoom}`);
  }
};

// Emit real-time notification deletion to target audience
export const emitDeletedNotification = (notification) => {
  if (!io) return;

  const payload = {
    id: (notification.id || notification._id || '').toString(),
    targetType: notification.targetType,
    classId: notification.classId,
    studentId: notification.studentId
  };

  // 1. Emit to admin room
  io.to('admin').emit('notification:deleted', payload);

  // 2. Emit to specific student or class room
  if (notification.targetType === 'student' && notification.studentId) {
    const targetRoom = `student_${notification.studentId.toUpperCase().trim()}`;
    io.to(targetRoom).emit('notification:deleted', payload);
    console.log(`📡 Emitted personal deletion to room: ${targetRoom}`);
  } else if (notification.targetType === 'class' && notification.classId) {
    const targetRoom = `class_${notification.classId.toUpperCase().trim()}`;
    io.to(targetRoom).emit('notification:deleted', payload);
    console.log(`📡 Emitted class-wide deletion to room: ${targetRoom}`);
  }
};
