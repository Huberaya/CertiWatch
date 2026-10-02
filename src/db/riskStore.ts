import {
  EarlyWarningAlert,
  SupplierFinancialHealth,
  SupplyChainStressTestScenario,
  SupplyChainResilienceMetrics,
} from '../types/riskEarlyWarning';

export const INITIAL_EARLY_WARNING_ALERTS: EarlyWarningAlert[] = [
  {
    id: 'alt-01',
    category: 'EXTREME_WEATHER_CLIMATE',
    severity: 'HIGH_ALERT',
    title: 'Sécheresse Sévère Bassin du Cerrado & Stress Hydrique (Brésil)',
    source: 'Copernicus Climate Service & INMET Brésil',
    affectedCountry: 'Brésil',
    affectedRegion: 'Minas Gerais (Patrocínio & Araxá)',
    affectedSuppliers: [
      {
        supplierId: 'sup-3',
        supplierName: 'Café do Cerrado Exportadora',
        spendAtRiskEur: 3200000,
        exposedCommodity: 'Café Arabica Bourbon Jaune',
      },
    ],
    predictedLeadTimeDelayDays: 18,
    probabilityScorePercent: 88,
    detectionTimestamp: '2026-09-28T06:14:00Z',
    status: 'ACTIVE_WARNING',
    summaryDescription: 'Déficit pluviométrique de 45% enregistré sur les 60 derniers jours. Baisse prévisionnelle des rendements de grains de 22% et risques d’engorgement des moulins de traitement humide.',
    recommendedMitigation: 'Activer le stock tampon de sécurité (+3 semaines) et pré-réserver des volumes de compensation auprès de la coopérative de substitution en Colombie.',
  },
  {
    id: 'alt-02',
    category: 'LOGISTICS_CHOKEPOINT',
    severity: 'CRITICAL_BLACK_SWAN',
    title: 'Engorgement Maritime & Détournement du Fret Asie-Europe (Cap de Bonne-Espérance)',
    source: 'MarineTraffic Satellite AIS & Port of Rotterdam PortBase',
    affectedCountry: 'Vietnam / Mer Rouge',
    affectedRegion: 'Couloir Maritime Asie du Sud-Est & Canal de Suez',
    affectedSuppliers: [
      {
        supplierId: 'sup-6',
        supplierName: 'EcoTextile Vietnam Ltd',
        spendAtRiskEur: 1450000,
        exposedCommodity: 'Tote-Bags & Uniformes Coton GOTS',
      },
    ],
    predictedLeadTimeDelayDays: 14,
    probabilityScorePercent: 94,
    detectionTimestamp: '2026-09-29T11:20:00Z',
    status: 'MITIGATION_IN_PROGRESS',
    summaryDescription: 'Saturation des terminaux de transbordement de Singapour et allongement de 12 à 15 jours de transit pour contourner la zone maritime à risque.',
    recommendedMitigation: 'Bascule de 40% des volumes urgents sur le fret ferroviaire combiné Trans-Eurasie (Vietnam-Chine-Pologne) et étalement des cadences de livraison.',
  },
  {
    id: 'alt-03',
    category: 'EXTREME_WEATHER_CLIMATE',
    severity: 'MEDIUM_WATCH',
    title: 'Anomalie Thermique & Floraison Tardive Cacao (Côte d’Ivoire)',
    source: 'Famine Early Warning Systems Network (FEWS NET)',
    affectedCountry: 'Côte d’Ivoire',
    affectedRegion: 'Région de la Nawa (Soubré)',
    affectedSuppliers: [
      {
        supplierId: 'sup-4',
        supplierName: 'Saphir Cacao Côte d’Ivoire',
        spendAtRiskEur: 2800000,
        exposedCommodity: 'Fèves de Cacao Équitables & Biologiques',
      },
    ],
    predictedLeadTimeDelayDays: 9,
    probabilityScorePercent: 72,
    detectionTimestamp: '2026-09-25T14:45:00Z',
    status: 'ACTIVE_WARNING',
    summaryDescription: 'Retard de 2 semaines dans le pic de récolte principale suite à un démarrage tardif des pluies d’automne. Risque de tension sur les premiers embarquements au port de San Pedro.',
    recommendedMitigation: 'Prioriser l’approvisionnement des fèves certifiées sous contrat pluriannuel et sécuriser un slot d’embarquement maritime garanti avec CMA CGM.',
  },
  {
    id: 'alt-04',
    category: 'FINANCIAL_INSOLVENCY',
    severity: 'MEDIUM_WATCH',
    title: 'Dégradation du BFR & Allongement du Crédit Client (Vietnam)',
    source: 'Dun & Bradstreet Global Financial Analytics',
    affectedCountry: 'Vietnam',
    affectedRegion: 'Hanoï Industrial Zone',
    affectedSuppliers: [
      {
        supplierId: 'sup-6',
        supplierName: 'EcoTextile Vietnam Ltd',
        spendAtRiskEur: 980000,
        exposedCommodity: 'Filière Textile & Filature',
      },
    ],
    predictedLeadTimeDelayDays: 7,
    probabilityScorePercent: 55,
    detectionTimestamp: '2026-09-18T09:00:00Z',
    status: 'ACTIVE_WARNING',
    summaryDescription: 'Hausse du DSO (Days Sales Outstanding) à 75 jours consécutive aux investissements récents en machines de filature. L’Altman Z-Score passe en zone de vigilance à 1.95.',
    recommendedMitigation: 'Déployer un programme d’affacturage inversé (Reverse Factoring) pour payer le fournisseur à J+10 tout en préservant le délai de règlement Groupe à J+60.',
  },
];

