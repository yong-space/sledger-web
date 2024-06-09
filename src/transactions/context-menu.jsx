import CallMergeIcon from '@mui/icons-material/CallMerge';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import api from '../core/api';

const ContextMenu = ({
    mode, contextRow, contextMenuPosition, setContextMenuPosition,selectedRowSize, setTxToSplit, apiRef
}) => {
    const { editTransaction, deleteTransaction, listTransactions, showStatus } = api();

    const handleSplitTransaction = () => {
        setContextMenuPosition(null);
        setTxToSplit(contextRow);
    };

    const handleMergeTransaction = () => {
        setContextMenuPosition(null);
        const tx = Array.from(apiRef.current.getSelectedRows().values());
        const mainTx = (mode === 'import') ? tx[0] : { ...tx[0] };
        for (let i=1; i<tx.length; i++) {
            const subTx = tx[i];
            mainTx.amount += subTx.amount;
            if (mainTx.remarks && mainTx.remarks !== subTx.remarks) {
                mainTx.remarks += " " + subTx.remarks;
            }
        };
        const idsToDelete = tx.slice(1).map(({ id }) => id);
        if (mode === 'import') {
            idsToDelete.map((id) => ({ id, _action: 'delete' }))
                .forEach((r) => apiRef.current.updateRows([ r ]));
        } else {
            editTransaction([ mainTx ], () => {
                deleteTransaction(idsToDelete, () => {
                    idsToDelete.map((id) => ({ id, _action: 'delete' }))
                        .forEach((r) => apiRef.current.updateRows([ r ]));

                    listTransactions(mainTx.accountId, (allTx) => {
                        for (const row of apiRef.current.getRowModels().values()) {
                            const newRow = allTx.find(({ id }) => id === row.id);
                            if (row.balance !== newRow.balance) {
                                apiRef.current.updateRows([ newRow ]);
                            }
                        }
                        showStatus('success', 'Transactions merged');
                    });
                });
            });
        }
    };

    return (
        <Menu
            open={contextMenuPosition !== null}
            onClose={() => setContextMenuPosition(null)}
            anchorReference="anchorPosition"
            anchorPosition={ contextMenuPosition || undefined }
            slotProps={{
                root: {
                    onContextMenu: (e) => {
                        e.preventDefault();
                        setContextMenuPosition(null);
                    },
                },
            }}
        >
            <MenuItem onClick={handleSplitTransaction}>
                <CallSplitIcon sx={{ marginRight: '.7rem' }} />
                Split Transaction
            </MenuItem>
            <MenuItem
                onClick={handleMergeTransaction}
                disabled={selectedRowSize < 2 || selectedRowSize > 5}
            >
                <CallMergeIcon sx={{ marginRight: '.7rem' }} />
                Merge Transactions
            </MenuItem>
        </Menu>
    );
};
export default ContextMenu;
