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

export { LoginContext, LoginProvider };
