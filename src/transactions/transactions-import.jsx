import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dropzone from 'react-dropzone'
import styled from 'styled-components';
import { red, green, blue, grey } from '@mui/material/colors';

const ImportZone = styled.div`
    flex: 1 1 1px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-width: 2px;
    border-style: dashed;
    border-radius: .3rem;
    color: ${props => props.isDragAccept ? green[400] : props.isDragReject ? red[400] : props.isFocused ? blue[400] : grey[400] };
    border-color: ${props => props.isDragAccept ? green[400] : props.isDragReject ? red[400] : props.isFocused ? blue[400] : grey[400] };
`;

const TransactionsImport = ({ setImportMode }) => {
    const onDrop = (acceptedFiles) => {
        const reader = new FileReader();
        reader.onabort = () => console.error('file reading was aborted');
        reader.onerror = () => console.error('file reading has failed');
        reader.onload = () => {
          const binaryStr = reader.result;
          console.log(binaryStr)
        };
        // reader.readAsArrayBuffer(acceptedFiles[0]);
        reader.readAsText(acceptedFiles[0]);
    };

    return (
        <Stack spacing={1} sx={{ flex: '1 1 1px' }}>
            <Dropzone
                accept={{
                    'application/vnd.ms-excel': [ '.csv' ],
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [ '.xlsx' ],
                }}
                multiple={false}
                onDropAccepted={onDrop}
            >
                {({ getRootProps, getInputProps, isFocused, isDragAccept, isDragReject }) => (
                    <ImportZone {...getRootProps()} {...{ isFocused, isDragAccept, isDragReject }}>
                        <input {...getInputProps()} />
                        Click to select exported file or drag file here
                    </ImportZone>
                )}
            </Dropzone>

            <Stack direction="row" spacing={2}>
                <Button
                    color="info"
                    variant="contained"
                    onClick={() => setImportMode(false)}
                >
                    Import Transactions
                </Button>
                <Button
                    variant="contained"
                    onClick={() => setImportMode(false)}
                >
                    Cancel
                </Button>
            </Stack>
        </Stack>
    );
};
export default TransactionsImport;
