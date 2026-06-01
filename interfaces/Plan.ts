export interface Plan {
    billing_cycle: string;
    id: string;
    name: string;
    price: number;
    currency: string;
    features: Record<string, boolean | string | number>;
}