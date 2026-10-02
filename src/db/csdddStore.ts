import {
  SupplierDueDiligenceRecord,
  WhistleblowingGrievance,
  SupplierCapaItem,
  VigilancePlanSummary,
  CsdddRiskSeverity,
} from '../types/csddd';

export const INITIAL_CSDDD_SUPPLIERS: SupplierDueDiligenceRecord[] = [
  {
    supplierId: 'sup-1',
    supplierName: 'AgroLait Normandie SAS',
    country: 'France',
    countryRiskIndex: 12, // Très faible risque
    tier: 1,
    spendCriticality: 'CRITICAL',
    status: 'COMPLIANT_VERIFIED',
    overallDueDiligenceScore: 96,
    socialAuditType: 'SMETA_4_PILLARS',
    socialAuditScore: 98,
    socialAuditDate: '2026-02-14',
    socialAuditExpiryDate: '2028-02-13',
    socialAuditBody: 'Bureau Veritas Certification',
    charterSigned: true,
    charterSignedDate: '2025-11-20',
    charterSignatoryName: 'Jean-Marc Dupont',
    charterSignatoryRole: 'Directeur Général',
    charterEidasHash: 'eidas_sha256_99481a8b02c4819d721bb840192aef31',
    childLaborZeroToleranceVerified: true,
    forcedLaborRiskFreeVerified: true,
    livingWageAssessed: true,
    activeCapaCount: 0,
    grievancesCount: 0,
    risks: [
      {
        topic: 'CHILD_LABOUR',
        labelFr: 'Travail des enfants (OIT 138 & 182)',
        severity: 'LOW',
        probability: 'LOW',
        riskScore: 5,
        mitigationMeasure: 'Contrôles d’identité stricts à l’embauche et convention collective laitière',
        isCompliant: true,
      },
      {
        topic: 'HEALTH_AND_SAFETY',
        labelFr: 'Santé et sécurité au travail',
        severity: 'MEDIUM',
        probability: 'LOW',
        riskScore: 18,
        mitigationMeasure: 'EPI obligatoires, formation annuelle gestes et postures, CSSCT active',
        isCompliant: true,
      },
      {
        topic: 'LIVING_WAGE',
        labelFr: 'Salaire vital décent (OIT 100)',
        severity: 'LOW',
        probability: 'LOW',
        riskScore: 8,
        mitigationMeasure: 'Grille salariale audité : salaire minimum d’embauche 18% au-dessus du SMIC',
        isCompliant: true,
      },
    ],
  },
  {
    supplierId: 'sup-2',
    supplierName: 'Nordic Timber Supply AB',
    country: 'Suède',
    countryRiskIndex: 8,
    tier: 1,
    spendCriticality: 'HIGH',
    status: 'COMPLIANT_VERIFIED',
    overallDueDiligenceScore: 94,
    socialAuditType: 'SA8000',
    socialAuditScore: 96,
    socialAuditDate: '2025-10-10',
    socialAuditExpiryDate: '2028-10-09',
    socialAuditBody: 'SGS International',
    charterSigned: true,
    charterSignedDate: '2025-12-05',
    charterSignatoryName: 'Astrid Lindqvist',
    charterSignatoryRole: 'Chief Sustainability Officer',
    charterEidasHash: 'eidas_sha256_384018bcfa1902847a98bc1904a298cf',
    childLaborZeroToleranceVerified: true,
    forcedLaborRiskFreeVerified: true,
    livingWageAssessed: true,
    activeCapaCount: 0,
    grievancesCount: 0,
    risks: [
      {
        topic: 'HEALTH_AND_SAFETY',
        labelFr: 'Sécurité en milieu forestier & bûcheronnage',
        severity: 'MEDIUM',
        probability: 'LOW',
        riskScore: 22,
        mitigationMeasure: 'Matériel forestier certifié CE, capteurs de détection d’homme à terre GPS',
        isCompliant: true,
      },
      {
        topic: 'FREEDOM_OF_ASSOCIATION',
        labelFr: 'Liberté syndicale & convention suédoise',
        severity: 'LOW',
        probability: 'LOW',
        riskScore: 5,
        mitigationMeasure: 'Taux de syndicalisation 88%, accords de branche GS-facket',
        isCompliant: true,
      },
    ],
  },
  {
    supplierId: 'sup-3',
    supplierName: 'Café do Cerrado Exportadora',
    country: 'Brésil',
    countryRiskIndex: 44, // Risque modéré
    tier: 1,
    spendCriticality: 'CRITICAL',
    status: 'IN_PROGRESS_ASSESSMENT',
    overallDueDiligenceScore: 82,
    socialAuditType: 'FAIRTRADE_USA',
    socialAuditScore: 85,
    socialAuditDate: '2026-03-22',
    socialAuditExpiryDate: '2027-03-21',
    socialAuditBody: 'Intertek Latin America',
    charterSigned: true,
    charterSignedDate: '2026-01-18',
    charterSignatoryName: 'Rodrigo Silva',
    charterSignatoryRole: 'Directeur des Opérations',
    charterEidasHash: 'eidas_sha256_192083bc74019284719048a192bc9381',
    childLaborZeroToleranceVerified: true,
    forcedLaborRiskFreeVerified: true,
    livingWageAssessed: true,
    activeCapaCount: 1,
    grievancesCount: 1,
    risks: [
      {
        topic: 'FORCED_LABOUR',
        labelFr: 'Prévention du travail forcé (saisonniers)',
        severity: 'HIGH',
        probability: 'MEDIUM',
        riskScore: 48,
        mitigationMeasure: 'Audit inopiné des prestataires de recrutement saisonnier et contrats écrits',
        isCompliant: true,
      },
      {
        topic: 'INDIGENOUS_PEOPLES_RIGHTS',
        labelFr: 'Droits des communautés locales & terres',
        severity: 'MEDIUM',
        probability: 'LOW',
        riskScore: 28,
        mitigationMeasure: 'Vérification cadastrale CAR Brésil et absence de chevauchement avec réserves indigènes',
        isCompliant: true,
      },
    ],
  },
  {
    supplierId: 'sup-4',
    supplierName: 'Saphir Cacao Côte d’Ivoire',
    country: 'Côte d’Ivoire',
    countryRiskIndex: 68, // Risque élevé (filière cacao)
    tier: 1,
    spendCriticality: 'CRITICAL',
    status: 'CAPA_REQUIRED',
    overallDueDiligenceScore: 71,
    socialAuditType: 'SMETA_4_PILLARS',
    socialAuditScore: 74,
    socialAuditDate: '2025-11-18',
    socialAuditExpiryDate: '2026-11-17',
    socialAuditBody: 'Afnor Certification Afrique',
    charterSigned: true,
    charterSignedDate: '2025-10-15',
    charterSignatoryName: 'Amadou Koné',
    charterSignatoryRole: 'Président du Conseil d’Administration',
    charterEidasHash: 'eidas_sha256_883019ab728491029481bc9204918239',
    childLaborZeroToleranceVerified: false, // Attention : CAPA requise
    forcedLaborRiskFreeVerified: true,
    livingWageAssessed: true,
    activeCapaCount: 1,
    grievancesCount: 1,
    risks: [
      {
        topic: 'CHILD_LABOUR',
        labelFr: 'Travail des enfants dans les parcelles satellites',
        severity: 'CRITICAL',
        probability: 'HIGH',
        riskScore: 78,
        mitigationMeasure: 'Système CLMRS (Child Labour Monitoring & Remediation System) avec bourses scolaires',
        isCompliant: false, // Non-conformité en cours de résolution
      },
      {
        topic: 'LIVING_WAGE',
        labelFr: 'Revenu décent des cacaoculteurs (Living Income)',
        severity: 'HIGH',
        probability: 'MEDIUM',
        riskScore: 54,
        mitigationMeasure: 'Paiement effectif du Différentiel de Revenu Décent (DRD de 400 $/t fixé par le CCC)',
        isCompliant: true,
      },
    ],
  },
  {
    supplierId: 'sup-5',
    supplierName: 'BioPackaging Solutions France',
    country: 'France',
    countryRiskIndex: 12,
    tier: 1,
    spendCriticality: 'MEDIUM',
    status: 'COMPLIANT_VERIFIED',
    overallDueDiligenceScore: 95,
    socialAuditType: 'ECOVADIS_GOLD',
    socialAuditScore: 78,
    socialAuditDate: '2026-01-20',
    socialAuditExpiryDate: '2027-01-19',
    socialAuditBody: 'EcoVadis SAS',
    charterSigned: true,
    charterSignedDate: '2026-01-10',
    charterSignatoryName: 'Valérie Moreau',
    charterSignatoryRole: 'Directrice RSE',
    charterEidasHash: 'eidas_sha256_774910283bc91820491820bc91840291',
    childLaborZeroToleranceVerified: true,
    forcedLaborRiskFreeVerified: true,
    livingWageAssessed: true,
    activeCapaCount: 0,
    grievancesCount: 0,
    risks: [
      {
        topic: 'DISCRIMINATION_HARASSMENT',
        labelFr: 'Égalité salariale femmes-hommes',
        severity: 'LOW',
        probability: 'LOW',
        riskScore: 10,
        mitigationMeasure: 'Index égalité professionnelle 99/100, accord d’entreprise QVT',
        isCompliant: true,
      },
    ],
  },
  {
    supplierId: 'sup-6',
    supplierName: 'EcoTextile Vietnam Ltd',
    country: 'Vietnam',
    countryRiskIndex: 58,
    tier: 1,
    spendCriticality: 'HIGH',
    status: 'CAPA_REQUIRED',
    overallDueDiligenceScore: 68,
    socialAuditType: 'BSCI',
    socialAuditScore: 68,
    socialAuditDate: '2025-12-04',
    socialAuditExpiryDate: '2026-12-03',
    socialAuditBody: 'TÜV Rheinland Vietnam',
    charterSigned: true,
    charterSignedDate: '2025-11-01',
    charterSignatoryName: 'Nguyen Van Minh',
    charterSignatoryRole: 'Directeur d’Usine',
    charterEidasHash: 'eidas_sha256_55491029481bc920491829bc81029481',
    childLaborZeroToleranceVerified: true,
    forcedLaborRiskFreeVerified: true,
    livingWageAssessed: false,
    activeCapaCount: 1,
    grievancesCount: 1,
    risks: [
      {
        topic: 'HEALTH_AND_SAFETY',
        labelFr: 'Dépassement d’heures supplémentaires en pic',
        severity: 'HIGH',
        probability: 'HIGH',
        riskScore: 68,
        mitigationMeasure: 'Recrutement d’une 2e équipe de rotation et limitation contractuelle à 12h sup/semaine',
        isCompliant: false,
      },
      {
        topic: 'LIVING_WAGE',
        labelFr: 'Niveau de salaire vs Global Living Wage Coalition',
        severity: 'MEDIUM',
        probability: 'MEDIUM',
        riskScore: 45,
        mitigationMeasure: 'Étude d’alignement salarial pour combler l’écart de 12% avec le salaire vital de la région de Hanoï',
        isCompliant: false,
      },
    ],
  },
];

