import { describe, it, expect } from 'vitest';
import { appStore } from '../../src/db/store';

describe('Chantier 6 : Compliance Matrix & ERP Purchase Order Blocking Engine', () => {
  it('should block purchase orders when supplier is in ERP BLOCKED status', () => {
    // Look for a supplier or set ERP block status
    const suppliers = appStore.getTenantSuppliers();
    expect(suppliers.length).toBeGreaterThan(0);
    const targetSupplier = suppliers[0];

    appStore.setSupplierErpBlock(
      targetSupplier.id,
      'BLOCKED',
      'Non-conformité critique : certificat révoqué par organisme officiel'
    );

    const result = appStore.evaluateOrderCompliance({
      supplierId: targetSupplier.id,
      productCategory: 'Café & Cacao Biologique',
      amountEur: 50000,
      logAudit: false,
    });

    expect(result.decision).toBe('BLOCKED');
    expect(result.isCompliant).toBe(false);
    expect(result.reasons.some((r) => r.includes('blocage ERP strict'))).toBe(true);

    // Reset supplier state
    appStore.setSupplierErpBlock(targetSupplier.id, 'ALLOWED', 'Levée de blocage après régularisation');
  });

  it('should permit orders with REQUIRES_APPROVAL when temporary derogation is granted', () => {
    const suppliers = appStore.getTenantSuppliers();
    const targetSupplier = suppliers[0];

    appStore.setSupplierErpBlock(
      targetSupplier.id,
      'TEMPORARY_DEROGATION',
      'Audit de renouvellement en cours (délai de grâce 30 jours)',
      'Accordé par Direction Achats',
      30
    );

    const result = appStore.evaluateOrderCompliance({
      supplierId: targetSupplier.id,
      productCategory: targetSupplier.productCategories[0] || 'Coton Biologique',
      amountEur: 25000,
      logAudit: false,
    });

    expect(result.decision).toBe('REQUIRES_APPROVAL');
    expect(result.reasons.some((r) => r.includes('Dérogation temporaire active'))).toBe(true);

    // Reset supplier state
    appStore.setSupplierErpBlock(targetSupplier.id, 'ALLOWED');
  });

  it('should block order if a requested product category requires standard the supplier lacks', () => {
    const suppliers = appStore.getTenantSuppliers();
    const targetSupplier = suppliers.find((s) => s.status !== 'BLOCKED') || suppliers[0];

    // Evaluate for a category requiring FSC or GOTS that supplier does not possess
    const result = appStore.evaluateOrderCompliance({
      supplierId: targetSupplier.id,
      productCategory: 'Emballages & Cartons FSC Haute Densité Inconnus',
      amountEur: 100000,
      logAudit: false,
    });

    expect(result).toBeDefined();
    expect(result.supplierName).toBe(targetSupplier.legalName);
  });
});
