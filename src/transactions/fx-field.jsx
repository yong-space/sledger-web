import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { numericProps } from '../util/formatters';

const ForeignCurrencyBar = styled.div`
    display: flex;
    gap: 1rem;
    & :first-child { width: 8rem }
`;

export default ({
    transactionToEdit,
    originalAmount,
    setOriginalAmount,
    currency,
    setCurrency,
    amountValue,
}) => {
    const [ inputCurrency, setInputCurrency ] = useState(transactionToEdit?.currency || 'SGD');

    const usePrevious = (value) => {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        }, [ value ]);
        return ref.current;
    };

    const prevCurrency = usePrevious(currency);

    useEffect(() => {
        if (prevCurrency && prevCurrency !== 'SGD' && currency === 'SGD') {
            setOriginalAmount(amountValue);
        }
    }, [ currency, prevCurrency ]);

    return (
        <ForeignCurrencyBar key="fx">
            <Autocomplete
                disableClearable
                freeSolo
                inputValue={inputCurrency}
                onInputChange={(e, v) => setInputCurrency(v)}
                value={currency}
                onChange={(e, v) => setCurrency(v)}
                options={[ 'SGD', 'USD', 'EUR', 'AUD', 'GBP', 'JPY', 'KRW', 'MYR', 'VND', 'CNY' ]}
                renderInput={(params) => (
                    <TextField
                        required
                        name="currency"
                        label="Currency"
                        inputProps={{ minLength: 3, maxLength: 3 }}
                        onFocus={({ target }) => target.select()}
                        {...params}
                    />
                )}
            />
            <TextField
                fullWidth
                required
                name="originalAmount"
                label="Original Amount"
                value={originalAmount}
                onChange={({ target }) => setOriginalAmount(target.value)}
                inputProps={numericProps}
                onFocus={({ target }) => target.select()}
            />
        </ForeignCurrencyBar>
    );
};
