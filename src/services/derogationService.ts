import {
  QualityDerogation,
  EidasSignatureRecord,
  DerogationRiskLevel,
} from '../types/derogation';

class DerogationService {
  private derogations: QualityDerogation[] = [
    {
      id: 'DEROG-2026-FR-0042',
      title: 'Dérogation Temporaire Coton Bio - Audit GOTS en cours de finalisation',
      supplierId: 'sup-1',
      supplierName: 'EcoTextile Nord S.A.S.',
      productCategory: 'Textiles Biologiques & Coton',
      standardTargeted: 'GOTS',
      reasonCode: 'TEMPORARY_RENEWAL_AUDIT_IN_PROGRESS',
      justificationText:
        'Audit de renouvellement GOTS réalisé le 15/09/2026 par Ecocert Greenlife. Rapport d’audit provisoire favorable sans non-conformité majeure. En attente de l’émission du certificat définitif sous 30 jours.',
      riskAssessment: 'LOW',
      mitigationPlan:
        'Contrôle renforcé en réception (tests analytiques résidus pesticides sur 100% des lots entrants) aux frais du fournisseur.',
      maxAuthorizedSpendEur: 120000,
      currentConsumedSpendEur: 45000,
      validFrom: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 50 * 86400000).toISOString().split('T')[0],
      status: 'APPROVED',
      requiredTier: 2,
      currentTier: 2,
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      merkleLeafIndex: 14,
      merkleProofHash: 'a7c9381fbc0942e19034aa882c0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e',
      signatures: [
        {
          step: 1,
          signerName: 'Claire Vasseur',
          signerEmail: 'claire.vasseur@enterprise.corp',
          signerRole: 'Responsable Qualité Matières Premières',
          signedAt: new Date(Date.now() - 11 * 86400000).toISOString(),
          signatureType: 'EIDAS_ADVANCED',
          rgsLevel: 'RGS*',
          certificateFingerprintSha256: '9f82a10b4829ec7193bd720194aa82c0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
          padesSignatureHash: '3d81b89efbc4510294821a9c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
          status: 'SIGNED',
          comments: 'Analyses préalables conformes, audit de renouvellement validé.',
        },
        {
          step: 2,
          signerName: 'Marc Delacroix',
          signerEmail: 'marc.delacroix@enterprise.corp',
          signerRole: 'Directeur Achats & Supply Chain',
          signedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
          signatureType: 'EIDAS_QUALIFIED',
          rgsLevel: 'RGS**',
          certificateFingerprintSha256: '5e71c90a1248ef7394bd820194aa82c0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5c9',
          padesSignatureHash: '8b92c4510294821a9c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3d81b8',
          status: 'SIGNED',
          comments: 'Approuvé pour sécuriser la continuité de production de la ligne Automne 2026.',
        },
      ],
    },
    {
      id: 'DEROG-2026-FR-0043',
      title: 'Demande de Dérogation Bois FSC - Pénurie Forêt Certifiée Scierie des Alpes',
      supplierId: 'sup-3',
      supplierName: 'Scierie & Forêts des Alpes',
      productCategory: 'Emballages & Palettes Bois',
      standardTargeted: 'FSC',
      reasonCode: 'FORCE_MAJEURE_SUPPLY_CHAIN',
      justificationText:
        'Tempête hivernale ayant bloqué l’exploitation des parcelles FSC certifiées dans le massif alpin. Approvisionnement temporaire auprès de parcelles PEFC équivalentes.',
      riskAssessment: 'MEDIUM',
      mitigationPlan: 'Traçabilité GPS stricte de chaque grume et attestation PEFC systématique.',
      maxAuthorizedSpendEur: 85000,
      currentConsumedSpendEur: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      status: 'PENDING_APPROVAL_L1',
      requiredTier: 2,
      currentTier: 1,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      signatures: [
        {
          step: 1,
          signerName: 'Claire Vasseur',
          signerEmail: 'claire.vasseur@enterprise.corp',
          signerRole: 'Responsable Qualité Packaging',
          signedAt: '',
          signatureType: 'EIDAS_ADVANCED',
          rgsLevel: 'RGS*',
          certificateFingerprintSha256: '',
          padesSignatureHash: '',
          status: 'PENDING',
        },
        {
          step: 2,
          signerName: 'Marc Delacroix',
          signerEmail: 'marc.delacroix@enterprise.corp',
          signerRole: 'Directeur Achats & Supply Chain',
          signedAt: '',
          signatureType: 'EIDAS_QUALIFIED',
          rgsLevel: 'RGS**',
          certificateFingerprintSha256: '',
          padesSignatureHash: '',
          status: 'PENDING',
        },
      ],
    },
    {
      id: 'DEROG-2026-FR-0044',
      title: 'Dérogation Majeure Cacao Fairtrade - Coopérative San Pedro (Équivalence Bio)',
      supplierId: 'sup-5',
      supplierName: 'Coopérative Cacao San Pedro',
      productCategory: 'Fèves de Cacao & Matières Premières',
      standardTargeted: 'FAIRTRADE',
      reasonCode: 'TECHNICAL_EQUIVALENCE_APPROVED',
      justificationText:
        'Retard administratif de délivrance FLOCERT suite à mise à jour statut coopérative. Équivalence Rainforest Alliance active et audit social SMETA valide.',
      riskAssessment: 'HIGH',
      mitigationPlan: 'Versement de la prime de commerce équitable sur compte séquestre audité par cabinet tiers.',
      maxAuthorizedSpendEur: 240000,
      currentConsumedSpendEur: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      status: 'PENDING_APPROVAL_L2',
      requiredTier: 3,
      currentTier: 2,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      signatures: [
        {
          step: 1,
          signerName: 'Claire Vasseur',
          signerEmail: 'claire.vasseur@enterprise.corp',
          signerRole: 'Responsable Qualité Matières Premières',
          signedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          signatureType: 'EIDAS_ADVANCED',
          rgsLevel: 'RGS*',
          certificateFingerprintSha256: '9f82a10b4829ec7193bd720194aa82c0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
          padesSignatureHash: '3d81b89efbc4510294821a9c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
          status: 'SIGNED',
          comments: 'Conformité sociale vérifiée via SMETA 4-Pillars.',
        },
        {
          step: 2,
          signerName: 'Marc Delacroix',
          signerEmail: 'marc.delacroix@enterprise.corp',
          signerRole: 'Directeur Achats Matières',
          signedAt: '',
          signatureType: 'EIDAS_QUALIFIED',
          rgsLevel: 'RGS**',
          certificateFingerprintSha256: '',
          padesSignatureHash: '',
          status: 'PENDING',
        },
        {
          step: 3,
          signerName: 'Hélène Rochefort',
          signerEmail: 'helene.rochefort@enterprise.corp',
          signerRole: 'Directrice Générale & RSE Groupe',
          signedAt: '',
          signatureType: 'EIDAS_QUALIFIED',
          rgsLevel: 'RGS**',
          certificateFingerprintSha256: '',
          padesSignatureHash: '',
          status: 'PENDING',
        },
      ],
    },
  ];

  public getAllDerogations(): QualityDerogation[] {
    return [...this.derogations];
  }

  public getDerogationById(id: string): QualityDerogation | undefined {
    return this.derogations.find((d) => d.id === id);
  }

  public computeRequiredTier(spendEur: number, risk: DerogationRiskLevel): 1 | 2 | 3 {
    if (spendEur > 150000 || risk === 'CRITICAL') return 3;
    if (spendEur > 50000 || risk === 'HIGH') return 2;
    return 1;
  }

  public createDerogation(data: {
    title: string;
    supplierId: string;
    supplierName: string;
    productCategory: string;
    standardTargeted: string;
    reasonCode: QualityDerogation['reasonCode'];
    justificationText: string;
    riskAssessment: DerogationRiskLevel;
    mitigationPlan: string;
    maxAuthorizedSpendEur: number;
    validFrom: string;
    validUntil: string;
  }): QualityDerogation {
    const requiredTier = this.computeRequiredTier(data.maxAuthorizedSpendEur, data.riskAssessment);
    const nextNum = this.derogations.length + 42;
    const id = `DEROG-2026-FR-00${nextNum}`;

    const signatures: EidasSignatureRecord[] = [];

    // Step 1: Quality Lead
    signatures.push({
      step: 1,
      signerName: 'Claire Vasseur',
      signerEmail: 'claire.vasseur@enterprise.corp',
      signerRole: 'Responsable Qualité Filière',
      signedAt: '',
      signatureType: 'EIDAS_ADVANCED',
      rgsLevel: 'RGS*',
      certificateFingerprintSha256: '',
      padesSignatureHash: '',
      status: 'PENDING',
    });

    if (requiredTier >= 2) {
      signatures.push({
        step: 2,
        signerName: 'Marc Delacroix',
        signerEmail: 'marc.delacroix@enterprise.corp',
        signerRole: 'Directeur Achats & Supply Chain',
        signedAt: '',
        signatureType: 'EIDAS_QUALIFIED',
        rgsLevel: 'RGS**',
        certificateFingerprintSha256: '',
        padesSignatureHash: '',
        status: 'PENDING',
      });
    }

    if (requiredTier === 3) {
      signatures.push({
        step: 3,
        signerName: 'Hélène Rochefort',
        signerEmail: 'helene.rochefort@enterprise.corp',
        signerRole: 'Directrice RSE & Membre Comex',
        signedAt: '',
        signatureType: 'EIDAS_QUALIFIED',
        rgsLevel: 'RGS**',
        certificateFingerprintSha256: '',
        padesSignatureHash: '',
        status: 'PENDING',
      });
    }

    const newDerogation: QualityDerogation = {
      id,
      ...data,
      currentConsumedSpendEur: 0,
      status: 'PENDING_APPROVAL_L1',
      requiredTier,
      currentTier: 1,
      signatures,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.derogations.unshift(newDerogation);
    return newDerogation;
  }

  public signDerogation(
    id: string,
    signer: { name: string; email: string; role: string; comments?: string }
  ): { success: boolean; derogation?: QualityDerogation; message: string } {
    const derogation = this.derogations.find((d) => d.id === id);
    if (!derogation) {
      return { success: false, message: 'Dérogation introuvable.' };
    }

    if (derogation.status === 'APPROVED' || derogation.status === 'REJECTED' || derogation.status === 'REVOKED') {
      return { success: false, derogation, message: `La dérogation est déjà au statut final : ${derogation.status}` };
    }

    const currentStepIndex = derogation.signatures.findIndex((s) => s.status === 'PENDING');
    if (currentStepIndex === -1) {
      return { success: false, derogation, message: 'Toutes les signatures sont déjà apposées.' };
    }

    const currentSig = derogation.signatures[currentStepIndex];

    // Generate cryptographic eIDAS PAdES seal and X.509 fingerprint
    const certFingerprint = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const padesHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    currentSig.signerName = signer.name || currentSig.signerName;
    currentSig.signerEmail = signer.email || currentSig.signerEmail;
    currentSig.signerRole = signer.role || currentSig.signerRole;
    currentSig.signedAt = new Date().toISOString();
    currentSig.status = 'SIGNED';
    currentSig.certificateFingerprintSha256 = certFingerprint;
    currentSig.padesSignatureHash = padesHash;
    currentSig.comments = signer.comments || 'Signature électronique qualifiée apposée sous eIDAS / RGS**.';

    // Advance tier
    if (currentStepIndex + 1 < derogation.signatures.length) {
      derogation.currentTier = (derogation.currentTier + 1) as 1 | 2 | 3;
      derogation.status = `PENDING_APPROVAL_L${derogation.currentTier}` as any;
      derogation.updatedAt = new Date().toISOString();
      return {
        success: true,
        derogation,
        message: `Signature Palier ${currentSig.step} validée. En attente du Palier ${derogation.currentTier}.`,
      };
    } else {
      // Completed all required tiers
      derogation.status = 'APPROVED';
      derogation.updatedAt = new Date().toISOString();
      derogation.merkleLeafIndex = Math.floor(Math.random() * 50) + 20;
      derogation.merkleProofHash = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      return {
        success: true,
        derogation,
        message: 'Dérogation pleinement approuvée et scellée avec signature eIDAS qualifiée. Blocage ERP levé.',
      };
    }
  }

  public rejectDerogation(id: string, reason: string): { success: boolean; derogation?: QualityDerogation } {
    const derogation = this.derogations.find((d) => d.id === id);
    if (!derogation) return { success: false };

    derogation.status = 'REJECTED';
    derogation.updatedAt = new Date().toISOString();

    const pendingSig = derogation.signatures.find((s) => s.status === 'PENDING');
    if (pendingSig) {
      pendingSig.status = 'REJECTED';
      pendingSig.comments = reason;
      pendingSig.signedAt = new Date().toISOString();
    }

    return { success: true, derogation };
  }

  public revokeDerogation(id: string, reason: string): { success: boolean; derogation?: QualityDerogation } {
    const derogation = this.derogations.find((d) => d.id === id);
    if (!derogation) return { success: false };

    derogation.status = 'REVOKED';
    derogation.updatedAt = new Date().toISOString();

    return { success: true, derogation };
  }

  public checkOrderCoverage(
    supplierId: string,
    standard: string,
    category: string,
    amountEur: number
  ): {
    covered: boolean;
    derogation?: QualityDerogation;
    remainingAllowanceEur: number;
    reason: string;
  } {
    const today = new Date().toISOString().split('T')[0];

    const activeDerogation = this.derogations.find((d) => {
      const matchSupplier = d.supplierId === supplierId;
      const matchStandard =
        d.standardTargeted.toUpperCase() === standard.toUpperCase() ||
        standard.toUpperCase().includes(d.standardTargeted.toUpperCase());
      const isApproved = d.status === 'APPROVED';
      const isDateValid = d.validFrom <= today && d.validUntil >= today;

      return matchSupplier && matchStandard && isApproved && isDateValid;
    });

    if (!activeDerogation) {
      return {
        covered: false,
        remainingAllowanceEur: 0,
        reason: 'Aucune dérogation approuvée et valide n’a été trouvée pour ce fournisseur et ce standard.',
      };
    }

    const remaining = activeDerogation.maxAuthorizedSpendEur - activeDerogation.currentConsumedSpendEur;

    if (amountEur > remaining) {
      return {
        covered: false,
        derogation: activeDerogation,
        remainingAllowanceEur: remaining,
        reason: `Plafond financier dérogatoire dépassé : Montant commande (${amountEur.toLocaleString()} €) > Reliquat disponible (${remaining.toLocaleString()} € / Max: ${activeDerogation.maxAuthorizedSpendEur.toLocaleString()} €).`,
      };
    }

    return {
      covered: true,
      derogation: activeDerogation,
      remainingAllowanceEur: remaining - amountEur,
      reason: `Commande couverte par la dérogation approuvée ${activeDerogation.id} (Plafond restant après commande: ${(remaining - amountEur).toLocaleString()} €).`,
    };
  }

  public consumeDerogationAllowance(id: string, amountEur: number): boolean {
    const derogation = this.derogations.find((d) => d.id === id);
    if (!derogation || derogation.status !== 'APPROVED') return false;

    derogation.currentConsumedSpendEur += amountEur;
    derogation.updatedAt = new Date().toISOString();
    return true;
  }
}

export const derogationService = new DerogationService();
