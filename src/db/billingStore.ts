import {
  PricingPlan,
  StripeSubscriptionState,
  SubscriptionTier,
  BillingInterval,
  PaymentMethod,
  StripeInvoice,
} from '../types/billing';
import { appStore } from './store';

export const PRICING_PLANS: Record<SubscriptionTier, PricingPlan> = {
  STARTER: {
    id: 'STARTER',
    name: 'Starter Compliance',
    tagline: 'Pour PME & ETI débutant la digitalisation de leurs certificats',
    monthlyPriceEur: 490,
    annualPriceEur: 390, // -20%
    includedSuppliers: 100,
    includedCertificates: 300,
    extraCertificatePriceEur: 2.8,
    includedSatelliteScans: 5,
    extraSatelliteScanPriceEur: 20,
    slaUptime: '99.5%',
    supportLevel: 'Email sous 24h',
    features: [
      { text: 'Jusqu’à 100 fournisseurs suivis', included: true },
      { text: '300 certificats durables surveillés', included: true },
      { text: 'OCR intelligent & détection de fraudes', included: true },
      { text: 'Vérification automatique GOTS, FSC, Ecocert', included: true },
      { text: 'Alertes d’expiration par email', included: true },
      { text: 'Connecteurs ERP (SAP, Coupa)', included: false },
      { text: 'Analyses satellitaires EUDR radar Sentinel-2', included: false },
      { text: 'Fédération SSO SAML 2.0 & SCIM', included: false },
      { text: 'Stockage Cloud Vault AES-256 dédié', included: false },
    ],
  },
  BUSINESS: {
    id: 'BUSINESS',
    name: 'Business Pro',
    tagline: 'Pour grandes entreprises avec supply chain internationale & audits fréquents',
    monthlyPriceEur: 1490,
    annualPriceEur: 1190, // -20%
    includedSuppliers: 500,
    includedCertificates: 2000,
    extraCertificatePriceEur: 2.2,
    includedSatelliteScans: 50,
    extraSatelliteScanPriceEur: 15,
    slaUptime: '99.9%',
    supportLevel: 'Support prioritaire & Téléphone (4h)',
    popular: true,
    features: [
      { text: 'Jusqu’à 500 fournisseurs suivis', included: true, highlight: true },
      { text: '2 000 certificats durables surveillés', included: true, highlight: true },
      { text: 'OCR certifié & score d’intégrité cryptographique', included: true },
      { text: 'Connecteurs ERP bidirectionnels (SAP S/4HANA, Coupa)', included: true, highlight: true },
      { text: '50 analyses satellitaires EUDR / mois', included: true },
      { text: 'PWA Mode Déconnecté pour auditeurs terrain', included: true },
      { text: 'Piste d’audit immuable SHA-256', included: true },
      { text: 'Fédération SSO SAML 2.0 (Okta, Azure AD)', included: true },
      { text: 'Déploiement sur serveur cloud dédié', included: false },
    ],
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise Global',
    tagline: 'Pour groupes mondiaux, CAC 40 & exigences de souveraineté maximale',
    monthlyPriceEur: 4900,
    annualPriceEur: 3900, // -20%
    includedSuppliers: -1, // Illimité
    includedCertificates: -1, // Illimité
    extraCertificatePriceEur: 1.5,
    includedSatelliteScans: 250,
    extraSatelliteScanPriceEur: 10,
    slaUptime: '99.95% garanti par contrat',
    supportLevel: 'Customer Success Manager dédié & SLA 1h',
    features: [
      { text: 'Fournisseurs & Certificats illimités', included: true, highlight: true },
      { text: 'Scans satellitaires haute résolution illimités', included: true, highlight: true },
      { text: 'Synchronisation SCIM 2.0 & SSO multi-filiales', included: true, highlight: true },
      { text: 'Persistance PostgreSQL Neon Cloud dédiée', included: true },
      { text: 'Isolation multi-tenant étanche certifiée SOC 2 Type II', included: true },
      { text: 'Garantie de non-régression réglementaire EUDR/CSRD', included: true },
      { text: 'Clés de chiffrement client (BYOK KMS)', included: true },
      { text: 'Accompagnement CAC / OTI pour audits RSE', included: true },
    ],
  },
};

