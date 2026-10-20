import CallMergeIcon from '@mui/icons-material/CallMerge';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import api from '../core/api';
import { gridRowSelectionCountSelector } from '@mui/x-data-grid';
import { refreshRows } from './transaction-rows';

const ContextMenu = ({
    mode, contextRow, contextMenuPosition, setContextMenuPosition, setTxToSplit, apiRef, setTransactions, setSelectionModel,
}) => {
    const { editTransaction, deleteTransaction, listTransactions, showStatus } = api();

    const selectedRowSize = gridRowSelectionCountSelector(apiRef);

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
            setTransactions((t) => t.filter(({id}) => !idsToDelete.includes(id)));
            setSelectionModel({ type: 'include', ids: new Set([ mainTx.id ]) });
        } else {
            editTransaction([ mainTx ], () => {
                deleteTransaction(idsToDelete, () => {
                    listTransactions(mainTx.accountId, (allTx) => {
                        setTransactions((rows) => refreshRows(rows.filter(({ id }) => !idsToDelete.includes(id)), allTx));
                        showStatus('success', 'Transactions merged');
                    });
                });
            });
        }
    };

    // Deliberately not a modal Menu: a modal would aria-hide #root while the
    // grid re-focuses the right-clicked cell, triggering Chrome's "Blocked
    // aria-hidden" warning. A Popper leaves grid focus alone entirely.
    return (
        <Popper
            open={contextMenuPosition !== null}
            anchorEl={contextMenuPosition && {
                getBoundingClientRect: () => new DOMRect(contextMenuPosition.left, contextMenuPosition.top, 0, 0),
            }}
            placement="bottom-start"
            sx={{ zIndex: 'modal' }}
        >
            <ClickAwayListener mouseEvent="onMouseDown" onClickAway={() => setContextMenuPosition(null)}>
                <Paper elevation={8}>
                    <MenuList
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenuPosition(null);
                        }}
                        onKeyDown={(e) => e.key === 'Escape' && setContextMenuPosition(null)}
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
                    </MenuList>
                </Paper>
            </ClickAwayListener>
        </Popper>
    );
};
export default ContextMenu;