export const INITIAL_SUPPLIER_FINANCIAL_HEALTH: SupplierFinancialHealth[] = [
  {
    supplierId: 'sup-1',
    supplierName: 'AgroLait Normandie SAS',
    country: 'France',
    altmanZScore: 3.82,
    distressRiskLabel: 'SAFE',
    daysSalesOutstanding: 42,
    workingCapitalRatio: 1.85,
    creditRatingAgencyScore: 'AAA',
    lastBalanceSheetDate: '2025-12-31',
  },
  {
    supplierId: 'sup-2',
    supplierName: 'Nordic Timber Supply AB',
    country: 'Suède',
    altmanZScore: 3.45,
    distressRiskLabel: 'SAFE',
    daysSalesOutstanding: 38,
    workingCapitalRatio: 1.72,
    creditRatingAgencyScore: 'AA',
    lastBalanceSheetDate: '2025-12-31',
  },
  {
    supplierId: 'sup-5',
    supplierName: 'BioPackaging Solutions France',
    country: 'France',
    altmanZScore: 3.15,
    distressRiskLabel: 'SAFE',
    daysSalesOutstanding: 45,
    workingCapitalRatio: 1.60,
    creditRatingAgencyScore: 'A+',
    lastBalanceSheetDate: '2025-12-31',
  },
  {
    supplierId: 'sup-3',
    supplierName: 'Café do Cerrado Exportadora',
    country: 'Brésil',
    altmanZScore: 2.45,
    distressRiskLabel: 'GREY_ZONE',
    daysSalesOutstanding: 58,
    workingCapitalRatio: 1.35,
    creditRatingAgencyScore: 'BBB',
    lastBalanceSheetDate: '2025-12-31',
  },
  {
    supplierId: 'sup-4',
    supplierName: 'Saphir Cacao Côte d’Ivoire',
    country: 'Côte d’Ivoire',
    altmanZScore: 2.20,
    distressRiskLabel: 'GREY_ZONE',
    daysSalesOutstanding: 64,
    workingCapitalRatio: 1.28,
    creditRatingAgencyScore: 'BB+',
    lastBalanceSheetDate: '2025-12-31',
  },
  {
    supplierId: 'sup-6',
    supplierName: 'EcoTextile Vietnam Ltd',
    country: 'Vietnam',
    altmanZScore: 1.95,
    distressRiskLabel: 'GREY_ZONE',
    daysSalesOutstanding: 75,
    workingCapitalRatio: 1.15,
    creditRatingAgencyScore: 'BB-',
    lastBalanceSheetDate: '2025-12-31',
  },
];