export const INITIAL_WHISTLEBLOWING_GRIEVANCES: WhistleblowingGrievance[] = [
  {
    id: 'grv-1',
    referenceNumber: 'VIGILANCE-GRV-2026-004',
    supplierId: 'sup-4',
    supplierName: 'Saphir Cacao Côte d’Ivoire',
    country: 'Côte d’Ivoire',
    topic: 'CHILD_LABOUR',
    reporterType: 'NGO_ALERT',
    reportedAt: '2026-08-14T09:30:00Z',
    severity: 'CRITICAL',
    status: 'CAPA_IN_REMEDIATION',
    title: 'Présence d’adolescents non scolarisés sur la section Soubré Est',
    description: 'Signalement émis par l’ONG locale Initiative Enfance & Forêt constatant l’aide de mineurs de 14 ans à la cueillette pendant les horaires scolaires sur 3 parcelles sous contrat.',
    evidenceFilesCount: 4,
    assignedInvestigator: 'Marc Lemoine (Directeur Audit Éthique)',
    remediationPlanSummary: 'Mise en place d’un agent CLMRS dédié, prise en charge des kits scolaires et engagement formel du chef de village.',
  },
  {
    id: 'grv-2',
    referenceNumber: 'VIGILANCE-GRV-2026-003',
    supplierId: 'sup-6',
    supplierName: 'EcoTextile Vietnam Ltd',
    country: 'Vietnam',
    topic: 'HEALTH_AND_SAFETY',
    reporterType: 'TRADE_UNION_DELEGATE',
    reportedAt: '2026-07-28T14:15:00Z',
    severity: 'HIGH',
    status: 'INVESTIGATION_UNDERWAY',
    title: 'Heures supplémentaires consécutives sans repos hebdomadaire',
    description: 'Alerte transmise via le canal sécurisé anonyme signalant des semaines de 62 heures travaillées sur la ligne de confection n°3 lors de la commande automne.',
    evidenceFilesCount: 2,
    assignedInvestigator: 'Claire Delacroix (Direction Achats)',
    remediationPlanSummary: 'Revue des feuilles de pointage électroniques et aménagement immédiat du temps de travail avec compensation financière majorée à 200%.',
  },
  {
    id: 'grv-3',
    referenceNumber: 'VIGILANCE-GRV-2026-001',
    supplierId: 'sup-3',
    supplierName: 'Café do Cerrado Exportadora',
    country: 'Brésil',
    topic: 'HEALTH_AND_SAFETY',
    reporterType: 'LOCAL_COMMUNITY',
    reportedAt: '2026-05-12T11:00:00Z',
    severity: 'MEDIUM',
    status: 'RESOLVED_CLOSED',
    title: 'Qualité de l’eau potable dans le campement des cueilleurs saisonniers',
    description: 'Problème de filtration sur un forage temporaire alimentant 40 saisonniers en période de récolte de café.',
    evidenceFilesCount: 3,
    assignedInvestigator: 'Intertek Latin America Audit Team',
    remediationPlanSummary: 'Installation de 2 citernes d’eau minérale scellées et nouveau système de filtration UV certifié conforme par la mairie de Patrocínio.',
    resolvedAt: '2026-06-02T16:00:00Z',
  },
];

