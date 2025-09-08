import React, { useEffect } from 'react';
import { notification } from 'antd';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { selectUI, uiActions } from '@/store';

const NotificationManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector(selectUI);

  useEffect(() => {
    notifications.forEach(notif => {
      notification[notif.type]({
        message: notif.type.charAt(0).toUpperCase() + notif.type.slice(1),
        description: notif.message,
        duration: notif.duration ? notif.duration / 1000 : 4.5,
        onClose: () => {
          dispatch(uiActions.removeNotification(notif.id));
        },
      });

      // Auto remove notification after showing
      dispatch(uiActions.removeNotification(notif.id));
    });
  }, [notifications, dispatch]);

  return null;
};

export default NotificationManager;