const initialSubscriptionState: StripeSubscriptionState = {
  subscriptionId: 'sub_live_stripe_992014810293',
  customerId: 'cus_danone_global_8921',
  currentPlanId: 'BUSINESS',
  interval: 'MONTHLY',
  status: 'ACTIVE',
  currentPeriodStart: '2026-09-01T00:00:00Z',
  currentPeriodEnd: '2026-10-01T00:00:00Z',
  cancelAtPeriodEnd: false,
  meters: [
    {
      id: 'meter_certs',
      name: 'Certificats surveillés en continu',
      unit: 'certificats',
      currentValue: 12,
      includedQuota: 2000,
      unitPriceEur: 2.2,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    },
    {
      id: 'meter_suppliers',
      name: 'Fournisseurs actifs au répertoire',
      unit: 'fournisseurs',
      currentValue: 6,
      includedQuota: 500,
      unitPriceEur: 0,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    },
    {
      id: 'meter_eudr_scans',
      name: 'Analyses satellitaires Sentinel-2 EUDR',
      unit: 'vérifications radar',
      currentValue: 8,
      includedQuota: 50,
      unitPriceEur: 15,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    },
    {
      id: 'meter_webhooks',
      name: 'Événements & Webhooks ERP transmis',
      unit: 'requêtes',
      currentValue: 1420,
      includedQuota: 10000,
      unitPriceEur: 0.05,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    },
  ],
  paymentMethods: [
    {
      id: 'pm_corp_card_01',
      type: 'CARD',
      brand: 'Visa Corporate',
      last4: '4242',
      expMonth: 12,
      expYear: 2028,
      isDefault: true,
      addedAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 'pm_sepa_b2b_02',
      type: 'SEPA_DEBIT',
      bankName: 'BNP Paribas Corporate',
      ibanMasked: 'FR76 •••• •••• •••• 8912',
      last4: '8912',
      isDefault: false,
      addedAt: '2025-06-20T14:30:00Z',
    },
  ],
  invoices: [
    {
      id: 'inv_2026_09',
      invoiceNumber: 'CW-INV-2026-009',
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
      issueDate: '2026-09-01',
      dueDate: '2026-09-30',
      subtotalEur: 1490.0,
      taxPercent: 20,
      taxEur: 298.0,
      totalEur: 1788.0,
      currency: 'EUR',
      status: 'PAID',
      paidAt: '2026-09-01T08:15:00Z',
      pdfUrl: '/api/billing/invoices/inv_2026_09/download',
      downloadFilename: 'Facture_CertiWatch_CW-INV-2026-009.pdf',
      paymentMethodLast4: '4242',
      lineItems: [
        {
          description: 'Abonnement CertiWatch Business Pro (Mensuel)',
          quantity: 1,
          unitPriceEur: 1490.0,
          totalEur: 1490.0,
        },
      ],
    },
    {
      id: 'inv_2026_08',
      invoiceNumber: 'CW-INV-2026-008',
      periodStart: '2026-08-01',
      periodEnd: '2026-08-31',
      issueDate: '2026-08-01',
      dueDate: '2026-08-31',
      subtotalEur: 1535.0,
      taxPercent: 20,
      taxEur: 307.0,
      totalEur: 1842.0,
      currency: 'EUR',
      status: 'PAID',
      paidAt: '2026-08-01T09:00:00Z',
      pdfUrl: '/api/billing/invoices/inv_2026_08/download',
      downloadFilename: 'Facture_CertiWatch_CW-INV-2026-008.pdf',
      paymentMethodLast4: '4242',
      lineItems: [
        {
          description: 'Abonnement CertiWatch Business Pro (Mensuel)',
          quantity: 1,
          unitPriceEur: 1490.0,
          totalEur: 1490.0,
        },
        {
          description: 'Dépassement Métrique EUDR : 3 vérifications satellitaires radar supplémentaires',
          quantity: 3,
          unitPriceEur: 15.0,
          totalEur: 45.0,
        },
      ],
    },
    {
      id: 'inv_2026_07',
      invoiceNumber: 'CW-INV-2026-007',
      periodStart: '2026-07-01',
      periodEnd: '2026-07-31',
      issueDate: '2026-07-01',
      dueDate: '2026-07-31',
      subtotalEur: 1490.0,
      taxPercent: 20,
      taxEur: 298.0,
      totalEur: 1788.0,
      currency: 'EUR',
      status: 'PAID',
      paidAt: '2026-07-01T08:30:00Z',
      pdfUrl: '/api/billing/invoices/inv_2026_07/download',
      downloadFilename: 'Facture_CertiWatch_CW-INV-2026-007.pdf',
      paymentMethodLast4: '4242',
      lineItems: [
        {
          description: 'Abonnement CertiWatch Business Pro (Mensuel)',
          quantity: 1,
          unitPriceEur: 1490.0,
          totalEur: 1490.0,
        },
      ],
    },
  ],
  billingDetails: {
    companyName: 'Danone Global Sourcing SA',
    siret: '839 201 948 00021',
    vatNumber: 'FR 83 9201948',
    address: '17 Boulevard Haussmann',
    postalCode: '75009',
    city: 'Paris',
    country: 'France',
    billingEmail: 'facturation-fournisseurs@danone.com',
    purchaseOrderRef: 'PO-DAN-2026-RSE-449',
  },
};

class BillingStore {
  private state: StripeSubscriptionState = initialSubscriptionState;
  private listeners: Set<() => void> = new Set();

  public subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getState(): StripeSubscriptionState {
    // Dynamic refresh of certs and suppliers count from appStore
    const certsCount = appStore.getTenantCertificates().length;
    const suppliersCount = appStore.getTenantSuppliers().length;

    const updatedMeters = this.state.meters.map((m) => {
      if (m.id === 'meter_certs') return { ...m, currentValue: certsCount };
      if (m.id === 'meter_suppliers') return { ...m, currentValue: suppliersCount };
      return m;
    });

    return {
      ...this.state,
      meters: updatedMeters,
    };
  }

