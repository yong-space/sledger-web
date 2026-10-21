import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { numericProps } from '../util/formatters';

const ForeignCurrencyBar = styled.div`
    display: flex;
    gap: 1rem;
    & > :first-child { width: 8rem }
`;

export default ({
    originalAmount,
    setOriginalAmount,
    currency,
    setCurrency,
    amountValue,
}) => {
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
                disableClearable={currency === 'SGD'}
                freeSolo
                inputValue={currency}
                onInputChange={(e, v, reason) => setCurrency(reason === 'clear' ? 'SGD' : v)}
                value={currency}
                onChange={(e, v) => setCurrency(v || 'SGD')}
                options={[ 'SGD', 'USD', 'EUR', 'AUD', 'GBP', 'JPY', 'KRW', 'MYR', 'VND', 'CNY' ]}
                renderInput={(params) => (
                    <TextField
                        required
                        name="currency"
                        label="Currency"
                        onFocus={({ target }) => target.select()}
                        {...params}
                        slotProps={{
                            ...params.slotProps,
                            htmlInput: { ...params.slotProps.htmlInput, minLength: 3, maxLength: 3 }
                        }} />
                )}
            />
            <TextField
                fullWidth
                required
                name="originalAmount"
                label="Original Amount"
                value={originalAmount}
                onChange={({ target }) => setOriginalAmount(target.value)}
                onFocus={({ target }) => target.select()}
                slotProps={{
                    htmlInput: numericProps
                }}
            />
        </ForeignCurrencyBar>
    );
};
