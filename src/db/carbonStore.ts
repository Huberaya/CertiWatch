import {
  CsrdEsrsE1Metrics,
  SupplierCarbonProfile,
  Scope3CategoryBreakdown,
  DecarbonizationLever,
  NetZeroTrajectoryDataPoint,
} from '../types/carbon';

export const INITIAL_CSRD_E1_METRICS: CsrdEsrsE1Metrics = {
  reportingYear: 2026,
  grossScope1Tco2e: 420.0,
  grossScope2LocationBasedTco2e: 240.0,
  grossScope2MarketBasedTco2e: 180.0,
  grossScope3UpstreamTco2e: 24150.0,
  grossScope3DownstreamTco2e: 650.0,
  totalGhgEmissionsTco2e: 25400.0,
  ghgIntensityPerTurnoverTco2ePerMillionEur: 68.2, // tCO2e / M€ CA
  internalCarbonPriceEurPerTonne: 100.0, // Prix fantôme du carbone (Shadow Carbon Price)
  carbonCreditsRetiredTco2e: 1200.0, // Certifiés Gold Standard / Label Bas Carbone
  sbtiValidationDate: '2024-11-15',
  scope3Categories: [
    {
      category: 'CAT_1_PURCHASED_GOODS',
      labelFr: 'Catégorie 1 : Biens & Services Achetés (Matières premières, Packaging, Ingrédients)',
      emissionsTco2e: 17850.0,
      percentageOfScope3: 72.0,
      dataQualityTier: 'TIER_1_PRIMARY',
      primaryDataPercentage: 78.5,
      yoyVariationPercent: -4.2,
    },
    {
      category: 'CAT_4_UPSTREAM_TRANSPORT',
      labelFr: 'Catégorie 4 : Fret & Transport amont (Maritime, Routier, Ferroviaire)',
      emissionsTco2e: 3650.0,
      percentageOfScope3: 14.7,
      dataQualityTier: 'TIER_2_HYBRID',
      primaryDataPercentage: 62.0,
      yoyVariationPercent: -6.1,
    },
    {
      category: 'CAT_2_CAPITAL_GOODS',
      labelFr: 'Catégorie 2 : Biens d’équipement (Machines industrielles, Bâtiments, Véhicules)',
      emissionsTco2e: 1550.0,
      percentageOfScope3: 6.2,
      dataQualityTier: 'TIER_3_MONETARY_ADEME',
      primaryDataPercentage: 25.0,
      yoyVariationPercent: +1.5,
    },
    {
      category: 'CAT_3_FUEL_ENERGY',
      labelFr: 'Catégorie 3 : Activités liées aux combustibles & énergie amont (WTT)',
      emissionsTco2e: 820.0,
      percentageOfScope3: 3.3,
      dataQualityTier: 'TIER_1_PRIMARY',
      primaryDataPercentage: 88.0,
      yoyVariationPercent: -8.0,
    },
    {
      category: 'CAT_5_WASTE_GENERATED',
      labelFr: 'Catégorie 5 : Déchets générés par l’exploitation & fin de vie industrielle',
      emissionsTco2e: 280.0,
      percentageOfScope3: 1.1,
      dataQualityTier: 'TIER_2_HYBRID',
      primaryDataPercentage: 70.0,
      yoyVariationPercent: -12.4,
    },
    {
      category: 'CAT_9_DOWNSTREAM_TRANSPORT',
      labelFr: 'Catégorie 9 : Transport et distribution aval vers entrepôts distributeurs',
      emissionsTco2e: 650.0,
      percentageOfScope3: 2.7,
      dataQualityTier: 'TIER_2_HYBRID',
      primaryDataPercentage: 55.0,
      yoyVariationPercent: -3.5,
    },
  ],
};

