import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Shield,
  FileText,
  Zap,
  Building,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Receipt,
  HelpCircle,
} from 'lucide-react';
import { billingStore, PRICING_PLANS } from '../../db/billingStore';
import {
  SubscriptionTier,
  BillingInterval,
  PricingPlan,
  StripeInvoice,
  PaymentMethod,
} from '../../types/billing';
import { appStore } from '../../db/store';

export function BillingView() {
  const [subState, setSubState] = useState(billingStore.getState());
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>(subState.interval);
  const [showUpgradeModal, setShowUpgradeModal] = useState<SubscriptionTier | null>(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Billing details edit state
  const [billingDetails, setBillingDetails] = useState(subState.billingDetails);
  const [isEditingBilling, setIsEditingBilling] = useState(false);

  // New card state
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExp, setNewCardExp] = useState('');
  const [newCardBrand, setNewCardBrand] = useState('Visa Corporate');

  useEffect(() => {
    return billingStore.subscribe(() => {
      setSubState(billingStore.getState());
    });
  }, []);

  const currentPlan = PRICING_PLANS[subState.currentPlanId];

  const handleIntervalToggle = (interval: BillingInterval) => {
    setSelectedInterval(interval);
    billingStore.setInterval(interval);
  };

  const handleConfirmPlanChange = (tier: SubscriptionTier) => {
    const result = billingStore.changePlan(tier);
    setShowUpgradeModal(null);
    setNotification(
      `Plan mis à jour avec succès vers ${PRICING_PLANS[tier].name}. Une facture de régularisation pro-rata de ${result.immediateChargeEur} € HT a été émise.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSaveBillingDetails = (e: React.FormEvent) => {
    e.preventDefault();
    billingStore.updateBillingDetails(billingDetails);
    setIsEditingBilling(false);
    setNotification('Coordonnées de facturation et N° Bon de Commande (PO) enregistrés.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber) return;
    const last4 = newCardNumber.slice(-4) || '8842';
    billingStore.addPaymentMethod({
      type: 'CARD',
      brand: newCardBrand,
      last4,
      expMonth: 10,
      expYear: 2029,
      isDefault: false,
    });
    setNewCardNumber('');
    setNewCardExp('');
    setShowAddPaymentModal(false);
    setNotification('Nouveau moyen de paiement B2B enregistré avec succès.');
    setTimeout(() => setNotification(null), 3000);
  };

  const activeTenant = appStore.getActiveTenant();

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Chantier 13 : Monétisation B2B &amp; Facturation Stripe Billing
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {subState.status === 'ACTIVE' ? 'Abonnement Actif' : subState.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Stripe Customer Portal Prêt
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Gestion de votre souscription d'entreprise pour <strong>{activeTenant.name}</strong>, tarification à l'usage, factures conformes à la TVA européenne et moyens de paiement corporate.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPortalModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>Portail Client Stripe</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Interval Selector Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Cycle de Facturation Entreprise</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              -20% en engagement annuel
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Basculez entre le prélèvement mensuel sans engagement ou l'engagement annuel avec remise CAC40.
          </p>
        </div>

        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleIntervalToggle('MONTHLY')}
            className={`px-4 py-1.5 rounded-lg transition ${
              selectedInterval === 'MONTHLY'
                ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => handleIntervalToggle('ANNUAL')}
            className={`px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              selectedInterval === 'ANNUAL'
                ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annuel</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-300 text-[10px]">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* 3 Pricing Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(PRICING_PLANS) as SubscriptionTier[]).map((tierKey) => {
          const plan = PRICING_PLANS[tierKey];
          const isCurrent = subState.currentPlanId === tierKey;
          const displayPrice =
            selectedInterval === 'ANNUAL' ? plan.annualPriceEur : plan.monthlyPriceEur;

          return (
            <div
              key={tierKey}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                isCurrent
                  ? 'bg-slate-900 border-2 border-emerald-500 shadow-xl shadow-emerald-950/20'
                  : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                  Plan Actuel
                </div>
              )}

              {plan.popular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                  Recommandé ETI
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">SLA {plan.slaUptime}</span>
                </div>

                <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.tagline}</p>

                <div className="my-5 pb-5 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{displayPrice} €</span>
                    <span className="text-xs text-slate-400">/ mois HT</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {selectedInterval === 'ANNUAL'
                      ? `Facturé ${displayPrice * 12} € / an`
                      : 'Facturation mensuelle sans engagement'}
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 text-xs">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      {feat.included ? (
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            feat.highlight ? 'text-emerald-400 font-bold' : 'text-slate-400'
                          }`}
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={
                          feat.included
                            ? feat.highlight
                              ? 'text-white font-semibold'
                              : 'text-slate-300'
                            : 'text-slate-600 line-through'
                        }
                      >
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs cursor-default"
                  >
                    Votre Plan Actif
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(tierKey)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Choisir {plan.name}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage-based Metering Panel */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Facturation à l'Usage &amp; Jauges Métriques en Temps Réel
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Consommation mensuelle du cycle en cours ({subState.meters[0]?.periodStart} au {subState.meters[0]?.periodEnd}).
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Prochaine facture estimée</span>
            <span className="text-lg font-bold text-white">
              {currentPlan.monthlyPriceEur} € HT
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subState.meters.map((meter) => {
            const isUnlimited = meter.includedQuota === 99999 || meter.includedQuota === -1;
            const percent = isUnlimited
              ? 5
              : Math.min(100, Math.round((meter.currentValue / meter.includedQuota) * 100));
            const isWarning = percent >= 80;

            return (
              <div
                key={meter.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{meter.name}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {meter.currentValue} / {isUnlimited ? 'Illimité' : meter.includedQuota}{' '}
                    {meter.unit}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {isUnlimited
                      ? 'Inclus en illimité dans votre plan'
                      : `${percent}% du quota mensuel consommé`}
                  </span>
                  {meter.unitPriceEur > 0 && !isUnlimited && (
                    <span>Extra : {meter.unitPriceEur} € / {meter.unit}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Methods & Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Moyens de Paiement B2B</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddPaymentModal(true)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Ajouter un moyen de paiement"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {subState.paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                  pm.isDefault
                    ? 'bg-slate-950 border-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {pm.brand || pm.bankName || 'Carte Bancaire'}
                      </span>
                      {pm.isDefault && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Par défaut
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {pm.ibanMasked || `•••• •••• •••• ${pm.last4}`}{' '}
                      {pm.expMonth && `(Exp ${pm.expMonth}/${pm.expYear})`}
                    </p>
                  </div>
                </div>

                {!pm.isDefault && (
                  <button
                    type="button"
                    onClick={() => billingStore.setDefaultPaymentMethod(pm.id)}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 font-semibold transition"
                  >
                    Activer
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => setShowAddPaymentModal(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une Carte ou Mandat SEPA B2B</span>
            </button>
          </div>
        </div>

        {/* Corporate Billing Details & PO */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Coordonnées de Facturation &amp; PO</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsEditingBilling(!isEditingBilling)}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              {isEditingBilling ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {isEditingBilling ? (
            <form onSubmit={handleSaveBillingDetails} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Raison Sociale</label>
                <input
                  type="text"
                  value={billingDetails.companyName}
                  onChange={(e) =>
                    setBillingDetails({ ...billingDetails, companyName: e.target.value })
                  }
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">N° SIRET</label>
                  <input
                    type="text"
                    value={billingDetails.siret}
                    onChange={(e) =>
                      setBillingDetails({ ...billingDetails, siret: e.target.value })
                    }
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">N° TVA Intracommunautaire</label>
                  <input
                    type="text"
                    value={billingDetails.vatNumber}
                    onChange={(e) =>
                      setBillingDetails({ ...billingDetails, vatNumber: e.target.value })
                    }
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">N° Bon de Commande (Purchase Order)</label>
                <input
                  type="text"
                  value={billingDetails.purchaseOrderRef || ''}
                  onChange={(e) =>
                    setBillingDetails({ ...billingDetails, purchaseOrderRef: e.target.value })
                  }
                  placeholder="PO-2026-RSE-..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Email Facturation</label>
                <input
                  type="email"
                  value={billingDetails.billingEmail}
                  onChange={(e) =>
                    setBillingDetails({ ...billingDetails, billingEmail: e.target.value })
                  }
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition mt-2"
              >
                Enregistrer Coordonnées
              </button>
            </form>
          ) : (
            <div className="space-y-2.5 text-xs text-slate-300">
              <div>
                <span className="text-[11px] text-slate-500 block">Raison Sociale</span>
                <span className="font-semibold text-white">{billingDetails.companyName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 block">SIRET</span>
                  <span className="font-mono text-slate-300">{billingDetails.siret}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">TVA</span>
                  <span className="font-mono text-slate-300">{billingDetails.vatNumber}</span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">N° Bon de Commande Achats (PO)</span>
                <span className="font-mono font-bold text-emerald-400">
                  {billingDetails.purchaseOrderRef || 'Non renseigné'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Email Comptabilité Fournisseurs</span>
                <span className="text-slate-300">{billingDetails.billingEmail}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Adresse de Facturation</span>
                <span className="text-slate-300">{billingDetails.address}, {billingDetails.postalCode} {billingDetails.city}</span>
              </div>
            </div>
          )}
        </div>

        {/* Certified Billing Security & Compliance */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Garanties &amp; Conformité Fiscale</h4>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Facturation Électronique 2026</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Factures certifiées conformes aux exigences de la DGFIP et du format Factur-X / UBL.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Stripe PCI-DSS Level 1</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Les coordonnées bancaires ne transitent jamais en clair sur nos serveurs.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chorus Pro &amp; Marchés Publics</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Paiement sur facture à 30/60 jours fin de mois avec référence de bon d'engagement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices History Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>Historique des Factures &amp; Reçus Fiscaux</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Téléchargez vos factures certifiées acquittées avec mention de la TVA et du numéro de PO.
            </p>
          </div>

          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono">
            {subState.invoices.length} factures disponibles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">N° Facture</th>
                <th className="py-3 px-4">Période</th>
                <th className="py-3 px-4">Date d'Émission</th>
                <th className="py-3 px-4">Montant HT</th>
                <th className="py-3 px-4">TVA (20%)</th>
                <th className="py-3 px-4">Total TTC</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Téléchargement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {subState.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>{inv.invoiceNumber}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {inv.periodStart} au {inv.periodEnd}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{inv.issueDate}</td>
                  <td className="py-3 px-4 font-mono font-semibold">{inv.subtotalEur.toFixed(2)} €</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{inv.taxEur.toFixed(2)} €</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {inv.totalEur.toFixed(2)} €
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {inv.status === 'PAID' ? 'Acquittée' : inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-200 text-xs font-semibold transition border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade / Plan Change Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Confirmation de Changement de Plan
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calcul instantané du pro-rata Stripe Billing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Plan actuel :</span>
                  <span className="font-bold text-white">
                    {PRICING_PLANS[subState.currentPlanId].name} ({PRICING_PLANS[subState.currentPlanId].monthlyPriceEur} € HT)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nouveau plan sélectionné :</span>
                  <span className="font-bold text-emerald-400">
                    {PRICING_PLANS[showUpgradeModal].name} ({PRICING_PLANS[showUpgradeModal].monthlyPriceEur} € HT)
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Crédit pro-rata période restante :</span>
                  <span className="text-emerald-400 font-mono">- 745.00 €</span>
                </div>
                <div className="flex items-center justify-between font-bold text-sm text-white pt-2 border-t border-slate-800">
                  <span>Prélèvement immédiat de régularisation :</span>
                  <span className="text-emerald-400 font-mono">
                    {Math.max(
                      0,
                      PRICING_PLANS[showUpgradeModal].monthlyPriceEur - 745
                    ).toFixed(2)}{' '}
                    € HT
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Les nouveaux quotas de fournisseurs, de certificats et les accès fonctionnalités sont débloqués immédiatement pour l'ensemble des collaborateurs de votre organisation.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleConfirmPlanChange(showUpgradeModal)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
              >
                Confirmer &amp; Activer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Ajouter un Moyen de Paiement Corporate</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPaymentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Type de Moyen de Paiement</label>
                <select
                  value={newCardBrand}
                  onChange={(e) => setNewCardBrand(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="Visa Corporate">Carte Bancaire Visa Corporate</option>
                  <option value="Mastercard Business">Mastercard Business</option>
                  <option value="Amex Corporate">American Express Corporate</option>
                  <option value="SEPA B2B">Prélèvement SEPA B2B (IBAN)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Numéro de Carte ou IBAN
                </label>
                <input
                  type="text"
                  required
                  placeholder="4242 •••• •••• 9812 ou FR76 ••••"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Expiration (MM/AA)</label>
                  <input
                    type="text"
                    placeholder="12/28"
                    value={newCardExp}
                    onChange={(e) => setNewCardExp(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">CVC / Cryptogramme</label>
                  <input
                    type="password"
                    placeholder="•••"
                    maxLength={4}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stripe Customer Portal Modal */}
      {showPortalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Portail Client Stripe Billing (Customer Portal)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPortalModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white">Environnement Stripe Connect Sécurisé</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Le portail Stripe Billing permet à votre direction financière et comptable d'accéder en toute autonomie aux factures acquittées, d'actualiser les mandats SEPA B2B, et d'ajouter des contacts de facturation supplémentaires.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-emerald-400">
                  ID Client Stripe : cus_danone_global_8921
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPortalModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