export const INITIAL_STRESS_TEST_SCENARIOS: SupplyChainStressTestScenario[] = [
  {
    id: 'scen-1',
    name: 'Choc Climatique Majeur & Baisse des Récoltes Tropicales (-35%)',
    description: 'Sécheresse simultanée Amérique Latine et Afrique de l’Ouest combinée à une hausse des prix spot de 45% sur le cacao et le café arabica.',
    triggerEvent: 'Phénomène El Niño étendu & stress thermique équatorial',
    affectedPortOrCorridor: 'Corridor Santos (Brésil) & San Pedro (Côte d’Ivoire)',
    simulatedLeadTimeInflationDays: 24,
    simulatedCostIncreasePercent: 28,
    totalFinancialImpactEur: 1850000,
    impactedSkuCount: 14,
    contingencyReadinessScore: 82,
    backupSupplierAvailable: true,
    recommendedBufferStockWeeks: 6,
  },
  {
    id: 'scen-2',
    name: 'Blocage Maritime & Saturation Portuaire Europe du Nord (Rotterdam / Le Havre)',
    description: 'Grève générale de 14 jours des dockers européens couplée à une défaillance de grutage immobilisant 4 porte-conteneurs majeurs.',
    triggerEvent: 'Mouvement social interprofessionnel & panne informatique portuaire',
    affectedPortOrCorridor: 'Terminaux à conteneurs Rotterdam World Gateway & Le Havre Port 2000',
    simulatedLeadTimeInflationDays: 16,
    simulatedCostIncreasePercent: 14,
    totalFinancialImpactEur: 640000,
    impactedSkuCount: 22,
    contingencyReadinessScore: 88,
    backupSupplierAvailable: true,
    recommendedBufferStockWeeks: 4,
  },
  {
    id: 'scen-3',
    name: 'Pénurie Énergétique & Gel Industriel Grand Nord Européen',
    description: 'Rupture temporaire du réseau électrique scandinave affectant les scieries suédoises et la fabrication des palettes bois certifiées FSC.',
    triggerEvent: 'Tempête hivernale exceptionnelle & avarie de transformateur haute tension',
    affectedPortOrCorridor: 'Corridor routier & ferroviaire Scandinavie-Allemagne',
    simulatedLeadTimeInflationDays: 10,
    simulatedCostIncreasePercent: 8,
    totalFinancialImpactEur: 320000,
    impactedSkuCount: 8,
    contingencyReadinessScore: 92,
    backupSupplierAvailable: true,
    recommendedBufferStockWeeks: 3,
  },
];

class RiskStore {
  private alerts: EarlyWarningAlert[] = INITIAL_EARLY_WARNING_ALERTS;
  private financialHealth: SupplierFinancialHealth[] = INITIAL_SUPPLIER_FINANCIAL_HEALTH;
  private scenarios: SupplyChainStressTestScenario[] = INITIAL_STRESS_TEST_SCENARIOS;
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

  public getAlerts(): EarlyWarningAlert[] {
    return [...this.alerts];
  }

  public getFinancialHealth(): SupplierFinancialHealth[] {
    return [...this.financialHealth];
  }

  public getScenarios(): SupplyChainStressTestScenario[] {
    return [...this.scenarios];
  }

  public getResilienceMetrics(): SupplyChainResilienceMetrics {
    const active = this.alerts.filter((a) => a.status !== 'CONTAINED_RESOLVED');
    const critical = active.filter((a) => a.severity === 'CRITICAL_BLACK_SWAN' || a.severity === 'HIGH_ALERT');
    const totalSpend = active.reduce(
      (sum, a) => sum + a.affectedSuppliers.reduce((s2, sup) => s2 + sup.spendAtRiskEur, 0),
      0
    );
    const distressed = this.financialHealth.filter((f) => f.distressRiskLabel === 'DISTRESS' || f.distressRiskLabel === 'GREY_ZONE').length;

    return {
      globalResilienceScore: 84, // 0-100 index
      activeAlertsCount: active.length,
      criticalAlertsCount: critical.length,
      totalSpendAtRiskEur: totalSpend,
      distressedSuppliersCount: distressed,
      averageLeadTimeBufferDays: 16.5,
      stressTestStatus: 'TESTED_RESILIENT',
    };
  }

  public acknowledgeAlert(alertId: string) {
    this.alerts = this.alerts.map((a) =>
      a.id === alertId ? { ...a, status: 'MITIGATION_IN_PROGRESS' } : a
    );
    this.notify();
  }

  public resolveAlert(alertId: string) {
    this.alerts = this.alerts.map((a) =>
      a.id === alertId ? { ...a, status: 'CONTAINED_RESOLVED' } : a
    );
    this.notify();
  }
}

export const riskStore = new RiskStore();
