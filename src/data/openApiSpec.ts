import { ApiEndpoint } from '../types/openapi';

export const OPENAPI_V3_DOCUMENT = {
  openapi: '3.0.3',
  info: {
    title: 'CertiWatch Enterprise B2B API',
    version: '1.4.2',
    description:
      'API REST certifiée pour l’intégration ERP (SAP S/4HANA, Coupa, Ivalua, Celonis), le contrôle prédictif de validité des certifications fournisseurs, la gestion des webhooks HMAC-SHA256, le calcul Scope 3 GHG Protocol et la vérification de chaîne de Merkle.',
    contact: {
      name: 'CertiWatch Developer Support',
      email: 'devops@certiwatch.io',
      url: 'https://certiwatch.io/docs',
    },
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
    },
  },
  servers: [
    {
      url: 'https://api.certiwatch.io/v1',
      description: 'Production Anycast Europe (europe-west2 / europe-west9)',
    },
    {
      url: 'https://api-sandbox.certiwatch.io/v1',
      description: 'Environnement de Sandbox / Test ERP',
    },
  ],
  security: [
    {
      ApiKeyAuth: [],
    },
    {
      BearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'Clé d’API d’organisation (ex: cw_live_sk_...)',
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Jeton JWT OAuth2 / Clerk Enterprise SSO',
      },
    },
  },
  tags: [
    { name: 'Achats & Blocage ERP', description: 'Validation en temps réel des bons de commandes SAP/Coupa' },
    { name: 'Fournisseurs & Référentiel', description: 'Consultation et enrôlement des fournisseurs' },
    { name: 'Certificats & Validité', description: 'Recherche et vérification cryptographique' },
    { name: 'Webhooks & Intégrations', description: 'Gestion des flux sortants signés HMAC-SHA256' },
    { name: 'Audit & Chaîne Cryptographique', description: 'Preuve d’intégrité Merkle SHA-256' },
    { name: 'Bilan Carbone Scope 3', description: '15 catégories GHG Protocol & trajectoire Net-Zero' },
    { name: 'Passeport Numérique DPP', description: 'Résolution GS1 Digital Link ESPR' },
  ],
};

