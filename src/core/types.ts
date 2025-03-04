export interface Transaction {
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

export interface Account {
    id: number;
    name?: string;
    issuerId?: number;
    visible?: boolean;
    type?: string;
    multiCurrency?: boolean;
    sortOrder?: number;
    billingMonthOffset?: number;
    billingCycle?: number;
    ordinaryRatio?: string;
    specialRatio?: string;
    medisaveRatio?: string;
}

export interface AccountIssuer {
    id: number;
    name: string;
    canImport: boolean;
}
