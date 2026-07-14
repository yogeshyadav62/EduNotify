export type NotificationCategory = 'academic' | 'fees' | 'events' | 'transport' | 'general';

export const NOTIFICATION_TYPES = {
  ACADEMIC: 'academic',
  FEES: 'fees',
  EVENTS: 'events',
  TRANSPORT: 'transport',
  GENERAL: 'general',
} as const;

export const ICONS = {
  academic: 'book-outline' as const,
  fees: 'card-outline' as const,
  events: 'calendar-outline' as const,
  transport: 'bus-outline' as const,
  general: 'megaphone-outline' as const,
} as const;

export interface Notification {
  id: string;
  facultyName: string;
  classId: string;
  studentId: string | null; // null represents class-wide announcement
  title: string;
  description: string;
  dateTime: string;
  category?: NotificationCategory;
  attachmentUrl?: string | null;
  attachmentType?: string | null; // MIME type: 'image/jpeg', 'application/pdf', etc.
  isDelivered?: boolean;
  isSeen?: boolean;
  deliveredAt?: string | null;
  seenAt?: string | null;
}

export interface NotificationState {
  items: Notification[];
  readNotificationIds: string[]; // List of read notification IDs
  loading: boolean;
  error: string | null;
  filter: 'all' | 'class' | 'personal'; // Filter by notification type
}
