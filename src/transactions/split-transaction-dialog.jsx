import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import api from '../core/api';
import { useState } from 'react';
import { numericProps } from '../util/formatters';

const SplitTransactionDialog = ({ mode, tx, setTx, apiRef, selectionModel, setSelectionModel }) => {
    const round = (val) => Number(Number(val).toFixed(2));
    const [ value1, setValue1 ] = useState((Math.abs(tx.amount) - 0.01).toFixed(2));
    const value2 = round(Math.abs(tx.amount) - Number(value1));
    const splits = [ round(value1) ];

    const { addTransaction, editTransaction, listTransactions, showStatus } = api();

    const postProcess = (newTx) => {
        setTx(undefined);
        if (selectionModel.indexOf(tx.id) > -1) {
            setSelectionModel((old) => [ ...old, newTx.id ]);
        }
    };

    const processSplit = () => {
        const multiplier = tx.amount > 0 ? 1 : -1;
        const newTx = { ...tx };
        newTx.amount = (Math.abs(tx.amount) - splits[0]) * multiplier;
        newTx.id = Math.max(...[ ...apiRef.current.getRowModels().values() ].map(({ id }) => id)) + 1;

        if (mode === 'import') {
            tx.amount = splits[0] * multiplier;
            apiRef.current.updateRows([ newTx ]);
            postProcess(newTx);
        } else {
            const editTx = { ...tx, amount: splits[0] * multiplier };
            apiRef.current.updateRows([ newTx ]);
            editTransaction([ editTx ], () => {
                addTransaction([ newTx ], (newTxResponse) => {
                    newTx.id = newTxResponse[0].id;
                    listTransactions(tx.accountId, (allTx) => {
                        for (const row of apiRef.current.getRowModels().values()) {
                            const newRow = allTx.find(({ id }) => id === row.id);
                            if (row.balance !== newRow.balance) {
                                apiRef.current.updateRows([ newRow ]);
                            }
                        }
                        postProcess(newTx);
                        showStatus('success', 'Transaction split successfully');
                    });
                })
            });
        }
    };

    return (
        <Dialog
            open
            fullWidth
            aria-labelledby="split-transaction-dialog-title"
            aria-describedby="split-transaction-dialog-description"
        >
            <DialogTitle id="split-transaction-dialog-title">
                Split Transaction
            </DialogTitle>
            <DialogContent>
                <Slider
                    value={splits}
                    onChange={(_, value) => setValue1(value[0].toFixed(2))}
                    color="info"
                    min={0.01}
                    max={Math.abs(tx.amount) - 0.01}
                    step={0.01}
                    sx={{ margin: '.6rem 0' }}
                />

                <Stack direction="row" justifyContent="space-between" pb={2}>
                    <TextField
                        required
                        value={value1}
                        onChange={({ target }) => setValue1(target.value)}
                        // @ts-ignore
                        inputProps={numericProps}
                    />
                    <TextField
                        disabled
                        value={value2 === Math.abs(tx.amount) || value2 < 0.01 ? 'INVALID' : value2}
                    />
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                    <Button
                        variant="contained"
                        color="info"
                        onClick={processSplit}
                        disabled={value1 === '' || Number(value1) < 0.01 || Number(value1) >= Math.abs(tx.amount)}
                    >
                        Split Transaction
                    </Button>
                    <Button variant="contained" onClick={() => setTx(undefined)} autoFocus>
                        Cancel
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};
export default SplitTransactionDialog;
