export interface Transaction {
    id: number;
    amount: number;
}
export interface Account {
    id: number;
    name: string;
    issuerId: number;
    visible: boolean;
    type: string;
    multiCurrency: boolean;
}