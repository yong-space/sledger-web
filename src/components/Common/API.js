import useLogin from '../Login/LoginHook';

export default () => {
    const baseUrl = process.env.REACT_APP_BASE_URL || window.location.origin;
    const { getJwt } = useLogin();
    const GET = 'GET';
    const POST = 'POST';

    const apiCall = async (method, path, body) => {
        const config = {
            method: method,
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getJwt()}`
            },
        };
        if (method === POST && body) {
            if (typeof body == 'object') {
                body = JSON.stringify(body);
            }
            config['body'] = body;
        }
        return await fetch(`${baseUrl}/api/${path}`, config)
            .then(res => {
                if (!res.ok)
                    throw Error(res.statusText);
                return res.json();
            })
            .then(json => json)
            .catch(err => err);
    }

    const getX = async () => {
        return await apiCall(GET, 'public/x');
    }

    const getY = async () => {
        return await apiCall(GET, 'private/y');
    }

    const saveProfile = async (user) => {
        return await apiCall(POST, 'profile/save', user);
    }

    return {
        getX,
        getY,
        saveProfile
    }
};
