import React from 'react';
import createPersistedState from 'use-persisted-state';

const LoginContext = React.createContext([{}, () => {}]);

const LoginProvider = (props) => {
    const useLoginState = createPersistedState('login');
    const [ state, setState ] = useLoginState({});

    return (
        <LoginContext.Provider value={[ state, setState ]}>
            { props.children }
        </LoginContext.Provider>
    );
};

const IsLoggedIn = () => {
    const useLoginState = createPersistedState('login');
    const [ state ] = useLoginState({});
    return !!(state.jwtObj && (state.jwtObj.exp * 1000) > Date.now());
}

export { LoginContext, LoginProvider, IsLoggedIn };
