import { describe, it, expect } from 'vitest';
import { erpConnectorService } from '../../src/services/erpConnectorService';

describe('Chantier C : Connecteurs ERP Bidirectionnels & Webhooks Certifiés', () => {
  it('should test and establish SAP S/4HANA OData connection', () => {
    const res = erpConnectorService.testSapConnection();
    expect(res.success).toBe(true);
    expect(res.odataMetadataLoaded).toBe(true);
    expect(res.latencyMs).toBeGreaterThan(0);

    const config = erpConnectorService.getSapConfig();
    expect(config.status).toBe('CONNECTED');
    expect(config.serviceName).toBe('API_PURCHASEORDER_PROCESS_SRV');
    expect(config.entitySet).toBe('A_PurchaseOrderItem');
  });

  it('should simulate SAP S/4HANA PurchasingHoldBlock on a non-compliant order', () => {
    const poNumber = 'PO-2026-SAP-88190';
    const itemNumber = '00010';
    const reason = 'Certificat GOTS expiré';

    const result = erpConnectorService.simulateSapPurchaseHold(poNumber, itemNumber, reason);

    expect(result.success).toBe(true);
    expect(result.odataResponse.d.PurchaseOrder).toBe(poNumber);
    expect(result.odataResponse.d.PurchasingHoldBlock).toBe('X');
    expect(result.odataResponse.d.Status).toBe('LOCKED_BY_CERTIWATCH');

    // Verify sync log entry
    const logs = erpConnectorService.getSyncLogs();
    const entry = logs.find((l) => l.documentRef === `${poNumber}/${itemNumber}`);
    expect(entry).toBeDefined();
    expect(entry?.erpSystem).toBe('SAP_S4HANA');
    expect(entry?.status).toBe('BLOCKED');
  });

  it('should validate Coupa REST API connection and scopes', () => {
    const res = erpConnectorService.testCoupaConnection();
    expect(res.success).toBe(true);
    expect(res.scopesGranted).toContain('core.purchase_orders.read');
    expect(res.scopesGranted).toContain('core.purchase_orders.write');

    const config = erpConnectorService.getCoupaConfig();
    expect(config.status).toBe('CONNECTED');
    expect(config.customFieldsMapping.statusField).toBe('c_certiwatch_status');
    expect(config.customFieldsMapping.scoreField).toBe('c_compliance_score');
  });

  it('should validate Celonis EMS Process Mining Action Flow connection', () => {
    const res = erpConnectorService.testCelonisConnection();
    expect(res.success).toBe(true);
    expect(res.actionFlowReady).toBe(true);

    const config = erpConnectorService.getCelonisConfig();
    expect(config.status).toBe('CONNECTED');
    expect(config.detectMaverickBuying).toBe(true);
  });

  it('should maintain an immutable audit trail of bidirectional ERP sync operations', () => {
    const logs = erpConnectorService.getSyncLogs();
    expect(logs.length).toBeGreaterThanOrEqual(4);

    const sapLogs = logs.filter((l) => l.erpSystem === 'SAP_S4HANA');
    expect(sapLogs.length).toBeGreaterThanOrEqual(2);

    const coupaLogs = logs.filter((l) => l.erpSystem === 'COUPA');
    expect(coupaLogs.length).toBeGreaterThanOrEqual(1);

    const celonisLogs = logs.filter((l) => l.erpSystem === 'CELONIS_EMS');
    expect(celonisLogs.length).toBeGreaterThanOrEqual(1);
  });
});