export const INITIAL_SUPPLIER_CARBON_PROFILES: SupplierCarbonProfile[] = [
  {
    supplierId: 'sup-1',
    supplierName: 'AgroLait Normandie SAS',
    country: 'France',
    productCategory: 'Produits Laitiers Biologiques',
    annualSpendEur: 9400000,
    annualVolumeTonnes: 12500,
    scope1Tco2e: 450,
    scope2Tco2e: 120,
    scope3AllocatedTco2e: 3850,
    totalAllocatedTco2e: 4420,
    carbonIntensityKgPerEuro: 0.47,
    dataQualityTier: 'TIER_1_PRIMARY',
    primaryDataSharePercent: 92,
    sbtiStatus: 'TARGET_VALIDATED_1_5C',
    cdpScore: 'A_MINUS',
    renewableEnergyPercent: 65,
    reductionTargetPercent2030: 45,
    onTrackForNetZero: true,
    priorityForEngagement: 'MEDIUM_PRIORITY',
    keyDecarbonizationLever: 'Méthanisation agricole des effluents & méthaniseurs collectifs',
  },
  {
    supplierId: 'sup-2',
    supplierName: 'Nordic Timber Supply AB',
    country: 'Suède',
    productCategory: 'Bois d’œuvre & Palette FSC',
    annualSpendEur: 4200000,
    annualVolumeTonnes: 8200,
    scope1Tco2e: 180,
    scope2Tco2e: 40,
    scope3AllocatedTco2e: 1280,
    totalAllocatedTco2e: 1500,
    carbonIntensityKgPerEuro: 0.36,
    dataQualityTier: 'TIER_1_PRIMARY',
    primaryDataSharePercent: 95,
    sbtiStatus: 'TARGET_VALIDATED_1_5C',
    cdpScore: 'A',
    renewableEnergyPercent: 88,
    reductionTargetPercent2030: 55,
    onTrackForNetZero: true,
    priorityForEngagement: 'MONITORED',
    keyDecarbonizationLever: 'Électrification des engins d’abattage et biomasse forestière',
  },
  {
    supplierId: 'sup-3',
    supplierName: 'Café do Cerrado Exportadora',
    country: 'Brésil',
    productCategory: 'Café Arabica & Cacao EUDR',
    annualSpendEur: 8900000,
    annualVolumeTonnes: 4800,
    scope1Tco2e: 820,
    scope2Tco2e: 210,
    scope3AllocatedTco2e: 5470,
    totalAllocatedTco2e: 6500,
    carbonIntensityKgPerEuro: 0.73,
    dataQualityTier: 'TIER_2_HYBRID',
    primaryDataSharePercent: 68,
    sbtiStatus: 'COMMITTED_1_5C',
    cdpScore: 'B',
    renewableEnergyPercent: 42,
    reductionTargetPercent2030: 38,
    onTrackForNetZero: false,
    priorityForEngagement: 'HIGH_PRIORITY',
    keyDecarbonizationLever: 'Agroforesterie sous ombrage et traçabilité zéro déforestation EUDR',
  },
  {
    supplierId: 'sup-4',
    supplierName: 'Saphir Cacao Côte d’Ivoire',
    country: 'Côte d’Ivoire',
    productCategory: 'Fèves de Cacao Équitables',
    annualSpendEur: 7600000,
    annualVolumeTonnes: 3900,
    scope1Tco2e: 940,
    scope2Tco2e: 280,
    scope3AllocatedTco2e: 6180,
    totalAllocatedTco2e: 7400,
    carbonIntensityKgPerEuro: 0.97,
    dataQualityTier: 'TIER_2_HYBRID',
    primaryDataSharePercent: 58,
    sbtiStatus: 'COMMITTED_WELL_BELOW_2C',
    cdpScore: 'C',
    renewableEnergyPercent: 25,
    reductionTargetPercent2030: 30,
    onTrackForNetZero: false,
    priorityForEngagement: 'HIGH_PRIORITY',
    keyDecarbonizationLever: 'Lutte contre les engrais minéraux et compostage des cabosses',
  },
  {
    supplierId: 'sup-5',
    supplierName: 'BioPackaging Solutions France',
    country: 'France',
    productCategory: 'Emballages Carton Recyclé FSC',
    annualSpendEur: 3800000,
    annualVolumeTonnes: 6100,
    scope1Tco2e: 210,
    scope2Tco2e: 85,
    scope3AllocatedTco2e: 1805,
    totalAllocatedTco2e: 2100,
    carbonIntensityKgPerEuro: 0.55,
    dataQualityTier: 'TIER_1_PRIMARY',
    primaryDataSharePercent: 88,
    sbtiStatus: 'TARGET_VALIDATED_1_5C',
    cdpScore: 'B',
    renewableEnergyPercent: 72,
    reductionTargetPercent2030: 50,
    onTrackForNetZero: true,
    priorityForEngagement: 'MONITORED',
    keyDecarbonizationLever: 'Optimisation du grammage carton et boucle d’économie circulaire',
  },
  {
    supplierId: 'sup-6',
    supplierName: 'EcoTextile Vietnam Ltd',
    country: 'Vietnam',
    productCategory: 'Uniformes & Sacs Coton GOTS',
    annualSpendEur: 2900000,
    annualVolumeTonnes: 1400,
    scope1Tco2e: 360,
    scope2Tco2e: 310,
    scope3AllocatedTco2e: 2810,
    totalAllocatedTco2e: 3480,
    carbonIntensityKgPerEuro: 1.20,
    dataQualityTier: 'TIER_3_MONETARY_ADEME',
    primaryDataSharePercent: 40,
    sbtiStatus: 'NONE',
    cdpScore: 'NOT_REPORTING',
    renewableEnergyPercent: 18,
    reductionTargetPercent2030: 20,
    onTrackForNetZero: false,
    priorityForEngagement: 'HIGH_PRIORITY',
    keyDecarbonizationLever: 'Passage aux chaudières biomasse et solaire photovoltaïque en toiture',
  },
];

