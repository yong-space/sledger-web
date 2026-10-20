import { Transaction } from '../core/types';

// The free DataGrid only accepts one row per apiRef.updateRows() call, so grid changes go
// through the transactions atom instead: build the next row list here and set it once.

// Grid rows show "Category: Sub" when the sub-category adds information.
// Safe to apply to rows that already carry the combined label.
export const withCategoryLabel = <T extends Transaction>(tx: T): T => {
    const category = tx.category && tx.category.indexOf(':') === -1 && tx.subCategory && tx.subCategory !== tx.category
        ? `${tx.category}: ${tx.subCategory}`
        : tx.category;
    return { ...tx, category };
};

// Replace rows already in the grid with their server version; rows the server did not return are kept
export const refreshRows = <T extends Transaction>(rows: T[], serverRows: T[]): T[] => {
    const serverById = new Map(serverRows.map((row) => [ row.id, row ]));
    return rows.map((row) => serverById.has(row.id) ? withCategoryLabel(serverById.get(row.id)) : row);
};

// refreshRows, plus append server rows that are not in the grid yet
export const upsertRows = <T extends Transaction>(rows: T[], serverRows: T[]): T[] => {
    const existingIds = new Set(rows.map(({ id }) => id));
    return [
        ...refreshRows(rows, serverRows),
        ...serverRows.filter(({ id }) => !existingIds.has(id)).map(withCategoryLabel),
    ];
};
