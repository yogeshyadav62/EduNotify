export type NotificationCategory = 'academic' | 'fees' | 'events' | 'transport' | 'general';

export interface Notification {
  id: string;
  facultyName: string;
  classId: string;
  studentId: string | null; // null represents class-wide announcement
  title: string;
  description: string;
  dateTime: string;
  category?: NotificationCategory;
}

export interface NotificationState {
  items: Notification[];
  readNotificationIds: string[]; // List of read notification IDs
  loading: boolean;
  error: string | null;
  filter: 'all' | 'class' | 'personal'; // Filter by notification type
}
