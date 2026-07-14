import 'dotenv/config';
import { createServer } from 'http';
import app from './src/app.js';
import { initSocket } from './src/loaders/socket.js';
import { initDatabase } from './src/loaders/mongoose.js';
import { startNotificationScheduler } from './src/schedulers/notificationScheduler.js';

const PORT = process.env.PORT || 4500;

const startServer = async () => {
  try {
    // 1. Initialize Database
    await initDatabase();

    // 2. Create HTTP Server
    const httpServer = createServer(app);

    // 3. Initialize Socket.IO
    initSocket(httpServer);

    // 4. Start Background Scheduler
    startNotificationScheduler();

    // 5. Start Server
    httpServer.listen(PORT, () => {
      console.log(`🚀 EduNotify Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
