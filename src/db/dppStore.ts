import {
  DigitalProductPassport,
  DppSummaryStatistics,
} from '../types/dpp';

export const INITIAL_DPP_PASSPORTS: DigitalProductPassport[] = [
  {
    id: 'dpp-1',
    gtin: '3045320084912',
    batchLotNumber: 'LOT-2026-N904',
    productName: 'Lait Bio Frais Normandie Équitable 1L',
    brand: 'Danone Éco-Responsable',
    category: 'FOOD_DAIRY',
    manufacturingDate: '2026-09-15',
    bestBeforeDate: '2026-10-15',
    manufacturingFacility: {
      factoryName: 'Laiterie Centrale de Normandie',
      city: 'Le Molay-Littry',
      country: 'France',
      gpsCoordinates: '49.2435° N, 0.8719° W',
      certifications: ['ISO 14001', 'FSSC 22000', 'Label Bas-Carbone'],
    },
    circularityMetrics: {
      recycledContentPercent: 100, // Bouteille 100% rPET recyclé
      recyclabilityClass: 'CLASS_A_EXCELLENT',
      unitCarbonFootprintKgCo2e: 0.82,
      waterFootprintLiters: 14.5,
      csdddDueDiligenceVerified: true,
      childLaborFreeGuaranteed: true,
    },
    components: [
      {
        id: 'comp-1',
        name: 'Lait cru biologique entier collecté en prairie',
        percentageWeight: 96.5,
        supplierId: 'sup-1',
        supplierName: 'AgroLait Normandie SAS',
        countryOfOrigin: 'France',
        originPlotGps: '49.1829° N, 0.3707° W (Bassin de Bayeux)',
        certifiedStandard: 'Agriculture Biologique & Ecocert Bio',
        eudrZeroDeforestationVerified: true,
        unitCarbonFootprintKgCo2e: 0.74,
      },
      {
        id: 'comp-2',
        name: 'Bouteille & Bouchon rPET 100% Recyclé',
        percentageWeight: 3.5,
        supplierId: 'sup-5',
        supplierName: 'BioPackaging Solutions France',
        countryOfOrigin: 'France',
        certifiedStandard: 'EuCertPlast & RecyClass Classe A',
        eudrZeroDeforestationVerified: true,
        unitCarbonFootprintKgCo2e: 0.08,
      },
    ],
    gs1DigitalLinkUrl: 'https://id.certiwatch.io/01/3045320084912/10/LOT-2026-N904',
    verifiableCredentialHash: 'w3c_vc_sha256_883019ab728491029481bc92049182390192a8bc',
    status: 'ACTIVE_LIVE',
  },
  {
    id: 'dpp-2',
    gtin: '3270190412850',
    batchLotNumber: 'LOT-2026-C821',
    productName: 'Chocolat Noir Grand Cru 72% Équitable & Zéro Déforestation 100g',
    brand: 'ChocoWatch Terroirs',
    category: 'HOT_BEVERAGES',
    manufacturingDate: '2026-08-28',
    bestBeforeDate: '2028-02-28',
    manufacturingFacility: {
      factoryName: 'Atelier de Torréfaction & Chocolaterie Durable',
      city: 'Blois',
      country: 'France',
      gpsCoordinates: '47.5861° N, 1.3359° E',
      certifications: ['IFS Food v8', 'Fairtrade Certified Facility', 'ISO 50001'],
    },
    circularityMetrics: {
      recycledContentPercent: 88,
      recyclabilityClass: 'CLASS_A_EXCELLENT',
      unitCarbonFootprintKgCo2e: 0.38,
      waterFootprintLiters: 48.0,
      csdddDueDiligenceVerified: true,
      childLaborFreeGuaranteed: true,
    },
    components: [
      {
        id: 'comp-3',
        name: 'Pâte & Fèves de Cacao Criollo Zéro Déforestation',
        percentageWeight: 72.0,
        supplierId: 'sup-4',
        supplierName: 'Saphir Cacao Côte d’Ivoire',
        countryOfOrigin: 'Côte d’Ivoire',
        originPlotGps: '5.7856° N, 6.6021° W (Section Soubré Parcelles 04 & 09)',
        certifiedStandard: 'Fairtrade Max Havelaar & EUDR Sentinel-2 Validé',
        eudrZeroDeforestationVerified: true,
        unitCarbonFootprintKgCo2e: 0.29,
      },
      {
        id: 'comp-4',
        name: 'Étui Carton Recyclé & Encre Végétale sans Huile Minérale',
        percentageWeight: 8.0,
        supplierId: 'sup-5',
        supplierName: 'BioPackaging Solutions France',
        countryOfOrigin: 'France',
        certifiedStandard: 'FSC-Recycled 100% & Imprim’Vert',
        eudrZeroDeforestationVerified: true,
        unitCarbonFootprintKgCo2e: 0.03,
      },
    ],
    gs1DigitalLinkUrl: 'https://id.certiwatch.io/01/3270190412850/10/LOT-2026-C821',
    verifiableCredentialHash: 'w3c_vc_sha256_384018bcfa1902847a98bc1904a298cf0192ba84',
    status: 'ACTIVE_LIVE',
  },
  {
    id: 'dpp-3',
    gtin: '3564700981244',
    batchLotNumber: 'LOT-2026-B109',
    productName: 'Café Pur Arabica do Cerrado en Grains 500g',
    brand: 'Cafés d’Origine Certifiée',
    category: 'HOT_BEVERAGES',
    manufacturingDate: '2026-09-02',
    bestBeforeDate: '2027-09-02',
    manufacturingFacility: {
      factoryName: 'Torréfaction Artisanale des Volcans',
      city: 'Clermont-Ferrand',
      country: 'France',
      gpsCoordinates: '45.7772° N, 3.0870° E',
      certifications: ['Ecocert Bio', 'Rainforest Alliance Chain of Custody'],
    },
    circularityMetrics: {
      recycledContentPercent: 70,
      recyclabilityClass: 'CLASS_B_GOOD',
      unitCarbonFootprintKgCo2e: 0.65,
      waterFootprintLiters: 110.0,
      csdddDueDiligenceVerified: true,
      childLaborFreeGuaranteed: true,
    },
    components: [
      {
        id: 'comp-5',
        name: 'Café Vert Arabica Bourbon Jaune sous Ombrage',
        percentageWeight: 94.0,
        supplierId: 'sup-3',
        supplierName: 'Café do Cerrado Exportadora',
        countryOfOrigin: 'Brésil',
        originPlotGps: '18.9439° S, 46.9942° W (Fazenda Santa Bárbara, Minas Gerais)',
        certifiedStandard: 'Rainforest Alliance & TRACES-NT DDS Verified',
        eudrZeroDeforestationVerified: true,
        unitCarbonFootprintKgCo2e: 0.58,
      },
      {
        id: 'comp-6',
        name: 'Sachet Monomatériau Barrière Recyclable avec Valve Biosourcée',
        percentageWeight: 6.0,
        supplierId: 'sup-5',
        supplierName: 'BioPackaging Solutions France',
        countryOfOrigin: 'France',
        certifiedStandard: 'DIN CERTCO Biobased & OPRL Recyclable',
        eudrZeroDeforestationVerified: true,
        unitCarbonFootprintKgCo2e: 0.07,
      },
    ],
    gs1DigitalLinkUrl: 'https://id.certiwatch.io/01/3564700981244/10/LOT-2026-B109',
    verifiableCredentialHash: 'w3c_vc_sha256_192083bc74019284719048a192bc938177491028',
    status: 'ACTIVE_LIVE',
  },
  {
    id: 'dpp-4',
    gtin: '3700140298110',
    batchLotNumber: 'LOT-2026-T402',
    productName: 'Tote-Bag Textile Coton Biologique Réutilisable GOTS',
    brand: 'ÉcoStyle Corporate',
    category: 'TEXTILE_APPAREL',
    manufacturingDate: '2026-07-10',
    manufacturingFacility: {
      factoryName: 'Atelier de Filature & Confection GOTS Hanoï',
      city: 'Hanoï',
      country: 'Vietnam',
      gpsCoordinates: '21.0285° N, 105.8542° E',
      certifications: ['GOTS Version 7.0', 'OEKO-TEX Standard 100', 'BSCI Audited'],
    },
    circularityMetrics: {
      recycledContentPercent: 40,
      recyclabilityClass: 'CLASS_A_EXCELLENT',
      unitCarbonFootprintKgCo2e: 1.12,
      waterFootprintLiters: 240.0,
      csdddDueDiligenceVerified: true,
      childLaborFreeGuaranteed: true,
    },
    components: [
      {
        id: 'comp-7',
        name: 'Fibre de Coton Biologique Tissé 310 g/m²',
        percentageWeight: 100.0,
        supplierId: 'sup-6',
        supplierName: 'EcoTextile Vietnam Ltd',
        countryOfOrigin: 'Vietnam',
        certifiedStandard: 'Global Organic Textile Standard (GOTS)',
        eudrZeroDeforestationVerified: true,
        unitCarbonFootprintKgCo2e: 1.12,
      },
    ],
    gs1DigitalLinkUrl: 'https://id.certiwatch.io/01/3700140298110/10/LOT-2026-T402',
    verifiableCredentialHash: 'w3c_vc_sha256_55491029481bc920491829bc8102948192a8bc19',
    status: 'ACTIVE_LIVE',
  },
  {
    id: 'dpp-5',
    gtin: '3892019481023',
    batchLotNumber: 'LOT-2026-W305',
    productName: 'Palette Europe Bois Résineux Éco-Certifié FSC',
    brand: 'Nordic Logistics Green',
    category: 'WOOD_FURNITURE',
    manufacturingDate: '2026-08-12',
    manufacturingFacility: {
      factoryName: 'Scierie Forestière Automatisée Norrland',
      city: 'Sundsvall',
      country: 'Suède',
      gpsCoordinates: '62.3908° N, 17.3069° E',
      certifications: ['FSC Chain of Custody', 'PEFC', 'EPAL Official Licensed'],
    },
    circularityMetrics: {
      recycledContentPercent: 0, // Bois d'œuvre neuf géré durablement
      recyclabilityClass: 'CLASS_A_EXCELLENT',
      unitCarbonFootprintKgCo2e: 3.40,
      waterFootprintLiters: 18.0,
      csdddDueDiligenceVerified: true,
      childLaborFreeGuaranteed: true,
    },
    components: [
      {
        id: 'comp-8',
        name: 'Bois Résineux d’Épicéa & Pin Sylvestre FSC-100%',
        percentageWeight: 97.0,
        supplierId: 'sup-2',
        supplierName: 'Nordic Timber Supply AB',
        countryOfOrigin: 'Suède',
        originPlotGps: '63.8258° N, 20.2630° E (Forêt boréale certifiée FSC)',
        certifiedStandard: 'FSC-STD-40-004 & PEFC 2002',
        eudrZeroDeforestationVerified: true,
        unitCarbonFootprintKgCo2e: 3.10,
      },
      {
        id: 'comp-9',
        name: 'Clous & Pointes en Acier Bas-Carbone',
        percentageWeight: 3.0,
        supplierId: 'sup-5',
        supplierName: 'BioPackaging Solutions France',
        countryOfOrigin: 'France',
        certifiedStandard: 'EPAL Technical Standard',
        eudrZeroDeforestationVerified: true,
        unitCarbonFootprintKgCo2e: 0.30,
      },
    ],
    gs1DigitalLinkUrl: 'https://id.certiwatch.io/01/3892019481023/10/LOT-2026-W305',
    verifiableCredentialHash: 'w3c_vc_sha256_774910283bc91820491820bc91840291049281ab',
    status: 'ACTIVE_LIVE',
  },
];

