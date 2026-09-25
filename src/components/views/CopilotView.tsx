import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  User,
  ArrowRightLeft,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Globe2,
  Clock,
  Layers,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { appStore } from '../../db/store';
import { copilotService } from '../../services/copilotService';
import { CopilotMessage, SupplierSubstitutionAnalysis, RegulatoryWatchItem } from '../../types/ai';
import { SEED_REGULATORY_WATCH, SEED_CONTRACT_ANALYSES } from '../../db/aiSeedData';
import { SupplierSubstitutionModal } from '../copilot/SupplierSubstitutionModal';
import { ClauseAnalysisModal } from '../copilot/ClauseAnalysisModal';

interface CopilotViewProps {
  onNavigateTab?: (tab: any) => void;
}

export function CopilotView({ onNavigateTab }: CopilotViewProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'substitution' | 'clauses' | 'regulatory'>('chat');
  const activeTenant = appStore.getActiveTenant();
  const suppliers = appStore.getTenantSuppliers();

  // Chatbot state
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Bonjour ! Je suis **CertiBot**, votre copilote d'IA décisionnelle pour la conformité achats, la directive CSRD et le règlement EUDR.\n\nJe suis connecté en temps réel aux données de votre tenant **${activeTenant.name}** (${suppliers.length} fournisseurs surveillés). Comment puis-je vous aider aujourd'hui ?`,
      timestamp: new Date().toISOString(),
      actionSuggestions: [
        {
          type: 'NAVIGATE_TAB',
          label: 'Analyser les Risques Fournisseurs',
          payload: { tab: 'copilot', subTab: 'substitution' },
        },
        {
          type: 'NAVIGATE_TAB',
          label: 'Vérifier la Veille EUDR & GOTS',
          payload: { tab: 'copilot', subTab: 'regulatory' },
        },
      ],
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Substitution state
  const [substitutionTargetId, setSubstitutionTargetId] = useState<string>(suppliers[0]?.id || '');
  const [substitutionModalOpen, setSubstitutionModalOpen] = useState(false);
  const [clauseModalOpen, setClauseModalOpen] = useState(false);

  // Quick prompt suggestions
  const suggestedPrompts = [
    'Quels sont nos fournisseurs critiques à risque de blocage dans les 30 jours ?',
    'Trouver une alternative pour Agrícola Andina del Cacao (Cacao bio péruvien)',
    'Quelles sont les obligations strictes imposées par le Règlement EUDR 2023/1115 ?',
    'Comment réagir en cas de révocation inopinée d’un certificat GOTS par un organisme ?',
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isSending) return;

    const userMsg: CopilotMessage = {
      id: 'msg-u-' + Date.now().toString(36),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsSending(true);

    try {
      const assistantMsg = await copilotService.sendChatMessage(
        [...messages, userMsg],
        activeTenant.id
      );
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleActionClick = (action: any) => {
    if (action.type === 'NAVIGATE_TAB') {
      if (action.payload?.tab === 'copilot' && action.payload?.subTab) {
        setActiveTab(action.payload.subTab);
      } else if (onNavigateTab && action.payload?.tab) {
        onNavigateTab(action.payload.tab);
      }
    }
  };

  const currentSubstitutionAnalysis: SupplierSubstitutionAnalysis =
    copilotService.findSubstitutionCandidates(substitutionTargetId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Copilot IA Décisionnel & Intelligence Achats
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              CHANTIER 8
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Moteur d'IA générative et prescriptive pour la recherche d'alternatives fournisseurs, l'audit de clauses RSE et la veille normative continue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-purple-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            GEMINI 3.8 FLASH ENGINE
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Bot className="w-4 h-4" />
          1. Assistant Conversationnel IA (CertiBot)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('substitution')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'substitution'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          2. Moteur de Substitution Fournisseur
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clauses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'clauses'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          3. Audit de Clauses Contractuelles RSE
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('regulatory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'regulatory'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          4. Veille Réglementaire & Normative ({SEED_REGULATORY_WATCH.length})
        </button>
      </div>

      {/* Tab 1 : Chatbot */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-3 flex flex-col h-[600px] rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            {/* Chat header */}
            <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">CertiBot Copilot</span>
                <span className="text-slate-500 text-xs">• Contexte actif : {activeTenant.name}</span>
              </div>
              <span className="text-[11px] text-slate-400">Modèle Gemini IA Actif</span>
            </div>

            {/* Messages scroll area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((m) => {
                const isUser = m.role === 'user';

                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-purple-600 text-white rounded-br-none shadow-md shadow-purple-600/20'
                          : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                      }`}
                    >
                      <div className="whitespace-pre-line">{m.content}</div>

                      {/* Action buttons suggested by AI */}
                      {m.actionSuggestions && m.actionSuggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                          {m.actionSuggestions.map((act, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleActionClick(act)}
                              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <span>{act.label}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                    <span>CertiBot analyse votre demande et interroge le référentiel achats...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input area */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Posez une question à CertiBot (ex: 'Quelles sont nos priorités de relance ?')..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isSending}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 shadow-lg shadow-purple-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  Envoyer
                </button>
              </form>
            </div>
          </div>

          {/* Right suggestions & KPIs */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Questions Suggérées
              </span>

              <div className="space-y-2">
                {suggestedPrompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(p)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-[11px] text-slate-300 hover:text-white transition-colors leading-snug flex items-center justify-between group"
                  >
                    <span>{p}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-purple-400 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Outils Spécialisés
              </span>

              <button
                type="button"
                onClick={() => setActiveTab('substitution')}
                className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-200 font-semibold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                  <span>Substituer un Fournisseur</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('clauses')}
                className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-200 font-semibold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Auditer une Clause RSE</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('regulatory')}
                className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-200 font-semibold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Veille Normative EUDR & GOTS</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 : Substitution Engine */}
      {activeTab === 'substitution' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-purple-400 uppercase font-bold tracking-wider">
                Moteur de Recommandation Algorithmique
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Recherche de Fournisseurs Alternatifs de Remplacement
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                En cas de blocage ERP, de suspension de certificat ou de litige qualité, l'IA identifie
                automatiquement les fournisseurs compatibles dans le panel pour garantir la continuité opérationnelle.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400">Fournisseur à remplacer :</span>
              <select
                value={substitutionTargetId}
                onChange={(e) => setSubstitutionTargetId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.legalName} ({s.country})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Diagnosis Summary */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              Analyse Contextuelle IA
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {currentSubstitutionAnalysis.aiReasoning}
            </p>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSubstitutionAnalysis.candidates.map((cand, idx) => (
              <div
                key={cand.supplierId}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  idx === 0
                    ? 'bg-slate-900 border-emerald-500/40 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-white">{cand.supplierName}</h4>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          TOP MATCH
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {cand.country} ({cand.countryCode}) • Score de risque : {cand.riskScore}/100
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase block">Adéquation</span>
                    <span className="text-2xl font-black text-emerald-400">{cand.matchScore}%</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="text-slate-400 text-[11px] block font-semibold">Points Forts :</span>
                  {cand.pros.map((pro, pidx) => (
                    <div key={pidx} className="text-emerald-400 flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Délai transition : <strong>{cand.estimatedTransitionDelayDays}j</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setSubstitutionTargetId(currentSubstitutionAnalysis.blockedOrRiskSupplierId);
                      setSubstitutionModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Valider Substitution
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3 : Clauses Audit */}
      {activeTab === 'clauses' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                Analyseur Sémantique de Clauses Contractuelles RSE
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit automatique des projets d'accords d'achat, détection de non-conformités CSRD/EUDR et génération de formulations juridiques sécurisantes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setClauseModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Auditer un Nouveau Texte
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Exemple Analysé : {SEED_CONTRACT_ANALYSES[0].documentTitle}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
                Score : {SEED_CONTRACT_ANALYSES[0].score}/100 — VULNÉRABILITÉ MODÉRÉE
              </span>
            </div>

            <div className="space-y-3">
              {SEED_CONTRACT_ANALYSES[0].extractedClauses.map((cl, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{cl.topic}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cl.verdict === 'CONFORME'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {cl.verdict}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 text-[11px] font-mono text-slate-400">
                    "{cl.textExcerpt}"
                  </div>
                  <div className="text-xs text-amber-400 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{cl.riskExplanation}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 font-sans">
                    <strong>Formulation recommandée :</strong> {cl.recommendedWording}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4 : Regulatory Watch */}
      {activeTab === 'regulatory' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/20">
            <h3 className="text-lg font-bold text-white">Veille Normative & Réglementaire Active</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Anticipation des évolutions des standards certifiants (GOTS, FSC, PEFC) et directives européennes (CSRD, CSDDD, EUDR) avec calcul d'impact sur vos contrats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SEED_REGULATORY_WATCH.map((item) => {
              const isCritical = item.impactSeverity === 'CRITICAL';

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {item.standardOrLaw}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Date d'effet : <strong className="text-slate-200">{item.effectiveDate}</strong>
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      IMPACT {item.impactSeverity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Fournisseurs potentiellement impactés :</span>
                      <strong className="text-white">{item.affectedSuppliersCount} fournisseurs</strong>
                    </div>
                    <div className="text-[11px] text-cyan-400">
                      <strong>Plan d'action :</strong> {item.recommendedActionPlan}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <SupplierSubstitutionModal
        isOpen={substitutionModalOpen}
        onClose={() => setSubstitutionModalOpen(false)}
        supplierId={substitutionTargetId}
      />

      <ClauseAnalysisModal
        isOpen={clauseModalOpen}
        onClose={() => setClauseModalOpen(false)}
      />
    </div>
  );
}
