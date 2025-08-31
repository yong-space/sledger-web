import { red, green, blue, grey } from '@mui/material/colors';
import api from '../core/api';
import Dropzone from 'react-dropzone';
import styled from 'styled-components';

const ImportZone = styled.div`
    display: flex;
    flex: 1 1 1px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-width: 2px;
    border-style: dashed;
    border-radius: .3rem;
    color: ${props => props.isDragAccept ? green[400] : props.isDragReject ? red[400] : props.isFocused ? blue[400] : grey[400] };
    border-color: ${props => props.isDragAccept ? green[400] : props.isDragReject ? red[400] : props.isFocused ? blue[400] : grey[400] };
`;

const DropZone = ({ selectedAccountId, setLoading, setImportTransactions, setSelectionModel }) => {
    const { uploadImport } = api();

    const onDrop = (acceptedFiles) => {
        const data = new FormData();
        data.append('file', acceptedFiles[0]);
        data.append('accountId', selectedAccountId);
        setLoading(true);

        uploadImport(data, (response) => {
            const processedResponse = response.map((r) => ({
                ...r,
                category: r.subCategory && r.subCategory !== r.category
                    ? `${r.category}: ${r.subCategory}`
                    : r.category,
            }))
            setSelectionModel({ type: 'include', ids: new Set(processedResponse.map(({ id }) => id)) });
            setImportTransactions(processedResponse);
            setLoading(false);
        });
    };

    return (
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
    );
};
export default DropZone;
