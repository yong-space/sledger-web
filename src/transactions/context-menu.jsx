import CallMergeIcon from '@mui/icons-material/CallMerge';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const ContextMenu = ({ contextMenuPosition, setContextMenuPosition,selectedRowSize, apiRef }) => {
    const handleSplitTransaction = () => {
        setContextMenuPosition(null);
        const tx = apiRef.current.getSelectedRows().values().next().value;
        console.log(tx);
    };

    const handleMergeTransaction = () => {
        setContextMenuPosition(null);
        const tx = Array.from(apiRef.current.getSelectedRows().values());

        const mainTx = tx[0];
        for (let i=1; i<tx.length; i++) {
            const subTx = tx[i];
            mainTx.amount += subTx.amount;
            if (mainTx.remarks && mainTx.remarks !== subTx.remarks) {
                mainTx.remarks += " " + subTx.remarks;
            };
        };
        tx.splice(1)
            .map(({ id }) => ({ id, _action: 'delete' }))
            .forEach((r) => apiRef.current.updateRows([ r ]));
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
            <MenuItem
                onClick={handleSplitTransaction}
                disabled={selectedRowSize !== 1}
            >
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
