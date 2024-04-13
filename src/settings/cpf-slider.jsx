import Alert from '@mui/material/Alert';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';

const CpfSlider = ({ cpfRatio, setCpfRatio, cpfAllocationInvalid }) => {
    const getCpfSliderValue = () => [
        parseFloat(cpfRatio.ordinaryRatio),
        (parseFloat(cpfRatio.ordinaryRatio) + parseFloat(cpfRatio.specialRatio))
    ];

    const updateCpfSlider = (_, newValue) => setCpfRatio({
        ordinaryRatio: newValue[0],
        specialRatio: parseFloat((newValue[1] - newValue[0]).toFixed(4)),
        medisaveRatio: parseFloat((1 - newValue[1]).toFixed(4)),
    });

    const updateCpfRatio = ({ target }) => {
        if (isNaN(parseFloat(target.value))) {
            return;
        }
        const newRatio = {
            ...cpfRatio,
            [target.name]: parseFloat(target.value)
        };
        if (target.name === 'ordinaryRatio') {
            newRatio.specialRatio = parseFloat((1 - newRatio.ordinaryRatio - newRatio.medisaveRatio).toFixed(4));
        } else if (target.name === 'specialRatio') {
            newRatio.medisaveRatio = parseFloat((1 - newRatio.ordinaryRatio - newRatio.specialRatio).toFixed(4));
        } else {
            newRatio.specialRatio = parseFloat((1 - newRatio.ordinaryRatio - newRatio.medisaveRatio).toFixed(4));
        }
        setCpfRatio(newRatio);
    };

    const numericProps = { inputMode: 'numeric', pattern: '0.[0-9]{1,4}' };

    return (
        <>
            <Slider
                value={getCpfSliderValue()}
                onChange={updateCpfSlider}
                track={false}
                color="secondary"
                disableSwap
                min={0}
                max={1}
                step={0.0001}
            />
            <TextField
                required
                name="ordinaryRatio"
                label="Ordinary Ratio"
                value={cpfRatio.ordinaryRatio}
                onChange={updateCpfRatio}
                inputProps={numericProps}
            />
            <TextField
                required
                name="specialRatio"
                label="Special Ratio"
                value={cpfRatio.specialRatio}
                onChange={updateCpfRatio}
                inputProps={numericProps}
            />
            <TextField
                required
                name="medisaveRatio"
                label="Medisave Ratio"
                value={cpfRatio.medisaveRatio}
                onChange={updateCpfRatio}
                inputProps={numericProps}
            />
            { cpfAllocationInvalid() && (
                <Alert severity="error" variant="outlined">
                    Account allocation ratio is invalid
                </Alert>
            )}
        </>
    );
};
export default CpfSlider;
