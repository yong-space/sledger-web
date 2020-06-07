import React from 'react';
import createPersistedState from 'use-persisted-state';

const LoginContext = React.createContext([{}, () => {}]);

const LoginProvider = (props) => {
    const [ state, setState ] = createPersistedState('login')({});

    return (
        <LoginContext.Provider value={[ state, setState ]}>
            { props.children }
        </LoginContext.Provider>
    );
};

const IsLoggedIn = () => {
    const [ state ] = createPersistedState('login')({});
    return !!(state.jwtObj && (state.jwtObj.exp * 1000) > Date.now());
}

export { LoginContext, LoginProvider, IsLoggedIn };