export const INITIAL_CAPAS: SupplierCapaItem[] = [
  {
    id: 'capa-1',
    supplierId: 'sup-4',
    supplierName: 'Saphir Cacao Côte d’Ivoire',
    title: 'Plan de Remédiation Travail des Enfants & Enrôlement Scolaire',
    findingTopic: 'CHILD_LABOUR',
    severity: 'CRITICAL',
    rootCause: 'Éloignement de l’école primaire (8 km) et précarité financière des familles de métayers.',
    requiredAction: 'Financement du transport scolaire sécurisé, kits de fournitures et signature de l’engagement zéro travail d’enfants par les présidents de coopératives.',
    assignedManager: 'Amadou Koné / Équipe RSE CertiWatch',
    deadline: '2026-11-30',
    status: 'OPEN',
    progressPercent: 65,
    proofDocumentUri: 'https://vault.certiwatch.io/capa/capa-01-clmrs-soubre.pdf',
  },
  {
    id: 'capa-2',
    supplierId: 'sup-6',
    supplierName: 'EcoTextile Vietnam Ltd',
    title: 'Réorganisation du Temps de Travail & Arrêt des Dépassements',
    findingTopic: 'HEALTH_AND_SAFETY',
    severity: 'HIGH',
    rootCause: 'Sous-dimensionnement temporaire de l’équipe de couture lors du pic de commandes.',
    requiredAction: 'Embauche de 35 ouvriers qualifiés supplémentaires et limitation technique du système de badgeage à 48h/semaine.',
    assignedManager: 'Nguyen Van Minh',
    deadline: '2026-10-31',
    status: 'EVIDENCE_SUBMITTED',
    progressPercent: 90,
    proofDocumentUri: 'https://vault.certiwatch.io/capa/capa-02-pointage-hanoi.pdf',
  },
  {
    id: 'capa-3',
    supplierId: 'sup-3',
    supplierName: 'Café do Cerrado Exportadora',
    title: 'Audit Inopiné et Certification d’Eau Potable Saisonniers',
    findingTopic: 'HEALTH_AND_SAFETY',
    severity: 'MEDIUM',
    rootCause: 'Défaillance de la pompe du puits lors d’un épisode de sécheresse.',
    requiredAction: 'Pose de cuves filtrées en acier inoxydable et analyse bactériologique hebdomadaire.',
    assignedManager: 'Rodrigo Silva',
    deadline: '2026-06-01',
    status: 'VERIFIED_CLOSED',
    progressPercent: 100,
    proofDocumentUri: 'https://vault.certiwatch.io/capa/capa-03-eau-potable-brazil.pdf',
  },
];