class DppStore {
  private passports: DigitalProductPassport[] = INITIAL_DPP_PASSPORTS;
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

  public getPassports(): DigitalProductPassport[] {
    return [...this.passports];
  }

  public getPassport(gtin: string, batchLotNumber: string): DigitalProductPassport | undefined {
    return this.passports.find(
      (p) => p.gtin === gtin && p.batchLotNumber === batchLotNumber
    );
  }

  public getSummary(): DppSummaryStatistics {
    const total = this.passports.length;
    const avgRecycled =
      total > 0
        ? Math.round(
            this.passports.reduce(
              (acc, p) => acc + p.circularityMetrics.recycledContentPercent,
              0
            ) / total
          )
        : 0;

    const eudrCount = this.passports.filter((p) =>
      p.components.every((c) => c.eudrZeroDeforestationVerified)
    ).length;

    return {
      totalActivePassports: total,
      coveredGtinCount: new Set(this.passports.map((p) => p.gtin)).size,
      averageRecycledContentPercent: avgRecycled,
      eudrCertifiedPassportsCount: eudrCount,
      qrScansThisMonth: 14820,
      esprComplianceStatus: 'FULLY_COMPLIANT_ESPR_2024',
    };
  }

  public createPassport(newPassport: Omit<DigitalProductPassport, 'id' | 'gs1DigitalLinkUrl' | 'verifiableCredentialHash' | 'status'>) {
    const id = `dpp-${Date.now()}`;
    const gs1DigitalLinkUrl = `https://id.certiwatch.io/01/${newPassport.gtin}/10/${newPassport.batchLotNumber}`;
    const verifiableCredentialHash =
      'w3c_vc_sha256_' +
      Array.from({ length: 48 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

    const passport: DigitalProductPassport = {
      ...newPassport,
      id,
      gs1DigitalLinkUrl,
      verifiableCredentialHash,
      status: 'ACTIVE_LIVE',
    };

    this.passports = [passport, ...this.passports];
    this.notify();
    return passport;
  }
}

export const dppStore = new DppStore();