export const INITIAL_DECARBONIZATION_LEVERS: DecarbonizationLever[] = [
  {
    id: 'lev_1',
    title: 'PPA Solaire & Électrification Usines Laitières',
    description: 'Accompagner les coopératives normandes vers des contrats PPA solaires et pompes à chaleur industrielles.',
    category: 'CAT_1_PURCHASED_GOODS',
    potentialReductionTco2e: 1450,
    investmentCostEur: 85000,
    costPerTco2eEur: 58.6,
    implementationTimeframeMonths: 12,
    activeInSimulation: true,
    feasibility: 'HIGH',
  },
  {
    id: 'lev_2',
    title: 'Report Modal Fret Ferroviaire & Biocarburant HVO100',
    description: 'Basculer 40% des flux d’approvisionnement européens sur le rail combiné et camions HVO100.',
    category: 'CAT_4_UPSTREAM_TRANSPORT',
    potentialReductionTco2e: 1200,
    investmentCostEur: 42000,
    costPerTco2eEur: 35.0,
    implementationTimeframeMonths: 6,
    activeInSimulation: true,
    feasibility: 'HIGH',
  },
  {
    id: 'lev_3',
    title: 'Agroforesterie Régénérative Café & Cacao (Brésil / Côte d’Ivoire)',
    description: 'Financement de 1 200 hectares en agroforesterie intercalaire avec séquestration de carbone dans les sols.',
    category: 'CAT_1_PURCHASED_GOODS',
    potentialReductionTco2e: 2800,
    investmentCostEur: 140000,
    costPerTco2eEur: 50.0,
    implementationTimeframeMonths: 24,
    activeInSimulation: false,
    feasibility: 'MEDIUM',
  },
  {
    id: 'lev_4',
    title: 'Éco-conception & Allègement du Grammage des Emballages',
    description: 'Réduction de 15% de la masse de carton ondulé et suppression totale des encres contenant des métaux lourds.',
    category: 'CAT_1_PURCHASED_GOODS',
    potentialReductionTco2e: 480,
    investmentCostEur: 18000,
    costPerTco2eEur: 37.5,
    implementationTimeframeMonths: 8,
    activeInSimulation: true,
    feasibility: 'HIGH',
  },
  {
    id: 'lev_5',
    title: 'Fret Maritime Décarboné (Voiles Rigides & Bio-Méthanol)',
    description: 'Sélectionner des armateurs engagés sur des porte-conteneurs propulsés au bio-méthanol pour les imports Amérique du Sud.',
    category: 'CAT_4_UPSTREAM_TRANSPORT',
    potentialReductionTco2e: 950,
    investmentCostEur: 65000,
    costPerTco2eEur: 68.4,
    implementationTimeframeMonths: 18,
    activeInSimulation: false,
    feasibility: 'MEDIUM',
  },
];

