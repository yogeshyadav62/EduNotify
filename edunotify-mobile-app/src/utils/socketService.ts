import io, { Socket } from 'socket.io-client';
import { BASE_URL } from './Routes';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(classId: string, studentId: string) {
    if (this.socket && this.isConnected) {
      return;
    }

    try {
      this.socket = io(BASE_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 5,
        forceNew: true
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('🔌 Socket connected successfully');

        // Join secure student rooms
        if (classId) {
          this.socket?.emit('join:class', classId.toUpperCase().trim());
        }
        if (studentId) {
          this.socket?.emit('join:student', studentId.toUpperCase().trim());
        }
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('🔌 Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        this.isConnected = false;
        console.log('❌ Socket connection error:', error.message);
      });
    } catch (error) {
      this.isConnected = false;
      console.log('❌ Socket initialization failed:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  onNewNotification(callback: (notification: any) => void) {
    if (!this.socket) return;

    // Avoid duplicate listeners
    this.socket.off('notification:new');
    
    this.socket.on('notification:new', (notification) => {
      console.log('📡 Received real-time notification:', notification);
      callback(notification);
    });
  }

  onDeletedNotification(callback: (payload: { id: string }) => void) {
    if (!this.socket) return;

    // Avoid duplicate listeners
    this.socket.off('notification:deleted');
    
    this.socket.on('notification:deleted', (payload) => {
      console.log('📡 Received real-time deletion:', payload);
      callback(payload);
    });
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new SocketService();
