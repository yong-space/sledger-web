import useLogin from '../Login/LoginHook';

export default () => {
    const baseUrl = process.env.REACT_APP_BASE_URL || window.location.origin;
    const { getJwt } = useLogin();
    const GET = 'GET';
    const POST = 'POST';
    const PUT = 'PUT';

    const apiCall = async (method, path, body) => {
        const config = {
            method: method,
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getJwt()}`
            },
        };
        if ([ POST, PUT ].indexOf(method) > -1 && body) {
            if (typeof body == 'object') {
                body = JSON.stringify(body);
            }
            config['body'] = body;
        }
        return await fetch(`${baseUrl}/api/${path}`, config)
            .then(async res => {
                if (!res.ok) {
                    throw new Error((await res.json()).message);
                }
                return res.bodyUsed ? res.json() : {};
            })
            .then(json => json)
            .catch(err => { throw new Error(err.message) });
    }

    const getX = async () => {
        return await apiCall(GET, 'public/x');
    }

    const getY = async () => {
        return await apiCall(GET, 'private/y');
    }

    const updateProfile = async (user) => {
        return await apiCall(PUT, 'profile', user);
    }

    const updatePassword = async (password) => {
        return await apiCall(PUT, 'profile/password', password);
    }

    return {
        getX,
        getY,
        updateProfile,
        updatePassword
    }
};