export const INITIAL_VIGILANCE_PLAN_SUMMARY: VigilancePlanSummary = {
  reportingYear: 2026,
  totalSuppliersMonitored: 6,
  compliantSuppliersCount: 4,
  inProgressCount: 1,
  capaRequiredCount: 2,
  highRiskCount: 2,
  charterSignatureRatePercent: 100,
  socialAuditCoverageRatePercent: 100,
  openGrievancesCount: 2,
  resolvedGrievancesCount: 1,
  legalBasis: 'DIRECTIVE_UE_2024_1760_CSDDD',
};

class CsdddStore {
  private suppliers: SupplierDueDiligenceRecord[] = INITIAL_CSDDD_SUPPLIERS;
  private grievances: WhistleblowingGrievance[] = INITIAL_WHISTLEBLOWING_GRIEVANCES;
  private capas: SupplierCapaItem[] = INITIAL_CAPAS;
  private summary: VigilancePlanSummary = INITIAL_VIGILANCE_PLAN_SUMMARY;
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

  public getSuppliers(): SupplierDueDiligenceRecord[] {
    return [...this.suppliers];
  }

  public getGrievances(): WhistleblowingGrievance[] {
    return [...this.grievances];
  }

  public getCapas(): SupplierCapaItem[] {
    return [...this.capas];
  }

