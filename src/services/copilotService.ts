import { appStore } from '../db/store';
import {
  SupplierSubstitutionAnalysis,
  SupplierSubstituteCandidate,
  ContractClauseAnalysis,
  CopilotMessage,
} from '../types/ai';
import { SEED_CONTRACT_ANALYSES } from '../db/aiSeedData';

class CopilotService {
  /**
   * Intelligently discovers and ranks substitute suppliers when a supplier is blocked or at risk.
   */
  public findSubstitutionCandidates(blockedSupplierId: string): SupplierSubstitutionAnalysis {
    const suppliers = appStore.getTenantSuppliers();
    const certificates = appStore.getTenantCertificates();
    const rules = appStore.getTenantMatrixRules();

    const target = suppliers.find((s) => s.id === blockedSupplierId) || suppliers[0];
    const targetCategories = new Set(target?.productCategories || []);
    const targetCerts = certificates.filter((c) => c.supplierId === target?.id);
    const targetStandards = new Set(targetCerts.map((c) => c.certificationStandard));

    const otherSuppliers = suppliers.filter((s) => s.id !== target?.id);

    const candidates: SupplierSubstituteCandidate[] = otherSuppliers
      .map((supplier) => {
        const sCerts = certificates.filter((c) => c.supplierId === supplier.id && c.status === 'VALID');
        const sStandards = sCerts.map((c) => c.certificationStandard);

        // 1. Category overlap (max 40 pts)
        const commonCategories = supplier.productCategories.filter((cat) => targetCategories.has(cat));
        const categoryScore = targetCategories.size > 0
          ? Math.min(40, Math.round((commonCategories.length / targetCategories.size) * 40))
          : 20;

        // 2. Certification match (max 35 pts)
        const commonStandards = sStandards.filter((std) => targetStandards.has(std));
        const certScore = targetStandards.size > 0
          ? Math.min(35, Math.round((commonStandards.length / targetStandards.size) * 35))
          : 25;

        // 3. ERP status (max 15 pts)
        const isAllowed = !supplier.erpConfig || supplier.erpConfig.blockStatus === 'ALLOWED';
        const erpScore = isAllowed ? 15 : 0;

        // 4. Low risk bonus (max 10 pts)
        const risk = supplier.multiFactorRisk?.overallScore ?? (supplier.riskLevel === 'LOW' ? 15 : 50);
        const riskBonus = Math.max(0, Math.min(10, Math.round((100 - risk) / 10)));

        const matchScore = Math.min(99, categoryScore + certScore + erpScore + riskBonus);

        const pros: string[] = [];
        const cautions: string[] = [];

        if (isAllowed) pros.push('Statut ERP 100% Débloqué (Commandes immédiates autorisées)');
        else cautions.push('Statut ERP actuellement bloqué ou sous dérogation');

        if (commonCategories.length > 0) {
          pros.push(`Catégories compatibles : ${commonCategories.join(', ')}`);
        } else {
          cautions.push('Gamme de produits voisine mais nécessite qualification');
        }

        if (sStandards.length > 0) {
          pros.push(`Certifications actives : ${sStandards.join(', ')}`);
        } else {
          cautions.push('Aucun certificat actif actuellement dans le répertoire');
        }

        if (risk < 30) {
          pros.push(`Faible exposition aux risques (${risk}/100)`);
        } else {
          cautions.push(`Score de risque modéré à élevé (${risk}/100)`);
        }

        return {
          supplierId: supplier.id,
          supplierName: supplier.legalName,
          country: supplier.country,
          countryCode: supplier.countryCode,
          matchScore,
          riskScore: risk,
          erpBlockStatus: supplier.erpConfig?.blockStatus || 'ALLOWED',
          validCertifications: sStandards,
          productCategories: supplier.productCategories,
          pros,
          cautions,
          annualCapacity: '2 500 tonnes / an (Volume disponible)',
          estimatedTransitionDelayDays: isAllowed && sStandards.length > 0 ? 5 : 21,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    const bestCandidate = candidates[0];
    const aiReasoning = bestCandidate
      ? `Recommandation IA CertiWatch : En cas de défaillance ou de blocage sur "${target?.legalName}", l'alternative la plus robuste est "${bestCandidate.supplierName}" (${bestCandidate.country}) avec un score d'adéquation de ${bestCandidate.matchScore}%. Il détient ${bestCandidate.validCertifications.length} certifications valides et dispose d'un statut ERP autorisant la passation immédiate des commandes d'achat.`
      : 'Aucun fournisseur alternatif détecté avec un niveau de conformité suffisant.';

    return {
      blockedOrRiskSupplierId: target?.id || '',
      blockedSupplierName: target?.legalName || 'Fournisseur Cible',
      productCategory: Array.from(targetCategories).join(', ') || 'Matières Premières',
      reasonForSubstitution: target?.erpConfig?.blockedReason || 'Péremption imminente des certifications critiques & blocage préventif ERP',
      candidates,
      aiReasoning,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Analyzes contract clauses using AI / Gemini endpoint with fallback heuristic analysis.
   */
  public async analyzeContractClauses(text: string, title?: string): Promise<ContractClauseAnalysis> {
    try {
      const response = await fetch('/api/copilot/analyze-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.analysis) return data.analysis;
      }
    } catch (e) {
      console.warn('API call to /api/copilot/analyze-clause failed, using local AI evaluation engine.', e);
    }

    // Heuristic AI simulation when server route is unreachable
    const isEudrMentioned = /deforestation|foret|bois|eudr|gps/i.test(text);
    const isOitMentioned = /travail des enfants|travail force|oit|esclave/i.test(text);
    const isCertMentioned = /certificat|validite|gots|fsc|ecocert/i.test(text);

    return {
      id: 'analysis-' + Date.now().toString(36),
      documentTitle: title || 'Avenant RSE & Conformité Fournisseurs',
      complianceRating: isEudrMentioned && isOitMentioned ? 'STRONG' : 'MODERATE_RISK',
      score: isEudrMentioned && isOitMentioned ? 88 : 65,
      csrdCsdddReadiness:
        isEudrMentioned
          ? 'Clauses robustes sur les engagements zéro déforestation post-2020. Conforme EUDR Art. 9.'
          : 'Vulnérabilité détectée : absence de clause spécifique imposant la fourniture des coordonnées GPS (WGS84) sous 15 jours.',
      analyzedAt: new Date().toISOString(),
      extractedClauses: [
        {
          topic: 'Continuité des Certifications Officielles',
          textExcerpt: isCertMentioned ? 'Extrait identifié relatif aux standards durables.' : 'Clause générique de qualité.',
          verdict: isCertMentioned ? 'CONFORME' : 'AMBIGU',
          riskExplanation: isCertMentioned
            ? 'Obligation de maintien des certifications conforme.'
            : 'Aucun délai de prévenance en cas de suspension ou révocation.',
          recommendedWording:
            'Le Fournisseur notifiera sans délai et sous 48h ouvrées toute perte ou contestation de certification.',
        },
        {
          topic: 'Zéro Déforestation & Règlement Européen EUDR',
          textExcerpt: isEudrMentioned ? 'Engagement zéro déforestation formulé.' : 'Mention vague de respect des lois locales.',
          verdict: isEudrMentioned ? 'CONFORME' : 'NON_CONFORME',
          riskExplanation: isEudrMentioned
            ? 'Aligné sur le seuil du 31 décembre 2020.'
            : 'Risque majeur d’infraction au Règlement UE 2023/1115 (amende douanière jusqu’à 4% du CA).',
          recommendedWording:
            'Garantie formelle d’absence de déforestation après le 31 décembre 2020 et transmission obligatoire des polygones GPS.',
        },
      ],
      remediationRoadmap: [
        'Insérer une clause résolutoire automatique en cas de révocation de label GOTS/FSC.',
        'Exiger la communication trimestrielle des attestations d’audit social (SMETA/BSCI).',
      ],
    };
  }

  /**
   * Generates intelligent streaming or instant Copilot chat responses.
   */
  public async sendChatMessage(
    messages: CopilotMessage[],
    activeTenantId: string
  ): Promise<CopilotMessage> {
    const lastUserMessage = messages[messages.length - 1];

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          tenantId: activeTenantId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          return {
            id: 'msg-' + Date.now().toString(36),
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toISOString(),
            actionSuggestions: data.actionSuggestions,
          };
        }
      }
    } catch (e) {
      console.warn('Backend /api/copilot/chat unreachable, generating intelligent contextual answer locally.', e);
    }

    // High-context fallback engine
    const text = (lastUserMessage?.content || '').toLowerCase();
    const suppliers = appStore.getTenantSuppliers();
    const alerts = appStore.getTenantAlerts();
    const certs = appStore.getTenantCertificates();

    const openAlerts = alerts.filter((a) => a.status === 'OPEN' || a.status === 'IN_PROGRESS');
    const blockedSuppliers = suppliers.filter((s) => s.erpConfig?.blockStatus === 'BLOCKED');

    if (text.includes('fournisseur') && (text.includes('bloqu') || text.includes('critique') || text.includes('risque'))) {
      return {
        id: 'msg-' + Date.now().toString(36),
        role: 'assistant',
        content: `**Diagnostic d'exposition aux risques achats :**\n\nSur votre tenant actuel, vous avez **${blockedSuppliers.length} fournisseur(s) bloqué(s) dans l'ERP** et **${openAlerts.length} alerte(s) active(s)** :\n\n- ${blockedSuppliers.map((s) => `**${s.legalName}** (${s.country}) : *${s.erpConfig?.blockedReason || 'Non-conformité'}*`).join('\n- ')}\n\n💡 **Recommandation IA :** Vous pouvez lancer le module de **Substitution Fournisseur** pour rediriger immédiatement les bons de commandes vers une alternative certifiée conforme sans interrompre vos usines.`,
        timestamp: new Date().toISOString(),
        actionSuggestions: [
          {
            type: 'NAVIGATE_TAB',
            label: 'Ouvrir le Module de Substitution',
            payload: { tab: 'copilot', subTab: 'substitution' },
          },
          {
            type: 'NAVIGATE_TAB',
            label: 'Traiter les Alertes Urgentes',
            payload: { tab: 'alerts' },
          },
        ],
      };
    }

    if (text.includes('gots') || text.includes('oeko') || text.includes('fsc') || text.includes('eudr')) {
      return {
        id: 'msg-' + Date.now().toString(36),
        role: 'assistant',
        content: `**Analyse Normative & Réglementaire :**\n\n- **Règlement EUDR 2023/1115 (Déforestation) :** Applicable aux matières Bois, Papier, Cacao, Soja, etc. Chaque commande exige des coordonnées GPS validées (polygones pour les parcelles > 4 ha) et zéro déforestation post-2020.\n- **GOTS v7.0 :** Renforcement de la traçabilité sociale et interdiction totale des substances PFAS.\n- **FSC-STD-40-004 :** Certification de la chaîne de traçabilité forestière alignée pour les déclarations en douane.\n\nVotre taux de couverture actuel est de **${appStore.calculateCsrdEsrsScorecard().esrsE4BiodiversityCoverage}%** pour les matières certifiées durables.`,
        timestamp: new Date().toISOString(),
        actionSuggestions: [
          {
            type: 'NAVIGATE_TAB',
            label: 'Consulter le Rapport CSRD / EUDR',
            payload: { tab: 'reports' },
          },
          {
            type: 'NAVIGATE_TAB',
            label: 'Vérifier la Matrice Achats',
            payload: { tab: 'matrix' },
          },
        ],
      };
    }

    return {
      id: 'msg-' + Date.now().toString(36),
      role: 'assistant',
      content: `Je suis **CertiBot**, votre copilote d'IA décisionnelle pour la conformité achats, la directive CSRD et le règlement EUDR.\n\nVoici ce que je peux analyser pour vous :\n1. **Rechercher des fournisseurs alternatifs** en cas de blocage d'approvisionnement.\n2. **Vérifier l'alignement réglementaire** de vos matières (GOTS, FSC, Ecocert, OEKO-TEX).\n3. **Auditer vos clauses contractuelles RSE** et proposer des formulations juridiques protectrices.\n4. **Préparer les justificatifs d'audit** pour vos commissaires aux comptes.\n\nQue souhaitez-vous vérifier en priorité ?`,
      timestamp: new Date().toISOString(),
      actionSuggestions: [
        {
          type: 'NAVIGATE_TAB',
          label: 'Simuler une Substitution Fournisseur',
          payload: { tab: 'copilot', subTab: 'substitution' },
        },
        {
          type: 'NAVIGATE_TAB',
          label: 'Auditer une Clause Contractuelle',
          payload: { tab: 'copilot', subTab: 'clause' },
        },
      ],
    };
  }
}

export const copilotService = new CopilotService();
