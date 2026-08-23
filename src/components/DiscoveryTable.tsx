/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lead, LeadDiscovery, LeadConflict } from '../types';
import { 
  Check, X, FileJson, Link, ShieldAlert, BadgeInfo,
  ChevronDown, ChevronUp, AlertCircle, HelpCircle, AlertTriangle,
  Briefcase, ExternalLink, GitCompare, RefreshCw, ArrowRight, Sparkles
} from 'lucide-react';

interface DiscoveryTableProps {
  lead: Lead;
  discoveries: LeadDiscovery[];
  conflicts: LeadConflict[];
  onConfirmDiscovery: (discoveryId: string) => void;
  onRejectDiscovery: (discoveryId: string) => void;
  onResolveConflict: (conflictId: string, acceptedValue: string, source: string) => void;
}

export const DiscoveryTable: React.FC<DiscoveryTableProps> = ({
  lead,
  discoveries,
  conflicts,
  onConfirmDiscovery,
  onRejectDiscovery,
  onResolveConflict,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'conflicts' | 'vagas' | 'comparacao'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});
  const [selectedConflictForModal, setSelectedConflictForModal] = useState<LeadConflict | null>(null);

  // Cross-scan comparison engine
  const getCrossScanData = () => {
    const fieldsToScan = [
      {
        key: 'site',
        label: 'Site Oficial',
        currentValue: lead.site || '',
        discoveryKeys: ['site', 'website', 'url'],
        fallbackLabel: 'Site da Empresa'
      },
      {
        key: 'email',
        label: 'E-mail de Contato',
        currentValue: lead.email || '',
        discoveryKeys: ['email', 'e-mail', 'contato_email', 'email_contato'],
        fallbackLabel: 'E-mail Comercial'
      },
      {
        key: 'telefone',
        label: 'Telefone / WhatsApp',
        currentValue: lead.telefone || lead.whatsapp || '',
        discoveryKeys: ['telefone', 'phone', 'whatsapp', 'tel'],
        fallbackLabel: 'Telefone de Contato'
      },
      {
        key: 'instagram',
        label: 'Instagram',
        currentValue: lead.instagram || '',
        discoveryKeys: ['instagram', 'redes_sociais', 'insta'],
        fallbackLabel: 'Perfil do Instagram'
      },
      {
        key: 'cidade',
        label: 'Sede da Empresa',
        currentValue: lead.cidade || '',
        discoveryKeys: ['cidade', 'municipio', 'localidade', 'sede'],
        fallbackLabel: 'Cidade Sede'
      },
      {
        key: 'porteOficial',
        label: 'Porte / Faturamento',
        currentValue: lead.porteOficial || '',
        discoveryKeys: ['porte', 'faturamento', 'porte_oficial', 'tamanho'],
        fallbackLabel: 'Porte Oficial'
      },
      {
        key: 'vagasAbertas',
        label: 'Links de Vagas',
        currentValue: lead.vagasAbertas || '',
        discoveryKeys: ['vaga', 'contrata', 'gupy', 'vagas'],
        fallbackLabel: 'Portal de Vagas'
      }
    ];

    const results = fieldsToScan.map(field => {
      // Find matching discovery
      const matchedDiscovery = discoveries.find(d => {
        const fieldName = (d.field || '').toLowerCase().replace(/_/g, '');
        const labelName = (d.fieldLabel || '').toLowerCase();
        return field.discoveryKeys.some(dk => fieldName.includes(dk) || labelName.includes(dk));
      });

      const discoveredValue = matchedDiscovery?.cleanValue || '';
      const hasDiscovered = !!discoveredValue;
      const hasCurrent = !!field.currentValue;

      let status: 'synchronized' | 'pending_official' | 'divergent' | 'no_data' = 'no_data';
      
      if (!hasDiscovered && !hasCurrent) {
        status = 'no_data';
      } else if (hasDiscovered && !hasCurrent) {
        status = 'pending_official';
      } else if (hasDiscovered && hasCurrent) {
        const normCurrent = field.currentValue.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normDiscovered = discoveredValue.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (normCurrent === normDiscovered || normCurrent.includes(normDiscovered) || normDiscovered.includes(normCurrent)) {
          status = 'synchronized';
        } else {
          status = 'divergent';
        }
      } else if (!hasDiscovered && hasCurrent) {
        status = 'synchronized';
      }

      return {
        ...field,
        discoveredValue,
        discoverySource: matchedDiscovery?.sourceName || 'IA Finder',
        confidence: matchedDiscovery?.confidence || 0,
        discoveryId: matchedDiscovery?.id,
        status
      };
    });

    const pendingCount = results.filter(r => r.status === 'pending_official' || r.status === 'divergent').length;

    return { results, pendingCount };
  };

  const crossScan = getCrossScanData();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Confirmado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejeitado':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Conflitante':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'Sugerido':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getConfidenceStyle = (score: number) => {
    if (score >= 90) return 'text-emerald-600 font-bold';
    if (score >= 60) return 'text-amber-600 font-semibold';
    return 'text-rose-600 font-semibold';
  };

  // Extract and parse jobs/vagas dynamically
  const getParsedJobs = () => {
    const jobs: Array<{ title: string; url?: string; source: string; status: string; confidence: number }> = [];

    // 1. Check official lead fields
    if (lead.vagasOficial) {
      const items = Array.isArray(lead.vagasOficial) ? lead.vagasOficial : [lead.vagasOficial];
      items.forEach(item => {
        if (!item) return;
        const urls = item.match(/(https?:\/\/[^\s\)]+)/g);
        const firstUrl = urls && urls[0];
        let title = item;
        if (firstUrl) {
          title = item.replace(firstUrl, '').replace(/[()]/g, '').trim();
        }
        if (!title || title.length < 3) {
          title = "Vagas em aberto na empresa";
        }
        jobs.push({
          title,
          url: firstUrl || undefined,
          source: 'Cadastro Oficial (Receita/Gupy)',
          status: 'Confirmado',
          confidence: 100
        });
      });
    }

    if (lead.vagasAbertas && !lead.vagasOficial) {
      const urls = lead.vagasAbertas.match(/(https?:\/\/[^\s\)]+)/g);
      const firstUrl = urls && urls[0];
      let title = lead.vagasAbertas;
      if (firstUrl) {
        title = lead.vagasAbertas.replace(firstUrl, '').replace(/[()]/g, '').trim();
      }
      if (!title || title.length < 3) {
        title = "Vagas de Emprego Mapeadas";
      }
      jobs.push({
        title,
        url: firstUrl || undefined,
        source: 'Dados Iniciais Enriquecidos',
        status: 'Sugerido',
        confidence: 85
      });
    }

    // 2. Check discoveries list
    const vagasDiscoveries = discoveries.filter(d => {
      const f = (d.field || '').toLowerCase();
      const fl = (d.fieldLabel || '').toLowerCase();
      return f.includes('vaga') || f.includes('contrata') || fl.includes('vaga') || fl.includes('contrata') || fl.includes('gupy') || fl.includes('vagas');
    });

    vagasDiscoveries.forEach(d => {
      if (!d.cleanValue) return;
      // Split by commas or bullet points or newlines
      const parts = d.cleanValue.split(/[;\n••]+|\s{2,}/);
      parts.forEach(p => {
        const cleanedPart = p.trim();
        if (!cleanedPart || cleanedPart.length < 4) return;
        
        const urls = cleanedPart.match(/(https?:\/\/[^\s\)]+)/g);
        const firstUrl = urls && urls[0];
        let title = cleanedPart;
        if (firstUrl) {
          title = cleanedPart.replace(firstUrl, '').replace(/[()]/g, '').trim();
        }
        if (!title || title.length < 3) {
          title = d.fieldLabel || "Vaga em Aberto";
        }

        // Avoid exact title duplicate
        const isDup = jobs.some(j => j.title.toLowerCase().trim() === title.toLowerCase().trim());
        if (!isDup) {
          jobs.push({
            title,
            url: firstUrl || d.sourceUrl || undefined,
            source: d.sourceName || 'IA Finder',
            status: d.status,
            confidence: d.confidence
          });
        }
      });
    });

    return jobs;
  };

  const parsedJobs = getParsedJobs();
  const activeConflicts = conflicts.filter(c => c.status === 'Pendente');

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-5 space-y-4">
      {/* Table filter header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`text-sm font-semibold pb-2 transition-all border-b-2 ${
              activeTab === 'all'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-400 border-transparent hover:text-slate-700'
            }`}
          >
            Todas as Descobertas ({discoveries.length})
          </button>
          <button
            onClick={() => setActiveTab('conflicts')}
            id="tab-conflicts"
            className={`text-sm font-semibold pb-2 transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'conflicts'
                ? 'text-rose-600 border-rose-600'
                : 'text-slate-400 border-transparent hover:text-slate-700'
            }`}
          >
            Conflitos de Fontes ({activeConflicts.length})
            {activeConflicts.length > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('vagas')}
            id="tab-vagas"
            className={`text-sm font-semibold pb-2 transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'vagas'
                ? 'text-sky-600 border-sky-600'
                : 'text-slate-400 border-transparent hover:text-slate-700'
            }`}
          >
            <Briefcase className="h-4 w-4 shrink-0 text-sky-500" />
            Vagas Disponíveis ({parsedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('comparacao')}
            id="tab-comparacao"
            className={`text-sm font-semibold pb-2 transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'comparacao'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-400 border-transparent hover:text-slate-700'
            }`}
          >
            <GitCompare className="h-4 w-4 shrink-0 text-indigo-500" />
            Cruzamento de Dados
            {crossScan.pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-800 font-bold font-sans text-[10px] px-1.5 py-0.5 rounded-full border border-amber-200">
                {crossScan.pendingCount} novos
              </span>
            )}
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono italic">
          Auditoria Ativa • IA Nunca Inventa
        </div>
      </div>

      {/* CONFLICTS MATRIX VIEW */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          {activeConflicts.map((conflict) => (
            <div
              key={conflict.id}
              id={`conflict-card-${conflict.id}`}
              className="border border-rose-100 bg-rose-50/20 p-4 rounded-xl space-y-4 animate-in fade-in-50"
            >
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <h4 className="text-sm font-bold">Divergência Detectada: Campo "{conflict.fieldLabel}"</h4>
              </div>

              <p className="text-xs text-slate-500">
                O CRM detectou duas fontes ativas informando dados conflitantes para o campo. Selecione manualmente qual valor oficial homologar:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Source A Option */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-indigo-300 transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">FONTE DE ORIGEM A</span>
                    <h5 className="font-bold text-slate-800 text-sm mt-0.5">{conflict.sourceA}</h5>
                    <p className="text-xs font-mono bg-slate-50 p-2 rounded border text-indigo-700 font-bold mt-1.5 break-all">
                      {conflict.valueA}
                    </p>
                  </div>
                  <button
                    onClick={() => onResolveConflict(conflict.id, conflict.valueA, conflict.sourceA)}
                    id={`btn-resolve-conflict-a-${conflict.id}`}
                    className="w-full mt-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    Homologar Valor da Fonte A
                  </button>
                </div>

                {/* Source B Option */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-indigo-300 transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">FONTE DE ORIGEM B</span>
                    <h5 className="font-bold text-slate-800 text-sm mt-0.5">{conflict.sourceB}</h5>
                    <p className="text-xs font-mono bg-slate-50 p-2 rounded border text-emerald-700 font-bold mt-1.5 break-all">
                      {conflict.valueB}
                    </p>
                  </div>
                  <button
                    onClick={() => onResolveConflict(conflict.id, conflict.valueB, conflict.sourceB)}
                    id={`btn-resolve-conflict-b-${conflict.id}`}
                    className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    Homologar Valor da Fonte B
                  </button>
                </div>
              </div>
            </div>
          ))}

          {activeConflicts.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              ★ Excelente! Não existem conflitos pendentes de auditoria para o lead selecionado.
            </div>
          )}
        </div>
      )}

      {/* VAGAS DISPONÍVEIS VIEW */}
      {activeTab === 'vagas' && (
        <div className="space-y-4 animate-in fade-in-50">
          <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl flex items-start gap-3">
            <Briefcase className="h-5 w-5 text-sky-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-sky-800">Seção Dedicada: Vagas Disponíveis Mapeadas</h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                Exibição centralizada das vagas de emprego abertas encontradas para a empresa <strong className="text-slate-800 font-semibold">{lead.nomeFantasia || lead.razaoSocial}</strong>. O mapeamento busca continuamente em portais de recrutamento como Gupy, LinkedIn Vagas, Catho, e sites de carreiras institucionais.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedJobs.map((job, index) => {
              const isGupy = job.url?.toLowerCase().includes('gupy');
              const isLinkedin = job.url?.toLowerCase().includes('linkedin');
              const isCatho = job.url?.toLowerCase().includes('catho');
              const platformName = isGupy ? 'Gupy' : isLinkedin ? 'LinkedIn' : isCatho ? 'Catho' : 'Portal Institucional';
              const platformColor = isGupy ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                                    isLinkedin ? 'bg-sky-50 text-sky-700 border-sky-200' : 
                                    'bg-slate-50 text-slate-700 border-slate-200';

              return (
                <div 
                  key={index} 
                  className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm hover:border-sky-300 transition-all space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider font-mono ${platformColor}`}>
                        {platformName}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        job.status === 'Confirmado' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">
                      {job.title}
                    </h5>

                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                      <span>Confiança: <strong>{job.confidence}%</strong></span>
                      <span>•</span>
                      <span className="truncate">Fonte: {job.source}</span>
                    </div>
                  </div>

                  {job.url ? (
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm text-center cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Visualizar Vaga Direta
                    </a>
                  ) : (
                    <a 
                      href={`https://www.google.com/search?q=vagas+de+trabalho+na+empresa+${encodeURIComponent(lead.nomeFantasia || lead.razaoSocial)}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 text-center cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                      Pesquisar Vaga no Google
                    </a>
                  )}
                </div>
              );
            })}

            {parsedJobs.length === 0 && (
              <div className="col-span-full py-10 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-3 shadow-sm">
                <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">Nenhuma vaga mapeada ainda</p>
                  <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
                    Não encontramos links de vagas ativos para esta empresa em nossa última execução de robôs. Você pode buscar agora no Google Vagas ou Gupy:
                  </p>
                </div>
                <div className="pt-2">
                  <a 
                    href={`https://www.google.com/search?q=vagas+de+trabalho+na+empresa+${encodeURIComponent(lead.nomeFantasia || lead.razaoSocial)}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Buscar Vagas no Google Jobs
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DISCOVERIES TABLE VIEW */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {[
            {
              id: 'identificacao',
              name: 'Identificação Cadastral (CNPJ/Endereço/QSA)',
              color: 'text-indigo-700 bg-indigo-50 border-indigo-100',
              accent: 'bg-indigo-600',
              fields: ['cnpj', 'razaosocial', 'nomefantasia', 'cnaes', 'cnaeprincipal', 'cnaedesc', 'situacao', 'capitalsocial', 'socios', 'endereco', 'porte', 'razaosocialoficial', 'cnpjoficial', 'nomefantasiaoficial', 'cnaesoficial', 'situacaooficial', 'capitalsocialoficial', 'sociosoficial', 'enderecooficial']
            },
            {
              id: 'digital',
              name: 'Presença Digital & Canais (Sites/Redes/WHOIS)',
              color: 'text-sky-700 bg-sky-50 border-sky-100',
              accent: 'bg-sky-500',
              fields: ['site', 'instagram', 'linkedin', 'facebook', 'tiktok', 'youtube', 'whatsapp', 'email', 'telefone', 'siteoficial', 'redesoficiais', 'telefonesoficiais', 'emailsoficiais', 'whatsappoficial', 'tecnologiassiteoficial', 'scoresimilarweboficial', 'whoisdataoficial', 'whoisdata', 'tecnologias', 'links', 'links_coletados', 'urlsoficiais']
            },
            {
              id: 'comercial',
              name: 'Comercial & Estrutura (Porte/Filiais/Portfólio)',
              color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
              accent: 'bg-emerald-600',
              fields: ['produtos', 'servicos', 'filiais', 'estrutura', 'perfilpremium', 'produtosoficiais', 'servicosoficiais', 'filiaisoficiais', 'estruturaoficial', 'porteoficial', 'perfilpremiumoficial', 'produtosservicos', 'reputacao']
            },
            {
              id: 'estrategico',
              name: 'Inteligência Estratégica (Decisores/Vagas/Sinais)',
              color: 'text-amber-700 bg-amber-50 border-amber-100',
              accent: 'bg-amber-500',
              fields: ['expansao', 'novasunidades', 'reformas', 'contratacoes', 'compradores', 'operacoes', 'facilities', 'governanca', 'diretor', 'proprietario', 'vagasoficial', 'vagasabertas', 'faturamento', 'vagas', 'vagasdisponiveis', 'vagas_disponiveis']
            }
          ].map((cat) => {
            const catDiscoveries = discoveries.filter(disc => {
              const f = (disc.field || '').toLowerCase();
              const fl = (disc.fieldLabel || '').toLowerCase();
              
              // Check exact matches or heuristics
              const isInFields = cat.fields.includes(f);
              if (isInFields) return true;
              
              if (cat.id === 'identificacao') {
                return fl.includes('cnpj') || fl.includes('razão') || fl.includes('razao') || fl.includes('fantasia') || fl.includes('cnae') || fl.includes('sócio') || fl.includes('socio') || fl.includes('endereço') || fl.includes('capital') || fl.includes('cadastro');
              }
              if (cat.id === 'digital') {
                return fl.includes('site') || fl.includes('instagram') || fl.includes('linkedin') || fl.includes('facebook') || fl.includes('youtube') || fl.includes('whatsapp') || fl.includes('email') || fl.includes('e-mail') || fl.includes('telefone') || fl.includes('whois') || fl.includes('redes') || fl.includes('tags') || fl.includes('tecnologias') || fl.includes('link') || fl.includes('links') || fl.includes('cardápio') || fl.includes('cardapio') || fl.includes('catálogo') || fl.includes('catalogo') || fl.includes('url');
              }
              if (cat.id === 'comercial') {
                return fl.includes('reputação') || fl.includes('reputacao') || fl.includes('produto') || fl.includes('serviço') || fl.includes('servico') || fl.includes('filiais') || fl.includes('estrutura') || fl.includes('porte') || fl.includes('faturamento') || fl.includes('premium');
              }
              
              // Fallback to strategic if nothing matches
              const otherMatch = ['cnpj', 'razaosocial', 'nomefantasia', 'cnaes', 'cnaeprincipal', 'cnaedesc', 'situacao', 'capitalsocial', 'socios', 'endereco', 'porte', 'razaosocialoficial', 'cnpjoficial', 'nomefantasiaoficial', 'cnaesoficial', 'situacaooficial', 'capitalsocialoficial', 'sociosoficial', 'enderecooficial',
                                  'site', 'instagram', 'linkedin', 'facebook', 'tiktok', 'youtube', 'whatsapp', 'email', 'telefone', 'siteoficial', 'redesoficiais', 'telefonesoficiais', 'emailsoficiais', 'whatsappoficial', 'tecnologiassiteoficial', 'scoresimilarweboficial', 'whoisdataoficial', 'whoisdata', 'tecnologias', 'links', 'links_coletados', 'urlsoficiais',
                                  'produtos', 'servicos', 'filiais', 'estrutura', 'perfilpremium', 'produtosoficiais', 'servicosoficiais', 'filiaisoficiais', 'estruturaoficial', 'porteoficial', 'perfilpremiumoficial', 'produtosservicos', 'reputacao'
                                 ].some(x => x === f);
              return !otherMatch;
            });

            const isCollapsed = collapsedCats[cat.id];

            return (
              <div key={cat.id} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                {/* Category Header */}
                <button
                  onClick={() => setCollapsedCats(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                  className={`w-full flex items-center justify-between p-3.5 border-b border-slate-100 cursor-pointer text-left transition-all hover:opacity-95 ${cat.color}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${cat.accent}`}></span>
                    <span className="font-bold text-sm tracking-tight">{cat.name}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200">
                      {catDiscoveries.length} {catDiscoveries.length === 1 ? 'dado' : 'dados'}
                    </span>
                  </div>
                  <div>
                    {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </div>
                </button>

                {/* Category Discoveries Table */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/40">
                          <th className="py-2.5 px-4 w-[25%]">Atributo</th>
                          <th className="py-2.5 px-4 w-[35%]">Valor Descoberto</th>
                          <th className="py-2.5 px-4 w-[20%]">Fonte</th>
                          <th className="py-2.5 px-4 w-[10%] text-center">Confiança</th>
                          <th className="py-2.5 px-4 w-[10%]">Status</th>
                          <th className="py-2.5 px-4 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-700 text-xs">
                        {catDiscoveries.map((disc) => {
                          const isExpanded = expandedId === disc.id;
                          const hasConflict = activeConflicts.find(c => c.field === disc.field);
                          
                          return (
                            <React.Fragment key={disc.id}>
                              <tr
                                id={`discovery-row-${disc.id}`}
                                className={`hover:bg-slate-50/50 transition-all duration-700 cursor-pointer ${
                                  disc.status === 'Confirmado' 
                                    ? 'bg-emerald-50/40 border-l-4 border-l-emerald-500 animate-in fade-in-50' 
                                    : ''
                                }`}
                                onClick={() => toggleExpand(disc.id)}
                              >
                                <td className="py-3 px-4 font-semibold text-slate-800 break-words">
                                  {disc.fieldLabel}
                                </td>
                                <td className="py-3 px-4 max-w-[240px] truncate font-mono text-slate-600" title={String(disc.cleanValue || '')}>
                                  {disc.cleanValue}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-700 font-medium truncate max-w-[120px]" title={String(disc.sourceName || '')}>{disc.sourceName}</span>
                                      {disc.sourceUrl && disc.sourceUrl.startsWith('http') && (
                                        <a
                                          href={disc.sourceUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                                          title="Visitar URL de origem"
                                        >
                                          <Link className="h-3 w-3" />
                                        </a>
                                      )}
                                    </div>
                                    {(disc.sourceName.includes(',') || disc.sourceName.includes('e ') || disc.sourceName.includes('&')) && (
                                      <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded border border-emerald-100/80 flex items-center gap-0.5 w-fit select-none uppercase tracking-wide">
                                        ✓ Validado Cruzado
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className={`py-3 px-4 text-center font-mono ${getConfidenceStyle(disc.confidence)}`}>
                                  {disc.confidence}%
                                </td>
                                <td className="py-3 px-4">
                                  {hasConflict ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedConflictForModal(hasConflict);
                                      }}
                                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 animate-pulse transition-all cursor-pointer"
                                      title="Clique para resolver o conflito side-by-side"
                                    >
                                      <AlertTriangle className="h-3 w-3 text-amber-700 shrink-0" />
                                      Conflito
                                    </button>
                                  ) : (
                                    <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full ${getStatusStyle(disc.status)} inline-block transition-all duration-500 ${
                                      disc.status === 'Confirmado' 
                                        ? 'animate-in scale-in duration-500 shadow-sm shadow-emerald-200' 
                                        : ''
                                    }`}>
                                      {disc.status}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-end gap-1.5">
                                    {disc.status !== 'Confirmado' && !hasConflict && (
                                      <button
                                        onClick={() => onConfirmDiscovery(disc.id)}
                                        id={`btn-confirm-disc-${disc.id}`}
                                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200 transition-colors"
                                        title="Confirmar"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                    {disc.status !== 'Rejeitado' && !hasConflict && (
                                      <button
                                        onClick={() => onRejectDiscovery(disc.id)}
                                        id={`btn-reject-disc-${disc.id}`}
                                        className="p-1 text-rose-500 hover:bg-rose-50 rounded border border-rose-200 transition-colors"
                                        title="Rejeitar"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                    {hasConflict && (
                                      <button
                                        onClick={() => setSelectedConflictForModal(hasConflict)}
                                        className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded transition-colors shadow-sm"
                                        title="Resolver conflito"
                                      >
                                        Resolver
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {/* EXPANDED DETAILS */}
                              {isExpanded && (
                                <tr className="bg-slate-50/50">
                                  <td colSpan={6} className="py-4 px-5 border-l-2 border-indigo-600">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                      <div className="space-y-2">
                                        <h5 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                                          <BadgeInfo className="h-4 w-4 text-indigo-600" />
                                          Evidência Encontrada pelo Robô
                                        </h5>
                                        <blockquote className="bg-white border border-slate-200 p-3 rounded-lg italic text-slate-600 leading-relaxed relative">
                                          "{disc.evidence || 'Nenhuma descrição detalhada de evidência registrada para este nível.'}"
                                        </blockquote>

                                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500">
                                          <div><b className="text-slate-700">Responsável:</b> {disc.authorIA}</div>
                                          <div><b className="text-slate-700">Botão executor:</b> {disc.buttonId}</div>
                                          <div><b className="text-slate-700">Data consulta:</b> {disc.date} às {disc.time}</div>
                                          <div><b className="text-slate-700">Nível utilidade:</b> {disc.utility}</div>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <h5 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                                          <FileJson className="h-4 w-4 text-slate-500" />
                                          Payload JSON Bruto do Provedor (API)
                                        </h5>
                                        <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-[10px] font-mono leading-tight max-h-[120px] overflow-y-auto w-full select-all">
                                          {disc.rawJSON ? JSON.stringify(JSON.parse(disc.rawJSON), null, 2) : `{"rawValue": "${disc.rawValue}"}`}
                                        </pre>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}

                        {catDiscoveries.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                              Nenhum dado localizado nesta categoria ainda. Execute botões de enriquecimento para pesquisar.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CRUZAMENTO DE DADOS (COMPARATIVE ANALYSIS GRID) */}
      {activeTab === 'comparacao' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200" id="cross-scan-container">
          <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-100/50 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                Varredura Cruzada em Tempo Real
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Este assistente inteligente compara os dados salvos no cadastro principal com o que foi descoberto nas APIs de enriquecimento. Use para homologar novas informações ou corrigir divergências no CRM.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-slate-200/60 shrink-0 self-start md:self-center shadow-xs">
              <div className="text-right">
                <div className="text-[9px] uppercase font-bold text-slate-400 font-sans">Status Geral</div>
                <div className="text-xs font-black text-slate-700">
                  {crossScan.pendingCount > 0 ? `${crossScan.pendingCount} Atualizações` : 'Ficha 100% Sincrona'}
                </div>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${crossScan.pendingCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            </div>
          </div>

          {/* Comparisons List */}
          <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50/20">
            <div className="grid grid-cols-12 bg-slate-50 p-3 text-[10px] font-black text-slate-500 uppercase tracking-wider font-sans">
              <div className="col-span-3">Campo Atributo</div>
              <div className="col-span-4 font-bold">No Perfil Principal (CRM)</div>
              <div className="col-span-1 text-center font-bold">Status</div>
              <div className="col-span-4 font-bold">Descoberto via APIs</div>
            </div>

            {crossScan.results.map((item) => {
              const isPending = item.status === 'pending_official';
              const isDivergent = item.status === 'divergent';
              const isSync = item.status === 'synchronized';
              const isNoData = item.status === 'no_data';

              return (
                <div key={item.key} className="grid grid-cols-12 p-4 items-center hover:bg-slate-50/50 transition-colors gap-y-2 md:gap-y-0">
                  {/* Atributo */}
                  <div className="col-span-12 md:col-span-3 space-y-1">
                    <span className="text-xs font-bold text-slate-700 font-sans block">{item.label}</span>
                    {isPending && (
                      <span className="inline-flex items-center text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wide">
                        Pendente Homologação
                      </span>
                    )}
                    {isDivergent && (
                      <span className="inline-flex items-center text-[9px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 uppercase tracking-wide animate-pulse">
                        Divergente
                      </span>
                    )}
                    {isSync && (
                      <span className="inline-flex items-center text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">
                        Oficializado
                      </span>
                    )}
                    {isNoData && (
                      <span className="inline-flex items-center text-[9px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                        Não Mapeado
                      </span>
                    )}
                  </div>

                  {/* Valor Registrado */}
                  <div className="col-span-12 md:col-span-4">
                    {item.currentValue ? (
                      <div className="text-xs text-slate-800 break-all bg-white/70 px-2.5 py-1.5 rounded-lg border border-slate-200/60 font-medium">
                        {item.currentValue}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic block pl-1">Vazio no CRM</span>
                    )}
                  </div>

                  {/* Relação Arrow / Status */}
                  <div className="col-span-12 md:col-span-1 flex justify-center">
                    {isSync && <Check className="h-4.5 w-4.5 text-emerald-500" />}
                    {isPending && <ArrowRight className="h-4.5 w-4.5 text-amber-500" />}
                    {isDivergent && <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />}
                    {isNoData && <HelpCircle className="h-4.5 w-4.5 text-slate-300" />}
                  </div>

                  {/* Descoberto */}
                  <div className="col-span-12 md:col-span-4 flex items-center justify-between gap-3">
                    <div className="space-y-1 truncate">
                      {item.discoveredValue ? (
                        <>
                          <div className="text-xs font-mono font-bold text-indigo-700 break-all select-all">
                            {item.discoveredValue}
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-sans">
                            <span>Fonte: <b>{item.discoverySource}</b></span>
                            <span>•</span>
                            <span className="font-semibold text-indigo-500 font-mono">Confiança: {item.confidence}%</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic block">Não descoberto</span>
                      )}
                    </div>

                    {/* Action CTA */}
                    {item.discoveryId && (isPending || isDivergent) && (
                      <button
                        onClick={() => onConfirmDiscovery(item.discoveryId)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold text-[10px] rounded-lg transition-all border border-indigo-200 hover:border-indigo-600 shrink-0 cursor-pointer shadow-xs font-sans"
                        title="Aprovar e atualizar perfil do lead"
                      >
                        Oficializar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL SIDE-BY-SIDE RESOLUTION FOR CONFLICTS */}
      {selectedConflictForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100 uppercase tracking-wide">
                  Conflito de Auditoria Detectado
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-1.5">
                  Divergência no atributo: "{selectedConflictForModal.fieldLabel}"
                </h3>
              </div>
              <button 
                onClick={() => setSelectedConflictForModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Nossas APIs de coleta identificaram informações divergentes para este campo. Por favor, analise as fontes abaixo e escolha qual valor homologar para o perfil oficial do lead:
            </p>

            {/* Side-by-Side Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source A Option */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:border-indigo-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      FONTE A
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-medium">Confiança Alta</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mt-2">{selectedConflictForModal.sourceA}</h4>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 mt-2">
                    <p className="text-xs font-mono text-indigo-700 font-bold select-text break-all">
                      {selectedConflictForModal.valueA}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onResolveConflict(selectedConflictForModal.id, selectedConflictForModal.valueA, selectedConflictForModal.sourceA);
                    setSelectedConflictForModal(null);
                  }}
                  className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Homologar Fonte A
                </button>
              </div>

              {/* Source B Option */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      FONTE B
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-medium">Confiança Alta</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mt-2">{selectedConflictForModal.sourceB}</h4>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 mt-2">
                    <p className="text-xs font-mono text-emerald-700 font-bold select-text break-all">
                      {selectedConflictForModal.valueB}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onResolveConflict(selectedConflictForModal.id, selectedConflictForModal.valueB, selectedConflictForModal.sourceB);
                    setSelectedConflictForModal(null);
                  }}
                  className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Homologar Fonte B
                </button>
              </div>
            </div>

            {/* Footer hint */}
            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
              <HelpCircle className="h-3.5 w-3.5" /> Ao homologar, o perfil consolidado do lead no CRM é atualizado em tempo real.
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