  public getSummary(): VigilancePlanSummary {
    const compliant = this.suppliers.filter((s) => s.status === 'COMPLIANT_VERIFIED').length;
    const capaReq = this.suppliers.filter((s) => s.status === 'CAPA_REQUIRED').length;
    const inProg = this.suppliers.filter((s) => s.status === 'IN_PROGRESS_ASSESSMENT').length;
    const openGrv = this.grievances.filter((g) => g.status !== 'RESOLVED_CLOSED' && g.status !== 'DISMISSED').length;
    const closedGrv = this.grievances.filter((g) => g.status === 'RESOLVED_CLOSED').length;

    return {
      ...this.summary,
      totalSuppliersMonitored: this.suppliers.length,
      compliantSuppliersCount: compliant,
      inProgressCount: inProg,
      capaRequiredCount: capaReq,
      openGrievancesCount: openGrv,
      resolvedGrievancesCount: closedGrv,
    };
  }

  public signCharter(supplierId: string, signatoryName: string, signatoryRole: string) {
    const eidasHash = 'eidas_sha256_' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    this.suppliers = this.suppliers.map((s) => {
      if (s.supplierId === supplierId) {
        return {
          ...s,
          charterSigned: true,
          charterSignedDate: new Date().toISOString().split('T')[0],
          charterSignatoryName: signatoryName,
          charterSignatoryRole: signatoryRole,
          charterEidasHash: eidasHash,
        };
      }
      return s;
    });
    this.notify();
    return eidasHash;
  }

  public submitGrievance(data: Omit<WhistleblowingGrievance, 'id' | 'referenceNumber' | 'reportedAt' | 'evidenceFilesCount' | 'assignedInvestigator'>) {
    const newGrievance: WhistleblowingGrievance = {
      ...data,
      id: `grv_${Date.now()}`,
      referenceNumber: `VIGILANCE-GRV-2026-${Math.floor(Math.random() * 900 + 100)}`,
      reportedAt: new Date().toISOString(),
      evidenceFilesCount: 1,
      assignedInvestigator: 'Comité Éthique & Devoir de Vigilance CertiWatch',
    };
    this.grievances = [newGrievance, ...this.grievances];
    this.notify();
    return newGrievance;
  }

  public updateCapaProgress(capaId: string, progressPercent: number, status: SupplierCapaItem['status']) {
    this.capas = this.capas.map((c) => {
      if (c.id === capaId) {
        return {
          ...c,
          progressPercent,
          status,
        };
      }
      return c;
    });
    this.notify();
  }

  public updateGrievanceStatus(grievanceId: string, status: WhistleblowingGrievance['status']) {
    this.grievances = this.grievances.map((g) => {
      if (g.id === grievanceId) {
        return {
          ...g,
          status,
          resolvedAt: status === 'RESOLVED_CLOSED' ? new Date().toISOString() : g.resolvedAt,
        };
      }
      return g;
    });
    this.notify();
  }
}

export const csdddStore = new CsdddStore();
