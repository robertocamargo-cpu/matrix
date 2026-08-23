/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lead, LeadLog, LeadEnrichmentRun } from '../types';
import { 
  Building2, Globe, Shield, Zap, Play, 
  Loader2, CheckCircle2, AlertTriangle, Cpu, Layers, Trash2
} from 'lucide-react';

interface EnrichmentTiersProps {
  lead: Lead;
  onTriggerEnrichment: (buttonId: string, pdlFilters?: { state?: string, sector?: string, size?: string }) => Promise<void>;
  logs: LeadLog[];
  isEnriching: boolean;
  currentActiveButton: string | null;
  enrichmentProgress: number; // 0 to 100
  onTriggerEnrichMax: (reRunAll: boolean) => Promise<void>;
  runs: LeadEnrichmentRun[];
  onClearEnrichmentData?: (leadId: string) => void;
}

export const EnrichmentTiers: React.FC<EnrichmentTiersProps> = ({
  lead,
  onTriggerEnrichment,
  logs,
  isEnriching,
  currentActiveButton,
  enrichmentProgress,
  onTriggerEnrichMax,
  runs,
  onClearEnrichmentData,
}) => {
  const [activeTier, setActiveTier] = useState<number>(1);
  const [showPaidConfirm, setShowPaidConfirm] = useState<string | null>(null);
  const [showEnrichMaxOptions, setShowEnrichMaxOptions] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // PDL Advanced Search Filter States
  const [pdlState, setPdlState] = useState<string>('');
  const [pdlSector, setPdlSector] = useState<string>('');
  const [pdlSize, setPdlSize] = useState<string>('');

  // Filter logs associated with current active transaction
  const filterRunLogs = logs.slice(-8); // Show last 8 actions in real-time scroll

  // Level definitions
  const tiers = [
    {
      id: 1,
      name: 'Nível 1 — Identificação',
      description: 'Descobrir quem é a empresa através de cadastros e dados federados oficiais.',
      color: 'border-blue-500 text-blue-600 bg-blue-50/10',
      badgeColor: 'bg-blue-100 text-blue-700',
      accentColor: 'blue',
      icon: <Building2 className="h-4.5 w-4.5 text-blue-500" />,
      sources: ['BrasilAPI', 'CNPJ.ws', 'Receita Federal'],
      buttons: [
        { id: 'identify-company', name: 'Identificar Empresa', cost: 'Gratuito', desc: 'Puxar dados cadastrais, CNPJ e status fiscal oficial.' },
        { id: 'validate-cadastro', name: 'Validar Cadastro', cost: 'Gratuito', desc: 'Verificar atividade econômica e data de abertura.' },
        { id: 'classify-segment', name: 'Classificar Segmento', cost: 'Gratuito', desc: 'Análise e catalogação fiscal de mercado via classificação CNAE.' },
        { id: 'save-official-data', name: 'Salvar Dados Oficiais', cost: 'Gratuito', desc: 'Armazenar capital social e endereço federado homologado.' }
      ]
    },
    {
      id: 2,
      name: 'Nível 2 — Comercial',
      description: 'Mapear presença digital de luxo, canais oficiais, abrangência e reputação.',
      color: 'border-emerald-500 text-emerald-600 bg-emerald-50/10',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      accentColor: 'emerald',
      icon: <Globe className="h-4.5 w-4.5 text-emerald-500" />,
      sources: ['Google Search', 'Website Oficial', 'Canais Sociais', 'Reclame Aqui', 'Maps', 'Wappalyzer'],
      buttons: [
        { id: 'locate-digital-presence', name: 'Localizar Presença', cost: 'Gratuito', desc: 'Buscar links de mídias de alta conversão (Instagram, LinkedIn).' },
        { id: 'analyze-website', name: 'Analisar Site', cost: 'Gratuito', desc: 'Identificar canais de contato direto, WhatsApp e design style.' },
        { id: 'discover-structure', name: 'Descobrir Estrutura', cost: 'Gratuito', desc: 'Estimar filiais, fomento e porte físico da operação.' },
        { id: 'analyze-reputation', name: 'Analisar Reputação', cost: 'Gratuito', desc: 'Consultar rating, reclamações agregadas e NPS no Reclame Aqui.' },
        { id: 'generate-commercial-profile', name: 'Gerar Perfil Comercial', cost: 'Gratuito', desc: 'Catalogar serviços e produtos comercializados.' }
      ]
    },
    {
      id: 3,
      name: 'Nível 3 — Estratégico',
      description: 'Encontrar momentos de compra quentes, vagas de emprego em aberto e decisores.',
      color: 'border-amber-500 text-amber-600 bg-amber-50/10',
      badgeColor: 'bg-amber-100 text-amber-700',
      accentColor: 'amber',
      icon: <Shield className="h-4.5 w-4.5 text-amber-500" />,
      sources: ['LinkedIn Público Indexado', 'Google News', 'Gupy', 'Indeed'],
      buttons: [
        { id: 'seek-growth', name: 'Buscar Crescimento', cost: 'Gratuito', desc: 'Detectar planos de expansão ou abertura de novas salas e filiais.' },
        { id: 'seek-news', name: 'Buscar Notícias', cost: 'Gratuito', desc: 'Pesquisar mídias públicas por menções à diretoria ou marca.' },
        { id: 'seek-public-decisions', name: 'Contatos Estratégicos', cost: 'Gratuito', desc: 'Localizar perfis de cargos de alta liderança em fontes abertas.' },
        { id: 'classify-decisions', name: 'Classificar Tomadores', cost: 'Gratuito', desc: 'Organizar contatos baseados no departamento (Compras, Diretor).' },
        { id: 'generate-icp-score', name: 'Gerar ICP Score', cost: 'Gratuito', desc: 'Cálculo dinâmico automatizado de aderência ao perfil de Luxo.' },
        { id: 'generate-commercial-strategy', name: 'Estratégia de Abordagem', cost: 'Gratuito', desc: 'Definir pitch e contorno de objeções premium para o vendedor.' }
      ]
    },
    {
      id: 4,
      name: 'Nível 4 — Especialista (APIs Pagas)',
      description: 'Consultar bases estruturadas globais de contatos e tráfego web real.',
      color: 'border-indigo-500 text-indigo-600 bg-indigo-50/10',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      accentColor: 'indigo',
      icon: <Zap className="h-4.5 w-4.5 text-indigo-500" />,
      sources: ['Apollo.io API', 'People Data Labs', 'Hunter Email Verification', 'Similarweb'],
      buttons: [
        { id: 'apollo', name: 'Consultar Apollo.io', cost: 'Pago (R$ 0.15)', desc: 'Cruzar telefone celular direto e e-mails corporativos válidos.' },
        { id: 'pdl', name: 'People Data Labs', cost: 'Pago (R$ 0.15)', desc: 'Obter estatísticas históricas de funcionários e organograma.' },
        { id: 'hunter', name: 'Pesquisa Hunter', cost: 'Pago (R$ 0.15)', desc: 'Mapear e testar integridade de emails com o domínio do lead.' },
        { id: 'similarweb', name: 'Similarweb Tráfego', cost: 'Pago (R$ 0.15)', desc: 'Análise de rank global, volume de busca e estatísticas de visitas.' },
        { id: 'whois', name: 'Consulta WHOIS', cost: 'Pago (R$ 0.11)', desc: 'Apurar registrador do domínio oficial e data de renovação.' }
      ]
    }
  ];

  // Helper completion percentage math
  const getTierProgress = (tierId: number) => {
    const tier = tiers.find(t => t.id === tierId);
    if (!tier) return { completed: 0, total: 0, percentage: 0 };
    const completed = tier.buttons.filter(btn => runs.some(r => r.leadId === lead.id && r.buttonId === btn.id)).length;
    return {
      completed,
      total: tier.buttons.length,
      percentage: Math.round((completed / tier.buttons.length) * 100)
    };
  };

  const handleButtonClick = (buttonId: string, isPaid: boolean) => {
    if (isEnriching) return;
    if (isPaid) {
      setShowPaidConfirm(buttonId);
    } else {
      const filters = buttonId === 'pdl' ? { state: pdlState, sector: pdlSector, size: pdlSize } : undefined;
      onTriggerEnrichment(buttonId, filters);
    }
  };

  const confirmPaidExecution = () => {
    if (showPaidConfirm) {
      const filters = showPaidConfirm === 'pdl' ? { state: pdlState, sector: pdlSector, size: pdlSize } : undefined;
      onTriggerEnrichment(showPaidConfirm, filters);
      setShowPaidConfirm(null);
    }
  };

  const activeTierObj = tiers.find(t => t.id === activeTier)!;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-5">
      
      {/* Top action header: Tiers controller and Enriquecimento Máximo block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Motores de Enriquecimento</h3>
            <p className="text-xs text-slate-500">Selecione o nível de profundidade da varredura inteligente.</p>
          </div>
        </div>

        {/* Dynamic Enriquecimento Máximo Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {onClearEnrichmentData && (
            <button
              onClick={() => setShowResetConfirm(true)}
              id="btn-clear-enrichment"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-500 font-bold text-xs rounded-lg transition-all cursor-pointer"
            >
              Limpar Análise
            </button>
          )}
          <button
            onClick={() => setShowEnrichMaxOptions(!showEnrichMaxOptions)}
            id="btn-enrich-max"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 fill-white" />
            Enriquecimento Máximo
          </button>
        </div>
      </div>

      {/* Enrich Max configuration panel */}
      {showEnrichMaxOptions && (
        <div className="bg-gradient-to-r from-amber-500/5 to-rose-500/5 p-4 rounded-xl border border-amber-500/20 space-y-3.5">
          <div className="flex items-start gap-2.5">
            <Cpu className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Orquestrador Inteligente de Enriquecimento</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Varre todas as camadas disponíveis de dados públicos, cruzando redes, fontes federais e vagas abertas no mesmo fluxo.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end pt-1">
            <button
              onClick={() => {
                setShowEnrichMaxOptions(false);
                onTriggerEnrichMax(false); // only missing steps
              }}
              id="btn-enrich-max-missing"
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xxs sm:text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Executar Etapas Restantes
            </button>
            <button
              onClick={() => {
                setShowEnrichMaxOptions(false);
                onTriggerEnrichMax(true); // rerun all
              }}
              id="btn-enrich-max-all"
              className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-xxs sm:text-xs px-3.5 py-1.5 rounded-lg shadow-sm cursor-pointer"
            >
              Forçar Re-Execução de Todas as Etapas
            </button>
          </div>
        </div>
      )}

      {/* Modern Grid of Level Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        {tiers.map((tier) => {
          const { completed, total, percentage } = getTierProgress(tier.id);
          const isSelected = activeTier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => setActiveTier(tier.id)}
              className={`flex flex-col items-start text-left p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/10 ring-1 ring-indigo-600/10'
                  : 'border-slate-150 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="p-1 rounded bg-white shadow-xs border border-slate-100">
                  {tier.icon}
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                  percentage === 100 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : completed > 0 
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-500'
                }`}>
                  {completed}/{total}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 tracking-tight mt-1 line-clamp-1">
                {tier.name}
              </h4>
              
              {/* Mini progress bar inside tab */}
              <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full ${percentage === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Details Box of Selected Tier */}
      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-2">
        <div className="flex items-start justify-between gap-2.5">
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase">
              {activeTierObj.name}
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 leading-normal font-medium">
              {activeTierObj.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/40">
          <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase shrink-0">FONTES ANALISADAS:</span>
          {activeTierObj.sources.map((src, sIdx) => (
            <span 
              key={sIdx} 
              className="text-[9.5px] bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-sans shadow-xs font-medium"
            >
              {src}
            </span>
          ))}
        </div>
      </div>

      {/* People Data Labs Advanced Filters Card */}
      {activeTier === 4 && (
        <div className="bg-indigo-50/45 p-4 rounded-xl border border-indigo-100/80 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-600 animate-pulse" />
            <h4 className="font-bold text-slate-800 text-xs font-sans">
              Filtros de Busca Avançada (People Data Labs)
            </h4>
          </div>
          <p className="text-[10px] text-slate-500 font-sans">
            Defina critérios de busca estruturados para filtrar as descobertas de empresas e contatos no PDL.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 mb-1 font-sans">ESTADO (EX: RJ, SP, SC)</label>
              <input
                type="text"
                placeholder="Ex: SP"
                value={pdlState}
                onChange={(e) => setPdlState(e.target.value.toUpperCase())}
                maxLength={2}
                className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 mb-1 font-sans">SETOR DE ATUAÇÃO</label>
              <input
                type="text"
                placeholder="Ex: tech, finance"
                value={pdlSector}
                onChange={(e) => setPdlSector(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 mb-1 font-sans">PORTE (NÚM. COLABORADORES)</label>
              <select
                value={pdlSize}
                onChange={(e) => setPdlSize(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-705 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Todos os Portes</option>
                <option value="1-10">Micro (1-10)</option>
                <option value="11-50">Pequeno (11-50)</option>
                <option value="51-200">Médio-Pequeno (51-200)</option>
                <option value="201-500">Médio (201-500)</option>
                <option value="501-1000">Grande-Médio (501-1000)</option>
                <option value="1001-5000">Grande (1001-5000)</option>
                <option value="5001-10000">Corporação (5001-10000)</option>
                <option value="10001+">Enterprise (10001+)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Progress display bar under active enrichment action */}
      {isEnriching && (
        <div id="enrichment-progress-area" className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-md space-y-3.5">
          <div className="flex justify-between items-center text-sm font-sans">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              Executando: <span className="text-indigo-400 font-semibold">{getButtonLabel(currentActiveButton || '')}</span>
            </span>
            <span className="text-xs text-indigo-300 font-mono font-bold bg-indigo-950 px-2 py-0.5 border border-indigo-800/40 rounded">
              {enrichmentProgress}%
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              style={{ width: `${enrichmentProgress}%` }}
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
            ></div>
          </div>

          {/* Running logs block resembling real terminal stream */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-8 w-full max-h-[420px] overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 select-none">
            {filterRunLogs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                <span className={
                  log.type === 'error' ? 'text-rose-400 font-bold' :
                  log.type === 'warn' ? 'text-amber-400 font-bold animate-pulse' :
                  log.type === 'success' ? 'text-emerald-400 font-bold' :
                  log.type === 'api' ? 'text-sky-300' :
                  log.type === 'ai' ? 'text-amber-300' : 'text-slate-300'
                }>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bento Grid layout of tools in current active Tier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {activeTierObj.buttons.map((btn) => {
          const isPaid = btn.cost.includes('Pago');
          const hasBeenRun = runs.some(r => r.leadId === lead.id && r.buttonId === btn.id);
          return (
            <div
              key={btn.id}
              id={`enrich-btn-container-${btn.id}`}
              className={`bg-white border rounded-xl p-3.5 flex flex-col justify-between hover:shadow-xs transition-all ${
                hasBeenRun ? 'border-slate-300 bg-slate-50/10' : 'border-slate-200/85'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-1">
                  <div className="flex items-center gap-1.5">
                    {hasBeenRun && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                    <h4 className="text-xs font-extrabold text-slate-850 tracking-tight">{btn.name}</h4>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isPaid 
                      ? hasBeenRun ? 'bg-slate-200 text-slate-705' : 'bg-amber-100 text-amber-800 font-mono' 
                      : hasBeenRun ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-805'
                  }`}>
                    {btn.cost}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{btn.desc}</p>
              </div>
              <button
                onClick={() => handleButtonClick(btn.id, isPaid)}
                id={`btn-trigger-${btn.id}`}
                disabled={isEnriching}
                data-processed={hasBeenRun ? "true" : "false"}
                className={`mt-4 w-full py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold transition-all duration-300 cursor-pointer active:scale-95 ${
                  isEnriching
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : hasBeenRun
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600 shadow-sm font-semibold'
                      : 'bg-slate-900 text-white hover:bg-black border border-slate-950 shadow-sm'
                }`}
              >
                {hasBeenRun ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0 fill-current" />
                    Apurado • Atualizar
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-current" />
                    Mapear Dados
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Paid API Confirmation Dialog/Modal */}
      {showPaidConfirm && (
        <div id="paid-api-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex gap-3 text-amber-600">
              <div className="p-2.5 rounded-full bg-amber-50">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 font-sans">Confirmação de Custo de API</h3>
                <p className="text-xs text-slate-500 mt-1">Este enriquecimento envolve consulta a bancos pagos.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl space-y-2 text-slate-700 text-xs leading-relaxed">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="font-semibold text-slate-500">API B2B:</span>
                <span className="font-bold text-slate-800 uppercase">{showPaidConfirm} Connector</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="font-semibold text-slate-500">Débito Estimado:</span>
                <span className="font-bold text-rose-600">1.0 Crédito (~R$ 0.15)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Saldo Atual da Conta:</span>
                <span className="font-bold text-emerald-600">450 Créditos (R$ 67.50)</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic leading-snug">
              Nota: Essa cobrança é simulada para fins de auditoria no painel. O valor será computado na tabela de "lead_costs" associada ao lead.
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPaidConfirm(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Cancelar Operação
              </button>
              <button
                onClick={confirmPaidExecution}
                id="btn-confirm-paid-execution"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Confirmar e Debitar Crédito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Reset/Clear Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans">Limpar dados do Lead?</h3>
                <p className="text-xs text-slate-500">Isso apagará todas as descobertas e históricos.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-sans">
              Você deseja realmente limpar todas as informações estruturadas, contatos e histórico de enriquecimento acumulados para <strong>{lead.nomeFantasia || "esta empresa"}</strong>? A ficha retornará comercialmente ao estado de busca inicial.
            </p>

            <div className="flex items-center justify-end gap-2.5 font-sans">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg transition-all cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  if (onClearEnrichmentData) {
                    onClearEnrichmentData(lead.id);
                  }
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer animate-pulse"
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper name resolver for buttons outside dictionaries
function getButtonLabel(id: string): string {
  const dictionary: Record<string, string> = {
    'identify-company': 'Identificar Empresa',
    'validate-cadastro': 'Validar Cadastro',
    'classify-segment': 'Classificar Segmento',
    'save-official-data': 'Salvar Dados Oficiais',
    'locate-digital-presence': 'Localizar Presença Digital',
    'analyze-website': 'Analisar Site',
    'discover-structure': 'Descobrir Estrutura',
    'analyze-reputation': 'Analisar Reputação',
    'generate-commercial-profile': 'Gerar Perfil Comercial',
    'seek-growth': 'Buscar Crescimento',
    'seek-news': 'Buscar Notícias border',
    'seek-public-decisions': 'Buscar Decisores Públicos',
    'classify-decisions': 'Classificar Decisores',
    'generate-icp-score': 'Gerar ICP Score',
    'generate-commercial-strategy': 'Gerar Estratégia Comercial',
    'apollo': 'Apollo.io Enriquecimento',
    'pdl': 'People Data Labs Lookup',
    'hunter': 'Hunter.io Verificação',
    'rocketreach': 'Mapeamento RocketReach',
    'prospeo': 'Validador Prospeo',
    'similarweb': 'Métricas Similarweb',
    'whois': 'Consulta WHOIS',
    'executive-report': 'Relatório Executivo',
    'consolidation': 'Consolidação de Descobertas',
    'enrich-max': 'Enriquecimento Máximo Total'
  };
  return dictionary[id] || id;
}
