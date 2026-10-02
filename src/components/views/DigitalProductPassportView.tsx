import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Leaf,
  Layers,
  Factory,
  MapPin,
  CheckCircle2,
  Download,
  Share2,
  Search,
  Sparkles,
  Info,
  Calendar,
  Package,
  Award,
  BarChart2,
  FileCode,
} from 'lucide-react';
import { dppStore } from '../../db/dppStore';
import { DigitalProductPassport, DppSummaryStatistics } from '../../types/dpp';
import { appStore } from '../../db/store';

export function DigitalProductPassportView() {
  const [summary, setSummary] = useState<DppSummaryStatistics>(dppStore.getSummary());
  const [passports, setPassports] = useState<DigitalProductPassport[]>(dppStore.getPassports());
  const [selectedPassport, setSelectedPassport] = useState<DigitalProductPassport>(dppStore.getPassports()[0]);
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'PHONE_PREVIEW' | 'GS1_STUDIO'>('CATALOG');
  const [searchFilter, setSearchFilter] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    return dppStore.subscribe(() => {
      setSummary(dppStore.getSummary());
      setPassports(dppStore.getPassports());
    });
  }, []);

  const activeTenant = appStore.getActiveTenant();

  const filteredPassports = passports.filter(
    (p) =>
      p.productName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.gtin.includes(searchFilter) ||
      p.batchLotNumber.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setNotification('Lien GS1 Digital Link copié dans le presse-papier !');
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Hero Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/50 border border-emerald-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <QrCode className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Chantier 16 : Passeport Digital des Produits (DPP &amp; Règlement ESPR)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Règlement UE 2024/1781
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                Norme GS1 Digital Link
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Génération unitaire des Passeports Digitaux pour <strong>{activeTenant.name}</strong>, traçabilité unitaire de la matière première au consommateur, empreinte carbone ACV et scellement W3C Verifiable Credentials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`/api/dpp/public/${selectedPassport.gtin}/${selectedPassport.batchLotNumber}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ouvrir Vue Publique (Web)</span>
          </a>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Passeports DPP Actifs</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {summary.totalActivePassports}
            </span>
            <span className="text-xs text-slate-400">références ({summary.coveredGtinCount} GTINs)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Tous les lots de production sont scellés cryptographiquement.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Matières Recyclées &bull; Circulaire</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-cyan-400">
              {summary.averageRecycledContentPercent} %
            </span>
            <span className="text-xs text-slate-400">moyenne portefeuille</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Jusqu’à 100% de matière circulaire sur les packagings rPET et cartons FSC.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Traçabilité EUDR 100% Vérifiée</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">
              {summary.eudrCertifiedPassportsCount} / {summary.totalActivePassports}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Parcelles géolocalisées post-31 déc. 2020 zéro déforestation.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Scans Consommateurs &bull; GS1</span>
            <QrCode className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {summary.qrScansThisMonth.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-slate-400">scans / mois</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Transparence totale en rayon dans 12 pays européens.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('CATALOG')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'CATALOG'
              ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catalogue des Passeports ({passports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PHONE_PREVIEW')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'PHONE_PREVIEW'
              ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Simulateur Consommateur (Smartphone)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('GS1_STUDIO')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'GS1_STUDIO'
              ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Studio d'Étiquetage &amp; Données GS1 / W3C</span>
        </button>
      </div>

      {/* TAB 1: DPP Catalog */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Passeports Produits Déployés &bull; Lots de Production Sous Contrôle</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Agrégation automatique des certificats amont, de l'origine agricole et de l'empreinte carbone unitaire.
                </p>
              </div>

              <div className="w-full sm:w-72 relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, GTIN ou Lot..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPassports.map((passport) => (
                <div
                  key={passport.id}
                  onClick={() => {
                    setSelectedPassport(passport);
                    setActiveTab('PHONE_PREVIEW');
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:border-emerald-500/50 space-y-3 ${
                    selectedPassport.id === passport.id
                      ? 'bg-slate-950 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                      GTIN: {passport.gtin}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 font-mono">
                      {passport.batchLotNumber}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm leading-snug">{passport.productName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{passport.brand}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Empreinte Carbone</span>
                      <span className="font-bold text-emerald-400">
                        {passport.circularityMetrics.unitCarbonFootprintKgCo2e} kgCO₂e
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Matière Recyclée</span>
                      <span className="font-bold text-cyan-400">
                        {passport.circularityMetrics.recycledContentPercent} %
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Factory className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{passport.manufacturingFacility.factoryName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{passport.components.length} composants certifiés traçables</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span>Simuler Scan QR</span>
                      <span>&rarr;</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">W3C VC Scellé</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Smartphone Consumer Simulator */}
      {activeTab === 'PHONE_PREVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel: Selector & Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Sélectionnez un Produit à Simuler</span>
              </h3>

              <div className="space-y-2">
                {passports.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPassport(p)}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      selectedPassport.id === p.id
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="truncate">{p.productName}</span>
                      <span className="font-mono text-[10px] text-emerald-400">{p.batchLotNumber}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white block">Résolution GS1 Digital Link :</span>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 break-all">
                  {selectedPassport.gs1DigitalLinkUrl}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(selectedPassport.gs1DigitalLinkUrl)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Copier le Lien
                  </button>
                  <a
                    href={`/api/dpp/public/${selectedPassport.gtin}/${selectedPassport.batchLotNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold"
                  >
                    Plein Écran
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Realistic Mobile Mockup */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-sm rounded-[36px] bg-slate-950 border-4 border-slate-800 shadow-2xl p-4 overflow-hidden relative">
              {/* Notch */}
              <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

              {/* Mobile Screen Content */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-4 text-slate-200 text-xs max-h-[580px] overflow-y-auto">
                <div className="space-y-1 pb-3 border-b border-slate-800">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono uppercase">
                    Passeport Certifié ESPR 2024
                  </span>
                  <h4 className="font-bold text-white text-sm leading-tight mt-1">
                    {selectedPassport.productName}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    GTIN: {selectedPassport.gtin} &bull; Lot: {selectedPassport.batchLotNumber}
                  </p>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Empreinte Carbone</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {selectedPassport.circularityMetrics.unitCarbonFootprintKgCo2e} kgCO₂e
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Matière Recyclée</span>
                    <span className="text-cyan-400 font-bold text-sm">
                      {selectedPassport.circularityMetrics.recycledContentPercent} %
                    </span>
                  </div>
                </div>

                {/* Traceability BOM */}
                <div className="space-y-2">
                  <span className="font-bold text-white block text-[11px]">
                    Origine des Composants &bull; Chaîne de Traçabilité
                  </span>
                  {selectedPassport.components.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between font-bold text-white text-[11px]">
                        <span>{c.name}</span>
                        <span className="text-emerald-400 font-mono">{c.percentageWeight}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Fournisseur : {c.supplierName} ({c.countryOfOrigin})
                      </p>
                      <span className="inline-block text-[10px] font-semibold text-emerald-400">
                        ✓ {c.certifiedStandard}
                      </span>
                      {c.originPlotGps && (
                        <p className="text-[9px] text-slate-500 font-mono truncate">{c.originPlotGps}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Manufacturing Facility */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">Usine d'Assemblage &bull; Responsable</span>
                  <span className="font-bold text-white text-[11px] block">
                    {selectedPassport.manufacturingFacility.factoryName}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {selectedPassport.manufacturingFacility.city}, {selectedPassport.manufacturingFacility.country}
                  </p>
                </div>

                {/* Cryptographic W3C Seal */}
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1">
                  <span className="font-bold text-emerald-300 text-[10px] block">
                    Sceau Cryptographique W3C Verifiable Credentials
                  </span>
                  <p className="font-mono text-[9px] text-emerald-400/80 break-all">
                    {selectedPassport.verifiableCredentialHash}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Industrial Packaging & GS1 Studio */}
      {activeTab === 'GS1_STUDIO' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <span>Studio d'Intégration Industrielle &bull; Norme GS1 Digital Link &amp; W3C</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Format d'échange universel pour les imprimeurs de packaging, les douanes européennes et les flux ERP.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QR Code visualizer */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-xl">
                  {/* High visual quality simulated QR Code */}
                  <div className="w-48 h-48 bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-between text-white">
                    <div className="flex justify-between w-full">
                      <div className="w-12 h-12 border-4 border-emerald-400 rounded-lg p-1">
                        <div className="w-full h-full bg-emerald-400 rounded-sm" />
                      </div>
                      <div className="w-12 h-12 border-4 border-emerald-400 rounded-lg p-1">
                        <div className="w-full h-full bg-emerald-400 rounded-sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-400 font-bold">
                      <QrCode className="w-6 h-6 text-white" />
                      <span>GS1 DIGITAL LINK</span>
                    </div>
                    <div className="flex justify-between w-full">
                      <div className="w-12 h-12 border-4 border-emerald-400 rounded-lg p-1">
                        <div className="w-full h-full bg-emerald-400 rounded-sm" />
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono text-right flex items-end">
                        ESPR 2024
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-white text-sm">{selectedPassport.productName}</span>
                  <p className="text-xs text-slate-400 font-mono">
                    URL résolue : {selectedPassport.gs1DigitalLinkUrl}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNotification('QR Code GS1 Digital Link généré au format vectoriel SVG.');
                    setTimeout(() => setNotification(null), 3500);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger QR Code (SVG Haute Définition)</span>
                </button>
              </div>

              {/* JSON-LD Schema.org payload */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-sm block">
                  Format Normalisé JSON-LD (Schema.org / GS1 Standard)
                </span>
                <pre className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-80">
{`{
  "@context": [
    "https://schema.org",
    "https://gs1.org/voc/"
  ],
  "@type": "Product",
  "gtin": "${selectedPassport.gtin}",
  "name": "${selectedPassport.productName}",
  "brand": "${selectedPassport.brand}",
  "batchNumber": "${selectedPassport.batchLotNumber}",
  "esprCompliance": {
    "standard": "EU Regulation 2024/1781",
    "unitCarbonFootprint": "${selectedPassport.circularityMetrics.unitCarbonFootprintKgCo2e} kgCO2e",
    "recycledContent": "${selectedPassport.circularityMetrics.recycledContentPercent}%",
    "recyclabilityClass": "${selectedPassport.circularityMetrics.recyclabilityClass}",
    "eudrVerified": true
  },
  "verifiableCredential": {
    "proof": "${selectedPassport.verifiableCredentialHash}",
    "issuer": "did:certiwatch:enterprise:${selectedPassport.id}"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