export const INITIAL_NET_ZERO_TRAJECTORY: NetZeroTrajectoryDataPoint[] = [
  { year: 2020, baselineEmissionsTco2e: 32000, projectedEmissionsTco2e: 32000, target1_5cPathTco2e: 32000, achievedReductionPercent: 0 },
  { year: 2022, baselineEmissionsTco2e: 32000, projectedEmissionsTco2e: 29800, target1_5cPathTco2e: 29400, achievedReductionPercent: 6.8 },
  { year: 2024, baselineEmissionsTco2e: 32000, projectedEmissionsTco2e: 27500, target1_5cPathTco2e: 26800, achievedReductionPercent: 14.1 },
  { year: 2026, baselineEmissionsTco2e: 32000, projectedEmissionsTco2e: 25400, target1_5cPathTco2e: 24200, achievedReductionPercent: 20.6 },
  { year: 2028, baselineEmissionsTco2e: 32000, projectedEmissionsTco2e: 21800, target1_5cPathTco2e: 20500, achievedReductionPercent: 31.8 },
  { year: 2030, baselineEmissionsTco2e: 32000, projectedEmissionsTco2e: 18500, target1_5cPathTco2e: 16500, achievedReductionPercent: 42.2 }, // SBTi milestone (-42%)
  { year: 2035, baselineEmissionsTco2e: 32000, projectedEmissionsTco2e: 12400, target1_5cPathTco2e: 10800, achievedReductionPercent: 61.2 },
  { year: 2040, baselineEmissionsTco2e: 32000, projectedEmissionsTco2e: 7600, target1_5cPathTco2e: 6400, achievedReductionPercent: 76.2 },
  { year: 2050, baselineEmissionsTco2e: 32000, projectedEmissionsTco2e: 2500, target1_5cPathTco2e: 2500, achievedReductionPercent: 92.2 }, // Net-Zero (-90%+)
];

class CarbonStore {
  private metrics: CsrdEsrsE1Metrics = INITIAL_CSRD_E1_METRICS;
  private suppliers: SupplierCarbonProfile[] = INITIAL_SUPPLIER_CARBON_PROFILES;
  private levers: DecarbonizationLever[] = INITIAL_DECARBONIZATION_LEVERS;
  private trajectory: NetZeroTrajectoryDataPoint[] = INITIAL_NET_ZERO_TRAJECTORY;
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

  public getMetrics(): CsrdEsrsE1Metrics {
    return { ...this.metrics };
  }

  public getSuppliers(): SupplierCarbonProfile[] {
    return [...this.suppliers];
  }

  public getLevers(): DecarbonizationLever[] {
    return [...this.levers];
  }

  public getTrajectory(): NetZeroTrajectoryDataPoint[] {
    // Calculate total simulated reduction from active levers
    const activeReduction = this.levers
      .filter((l) => l.activeInSimulation)
      .reduce((sum, l) => sum + l.potentialReductionTco2e, 0);

    return this.trajectory.map((point) => {
      if (point.year >= 2026) {
        const factor = (point.year - 2024) / (2030 - 2024);
        const dynamicReduction = Math.round(activeReduction * Math.min(1.5, Math.max(0.2, factor)));
        const adjustedProjection = Math.max(point.target1_5cPathTco2e * 0.9, point.projectedEmissionsTco2e - dynamicReduction);
        const reductionPercent = Math.round(((point.baselineEmissionsTco2e - adjustedProjection) / point.baselineEmissionsTco2e) * 1000) / 10;
        return {
          ...point,
          projectedEmissionsTco2e: adjustedProjection,
          achievedReductionPercent: reductionPercent,
        };
      }
      return point;
    });
  }

  public toggleLever(leverId: string) {
    this.levers = this.levers.map((l) =>
      l.id === leverId ? { ...l, activeInSimulation: !l.activeInSimulation } : l
    );
    this.notify();
  }

  public getActiveLeversSummary() {
    const active = this.levers.filter((l) => l.activeInSimulation);
    const totalReductionTco2e = active.reduce((sum, l) => sum + l.potentialReductionTco2e, 0);
    const totalCapexEur = active.reduce((sum, l) => sum + l.investmentCostEur, 0);
    const avgAbatementCost = totalReductionTco2e > 0 ? Math.round((totalCapexEur / totalReductionTco2e) * 10) / 10 : 0;

    return {
      activeCount: active.length,
      totalReductionTco2e,
      totalCapexEur,
      avgAbatementCost,
    };
  }

  public updateSupplierData(supplierId: string, update: Partial<SupplierCarbonProfile>) {
    this.suppliers = this.suppliers.map((s) => (s.supplierId === supplierId ? { ...s, ...update } : s));
    this.notify();
  }
}

export const carbonStore = new CarbonStore();
