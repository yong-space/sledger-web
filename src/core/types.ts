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
    name?: string;
    issuerId?: number;
    visible?: boolean;
    type?: 'Cash' | 'Credit' | 'Retirement';
    multiCurrency?: boolean;
    sortOrder?: number;
    balance?: number;
}

export type CreditAccount = Account & {
    billingMonthOffset?: number;
    billingCycle?: number;
}

export type CpfAccount = Account & {
    ordinaryBalance?: number;
    specialBalance?: number;
    medisaveBalance?: number;
    ordinaryRatio?: string;
    specialRatio?: string;
    medisaveRatio?: string;
}

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
