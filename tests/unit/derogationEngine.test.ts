import { describe, it, expect } from 'vitest';
import { derogationService } from '../../src/services/derogationService';

describe('Chantier D : Moteur de Dérogations Qualité & Workflows Multi-Niveaux eIDAS / RGS**', () => {
  it('should compute the correct approval tier based on spend cap and risk level', () => {
    // Under 50k, low risk -> Tier 1
    expect(derogationService.computeRequiredTier(40000, 'LOW')).toBe(1);

    // 50k - 150k, medium risk -> Tier 2
    expect(derogationService.computeRequiredTier(80000, 'MEDIUM')).toBe(2);

    // Over 150k -> Tier 3 (Exécutif / RGS**)
    expect(derogationService.computeRequiredTier(200000, 'MEDIUM')).toBe(3);

    // Critical risk -> Tier 3 regardless of amount
    expect(derogationService.computeRequiredTier(25000, 'CRITICAL')).toBe(3);
  });

  it('should create a new derogation with correct tiered signatures', () => {
    const newDerog = derogationService.createDerogation({
      title: 'Dérogation Test Emballages PEFC',
      supplierId: 'sup-3',
      supplierName: 'Scierie des Alpes',
      productCategory: 'Emballages Bois',
      standardTargeted: 'FSC',
      reasonCode: 'FORCE_MAJEURE_SUPPLY_CHAIN',
      justificationText: 'Rupture temporaire suite intempéries.',
      riskAssessment: 'HIGH',
      mitigationPlan: 'Contrôles PEFC stricts.',
      maxAuthorizedSpendEur: 95000,
      validFrom: '2026-10-01',
      validUntil: '2026-12-31',
    });

    expect(newDerog.id).toContain('DEROG-2026-FR-');
    expect(newDerog.requiredTier).toBe(2);
    expect(newDerog.currentTier).toBe(1);
    expect(newDerog.status).toBe('PENDING_APPROVAL_L1');
    expect(newDerog.signatures.length).toBe(2);
    expect(newDerog.signatures[0].status).toBe('PENDING');
  });

  it('should process multi-tier eIDAS signatures up to full approval', () => {
    const list = derogationService.getAllDerogations();
    const pending = list.find((d) => d.status === 'PENDING_APPROVAL_L1');
    expect(pending).toBeDefined();

    if (!pending) return;

    // Sign Tier 1
    const resL1 = derogationService.signDerogation(pending.id, {
      name: 'Claire Vasseur',
      email: 'claire.vasseur@enterprise.corp',
      role: 'Responsable Qualité',
      comments: 'Conformité technique validée.',
    });

    expect(resL1.success).toBe(true);
    expect(resL1.derogation?.signatures[0].status).toBe('SIGNED');
    expect(resL1.derogation?.signatures[0].padesSignatureHash).toBeDefined();
    expect(resL1.derogation?.signatures[0].certificateFingerprintSha256).toBeDefined();

    if (pending.requiredTier >= 2) {
      expect(resL1.derogation?.status).toBe('PENDING_APPROVAL_L2');

      // Sign Tier 2
      const resL2 = derogationService.signDerogation(pending.id, {
        name: 'Marc Delacroix',
        email: 'marc.delacroix@enterprise.corp',
        role: 'Directeur Achats',
        comments: 'Approbation finale sous eIDAS qualifiée.',
      });

      expect(resL2.success).toBe(true);
      if (pending.requiredTier === 2) {
        expect(resL2.derogation?.status).toBe('APPROVED');
        expect(resL2.derogation?.merkleProofHash).toBeDefined();
      }
    }
  });

  it('should check purchase order coverage against approved derogations', () => {
    // DEROG-2026-FR-0042 is APPROVED for supplier 'sup-1', standard 'GOTS', max spend 120,000 €, consumed 45,000 €
    // Remaining allowance = 75,000 €

    // Order 1: 50,000 € <= 75,000 € -> COVERED
    const check1 = derogationService.checkOrderCoverage('sup-1', 'GOTS', 'Textiles', 50000);
    expect(check1.covered).toBe(true);
    expect(check1.derogation?.id).toBe('DEROG-2026-FR-0042');
    expect(check1.remainingAllowanceEur).toBe(25000);

    // Order 2: 90,000 € > 75,000 € -> REJECTED DUE TO SPEND CAP
    const check2 = derogationService.checkOrderCoverage('sup-1', 'GOTS', 'Textiles', 90000);
    expect(check2.covered).toBe(false);
    expect(check2.reason).toContain('Plafond financier dérogatoire dépassé');

    // Order 3: Unknown supplier -> NOT COVERED
    const check3 = derogationService.checkOrderCoverage('sup-999', 'GOTS', 'Textiles', 10000);
    expect(check3.covered).toBe(false);
  });

  it('should revoke a derogation and immediately invalidate future order coverage', () => {
    const list = derogationService.getAllDerogations();
    const approved = list.find((d) => d.status === 'APPROVED');
    expect(approved).toBeDefined();

    if (!approved) return;

    const res = derogationService.revokeDerogation(approved.id, 'Anomalie détectée en contre-audit');
    expect(res.success).toBe(true);
    expect(res.derogation?.status).toBe('REVOKED');

    // Verify order is now rejected
    const check = derogationService.checkOrderCoverage(approved.supplierId, approved.standardTargeted, 'Textiles', 10000);
    expect(check.covered).toBe(false);
  });
});
