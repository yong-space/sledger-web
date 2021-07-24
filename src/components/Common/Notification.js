import { notification } from 'antd';

export default {
    showSuccess: (message) => {
        notification.success({
            message,
            duration: 2,
            placement: 'bottomRight',
        });
    },
    showError: (title, message) => {
        notification.error({
            message: title,
            description: message,
            duration: 5,
            placement: 'bottomRight',
        });
    },
};
