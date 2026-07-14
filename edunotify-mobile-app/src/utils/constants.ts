import { NotificationCategory } from '../types/notification';

export const APP_NAME = 'EduNotify';
export const API_BASE_URL = 'https://api.edunotify.com/v1';

export interface CategoryInfo {
  label: string;
  icon: string;
  color: string;
  bgClass: string;
  textClass: string;
  iconColor: string;
}

export const CATEGORIES: Record<NotificationCategory | 'all', CategoryInfo> = {
  all: {
    label: 'All',
    icon: 'apps-sharp',
    color: '#2563EB',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    textClass: 'text-blue-600 dark:text-blue-400',
    iconColor: '#2563EB',
  },
  academic: {
    label: 'Academic',
    icon: 'book-outline',
    color: '#8B5CF6',
    bgClass: 'bg-purple-50 dark:bg-purple-900/20',
    textClass: 'text-purple-600 dark:text-purple-400',
    iconColor: '#8B5CF6',
  },
  fees: {
    label: 'Fees',
    icon: 'card-outline',
    color: '#10B981',
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    iconColor: '#10B981',
  },
  events: {
    label: 'Events',
    icon: 'calendar-outline',
    color: '#F59E0B',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    textClass: 'text-amber-600 dark:text-amber-400',
    iconColor: '#F59E0B',
  },
  transport: {
    label: 'Transport',
    icon: 'bus-outline',
    color: '#EF4444',
    bgClass: 'bg-rose-50 dark:bg-rose-900/20',
    textClass: 'text-rose-600 dark:text-rose-400',
    iconColor: '#EF4444',
  },
  general: {
    label: 'General',
    icon: 'megaphone-outline',
    color: '#6B7280',
    bgClass: 'bg-gray-50 dark:bg-gray-900/20',
    textClass: 'text-gray-600 dark:text-gray-400',
    iconColor: '#6B7280',
  },
};
