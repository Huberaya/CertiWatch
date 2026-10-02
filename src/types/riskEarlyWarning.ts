export type RiskCategory =
  | 'EXTREME_WEATHER_CLIMATE' // Sécheresses, inondations, typhons, stress hydrique
  | 'GEOPOLITICAL_CONFLICT' // Tensions territoriales, sanctions, fermetures de frontières
  | 'LOGISTICS_CHOKEPOINT' // Blocages portuaires, saturation maritime, détroits stratégiques
  | 'FINANCIAL_INSOLVENCY' // Altman Z-score, faillites, liquidités, défauts de paiement
  | 'LABOR_DISRUPTION' // Grèves générales, arrêts de production, mouvements sociaux
  | 'REGULATORY_SANCTION'; // Retrait d'agrément, embargo EUDR/CSDDD, sanctions douanières

export type RiskSeverityLevel = 'CRITICAL_BLACK_SWAN' | 'HIGH_ALERT' | 'MEDIUM_WATCH' | 'LOW_MONITOR';

export interface EarlyWarningAlert {
  id: string;
  category: RiskCategory;
  severity: RiskSeverityLevel;
  title: string;
  source: string; // e.g. "Copernicus Climate Service", "Bloomberg Supply Chain", "MarineTraffic", "Dun & Bradstreet"
  affectedCountry: string;
  affectedRegion: string;
  affectedSuppliers: {
    supplierId: string;
    supplierName: string;
    spendAtRiskEur: number;
    exposedCommodity: string;
  }[];
  predictedLeadTimeDelayDays: number;
  probabilityScorePercent: number; // 0-100%
  detectionTimestamp: string;
  status: 'ACTIVE_WARNING' | 'MITIGATION_IN_PROGRESS' | 'CONTAINED_RESOLVED';
  summaryDescription: string;
  recommendedMitigation: string;
}

export interface SupplierFinancialHealth {
  supplierId: string;
  supplierName: string;
  country: string;
  altmanZScore: number; // >2.99 Safe Zone, 1.81-2.99 Grey Zone, <1.81 Distress Zone
  distressRiskLabel: 'SAFE' | 'GREY_ZONE' | 'DISTRESS';
  daysSalesOutstanding: number; // DSO (jours de crédit client)
  workingCapitalRatio: number;
  creditRatingAgencyScore: string; // e.g. "A+", "BBB-", "CCC"
  lastBalanceSheetDate: string;
}

export interface SupplyChainStressTestScenario {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  affectedPortOrCorridor: string;
  simulatedLeadTimeInflationDays: number;
  simulatedCostIncreasePercent: number;
  totalFinancialImpactEur: number;
  impactedSkuCount: number;
  contingencyReadinessScore: number; // 0-100
  backupSupplierAvailable: boolean;
  recommendedBufferStockWeeks: number;
}

export interface SupplyChainResilienceMetrics {
  globalResilienceScore: number; // 0-100
  activeAlertsCount: number;
  criticalAlertsCount: number;
  totalSpendAtRiskEur: number;
  distressedSuppliersCount: number;
  averageLeadTimeBufferDays: number;
  stressTestStatus: 'TESTED_RESILIENT' | 'VULNERABILITY_DETECTED';
}
