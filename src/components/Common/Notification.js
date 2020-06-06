import { notification } from 'antd';

export default () => {
    const showSuccess = (message) => {
        notification['success']({
            message: message,
            duration: 2,
            placement: 'bottomRight'
        });
    }

    const showError = (title, message) => {
        notification['error']({
            message: title,
            description: message,
            duration: 5,
            placement: 'bottomRight'
        });
    }

    return { showSuccess, showError }
}
