import { appStore } from '../src/db/store';
import { seedNeonFromStore, getNeonTableStats } from '../src/db/neonService';

async function main() {
  console.log('🔄 Début de la synchronisation vers la base PostgreSQL Neon...');
  
  const state = appStore.getState();
  const snapshot = {
    tenants: state.tenants,
    users: state.users,
    suppliers: state.suppliers,
    certificates: state.certificates,
    auditLogs: state.auditLogs,
    matrixRules: state.matrixRules,
    eudrDeclarations: state.eudrPlots,
    webhookEndpoints: state.webhooks,
    fieldAudits: state.fieldAudits,
  };

  console.log(`📦 Données locales prêtes : ${snapshot.suppliers.length} fournisseurs, ${snapshot.certificates.length} certificats, ${snapshot.auditLogs.length} logs d'audit.`);

  const result = await seedNeonFromStore(snapshot);
  console.log('✅ Résultat du seed Neon :', result);

  const stats = await getNeonTableStats();
  console.log('📊 Statistiques en direct sur PostgreSQL :', stats);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erreur lors de la synchronisation :', err);
  process.exit(1);
});
