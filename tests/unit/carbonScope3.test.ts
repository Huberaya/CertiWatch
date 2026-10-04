import { describe, it, expect } from 'vitest';
import {
  carbonStore,
  INITIAL_CSRD_E1_METRICS,
  INITIAL_SUPPLIER_CARBON_PROFILES,
} from '../../src/db/carbonStore';

describe('Chantier 14 : Carbon Accounting Scope 3 & CSRD ESRS E1 Engine', () => {
  it('should verify that Scope 3 Upstream + Scope 3 Downstream equal total Scope 3', () => {
    const metrics = carbonStore.getMetrics();
    const calculatedTotalScope3 = metrics.grossScope3UpstreamTco2e + metrics.grossScope3DownstreamTco2e;

    expect(calculatedTotalScope3).toBe(24800.0);
    expect(calculatedTotalScope3).toBeGreaterThan(0);
  });

  it('should verify total GHG emissions sum equals Scope 1 + Market Scope 2 + Scope 3', () => {
    const metrics = carbonStore.getMetrics();
    const totalCalculated =
      metrics.grossScope1Tco2e +
      metrics.grossScope2MarketBasedTco2e +
      metrics.grossScope3UpstreamTco2e +
      metrics.grossScope3DownstreamTco2e;

    expect(totalCalculated).toBe(metrics.totalGhgEmissionsTco2e);
    expect(metrics.totalGhgEmissionsTco2e).toBe(25400.0);
  });

  it('should verify Category 1 (Purchased Goods) represents the dominant Scope 3 contributor (>70%)', () => {
    const metrics = carbonStore.getMetrics();
    const cat1 = metrics.scope3Categories.find((c) => c.category === 'CAT_1_PURCHASED_GOODS');

    expect(cat1).toBeDefined();
    expect(cat1?.percentageOfScope3).toBeGreaterThan(70);
    expect(cat1?.dataQualityTier).toBe('TIER_1_PRIMARY');
  });

  it('should verify carbon intensity calculation per turnover', () => {
    const metrics = carbonStore.getMetrics();
    expect(metrics.ghgIntensityPerTurnoverTco2ePerMillionEur).toBe(68.2);
    expect(metrics.internalCarbonPriceEurPerTonne).toBe(100.0);
  });

  it('should correctly filter high-priority suppliers for decarbonization engagement', () => {
    const profiles = carbonStore.getSuppliers();
    const highPriority = profiles.filter((p) => p.priorityForEngagement === 'HIGH_PRIORITY');

    expect(highPriority.length).toBeGreaterThan(0);
    highPriority.forEach((supplier) => {
      expect(supplier.totalAllocatedTco2e).toBeGreaterThan(2000);
      expect(supplier.keyDecarbonizationLever).toBeDefined();
    });
  });

  it('should correctly compute net zero trajectory reduction milestone for 2030', () => {
    const trajectory = carbonStore.getTrajectory();
    const baseline = trajectory.find((t) => t.year === 2024);
    const target2030 = trajectory.find((t) => t.year === 2030);

    expect(baseline).toBeDefined();
    expect(target2030).toBeDefined();
    if (baseline && target2030) {
      expect(target2030.projectedEmissionsTco2e).toBeLessThan(baseline.baselineEmissionsTco2e);
      const reductionPercent =
        ((baseline.baselineEmissionsTco2e - target2030.projectedEmissionsTco2e) /
          baseline.baselineEmissionsTco2e) *
        100;
      expect(reductionPercent).toBeGreaterThanOrEqual(40); // SBTi 1.5°C requires >= 40% absolute reduction by 2030
    }
  });
});
