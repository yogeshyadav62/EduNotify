import { Notification } from '../models/index.js';
import { emitNewNotification } from '../loaders/socket.js';
import { firebaseService } from '../services/firebase.service.js';

export const startNotificationScheduler = () => {
  console.log('⏰ Notification scheduler started (running every 30 seconds)...');
  
  setInterval(async () => {
    try {
      const now = new Date();

      // Find all draft notifications scheduled for now or in the past
      const scheduledNotices = await Notification.find({
        status: 'draft',
        scheduledFor: { $ne: null, $lte: now }
      });

      if (scheduledNotices.length > 0) {
        console.log(`⏰ Scheduler found ${scheduledNotices.length} pending notification(s) to publish.`);

        for (const notice of scheduledNotices) {
          // Update status to published
          notice.status = 'published';
          notice.dateTime = notice.scheduledFor; // Set notice date to schedule time
          await notice.save();

          // Broadcast in real-time
          emitNewNotification(notice);
          firebaseService.sendPushForNotification(notice);
          console.log(`📢 Published scheduled notice: "${notice.title}"`);
        }
      }
    } catch (error) {
      console.error('🔥 Error running notification scheduler:', error);
    }
  }, 30000); // 30 seconds interval
};
