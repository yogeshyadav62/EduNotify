import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseApp = null;
let messagingInstance = null;
let isConfigured = false;

// Check for service account configuration in backend config directory
const serviceAccountPath = path.join(__dirname, '../config/firebase-service-account.json');

try {
  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('ℹ️ Firebase config loaded from environment variable.');
    } catch (e) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var as JSON:', e.message);
    }
  } else if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('ℹ️ Firebase config loaded from firebase-service-account.json.');
  }

  if (serviceAccount) {
    firebaseApp = initializeApp({
      credential: cert(serviceAccount)
    });
    messagingInstance = getMessaging(firebaseApp);
    isConfigured = true;
    console.log('✅ Firebase Admin SDK initialized successfully.');
  } else {
    console.log('⚠️ Firebase service account key not found (neither JSON file nor FIREBASE_SERVICE_ACCOUNT env var). Push notifications are disabled in this session.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
}

export const firebaseService = {
  isConfigured() {
    return isConfigured;
  },

  /**
   * Send a push notification to one or multiple device tokens
   * @param {string|string[]} tokens - Single token or array of tokens
   * @param {string} title - Notification title
   * @param {string} body - Notification body text
   * @param {object} data - Extra payload data key-values
   */
  async sendPushNotification(tokens, title, body, data = {}) {
    if (!isConfigured || !messagingInstance) {
      console.log('⚠️ Push notification skipped: Firebase not configured.');
      return null;
    }

    if (!tokens || (Array.isArray(tokens) && tokens.length === 0)) {
      console.log('⚠️ Push notification skipped: No tokens provided.');
      return null;
    }

    const tokenList = Array.isArray(tokens) ? tokens : [tokens];

    // Filter out invalid/empty tokens
    const validTokens = tokenList.filter(t => typeof t === 'string' && t.trim().length > 0);
    if (validTokens.length === 0) {
      console.log('⚠️ Push notification skipped: No valid tokens.');
      return null;
    }

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK' // Standard trigger to open main activity
      },
      tokens: validTokens
    };

    try {
      const response = await messagingInstance.sendEachForMulticast(message);
      console.log(`📢 Push notifications sent: ${response.successCount} successful, ${response.failureCount} failed.`);
      return response;
    } catch (error) {
      console.error('❌ Error sending push notification:', error.message);
      throw error;
    }
  },

  /**
   * Send a push notification targeting a specific topic (e.g. Class topic)
   * @param {string} topic - Topic name
   * @param {string} title - Notification title
   * @param {string} body - Notification body text
   * @param {object} data - Extra payload data key-values
   */
  async sendToTopic(topic, title, body, data = {}) {
    if (!isConfigured || !messagingInstance) {
      console.log('⚠️ Push notification skipped: Firebase not configured.');
      return null;
    }

    const message = {
      notification: {
        title,
        body
      },
      data,
      topic
    };

    try {
      const response = await messagingInstance.send(message);
      console.log(`📢 Push notification sent to topic [${topic}]:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error sending push notification to topic [${topic}]:`, error.message);
      throw error;
    }
  },

  /**
   * Helper to send push notification to all target students for a notification
   * @param {object} notification - Mongoose Notification model instance
   */
  async sendPushForNotification(notification) {
    if (!isConfigured) {
      console.log('⚠️ Push notification skipped: Firebase not configured.');
      return;
    }

    try {
      const { title, description, targetType, classId, studentId } = notification;
      const data = {
        notificationId: notification._id ? notification._id.toString() : notification.id.toString(),
        title: title || '',
        description: description || '',
        category: notification.category || ''
      };

      // Dynamically import Student model to avoid circular dependency at startup
      const Student = (await import('../models/student.js')).default;

      if (targetType === 'class') {
        if (!classId) return;
        const students = await Student.find({ classId: classId.toUpperCase() });
        const tokens = students.map(s => s.fcmToken).filter(t => t);
        
        console.log(`📢 Sending push to class [${classId}], total student tokens found: ${tokens.length}`);
        if (tokens.length > 0) {
          await this.sendPushNotification(tokens, title, description, data);
        }
      } else if (targetType === 'student') {
        if (!studentId) return;
        const student = await Student.findById(studentId.toUpperCase());
        if (student && student.fcmToken) {
          console.log(`📢 Sending personal push to student [${studentId}]`);
          await this.sendPushNotification(student.fcmToken, title, description, data);
        } else {
          console.log(`⚠️ Push skipped: Student [${studentId}] has no registered FCM Token.`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to send push for notification:', error.message);
    }
  }
};
