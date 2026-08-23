/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lead, LeadDiscovery, LeadDecisionMaker, LeadConflict, LeadAIAnalysis, LeadHistory } from '../types';
import { 
  TrendingUp, Award, DollarSign, Clock, HelpCircle, 
  CheckCircle2, AlertTriangle, ArrowRight, UserCheck, PhoneCall, FileDown, Layers,
  Briefcase, AlertCircle, Sparkles
} from 'lucide-react';
import { calculateLuxuryScore } from '../utils/luxury';

interface LeadStatsSidebarProps {
  lead: Lead;
  discoveries: LeadDiscovery[];
  decisionMakers: LeadDecisionMaker[];
  conflicts: LeadConflict[];
  aiAnalysis: LeadAIAnalysis | null;
  history: LeadHistory[];
  nextButtonId: string;
  onNextButtonClick: (nextButtonId: string) => void;
  onNavigateToTab: (tabIndex: number) => void;
  totalCost: number;
  totalDurationMs: number;
}

export const LeadStatsSidebar: React.FC<LeadStatsSidebarProps> = ({
  lead,
  discoveries,
  decisionMakers,
  conflicts,
  aiAnalysis,
  history,
  nextButtonId,
  onNextButtonClick,
  onNavigateToTab,
  totalCost,
  totalDurationMs,
}) => {
  // Compute variables dynamically
  const dynLuxury = calculateLuxuryScore(lead, discoveries);
  const isPremium = aiAnalysis?.luxuryProfile ?? dynLuxury.isPremium;
  const luxuryScore = aiAnalysis?.luxuryScore ?? dynLuxury.score;
  const luxuryFactors = aiAnalysis?.luxuryFactors ?? dynLuxury.factors;
  
  const icp = aiAnalysis?.icpScore ?? (isPremium ? 90 : 65);
  const potential = aiAnalysis?.purchasePotential ?? (isPremium ? 85 : 60);
  const priority = aiAnalysis?.priority ?? (isPremium ? 'Alta' : 'Média');
  const nextRecLabel = getButtonLabel(nextButtonId);

  // Simple jobs counter helper
  const getJobsCount = () => {
    let count = 0;
    if (lead.vagasOficial) {
      count += Array.isArray(lead.vagasOficial) ? lead.vagasOficial.length : 1;
    } else if (lead.vagasAbertas) {
      count += 1;
    }
    const discoveriesCount = discoveries.filter(d => {
      const f = (d.field || '').toLowerCase();
      const fl = (d.fieldLabel || '').toLowerCase();
      return f.includes('vaga') || f.includes('contrata') || fl.includes('vaga') || fl.includes('contrata') || fl.includes('gupy') || fl.includes('vagas');
    }).length;
    return count + discoveriesCount;
  };
  const jobsCount = getJobsCount();

  // Best decision maker (ranking = 1)
  const bestDM = decisionMakers.length > 0 
    ? [...decisionMakers].sort((a, b) => a.ranking - b.ranking)[0]
    : null;

  // Best contact
  const bestContact = bestDM?.contacts?.[0] 
    ? `${bestDM.name} (${bestDM.contacts[0].email || bestDM.contacts[0].phone || 'Com Sucesso'})`
    : lead.telefone || lead.email || "Nenhum mapeado";

  // Confirmed fields list
  const confirmedDiscoveries = discoveries.filter(d => d.status === 'Confirmado');
  const uniqueConfirmedFields = Array.from(new Set(confirmedDiscoveries.map(d => d.field))) as string[];

  // Gaps list ("Ainda falta descobrir")
  const crucialFields = [
    { key: 'diretor', label: 'Decisor principal' },
    { key: 'telefone', label: 'Telefone comercial' },
    { key: 'email', label: 'E-mail contato' },
    { key: 'site', label: 'Site oficial' },
    { key: 'instagram', label: 'Canal Instagram' },
    { key: 'endereco', label: 'Endereço oficial' },
    { key: 'porte', label: 'Porte da empresa' },
    { key: 'produtos', label: 'Serviços/Produtos' }
  ];

  const pendingGaps = crucialFields.filter(field => {
    // 1. Check if dynamically discovered in discoveries list (regardless of confirmation status)
    const isDiscovered = discoveries.some(d => {
      const fieldLower = (d.field || '').toLowerCase().replace(/_/g, '');
      const labelLower = (d.fieldLabel || '').toLowerCase();
      const matchKey = fieldLower.includes(field.key.toLowerCase()) || field.key.toLowerCase().includes(fieldLower);
      const matchLabel = labelLower.includes(field.label.toLowerCase()) || field.label.toLowerCase().includes(labelLower);
      return matchKey || matchLabel;
    });
    if (isDiscovered) return false;

    // 2. Or if initial registered lead already contains it (user filled/edited it!)
    if (field.key === 'diretor' && (lead.diretorOficial || lead.nomeContato)) return false;
    if (field.key === 'telefone' && (lead.telefone || lead.whatsapp)) return false;
    if (field.key === 'email' && lead.email) return false;
    if (field.key === 'site' && lead.site) return false;
    if (field.key === 'instagram' && lead.instagram) return false;
    if (field.key === 'endereco' && (lead.enderecoOficial || lead.cidade || lead.estado)) return false;
    if (field.key === 'porte' && (lead.porteOficial || lead.capitalSocial)) return false;
    if (field.key === 'produtos' && (lead.produtosServicos || (lead.produtosOficiais && lead.produtosOficiais.length > 0) || (lead.servicosOficiais && lead.servicosOficiais.length > 0))) return false;

    return true;
  });

  const activeConflictsCount = conflicts.filter(c => c.status === 'Pendente').length;

  // Dynamic Enrichment Risk Calculation (0-100%)
  const calculateEnrichmentRisk = () => {
    let risk = 0;
    const reasons: string[] = [];

    // 1. Pending Conflicts (+25 pts per unresolved conflict, max 50)
    if (activeConflictsCount > 0) {
      const conflictPts = Math.min(activeConflictsCount * 25, 50);
      risk += conflictPts;
      reasons.push(`${activeConflictsCount} conflito(s) cadastrais ativos pendentes (+${conflictPts}%)`);
    }

    // 2. Verified reliable sources confirmed
    const reliableSourcesCount = uniqueConfirmedFields.length;
    if (reliableSourcesCount === 0) {
      risk += 30;
      reasons.push('Nenhuma fonte oficial homologada/confirmada (+30%)');
    } else if (reliableSourcesCount < 3) {
      risk += 15;
      reasons.push(`Apenas ${reliableSourcesCount} dado(s) oficial(is) confirmado(s) (+15%)`);
    }

    // 3. Lack of decision makers with confirmed names (+20 pts)
    const hasValidDM = decisionMakers.some(dm => dm.name && dm.name.length > 2 && !dm.name.toLowerCase().includes('pendente') && !dm.name.toLowerCase().includes('nome'));
    if (!hasValidDM && (!lead.sociosReal || lead.sociosReal.length === 0)) {
      risk += 20;
      reasons.push('Quadro societário e decisores ainda não mapeados (+20%)');
    }

    // 4. Crucial data gaps (+5 pts each, max 25)
    if (pendingGaps.length > 0) {
      const gapsPts = Math.min(pendingGaps.length * 5, 25);
      risk += gapsPts;
      reasons.push(`${pendingGaps.length} lacunas de contato/empresa pendentes (+${gapsPts}%)`);
    }

    // Cap at 100
    const finalRisk = Math.min(Math.max(risk, 5), 100);
    
    let level: 'Baixo' | 'Moderado' | 'Alto' = 'Baixo';
    let colorClass = 'text-emerald-400';
    let bgBarClass = 'bg-emerald-500';
    let badgeBorderClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

    if (finalRisk > 60) {
      level = 'Alto';
      colorClass = 'text-rose-400';
      bgBarClass = 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
      badgeBorderClass = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    } else if (finalRisk > 25) {
      level = 'Moderado';
      colorClass = 'text-amber-400';
      bgBarClass = 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
      badgeBorderClass = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    } else {
      level = 'Baixo';
      colorClass = 'text-emerald-400';
      bgBarClass = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
      badgeBorderClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }

    return {
      score: finalRisk,
      level,
      colorClass,
      bgBarClass,
      badgeBorderClass,
      reasons
    };
  };

  const enrichmentRisk = calculateEnrichmentRisk();

  // Helper label resolver
  function getButtonLabel(id: string): string {
    const dictionary: Record<string, string> = {
      'identify-company': 'Identificar Empresa',
      'validate-cadastro': 'Validar Cadastro',
      'classify-segment': 'Classificar Segmento',
      'save-official-data': 'Salvar Dados Oficiais',
      'locate-digital-presence': 'Localizar Presença',
      'analyze-website': 'Analisar Site',
      'discover-structure': 'Descobrir Estrutura',
      'analyze-reputation': 'Analisar Reputação',
      'generate-commercial-profile': 'Perfil Comercial',
      'seek-growth': 'Buscar Crescimento',
      'seek-news': 'Buscar Notícias',
      'seek-public-decisions': 'Mapear Decisores',
      'classify-decisions': 'Classificar Decisores',
      'generate-icp-score': 'Gerar ICP Score',
      'generate-commercial-strategy': 'Estratégia Comercial',
      'apollo': 'API Apollo',
      'pdl': 'API People Data Labs',
      'hunter': 'API Hunter',
      'rocketreach': 'API RocketReach',
      'prospeo': 'API Prospeo',
      'similarweb': 'API Similarweb',
      'whois': 'API WHOIS',
      'executive-report': 'Relatório Executivo',
      'consolidation': 'Consolidação Geral',
      'enrich-max': 'Enriquecimento Máximo'
    };
    return dictionary[id] || id;
  }

  // Format execution milliseconds nicely
  const formatTime = (ms: number) => {
    if (ms === 0) return '0s';
    const totalSecs = ms / 1000;
    if (totalSecs < 60) return `${totalSecs.toFixed(1)}s`;
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.round(totalSecs % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div id="sidebar-lead-stats" className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-6 lg:sticky lg:top-4">
      
      {/* Header section */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-950/50 border border-indigo-800/40 px-2 py-0.5 rounded-full">
          PAINEL LATERAL DE ENRIQUECIMENTO
        </span>
        <h2 className="text-xl font-bold font-sans tracking-tight mt-2 text-white">
          {lead.nomeFantasia || lead.razaoSocial || "Lead B2B"}
        </h2>
      </div>

      {/* Primary Export CTA */}
      <button
        onClick={async () => {
          const { exportLeadToPDF } = await import('../utils/pdfExport');
          exportLeadToPDF(lead, discoveries, decisionMakers, history, aiAnalysis, totalCost, totalDurationMs);
        }}
        id="btn-export-pdf"
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition-all border border-indigo-500/20 cursor-pointer active:scale-95"
      >
        <FileDown className="h-4 w-4 shrink-0" />
        Exportar Ficha Consolidada (PDF)
      </button>

      <hr className="border-slate-800" />

      {/* Dynamic Enrichment Risk Indicator (Risco de Enriquecimento) */}
      <div id="sidebar-enrichment-risk" className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className={`h-4 w-4 shrink-0 ${enrichmentRisk.colorClass}`} />
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 font-sans">
              Risco de Enriquecimento
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${enrichmentRisk.badgeBorderClass}`}>
            {enrichmentRisk.level} ({enrichmentRisk.score}%)
          </span>
        </div>

        {/* Dynamic visual risk progress bar (Green to Yellow to Red) */}
        <div className="space-y-1">
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800 p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${enrichmentRisk.bgBarClass}`}
              style={{ width: `${enrichmentRisk.score}%` }}
            />
          </div>
          <div className="flex justify-between text-[8.5px] font-mono text-slate-500">
            <span className="text-emerald-400">0% Seguro</span>
            <span className="text-amber-400">50% Moderado</span>
            <span className="text-rose-400">100% Crítico</span>
          </div>
        </div>

        {/* Dynamic risk factors breakdown */}
        <div className="pt-2 border-t border-slate-900 space-y-1">
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
            Diagnóstico de Confiabilidade:
          </div>
          {enrichmentRisk.reasons.length > 0 ? (
            <div className="space-y-1 max-h-[85px] overflow-y-auto pr-0.5">
              {enrichmentRisk.reasons.map((reason, rIdx) => (
                <div key={rIdx} className="text-[9px] text-slate-300 leading-snug flex items-start gap-1">
                  <span className={`shrink-0 ${enrichmentRisk.colorClass}`}>•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[9px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              <span>Dados 100% consistentes e homologados com sucesso.</span>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic ICP / Potential and priority dials */}
      <div className="grid grid-cols-2 gap-4">
        <div id="sidebar-icp-box" className="bg-slate-800/50 rounded-xl p-3 border border-slate-800 text-center relative group overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/10 blur-xl rounded-full"></div>
          <TrendingUp className="h-4 w-4 text-indigo-400 mx-auto mb-1" />
          <div className="text-2xl font-extrabold font-mono text-white tracking-tighter">
            {icp}%
          </div>
          <div className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mt-0.5">ICP Score</div>
        </div>

        <div id="sidebar-pot-box" className="bg-slate-800/50 rounded-xl p-3 border border-slate-800 text-center relative overflow-hidden">
          <Award className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
          <div className="text-2xl font-extrabold font-mono text-white tracking-tighter">
            {potential}%
          </div>
          <div className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider mt-0.5">Potencial Compra</div>
        </div>
      </div>

      {/* Priority and Luxury Score Indicators */}
      <div className="space-y-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium font-sans">Prioridade CRM</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            priority === 'Alta' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
            priority === 'Média' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
            'bg-slate-500/20 text-slate-300 border border-slate-500/30'
          }`}>
            {priority}
          </span>
        </div>

        <div className="flex flex-col gap-1 text-xs pt-2.5 border-t border-slate-800/60">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400 font-medium font-sans">Perfil Comercial</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
              isPremium 
                ? 'bg-amber-400/20 text-amber-300 border border-amber-500/30' 
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {isPremium ? '★ Luxo / Premium' : 'Padrão Comum'}
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between items-center font-mono">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Score Premium</span>
              <span className={`text-sm font-extrabold ${luxuryScore >= 70 ? 'text-amber-400' : luxuryScore >= 35 ? 'text-sky-400' : 'text-slate-400'}`}>
                {luxuryScore}/100
              </span>
            </div>

            <div className="flex items-center gap-1 justify-between">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => {
                  const filled = luxuryScore >= (i + 1) * 20;
                  return (
                    <span 
                      key={i} 
                      className={`text-sm ${filled ? 'text-amber-400' : 'text-slate-700'}`}
                    >
                      ★
                    </span>
                  );
                })}
              </div>
              <span className="text-[9px] text-slate-400 font-semibold font-sans">
                {luxuryScore >= 70 ? 'Luxo Consolidado' : luxuryScore >= 35 ? 'Médio-Alto Padrão' : 'Padrão Comum'}
              </span>
            </div>

            {/* Contributing factors listed clearly */}
            {luxuryFactors && luxuryFactors.length > 0 && (
              <div className="pt-2 border-t border-slate-900 space-y-1">
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Fatores de Qualificação:</div>
                <div className="space-y-1 max-h-[100px] overflow-y-auto pr-0.5">
                  {luxuryFactors.map((factor, fIdx) => (
                    <div key={fIdx} className="text-[9px] text-amber-300/90 leading-snug flex items-start gap-1">
                      <span className="text-amber-500 shrink-0">•</span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target and best decider info */}
      <div className="space-y-3 bg-slate-800/20 p-3 rounded-xl border border-slate-800/60">
        <div className="flex items-start gap-2.5">
          <UserCheck className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Melhor Decisor</div>
            <div className="text-xs font-semibold text-slate-100 line-clamp-1">{bestDM ? `${bestDM.name} (${bestDM.role})` : "Não mapeado"}</div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <PhoneCall className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Canal Quente Contato</div>
            <div className="text-xs font-mono font-medium text-slate-200 line-clamp-1">{bestContact}</div>
          </div>
        </div>
      </div>

      {/* Mapped Vacancies Widget */}
      <div 
        onClick={() => onNavigateToTab(3)} // Index 3 is Vagas tab
        className="bg-sky-950/30 border border-sky-800/40 p-3.5 rounded-xl hover:bg-sky-950/50 hover:border-sky-700/60 transition-all cursor-pointer space-y-2 group"
      >
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium font-sans flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-sky-400 shrink-0 group-hover:animate-bounce" />
            Vagas Ativas Mapeadas
          </span>
          <span className="text-xs font-black font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
            {jobsCount} Ativas
          </span>
        </div>
        <p className="text-[10px] text-sky-300/80 leading-normal">
          Identificamos oportunidades de contratação abertas nesta empresa. Clique aqui para visualizar a lista completa e links diretos de candidatura.
        </p>
      </div>

      <hr className="border-slate-800" />

      {/* INTELLIGENT GAP CLEANSER NOTIFICATION (LIMPEZA DE LACUNAS) */}
      {pendingGaps.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/25 p-3.5 rounded-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-xl rounded-full"></div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest font-sans">
                Aviso: Limpeza de Lacunas
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-200">
              {pendingGaps.length} lacunas cruciais de dados detectadas!
            </p>
            <p className="text-[10px] text-slate-400 leading-normal">
              Para obter uma ficha perfeita e maximizar as taxas de conversão de vendas, utilize as APIs direcionadas para limpar estas lacunas:
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-2.5 max-h-[160px] overflow-y-auto pr-0.5 scrollbar-thin">
            {pendingGaps.map(gap => {
              const gapApiSuggestions: Record<string, Array<{ id: string; label: string }>> = {
                diretor: [
                  { id: 'seek-public-decisions', label: 'LinkedIn Decisores' },
                  { id: 'pdl', label: 'People Data Labs' }
                ],
                telefone: [
                  { id: 'apollo', label: 'Apollo.io' },
                  { id: 'hunter', label: 'Hunter API' }
                ],
                email: [
                  { id: 'hunter', label: 'Hunter API' },
                  { id: 'apollo', label: 'Apollo.io' }
                ],
                site: [
                  { id: 'locate-digital-presence', label: 'Ache Site' },
                  { id: 'whois', label: 'API WHOIS' }
                ],
                instagram: [
                  { id: 'locate-digital-presence', label: 'Instagram Finder' }
                ],
                endereco: [
                  { id: 'validate-cadastro', label: 'Receita WS' }
                ],
                porte: [
                  { id: 'validate-cadastro', label: 'Receita WS' },
                  { id: 'similarweb', label: 'Similarweb' }
                ],
                produtos: [
                  { id: 'analyze-website', label: 'Analisar Site' }
                ]
              };
              const suggestions = gapApiSuggestions[gap.key] || [];
              return (
                <div key={gap.key} className="flex flex-col gap-1 pb-1.5 last:pb-0 border-b border-slate-800/40 last:border-0">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-300 font-medium">✗ {gap.label}</span>
                    <span className="text-[9px] text-rose-400 bg-rose-500/5 px-1.5 py-0.5 rounded font-mono">Faltante</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {suggestions.map(sug => (
                      <button
                        key={sug.id}
                        onClick={() => onNextButtonClick(sug.id)}
                        className="text-[8px] font-bold bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-200 hover:text-white px-2 py-0.5 rounded border border-indigo-500/20 hover:border-indigo-400/40 transition-all cursor-pointer font-sans"
                      >
                        Executar {sug.label}
                      </button>
                    ))}
                    {suggestions.length === 0 && (
                      <span className="text-[8px] text-slate-500 italic">Disparar Enriquecimento Geral</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pendingGaps.length > 0 && <hr className="border-slate-800" />}

      {/* Recommended Next step button widget */}
      <div className="bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-500/20 text-slate-200">
        <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
          <span>★ RECOMENDAÇÃO PRÓXIMO PASSO</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          Com base nos dados atuais, a IA recomenda disparar a seguinte etapa:
        </p>
        <button
          onClick={() => onNextButtonClick(nextButtonId)}
          id="btn-trigger-recommended"
          className="w-full flex items-center justify-between px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors group"
        >
          <span className="truncate">{nextRecLabel}</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
      </div>

      {/* Audit stats: Gaps and Confirmed fields count */}
      <div className="space-y-3.5">
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Dados Confirmados ({uniqueConfirmedFields.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto pr-1">
            {uniqueConfirmedFields.map((field) => (
              <span key={field} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                ✓ {field}
              </span>
            ))}
            {uniqueConfirmedFields.length === 0 && (
              <span className="text-[10px] text-slate-500 italic">Nenhum dado confirmado oficialmente ainda.</span>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-rose-400 flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" />
              Informações a Descobrir ({pendingGaps.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto pr-1">
            {pendingGaps.map((field) => (
              <span key={field.key} className="text-[9px] bg-rose-950/30 text-rose-300 px-1.5 py-0.5 rounded border border-rose-900/30">
                ✗ {field.label}
              </span>
            ))}
            {pendingGaps.length === 0 && (
              <span className="text-[10px] text-emerald-400 font-bold">✓ Ficha 100% preenchida e enriquecida!</span>
            )}
          </div>
        </div>
      </div>

      {/* Active conflicts alert block */}
      {activeConflictsCount > 0 && (
        <div
          onClick={() => onNavigateToTab(1)} // Navigate to discoveries/conflicts tab
          className="flex items-start gap-2.5 bg-rose-950/40 border border-rose-800/40 p-3 rounded-lg text-rose-200 cursor-pointer hover:bg-rose-950/60 transition-colors"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400 animate-bounce" />
          <div>
            <div className="text-xs font-bold text-rose-300">Conflito Detectado ({activeConflictsCount})</div>
            <p className="text-[10px] text-rose-300/80 leading-snug mt-0.5">
              Há dados divergentes entre as fontes encontradas. Clique aqui para resolver manualmente.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
