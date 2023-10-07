import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import state from './state';
import styled from 'styled-components';
import { useState, useEffect } from 'react';

const FxRoot = styled.sup`
    font-size: .8rem;
    position: relative;
    top: -.3rem;
    left: -.3rem;
`;
const Fx = () => <FxRoot>FX</FxRoot>;

const AccountSelector = ({ handleChange, disabled, sx, accountFilter, showCashCredit }) => {
    const [ loading, setLoading ] = useState(true);
    const issuers = state.useState(state.issuers)[0];
    const accounts = state.useState(state.accounts)[0];
    const [ selectedAccount, setSelectedAccount ] = state.useState(state.selectedAccount);
    const getVisibleAccounts = () => accounts.filter((a) => a.visible);
    const getAccounts = () => {
        let allAccounts = !accountFilter ? getVisibleAccounts() : getVisibleAccounts().filter(accountFilter);
        if (showCashCredit) {
            allAccounts.push({ id: 0, name: 'All Transactions', type: 'Aggregated' });
        }
        return allAccounts.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
    };
    const getIssuer = (id) => issuers.find(i => i.id === id);

    useEffect(() => {
        if (!selectedAccount || (selectedAccount.id > 0 && !getAccounts().find(({ id }) => id === selectedAccount.id))) {
            setSelectedAccount(getAccounts()[0]);
        } else {
            setLoading(false);
        }
    }, [ accounts, selectedAccount ]);

    const colors = {
        'Cash': 'success',
        'Credit': 'warning',
        'Retirement': 'info',
    };

    const AccountEntry = ({ type, issuer, name, multiCurrency }) => (
        <>
            { issuer ? (
                <>
                    <Chip sx={{ borderRadius: '.5rem' }} label={type} color={colors[type]} size="small" />
                    <Chip sx={{ borderRadius: '.5rem', color: `#${issuer.colour}`, borderColor: `#${issuer.colour}` }} label={issuer.name} variant="outlined" size="small" />
                </>
            ) : (
                <Chip sx={{ borderRadius: '.5rem' }} label="Cash + Credit" size="small" />
            )}
            {name}
            {multiCurrency && <Fx />}
        </>
    );

    return !(accounts && selectedAccount && !loading) ? <></> : (
        <FormControl size="small" sx={sx}>
            <InputLabel id="account-label">Account</InputLabel>
            <Select
                labelId="account-label"
                label="Account"
                value={selectedAccount.id}
                onChange={handleChange}
                disabled={disabled}
                renderValue={(selectedId) => {
                    if (selectedId === 0) {
                        return (
                            <div style={{ display: 'flex', gap: '.4rem' }}>
                                <AccountEntry name="All Transactions" />
                            </div>
                        );
                    }
                    const { name, type, issuerId, multiCurrency } = getVisibleAccounts().find((a) => a.id === selectedId);
                    return (
                        <div style={{ display: 'flex', gap: '.4rem' }}>
                            <AccountEntry {...{ type, issuer: getIssuer(issuerId), name, multiCurrency }} />
                        </div>
                    )
                }}
            >
                { getAccounts().map(({ id, name, type, issuerId, multiCurrency }) => (
                    <MenuItem key={id} value={id} sx={{ gap: '.4rem' }}>
                        <AccountEntry {...{ type, issuer: getIssuer(issuerId), name, multiCurrency }} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
export default AccountSelector;
