export type Transaction = {
    id?: number;
    amount?: number;
    date?: string;
    accountId?: number;
    category?: string;
    subCategory?: string;
    remarks?: string;
    originalAmount?: number;
    code?: string;
    billingMonth?: string;
    forMonth?: string;
}

export type Account = {
    id: number;
    name: string;
    issuerId: number;
    visible: boolean;
    type: 'Cash' | 'Credit' | 'Retirement';
    sortOrder: number;
    balance: number;
}

export type CashAccount = Account & {
    type: 'Cash';
    multiCurrency: boolean;
}

export type CreditAccount = Account & {
    type: 'Credit';
    billingMonthOffset: number;
    billingCycle: number;
    multiCurrency: boolean;
}

export const isMultiCurrency = (account: AnyAccount): boolean => {
    if (account.type != 'Cash' && account.type != 'Credit') {
        return false;
    }
    return account.multiCurrency;
};

export type CpfAccount = Account & {
    type: 'Retirement';
    ordinaryBalance: number;
    specialBalance: number;
    medisaveBalance: number;
    ordinaryRatio: string;
    specialRatio: string;
    medisaveRatio: string;
}

export type AnyAccount = CashAccount | CreditAccount | CpfAccount;

export type AccountIssuer = {
    id: number;
    name: string;
    canImport: boolean;
    colour?: string;
}

export type Template = {
    id: number;
    ownerId: number;
    reference: string;
    remarks: string;
    category: string;
    subCategory: string;
}
