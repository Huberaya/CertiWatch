import { RegulatoryWatchItem, ContractClauseAnalysis } from '../types/ai';

export const SEED_REGULATORY_WATCH: RegulatoryWatchItem[] = [
  {
    id: 'reg-01',
    standardOrLaw: 'Règlement EUDR 2023/1115',
    title: 'Exigence de Géolocalisation & Déclaration TRACES-NT (Zéro Déforestation)',
    effectiveDate: '2025-12-30',
    status: 'UPCOMING',
    impactSeverity: 'CRITICAL',
    summary:
      'Interdiction d’importation et de commercialisation dans l’UE de 7 commodités (Bois, Papier/Carton, Cacao, Soja, Café, Caoutchouc, Huile de palme) sans polygone GPS et sans preuve d’absence de déforestation après le 31/12/2020.',
    affectedPurchasingCategories: ['Cacao & Dérivés', 'Carton & Emballages', 'Bois & Cellulose', 'Soja'],
    affectedSuppliersCount: 4,
    recommendedActionPlan:
      'Exiger des fournisseurs de cacao et de cellulose le dépôt de leurs polygones WGS84 et la référence DDS TRACES-NT via le portail CertiWatch.',
  },
  {
    id: 'reg-02',
    standardOrLaw: 'Standard GOTS Version 7.0',
    title: 'Interdiction stricte des PFAS et Diligence Raisonnable Renforcée',
    effectiveDate: '2025-03-01',
    status: 'IN_FORCE',
    impactSeverity: 'MAJOR',
    summary:
      'La norme GOTS 7.0 introduit l’interdiction totale de l’ensemble des substances chimiques de la famille des PFAS, ainsi qu’une évaluation obligatoire de l’impact sur les droits humains des sous-traitants de filature et de tissage.',
    affectedPurchasingCategories: ['Coton & Fibres Végétales', 'Fils & Tissus', 'Teintures & Façonnage Textile'],
    affectedSuppliersCount: 2,
    recommendedActionPlan:
      'Vérifier que les certificats GOTS enregistrés mentionnent explicitement le référentiel v7.0 lors du renouvellement annuel.',
  },
  {
    id: 'reg-03',
    standardOrLaw: 'Directive CSDDD 2024/1760/UE',
    title: 'Devoir de Vigilance des Entreprises en Matière de Durabilité',
    effectiveDate: '2026-07-26',
    status: 'UPCOMING',
    impactSeverity: 'CRITICAL',
    summary:
      'Obligation légale d’identifier, de prévenir et d’atténuer les atteintes aux droits humains et à l’environnement sur l’ensemble de la chaîne d’activités amont et aval. Amende maximale jusqu’à 5% du CA mondial.',
    affectedPurchasingCategories: ['Toutes familles d’achats stratégiques'],
    affectedSuppliersCount: 6,
    recommendedActionPlan:
      'Générer un pack d’audit officiel certifié CertiWatch et auditer 100% des fournisseurs affichant un score de risque > 50/100.',
  },
  {
    id: 'reg-04',
    standardOrLaw: 'FSC-STD-40-004 v3.2',
    title: 'Alignement Chaîne de Traçabilité FSC avec les exigences EUDR',
    effectiveDate: '2025-06-15',
    status: 'IN_FORCE',
    impactSeverity: 'MODERATE',
    summary:
      'FSC déploie le module "FSC Aligned for EUDR" pour certifier que les grumes et pâtes à papier respectent simultanément la légalité forestière et la délimitation géographique des concessions.',
    affectedPurchasingCategories: ['Carton & Emballages', 'Bois & Cellulose'],
    affectedSuppliersCount: 2,
    recommendedActionPlan:
      'Activer le contrôle automatique de conformité croisée FSC/EUDR dans la matrice de conformité CertiWatch.',
  },
];

export const SEED_CONTRACT_ANALYSES: ContractClauseAnalysis[] = [
  {
    id: 'analysis-01',
    documentTitle: 'Contrat-Cadre d’Approvisionnement Matières Premières Durables v2025',
    complianceRating: 'MODERATE_RISK',
    score: 74,
    csrdCsdddReadiness:
      'Couverture partielle des exigences CSRD ESRS S2. Manque de clauses spécifiques sur les données de traçabilité EUDR et le droit d’audit inopiné.',
    analyzedAt: '2026-09-22T14:30:00Z',
    extractedClauses: [
      {
        topic: 'Conformité des Certifications & Continuité',
        textExcerpt:
          'Le Fournisseur s’engage à maintenir valides les certifications de qualité requises pour les produits livrés.',
        verdict: 'AMBIGU',
        riskExplanation:
          'Absence de délai d’obligation de notification en cas de suspension ou révocation de certificat par l’organisme certificateur.',
        recommendedWording:
          'Le Fournisseur s’engage à notifier le Donneur d’Ordre sous 48 heures ouvrées de toute révocation, suspension ou expiration sans renouvellement de ses certifications GOTS, FSC ou Ecocert.',
      },
      {
        topic: 'Zéro Déforestation & Règlement EUDR',
        textExcerpt:
          'Le Fournisseur déclare respecter la législation environnementale de son pays de production.',
        verdict: 'NON_CONFORME',
        riskExplanation:
          'Clause insuffisante au regard du Règlement EUDR (UE 2023/1115) qui exige une obligation de résultat sur la date de déforestation post-2020 et la fourniture des coordonnées GPS.',
        recommendedWording:
          'Le Fournisseur garantit que les marchandises ne proviennent d’aucune parcelle déboisée après le 31 décembre 2020 et s’engage à transmettre les coordonnées GPS (polygones WGS84) et le numéro de déclaration TRACES-NT 15 jours avant toute expédition.',
      },
      {
        topic: 'Audits Sociaux & Devoir de Vigilance (OIT)',
        textExcerpt:
          'Le Fournisseur garantit le respect des conventions fondamentales de l’OIT, notamment l’interdiction du travail des enfants et du travail forcé.',
        verdict: 'CONFORME',
        riskExplanation:
          'Clause conforme aux standards internationaux, bien articulée avec les conventions OIT 138 et 182.',
        recommendedWording: 'Clause validée sans modification nécessaire.',
      },
    ],
    remediationRoadmap: [
      'Ajouter un avenant EUDR avec clause de résiliation immédiate en cas de défaut de coordonnées GPS.',
      'Imposer un droit d’audit inopiné par un organisme tiers indépendant (OTI).',
      'Intégrer une clause d’indemnisation en cas de blocage douanier pour défaut de conformité réglementaire.',
    ],
  },
];
