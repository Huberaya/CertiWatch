export type SubscriptionTier = 'STARTER' | 'BUSINESS' | 'ENTERPRISE';

export type BillingInterval = 'MONTHLY' | 'ANNUAL';

export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'UNPAID';

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  monthlyPriceEur: number;
  annualPriceEur: number; // 20% discount
  includedSuppliers: number; // -1 for unlimited
  includedCertificates: number; // -1 for unlimited
  extraCertificatePriceEur: number;
  includedSatelliteScans: number;
  extraSatelliteScanPriceEur: number;
  slaUptime: string;
  supportLevel: string;
  features: PlanFeature[];
  popular?: boolean;
}

export interface UsageMeterItem {
  id: string;
  name: string;
  unit: string;
  currentValue: number;
  includedQuota: number;
  unitPriceEur: number;
  periodStart: string;
  periodEnd: string;
}

export interface PaymentMethod {
  id: string;
  type: 'CARD' | 'SEPA_DEBIT' | 'CHORUS_PRO';
  brand?: string; // Visa, Mastercard, Amex
  last4: string;
  expMonth?: number;
  expYear?: number;
  bankName?: string;
  ibanMasked?: string;
  isDefault: boolean;
  addedAt: string;
}

export interface StripeInvoice {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  issueDate: string;
  dueDate: string;
  subtotalEur: number;
  taxPercent: number; // e.g. 20% French TVA
  taxEur: number;
  totalEur: number;
  currency: 'EUR';
  status: 'PAID' | 'OPEN' | 'VOID' | 'UNCOLLECTIBLE';
  pdfUrl: string;
  downloadFilename: string;
  paidAt?: string;
  paymentMethodLast4: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPriceEur: number;
    totalEur: number;
  }[];
}

export interface BillingDetails {
  companyName: string;
  siret: string;
  vatNumber: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  billingEmail: string;
  purchaseOrderRef?: string; // Required for French CAC40 & Enterprise procurement
}

export interface StripeSubscriptionState {
  subscriptionId: string;
  customerId: string;
  currentPlanId: SubscriptionTier;
  interval: BillingInterval;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  meters: UsageMeterItem[];
  paymentMethods: PaymentMethod[];
  invoices: StripeInvoice[];
  billingDetails: BillingDetails;
}
