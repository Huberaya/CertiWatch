export type GhgScope = 'SCOPE_1' | 'SCOPE_2' | 'SCOPE_3_UPSTREAM' | 'SCOPE_3_DOWNSTREAM';

export type Scope3Category =
  | 'CAT_1_PURCHASED_GOODS' // Catégorie 1 : Biens & Services Achetés
  | 'CAT_2_CAPITAL_GOODS' // Catégorie 2 : Biens d'équipement
  | 'CAT_3_FUEL_ENERGY' // Catégorie 3 : Énergie non incluse dans Scope 1 & 2
  | 'CAT_4_UPSTREAM_TRANSPORT' // Catégorie 4 : Fret & Transport amont
  | 'CAT_5_WASTE_GENERATED' // Catégorie 5 : Déchets d'exploitation
  | 'CAT_6_BUSINESS_TRAVEL' // Catégorie 6 : Déplacements professionnels
  | 'CAT_7_EMPLOYEE_COMMUTING' // Catégorie 7 : Déplacements domicile-travail
  | 'CAT_9_DOWNSTREAM_TRANSPORT' // Catégorie 9 : Transport et distribution aval
  | 'CAT_12_END_OF_LIFE'; // Catégorie 12 : Fin de vie des produits vendus

export type DataQualityTier = 'TIER_1_PRIMARY' | 'TIER_2_HYBRID' | 'TIER_3_MONETARY_ADEME';

export type SbtiCommitmentStatus = 'COMMITTED_1_5C' | 'TARGET_VALIDATED_1_5C' | 'COMMITTED_WELL_BELOW_2C' | 'NONE';

export type CdpScore = 'A' | 'A_MINUS' | 'B' | 'B_MINUS' | 'C' | 'D' | 'NOT_REPORTING';

export interface EmissionFactorReference {
  id: string;
  source: 'ADEME_BASE_CARBONE' | 'ECOINVENT_3_10' | 'AGRIBALYSE_3_1' | 'SUPPLIER_EPD';
  commodityCategory: string;
  factorValue: number;
  unit: string; // e.g. "kgCO2e / kg", "kgCO2e / k€ spend", "kgCO2e / tonne.km"
  uncertaintyPercent: number;
  lastUpdated: string;
}

export interface SupplierCarbonProfile {
  supplierId: string;
  supplierName: string;
  country: string;
  productCategory: string;
  annualSpendEur: number;
  annualVolumeTonnes?: number;
  // Emissions
  scope1Tco2e: number;
  scope2Tco2e: number;
  scope3AllocatedTco2e: number;
  totalAllocatedTco2e: number;
  carbonIntensityKgPerEuro: number;
  // Quality & ESG
  dataQualityTier: DataQualityTier;
  primaryDataSharePercent: number; // e.g. 85% primary verified data
  sbtiStatus: SbtiCommitmentStatus;
  cdpScore: CdpScore;
  renewableEnergyPercent: number;
  // Trajectory
  reductionTargetPercent2030: number;
  onTrackForNetZero: boolean;
  priorityForEngagement: 'HIGH_PRIORITY' | 'MEDIUM_PRIORITY' | 'MONITORED';
  keyDecarbonizationLever: string;
}

export interface Scope3CategoryBreakdown {
  category: Scope3Category;
  labelFr: string;
  emissionsTco2e: number;
  percentageOfScope3: number;
  dataQualityTier: DataQualityTier;
  primaryDataPercentage: number;
  yoyVariationPercent: number; // Year-over-Year
}

export interface DecarbonizationLever {
  id: string;
  title: string;
  description: string;
  category: Scope3Category;
  potentialReductionTco2e: number;
  investmentCostEur: number;
  costPerTco2eEur: number; // Abatement cost
  implementationTimeframeMonths: number;
  activeInSimulation: boolean;
  feasibility: 'HIGH' | 'MEDIUM' | 'COMPLEX';
}

export interface NetZeroTrajectoryDataPoint {
  year: number;
  baselineEmissionsTco2e: number;
  projectedEmissionsTco2e: number;
  target1_5cPathTco2e: number; // Paris agreement trajectory
  achievedReductionPercent: number;
}

export interface CsrdEsrsE1Metrics {
  reportingYear: number;
  grossScope1Tco2e: number;
  grossScope2LocationBasedTco2e: number;
  grossScope2MarketBasedTco2e: number;
  grossScope3UpstreamTco2e: number;
  grossScope3DownstreamTco2e: number;
  totalGhgEmissionsTco2e: number;
  ghgIntensityPerTurnoverTco2ePerMillionEur: number;
  internalCarbonPriceEurPerTonne: number;
  carbonCreditsRetiredTco2e: number;
  sbtiValidationDate?: string;
  scope3Categories: Scope3CategoryBreakdown[];
}
