import React from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from './ui/button';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const dummyNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Lead Assigned',
    message: 'A new lead has been assigned to you.',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: '2',
    title: 'Document Uploaded',
    message: 'A document has been uploaded to case #1234.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    title: 'Appointment Reminder',
    message: 'You have an appointment scheduled for tomorrow at 10 AM.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    title: 'Task Completed',
    message: 'The intake form for John Doe has been completed.',
    time: '1 day ago',
    read: true,
  },
].slice(0, 4);

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h5 className="font-normal text-gray-900 dark:text-white text-xs">Notifications</h5>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {dummyNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No notifications
          </div>
        ) : (
          dummyNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                notification.read ? '' : 'bg-blue-50 dark:bg-blue-900/10'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h6 className="font-medium text-xs text-gray-900 dark:text-white truncate">
                    {notification.title}
                  </h6>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {notification.time}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" className="w-full text-sm" onClick={onClose}>
          View All Notifications
        </Button>
      </div>
    </div>
  );
};

export default NotificationsDropdown;