export const OPENAPI_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'matrix-simulate',
    path: '/api/v1/matrix/simulate',
    method: 'POST',
    summary: 'Valider un bon de commande ERP (SAP / Coupa)',
    description:
      'Vérifie la conformité réglementaire et certifiante des lignes d’un bon de commande d’achat (Purchase Order). Déclenche un blocage dur immédiat si un standard obligatoire manque ou est expiré.',
    tag: 'Achats & Blocage ERP',
    requiresAuth: true,
    requestBodyExample: {
      poNumber: 'PO-2026-SAP-98124',
      supplierId: 'sup-1',
      productCategory: 'Textiles Biologiques & Coton',
      orderAmountEur: 142500,
      deliveryCountry: 'FR',
      requiredStandards: ['GOTS', 'OEKO-TEX'],
      hasExplicitDerogation: false,
    },
    responseExamples: [
      {
        status: 200,
        description: 'Commande analysée et autorisée par la matrice',
        body: {
          decision: 'ALLOWED',
          blocked: false,
          poNumber: 'PO-2026-SAP-98124',
          complianceScore: 98,
          validatedStandards: ['GOTS', 'OEKO-TEX'],
          missingStandards: [],
          reasons: ['Fournisseur certifié GOTS et OEKO-TEX Standard 100 valides.'],
          timestamp: '2026-10-04T10:00:00Z',
          executionTimeMs: 18,
        },
      },
      {
        status: 403,
        description: 'Commande bloquée pour non-conformité certifiante',
        body: {
          decision: 'BLOCKED',
          blocked: true,
          poNumber: 'PO-2026-SAP-98124',
          complianceScore: 32,
          missingStandards: ['GOTS'],
          blockingRuleId: 'rule-textiles-bio-01',
          reasons: ['Certificat GOTS expiré depuis plus de 15 jours. Blocage achat actif.'],
          derogationPossible: true,
          timestamp: '2026-10-04T10:00:00Z',
        },
      },
    ],
  },
  {
    id: 'suppliers-list',
    path: '/api/v1/suppliers',
    method: 'GET',
    summary: 'Lister les fournisseurs avec scores de risque',
    description:
      'Récupère le répertoire complet des fournisseurs du tenant actif avec scores de risque financier, ESG et statuts de conformité.',
    tag: 'Fournisseurs & Référentiel',
    requiresAuth: true,
    parameters: [
      {
        name: 'tier',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Filtrer par niveau (TIER_1, TIER_2, TIER_3)',
        example: 'TIER_1',
      },
      {
        name: 'status',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Filtrer par statut (COMPLIANT, AT_RISK, NON_COMPLIANT)',
        example: 'COMPLIANT',
      },
    ],
    responseExamples: [
      {
        status: 200,
        description: 'Liste paginée des fournisseurs',
        body: {
          total: 8,
          data: [
            {
              id: 'sup-1',
              name: 'EcoWeave Organics Ltd',
              sirenDuns: 'FR849102938',
              country: 'France',
              tier: 'TIER_1',
              riskScore: 12,
              altmanZScore: 3.42,
              complianceStatus: 'COMPLIANT',
              activeCertificatesCount: 3,
            },
          ],
        },
      },
    ],
  },
  {
    id: 'certificates-verify',
    path: '/api/v1/certificates/{id}/verify',
    method: 'GET',
    summary: 'Vérifier la validité cryptographique d’un certificat',
    description:
      'Interroge en temps réel le registre officiel (Ecocert, GOTS, FSC) et contrôle l’empreinte SHA-256 scellée dans la chaîne de Merkle.',
    tag: 'Certificats & Validité',
    requiresAuth: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        type: 'string',
        description: 'Identifiant unique du certificat (ex: cert-1)',
        example: 'cert-1',
      },
    ],
    responseExamples: [
      {
        status: 200,
        description: 'Certificat vérifié et valide',
        body: {
          certificateId: 'cert-1',
          standard: 'GOTS',
          certificateNumber: 'GOTS-2024-8849-FR',
          supplierName: 'EcoWeave Organics Ltd',
          status: 'VALID',
          validUntil: '2027-04-15',
          daysUntilExpiration: 558,
          officialRegistryMatch: true,
          merkleProofHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          integrityVerified: true,
        },
      },
    ],
  },
  {
    id: 'webhooks-subscribe',
    path: '/api/v1/webhooks/subscribe',
    method: 'POST',
    summary: 'Souscrire un webhook ERP sécurisé HMAC-SHA256',
    description:
      'Enregistre une URL de destination ERP. Chaque charge utile sera signée avec l’en-tête X-CertiWatch-Signature: sha256=... pour garantir l’authenticité et l’intégrité.',
    tag: 'Webhooks & Intégrations',
    requiresAuth: true,
    requestBodyExample: {
      targetUrl: 'https://erp-gateway.danone.com/api/v1/compliance/webhooks',
      subscribedEvents: [
        'certificate.expired',
        'certificate.revoked',
        'order.blocked',
        'supplier.risk_elevated',
      ],
      secretKey: 'whsec_hmac_sha256_enterprise_99182',
    },
    responseExamples: [
      {
        status: 201,
        description: 'Webhook enregistré avec succès',
        body: {
          webhookId: 'wh-sub-99182',
          targetUrl: 'https://erp-gateway.danone.com/api/v1/compliance/webhooks',
          status: 'ACTIVE',
          createdAt: '2026-10-04T10:00:00Z',
          signatureAlgorithm: 'HMAC-SHA256',
        },
      },
    ],
  },
  {
    id: 'audit-verify-chain',
    path: '/api/v1/audit/verify-chain',
    method: 'GET',
    summary: 'Auditer l’intégrité de la chaîne de Merkle SHA-256',
    description:
      'Recalcule mathématiquement la totalité des blocs de la piste d’audit pour garantir qu’aucune falsification n’a été opérée sur la base de données.',
    tag: 'Audit & Chaîne Cryptographique',
    requiresAuth: true,
    responseExamples: [
      {
        status: 200,
        description: 'Piste d’audit intègre et certifiée',
        body: {
          totalBlocks: 14,
          merkleRootHash: '9f83b2a8d11c7e48b590e2a39281a0e1c2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
          chainCompromised: false,
          sealedAt: '2026-10-04T10:00:00Z',
          certifiedCompliant: 'NF Z42-013 & eIDAS',
        },
      },
    ],
  },
  {
    id: 'carbon-scope3',
    path: '/api/v1/carbon/scope3/summary',
    method: 'GET',
    summary: 'Consulter le bilan carbone Scope 3 (GHG Protocol)',
    description:
      'Retourne la ventilation détaillée des émissions Scope 3 sur les 15 catégories du GHG Protocol avec trajectoire Net-Zero SBTi 1.5°C.',
    tag: 'Bilan Carbone Scope 3',
    requiresAuth: true,
    responseExamples: [
      {
        status: 200,
        description: 'Bilan Scope 3 consolidé',
        body: {
          reportingYear: 2026,
          totalEmissionsTonsCo2e: 48520,
          scope1Tons: 1250,
          scope2Tons: 3100,
          scope3Tons: 44170,
          scope3Percentage: 91.0,
          category1PurchasedGoodsTons: 32400,
          targetSbti2030Tons: 29112,
          onTrack: true,
        },
      },
    ],
  },
  {
    id: 'dpp-resolve',
    path: '/api/v1/dpp/{gs1DigitalLink}',
    method: 'GET',
    summary: 'Résoudre un Passeport Numérique de Produit (DPP)',
    description:
      'Résout le QR code GS1 Digital Link d’un produit manufacturé et renvoie sa nomenclature BOM, son empreinte carbone unitaire et son indice de réparabilité.',
    tag: 'Passeport Numérique DPP',
    requiresAuth: false,
    parameters: [
      {
        name: 'gs1DigitalLink',
        in: 'path',
        required: true,
        type: 'string',
        description: 'Code GS1 GTIN ou identifiant DPP (ex: 01036000291452)',
        example: '01036000291452',
      },
    ],
    responseExamples: [
      {
        status: 200,
        description: 'Passeport numérique résolu',
        body: {
          gtin: '01036000291452',
          productName: 'T-Shirt Coton Bio Équitable 180g',
          originCountry: 'Portugal',
          carbonFootprintKgCo2: 2.4,
          repairabilityIndex: 8.8,
          recyclabilityRate: 94.0,
          activeCertificates: ['GOTS-2024-8849-FR', 'OEKO-TEX-STANDARD-100'],
          esprComplianceVerified: true,
        },
      },
    ],
  },
];