  public updateBillingDetails(details: Partial<StripeSubscriptionState['billingDetails']>) {
    this.state.billingDetails = {
      ...this.state.billingDetails,
      ...details,
    };
    this.notify();
  }

  public setInterval(interval: BillingInterval) {
    this.state.interval = interval;
    this.notify();
  }

  public changePlan(newPlanId: SubscriptionTier): {
    oldPlan: SubscriptionTier;
    newPlan: SubscriptionTier;
    proRataCreditEur: number;
    immediateChargeEur: number;
  } {
    const oldPlan = this.state.currentPlanId;
    const currentPlanMeta = PRICING_PLANS[oldPlan];
    const newPlanMeta = PRICING_PLANS[newPlanId];

    const currentPrice =
      this.state.interval === 'ANNUAL' ? currentPlanMeta.annualPriceEur : currentPlanMeta.monthlyPriceEur;
    const nextPrice =
      this.state.interval === 'ANNUAL' ? newPlanMeta.annualPriceEur : newPlanMeta.monthlyPriceEur;

    // Simulate 15 days pro-rata calculation
    const proRataCreditEur = Math.round((currentPrice / 2) * 100) / 100;
    const immediateChargeEur = Math.max(0, Math.round((nextPrice - proRataCreditEur) * 100) / 100);

    this.state.currentPlanId = newPlanId;

    // Synchronize tenant tier in appStore
    const activeTenant = appStore.getActiveTenant();
    if (activeTenant) {
      activeTenant.tier = newPlanId;
      activeTenant.maxCertificatesAllowed =
        newPlanMeta.includedCertificates === -1 ? 99999 : newPlanMeta.includedCertificates;
      activeTenant.maxSuppliersAllowed =
        newPlanMeta.includedSuppliers === -1 ? 99999 : newPlanMeta.includedSuppliers;
    }

    // Update meter limits
    this.state.meters = this.state.meters.map((m) => {
      if (m.id === 'meter_certs') {
        return {
          ...m,
          includedQuota: newPlanMeta.includedCertificates === -1 ? 99999 : newPlanMeta.includedCertificates,
          unitPriceEur: newPlanMeta.extraCertificatePriceEur,
        };
      }
      if (m.id === 'meter_suppliers') {
        return {
          ...m,
          includedQuota: newPlanMeta.includedSuppliers === -1 ? 99999 : newPlanMeta.includedSuppliers,
        };
      }
      if (m.id === 'meter_eudr_scans') {
        return {
          ...m,
          includedQuota: newPlanMeta.includedSatelliteScans,
          unitPriceEur: newPlanMeta.extraSatelliteScanPriceEur,
        };
      }
      return m;
    });

    // Generate new pro-rata invoice
    const newInvoice: StripeInvoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `CW-INV-2026-PRO-${Math.floor(Math.random() * 900 + 100)}`,
      periodStart: new Date().toISOString().split('T')[0],
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      subtotalEur: immediateChargeEur,
      taxPercent: 20,
      taxEur: Math.round(immediateChargeEur * 0.2 * 100) / 100,
      totalEur: Math.round(immediateChargeEur * 1.2 * 100) / 100,
      currency: 'EUR',
      status: 'PAID',
      paidAt: new Date().toISOString(),
      pdfUrl: `/api/billing/invoices/inv_prorata/download`,
      downloadFilename: `Facture_CertiWatch_Upgrade_${newPlanId}.pdf`,
      paymentMethodLast4: '4242',
      lineItems: [
        {
          description: `Mise à niveau vers le Plan ${newPlanMeta.name} (Régularisation Pro-Rata)`,
          quantity: 1,
          unitPriceEur: immediateChargeEur,
          totalEur: immediateChargeEur,
        },
      ],
    };

    this.state.invoices = [newInvoice, ...this.state.invoices];
    this.notify();

    return {
      oldPlan,
      newPlan: newPlanId,
      proRataCreditEur,
      immediateChargeEur,
    };
  }

  public addPaymentMethod(method: Omit<PaymentMethod, 'id' | 'addedAt'>) {
    const newPm: PaymentMethod = {
      ...method,
      id: `pm_${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    if (newPm.isDefault) {
      this.state.paymentMethods.forEach((p) => (p.isDefault = false));
    }
    this.state.paymentMethods.push(newPm);
    this.notify();
  }

  public setDefaultPaymentMethod(id: string) {
    this.state.paymentMethods.forEach((p) => {
      p.isDefault = p.id === id;
    });
    this.notify();
  }

  public deletePaymentMethod(id: string) {
    this.state.paymentMethods = this.state.paymentMethods.filter((p) => p.id !== id);
    if (!this.state.paymentMethods.some((p) => p.isDefault) && this.state.paymentMethods.length > 0) {
      this.state.paymentMethods[0].isDefault = true;
    }
    this.notify();
  }
}

export const billingStore = new BillingStore();
