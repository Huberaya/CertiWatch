export type DppProductCategory =
  | 'FOOD_DAIRY' // Produits laitiers & desserts bio
  | 'HOT_BEVERAGES' // Café, Cacao & Chocolat durable
  | 'TEXTILE_APPAREL' // Uniformes & sacs coton GOTS
  | 'WOOD_FURNITURE' // Palettes & mobilier bois FSC
  | 'ECO_PACKAGING'; // Emballages carton & bioplastiques rPET

export type RecyclabilityClass = 'CLASS_A_EXCELLENT' | 'CLASS_B_GOOD' | 'CLASS_C_MODERATE' | 'CLASS_D_POOR';

export interface DppRawMaterialComponent {
  id: string;
  name: string;
  percentageWeight: number; // e.g. 65%
  supplierId: string;
  supplierName: string;
  countryOfOrigin: string;
  originPlotGps?: string;
  certifiedStandard: string; // e.g. "Ecocert Bio", "FSC-100%", "GOTS Organic", "Fairtrade"
  eudrZeroDeforestationVerified: boolean;
  unitCarbonFootprintKgCo2e: number;
}

export interface DigitalProductPassport {
  id: string;
  gtin: string; // Global Trade Item Number (EAN-13, e.g. "3045320084912")
  batchLotNumber: string; // e.g. "LOT-2026-N904"
  productName: string;
  brand: string;
  category: DppProductCategory;
  manufacturingDate: string;
  bestBeforeDate?: string;
  manufacturingFacility: {
    factoryName: string;
    city: string;
    country: string;
    gpsCoordinates: string;
    certifications: string[]; // e.g. ["ISO 14001", "FSSC 22000"]
  };
  // Circularity & ESG metrics (ESPR 2024 Compliance)
  circularityMetrics: {
    recycledContentPercent: number; // e.g. 85%
    recyclabilityClass: RecyclabilityClass;
    unitCarbonFootprintKgCo2e: number;
    waterFootprintLiters: number;
    csdddDueDiligenceVerified: boolean;
    childLaborFreeGuaranteed: boolean;
  };
  // Traceability & Ingredients
  components: DppRawMaterialComponent[];
  // Digital Links & Verification
  gs1DigitalLinkUrl: string; // e.g. "https://id.certiwatch.io/01/3045320084912/10/LOT-2026-N904"
  verifiableCredentialHash: string; // W3C cryptographic seal
  status: 'ACTIVE_LIVE' | 'PROTOTYPE_DRAFT' | 'RECALLED_REVOKED';
  qrCodeSvgDataUri?: string;
}

export interface DppSummaryStatistics {
  totalActivePassports: number;
  coveredGtinCount: number;
  averageRecycledContentPercent: number;
  eudrCertifiedPassportsCount: number;
  qrScansThisMonth: number;
  esprComplianceStatus: 'FULLY_COMPLIANT_ESPR_2024' | 'ACTION_REQUIRED';
}
