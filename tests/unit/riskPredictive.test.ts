import { describe, it, expect } from 'vitest';
import { riskStore } from '../../src/db/riskStore';

describe('Chantier 17 : Predictive AI Risk & Altman Z-Score Early Warning Engine', () => {
  it('should evaluate Altman Z-Scores and classify distress zones accurately', () => {
    const financialHealthList = riskStore.getFinancialHealth();
    expect(financialHealthList.length).toBeGreaterThan(0);

    financialHealthList.forEach((profile) => {
      if (profile.altmanZScore > 2.99) {
        expect(profile.distressRiskLabel).toBe('SAFE');
      } else if (profile.altmanZScore >= 1.81) {
        expect(profile.distressRiskLabel).toBe('GREY_ZONE');
      } else {
        expect(profile.distressRiskLabel).toBe('DISTRESS');
      }
    });
  });

  it('should identify grey-zone suppliers requiring monitoring or reverse factoring', () => {
    const financialHealthList = riskStore.getFinancialHealth();
    const greyZone = financialHealthList.filter((f) => f.distressRiskLabel === 'GREY_ZONE');

    expect(greyZone.length).toBeGreaterThan(0);
    greyZone.forEach((supplier) => {
      expect(supplier.altmanZScore).toBeLessThanOrEqual(2.99);
      expect(supplier.altmanZScore).toBeGreaterThanOrEqual(1.81);
      expect(supplier.workingCapitalRatio).toBeLessThan(1.5);
    });
  });

  it('should compute early warning alerts with spend-at-risk aggregation', () => {
    const alerts = riskStore.getAlerts();
    expect(alerts.length).toBeGreaterThan(0);

    const totalSpendAtRisk = alerts.reduce(
      (acc, a) =>
        acc + a.affectedSuppliers.reduce((sAcc, s) => sAcc + s.spendAtRiskEur, 0),
      0
    );

    expect(totalSpendAtRisk).toBeGreaterThan(1_000_000); // Over 1M€ exposed spend monitored
  });

  it('should verify stress test scenarios have valid contingency and buffer recommendations', () => {
    const scenarios = riskStore.getScenarios();
    expect(scenarios.length).toBeGreaterThan(0);

    scenarios.forEach((scenario) => {
      expect(scenario.simulatedLeadTimeInflationDays).toBeGreaterThan(0);
      expect(scenario.simulatedCostIncreasePercent).toBeGreaterThan(0);
      expect(scenario.recommendedBufferStockWeeks).toBeGreaterThanOrEqual(2);
      expect(scenario.contingencyReadinessScore).toBeGreaterThanOrEqual(0);
      expect(scenario.contingencyReadinessScore).toBeLessThanOrEqual(100);
    });
  });

  it('should verify global resilience index is within valid bounds (0-100)', () => {
    const metrics = riskStore.getResilienceMetrics();
    expect(metrics.globalResilienceScore).toBeGreaterThanOrEqual(0);
    expect(metrics.globalResilienceScore).toBeLessThanOrEqual(100);
    expect(metrics.activeAlertsCount).toBeGreaterThan(0);
    expect(metrics.totalSpendAtRiskEur).toBeGreaterThan(0);
  });
});
