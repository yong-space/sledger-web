import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useState, useEffect, useMemo } from 'react';
import { debounce } from '@mui/material/utils';

const AutoFill = ({ initValue, fieldProps, promise, ...props }) => {
    const [ loading, setLoading ] = useState(false);

    const [ inputValue, setInputValue ] = useState(initValue || '');
    const [ options, setOptions ] = useState([]);

    const fetcher = useMemo(() => debounce((request, callback) =>
        promise(request, callback), 200), []);

    useEffect(() => {
        if (inputValue.length < 3) {
            return;
        }
        setOptions([]);
        setLoading(true);
        if (inputValue === initValue) {
            return;
        }
        fetcher(inputValue, (response) => {
            setLoading(false);
            setOptions(Array.from(new Set([ ...response, inputValue.trim() ])));
        });
    }, [ inputValue ]);

    return (
        <Autocomplete
            freeSolo
            autoComplete
            loading={loading}
            options={options}
            getOptionLabel={(option) => option}
            inputValue={inputValue}
            onInputChange={(e, v) => setInputValue(v)}
            renderInput={(params) => <TextField {...fieldProps} {...params} />}
            {...props}
        />
    );
};
export default AutoFill;
