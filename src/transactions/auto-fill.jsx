import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useState, useEffect, useMemo } from 'react';
import { debounce } from '@mui/material/utils';

const AutoFill = ({ initValue, fieldProps, promise }) => {
    const [ loading, setLoading ] = useState(false);
    const [ value, setValue ] = useState(null);
    const [ inputValue, setInputValue ] = useState(initValue || '');
    const [ options, setOptions ] = useState([]);

    const fetcher = useMemo(() => debounce((request, callback) =>
        promise(request, callback), 300), []);

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
            setOptions(response);
        });
    }, [ inputValue ]);

    return (
        <Autocomplete
            freeSolo
            autoComplete
            loading={loading}
            options={options}
            inputValue={inputValue}
            getOptionLabel={(option) => option}
            onInputChange={(e, v) => setInputValue(v)}
            value={value}
            onChange={(e, v) => setValue(v)}
            filterOptions={(x) => x}
            renderInput={(params) => <TextField {...fieldProps} {...params} />}
        />
    );
};
export default AutoFill;
