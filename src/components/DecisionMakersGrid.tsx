/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LeadDecisionMaker, Lead } from '../types';
import { UserCheck, Award, Phone, Mail, Link as LinkIcon, Layers, ShieldCheck, AlertTriangle, Trash2, ExternalLink, Briefcase, Search, X } from 'lucide-react';

interface DecisionMakersGridProps {
  lead: Lead;
  decisionMakers: LeadDecisionMaker[];
  onUpdateStatus?: (dmId: string, status: 'Confirmado' | 'Rejeitado' | 'Trabalha em outro lugar') => void;
}

export const DecisionMakersGrid: React.FC<DecisionMakersGridProps> = ({
  lead,
  decisionMakers,
  onUpdateStatus,
}) => {
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');

  // Consolidate/Unify decision makers (If same decision maker appears in various sources: Unify and sum confidence)
  const consolidatedDMs: LeadDecisionMaker[] = [];

  decisionMakers.forEach((dm) => {
    const existing = consolidatedDMs.find(
      (c) => c.name.toLowerCase().trim() === dm.name.toLowerCase().trim()
    );

    if (existing) {
      // Sum confidence up to a maximum of 100
      existing.confidence = Math.min(100, existing.confidence + Math.round(dm.confidence * 0.15));
      // Accumulate unique sources
      dm.sources.forEach((src) => {
        if (!existing.sources.includes(src)) {
          existing.sources.push(src);
        }
      });
      // Merge unique contacts
      dm.contacts.forEach((contact) => {
        const hasContact = existing.contacts.some(
          (c) => c.email === contact.email && c.phone === contact.phone
        );
        if (!hasContact) {
          existing.contacts.push(contact);
        }
      });
      // Keep status if set
      if (dm.status) {
        existing.status = dm.status;
      }
    } else {
      consolidatedDMs.push({ ...dm, sources: [...dm.sources], contacts: [...dm.contacts] });
    }
  });

  // Sort primarily by ranking DESCENDING (5 -> 4 -> 3 -> 2 -> 1) and role title descending (Z to A)
  const rankedDMs = [...consolidatedDMs].sort((a, b) => {
    if (b.ranking !== a.ranking) {
      return b.ranking - a.ranking; // 5 first (Proprietário/CEO), then 4, 3, 2, 1
    }
    return b.role.localeCompare(a.role); // Role title descending
  });

  const getRankBadgeAndMeta = (ranking: number) => {
    switch (ranking) {
      case 1:
        return { label: 'Compras / Suprimentos (Tomador)', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 2:
        return { label: 'Operações (Influenciador)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 3:
        return { label: 'Facilities / Saúde (Técnico)', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 4:
        return { label: 'Diretor / C-Level (Decisor)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 5:
        return { label: 'Proprietário / CEO (Decisor Máximo)', color: 'bg-sky-100 text-sky-800 border-sky-300' };
      default:
        return { label: `Hierarquia ${ranking}`, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  // Helper to get a direct, clean, and working LinkedIn Profile link or search URL
  const getDirectLinkedInUrl = (dm: LeadDecisionMaker) => {
    const contactWithLinkedin = dm.contacts.find(c => c.linkedin && String(c.linkedin).trim() !== '');
    if (contactWithLinkedin && contactWithLinkedin.linkedin) {
      const lk = contactWithLinkedin.linkedin.trim();
      if (lk.startsWith('http://') || lk.startsWith('https://')) return lk;
      if (lk.includes('linkedin.com')) return `https://${lk}`;
    }
    const cleanName = dm.name
      .replace(/(Sócio-Administrador|Diretor|Presidente|Gerente|CEO|Proprietário|Administrador)/gi, '')
      .trim();
    const companyQuery = lead.nomeFantasia || lead.razaoSocial || '';
    const query = encodeURIComponent(`"${cleanName}" "${companyQuery}"`);
    return `https://www.linkedin.com/search/results/people/?keywords=${query}`;
  };

  const filteredRolesModalList = rankedDMs.filter(dm => {
    if (!roleSearchTerm.trim()) return true;
    const term = roleSearchTerm.toLowerCase();
    return dm.role.toLowerCase().includes(term) || dm.name.toLowerCase().includes(term) || (dm.department || '').toLowerCase().includes(term);
  });

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Painel de Decisores Mapeados & Consolidados
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRolesModalOpen(true)}
            id="btn-ver-cargos"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 border border-indigo-500/20"
          >
            <Briefcase className="h-4 w-4" />
            <span>CARGOS ({rankedDMs.length})</span>
          </button>
          <span className="text-[10px] text-slate-400 font-mono italic hidden sm:inline">
            Cargo Decrescente • Controle de Vínculo Ativo
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Lista hierárquica inteligente dos principais tomadores de decisão públicos. O sistema prioriza o **LinkedIn como fonte primária de verdade** para validar se o decisor realmente continua ativo nesta organização (vínculo atual) antes de iniciar a abordagem comercial:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rankedDMs.map((dm) => {
          const { label, color } = getRankBadgeAndMeta(dm.ranking);
          const directLinkedIn = getDirectLinkedInUrl(dm);
          const hasLinkedInContact = dm.contacts.some(c => c.linkedin) || dm.sources.some(s => s.toLowerCase().includes('linkedin'));
          
          return (
            <div
              key={dm.id}
              id={`dm-card-${dm.id}`}
              className={`border p-4 rounded-xl space-y-3 transition-all relative overflow-hidden ${
                dm.status === 'Trabalha em outro lugar'
                  ? 'border-rose-300 bg-rose-50/20 opacity-80'
                  : dm.status === 'Rejeitado'
                  ? 'border-slate-200 bg-slate-50/50 opacity-60'
                  : dm.status === 'Confirmado'
                  ? 'border-emerald-300 bg-emerald-50/10 shadow-sm shadow-emerald-50'
                  : 'border-slate-200 hover:border-indigo-400 bg-slate-50/20'
              }`}
            >
              {/* LinkedIn Prioritization Badge */}
              {hasLinkedInContact && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded-full shadow-sm">
                  <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
                  LinkedIn Primário
                </div>
              )}

              {/* Hierarchy ribbon */}
              <div className="flex justify-between items-start gap-2">
                <div className="max-w-[70%]">
                  <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${color}`}>
                    ★ {label}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm mt-1.5 flex items-center gap-1.5">
                    {dm.name}
                    {dm.status === 'Confirmado' && (
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" title="Vínculo confirmado com a empresa" />
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">{dm.role}</p>
                </div>
                
                {/* Score badge */}
                {!hasLinkedInContact && (
                  <div className="text-right">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Confiança</div>
                    <div className="text-sm font-black font-mono text-indigo-600">{dm.confidence}%</div>
                  </div>
                )}
              </div>

              {/* Nevine Target Matrix Badge */}
              {dm.isNevineTargetRole && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-extrabold text-amber-900 flex items-center gap-1 uppercase tracking-wide">
                      ★ Cargo Foco Matriz Nevine
                    </span>
                    <span className="bg-amber-500/20 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[9px]">
                      {dm.nevineCategory || 'Decisor / Influenciador'}
                    </span>
                  </div>
                  {dm.nevineKeyMetric && (
                    <p className="text-[10px] text-amber-800 font-medium">
                      🎯 <strong className="font-bold">Métrica Chave a Endereçar:</strong> {dm.nevineKeyMetric}
                    </p>
                  )}
                </div>
              )}

              {/* Verified Vínculo actual block from LinkedIn found link */}
              {(() => {
                const isEstimatedLinkedin = !dm.contacts.some(c => c.linkedin);
                
                if (dm.linkedinVerified === true) {
                  return (
                    <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-300 space-y-1 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-semibold flex items-center gap-1 text-emerald-800">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          Auditoria de LinkedIn Robusta OK
                        </span>
                        <span className="font-mono text-emerald-700 font-extrabold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">VÍNCULO CONFIRMADO</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 leading-snug">
                        {dm.linkedinVerificationDetails || `Vínculo profissional verificado: O perfil do profissional no LinkedIn possui registro explícito de atuação no cargo de ${dm.role} na empresa ${lead.nomeFantasia || lead.razaoSocial}. Risco de homônimo descartado.`}
                      </p>
                    </div>
                  );
                }

                if (dm.linkedinVerified === false && dm.linkedinVerificationDetails) {
                  return (
                    <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-300 space-y-1 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-semibold flex items-center gap-1 text-amber-800">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600/80 shrink-0" />
                          Alerta: Risco de Homônimo Detectado
                        </span>
                        <span className="font-mono text-amber-700 font-extrabold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-wide">VERIFICAÇÃO MANUAL</span>
                      </div>
                      <p className="text-[10px] text-amber-700 leading-snug">
                        {dm.linkedinVerificationDetails}
                      </p>
                    </div>
                  );
                }

                if (dm.status === 'Confirmado') {
                  return (
                    <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200 space-y-1">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-semibold flex items-center gap-1 text-emerald-800">
                          <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                          Vínculo de Trabalho Confirmado
                        </span>
                        <span className="font-mono text-emerald-700 font-extrabold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">VALIDADO OK</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 leading-snug">
                        Confirmado que o profissional <strong className="text-emerald-900 font-semibold">{dm.name}</strong> trabalha ou trabalhou como <strong className="text-emerald-900 font-semibold">{dm.role}</strong> na empresa <strong className="text-emerald-900 font-semibold">{lead.nomeFantasia || lead.razaoSocial}</strong>.
                      </p>
                    </div>
                  );
                }
                
                if (dm.status === 'Trabalha em outro lugar') {
                  return (
                    <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-200 space-y-1">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-semibold flex items-center gap-1 text-rose-800">
                          <AlertTriangle className="h-3 w-3 text-rose-600 shrink-0" />
                          Classificado como Desligado ou Homônimo
                        </span>
                        <span className="font-mono text-rose-700 font-extrabold bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200">OUTRA EMPRESA</span>
                      </div>
                      <p className="text-[10px] text-rose-700 leading-snug">
                        Este profissional foi marcado como não pertencente à empresa ativa ou o link do LinkedIn apontou para um homônimo.
                      </p>
                    </div>
                  );
                }

                if (dm.status === 'Rejeitado') {
                  return (
                    <div className="bg-slate-100/80 p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-semibold flex items-center gap-1 text-slate-700">
                          <AlertTriangle className="h-3 w-3 text-slate-500 shrink-0" />
                          Decisor Descartado / Inativo
                        </span>
                        <span className="font-mono text-slate-600 font-bold bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300">INATIVO</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-snug">
                        Perfil do tomador de decisão descartado ou inativo para abordagem comercial.
                      </p>
                    </div>
                  );
                }

                // Default non-audited state
                return (
                  <div className={`p-2.5 rounded-lg border space-y-2 ${isEstimatedLinkedin ? 'bg-amber-50/50 border-amber-200/80' : 'bg-blue-50/40 border-blue-200/60'}`}>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="font-semibold flex items-center gap-1 text-slate-700">
                        <AlertTriangle className={`h-3 w-3 ${isEstimatedLinkedin ? 'text-amber-500' : 'text-blue-500'} shrink-0`} />
                        Necessita Validação de Vínculo
                      </span>
                      {isEstimatedLinkedin ? (
                        <span className="font-mono text-amber-700 font-extrabold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 animate-pulse">RISCO DE HOMÔNIMO</span>
                      ) : (
                        <span className="font-mono text-blue-700 font-extrabold bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">VERIFICAÇÃO PENDENTE</span>
                      )}
                    </div>
                    
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      {isEstimatedLinkedin ? (
                        <>
                          ⚠️ <strong className="text-amber-800 font-bold">Link aproximado gerado por inteligência de nomes!</strong> Há um alto risco deste perfil ser de um homônimo (mesmo nome, mas outra empresa). Abra o perfil e verifique se ele trabalha ou já trabalhou na empresa <strong className="text-slate-800 font-semibold">{lead.nomeFantasia || lead.razaoSocial}</strong>.
                        </>
                      ) : (
                        <>
                          🔍 <strong className="text-blue-800 font-bold">Link extraído via APIs de enriquecimento.</strong> Recomendamos abrir o perfil e garantir que ele ocupa o cargo de <strong className="text-slate-800 font-semibold">{dm.role}</strong> na empresa <strong className="text-slate-800 font-semibold">{lead.nomeFantasia || lead.razaoSocial}</strong> atualmente.
                        </>
                      )}
                    </p>
                  </div>
                );
              })()}

              {/* High-visibility LinkedIn direct action button */}
              <div className="pt-1">
                <a 
                  href={directLinkedIn}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#0077b5] hover:bg-[#006297] text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:shadow-[#0077b5]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-center group"
                >
                  <ExternalLink className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-white" />
                  <span>Abrir LinkedIn Validado</span>
                </a>
              </div>

              {/* Contacts row */}
              <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                {/* Direct LinkedIn Profile Link */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 bg-indigo-50/30 p-1.5 rounded border border-indigo-100/30">
                  <LinkIcon className="h-3 w-3 text-indigo-500 shrink-0" />
                  <a 
                    href={directLinkedIn}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-600 hover:text-indigo-800 hover:underline truncate font-semibold"
                  >
                    LinkedIn: {dm.name} (Link Direto)
                  </a>
                </div>

                {dm.contacts.map((contact, idx) => (
                  <div key={idx} className="flex flex-col gap-1 text-[11px] font-mono">
                    {contact.email && (
                      <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Mail className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span className="break-all font-mono font-semibold truncate">{contact.email}</span>
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1 ${ (contact as any).isDirectEmail ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-600'}`}>
                          {(contact as any).isDirectEmail ? 'E-mail Direto' : 'E-mail Geral Empresa'}
                        </span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span className="font-mono font-semibold">{contact.phone}</span>
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1 ${ (contact as any).isDirectPhone ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-600'}`}>
                          {(contact as any).isDirectPhone ? 'Tel. Direto' : 'Tel. Geral Empresa'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Sources badges */}
              <div className="flex flex-wrap gap-1 mt-2">
                {dm.sources.map((src) => (
                  <span key={src} className="text-[8.5px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono border border-indigo-100/30">
                    Fonte: {src}
                  </span>
                ))}
              </div>

              {/* Auditor actions block */}
              <div className="border-t border-slate-100 pt-2.5 mt-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-medium">Auditoria de Vínculo:</span>
                  {dm.status === 'Confirmado' && (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ✓ Vínculo Confirmado
                    </span>
                  )}
                  {dm.status === 'Trabalha em outro lugar' && (
                    <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                      <AlertTriangle className="h-2.5 w-2.5 text-rose-600" /> Outra Empresa (Rede D'Or)
                    </span>
                  )}
                  {dm.status === 'Rejeitado' && (
                    <span className="text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      ✗ Fora da Empresa
                    </span>
                  )}
                  {(!dm.status || dm.status === 'Encontrado') && (
                    <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                      ● Não Verificado
                    </span>
                  )}
                </div>

                {onUpdateStatus && (
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => onUpdateStatus(dm.id, 'Confirmado')}
                      className={`text-[9px] font-bold px-2 py-1 rounded transition-colors cursor-pointer border ${
                        dm.status === 'Confirmado'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                      }`}
                    >
                      Confirmar Ativo
                    </button>
                    <button
                      onClick={() => onUpdateStatus(dm.id, 'Trabalha em outro lugar')}
                      className={`text-[9px] font-bold px-2 py-1 rounded transition-colors cursor-pointer border ${
                        dm.status === 'Trabalha em outro lugar'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-rose-700 hover:bg-rose-50 border-rose-200'
                      }`}
                      title="Marcar se o profissional mudou de empresa (ex: trabalha no São Luiz / Rede D'Or)"
                    >
                      Mudou de Empresa
                    </button>
                    <button
                      onClick={() => onUpdateStatus(dm.id, 'Rejeitado')}
                      className={`text-[9px] font-bold px-2 py-1 rounded transition-colors cursor-pointer border ${
                        dm.status === 'Rejeitado'
                          ? 'bg-slate-600 text-white border-slate-600'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      Inativo/Rejeitar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {rankedDMs.length === 0 && (
          <div className="col-span-full py-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs shadow-sm bg-slate-50/50">
            Nenhum decisor mapeado ainda para este lead. Dispare as etapas de Nível 3 (Estratégico) ou Apollo no Nível 4!
          </div>
        )}
      </div>

      {/* Roles List Modal (Tela / Modal de Cargos Encontrados) */}
      {isRolesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white">
                    Lista de Cargos Mapeados no Lead
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lead.nomeFantasia || lead.razaoSocial} • {rankedDMs.length} cargos/funções mapeadas no comitê
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRolesModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-150 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrar por nome do cargo, nome do decisor ou área (ex: Nutricionista, SCIH, Sommelier, Compras)..."
                  value={roleSearchTerm}
                  onChange={(e) => setRoleSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-sans shadow-sm"
                />
              </div>
              <span className="text-xs text-slate-500 font-mono font-semibold shrink-0">
                {filteredRolesModalList.length} de {rankedDMs.length} exibidos
              </span>
            </div>

            {/* Roles Table */}
            <div className="p-5 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-mono border-b border-slate-200">
                  <tr>
                    <th className="p-3">Cargo / Função Mapeada</th>
                    <th className="p-3">Decisor / Profissional</th>
                    <th className="p-3">Área / Departamento</th>
                    <th className="p-3">Autoridade / Hierarquia</th>
                    <th className="p-3">Contatos Mapeados</th>
                    <th className="p-3 text-right">LinkedIn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 font-sans">
                  {filteredRolesModalList.map((dm) => {
                    const { label, color } = getRankBadgeAndMeta(dm.ranking);
                    const directLinkedIn = getDirectLinkedInUrl(dm);
                    const directEmail = dm.contacts.find(c => c.email);
                    const directPhone = dm.contacts.find(c => c.phone);

                    return (
                      <tr key={dm.id} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="p-3 font-extrabold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            {dm.isNevineTargetRole && (
                              <span className="text-amber-500 text-sm" title="Cargo Foco Matriz Nevine">★</span>
                            )}
                            <span className="text-slate-900 font-extrabold text-xs">{dm.role}</span>
                          </div>
                          {dm.isNevineTargetRole && (
                            <span className="text-[9px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold inline-block mt-0.5 border border-amber-200">
                              Cargo Foco Nevine
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-slate-800">{dm.name}</td>
                        <td className="p-3 text-slate-600 font-medium">{dm.department || 'Geral / Executivo'}</td>
                        <td className="p-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full ${color}`}>
                            {label}
                          </span>
                        </td>
                        <td className="p-3 space-y-1 font-mono text-[10px]">
                          {directEmail?.email ? (
                            <div className="text-emerald-700 font-semibold truncate max-w-[180px]">
                              ✉ {directEmail.email}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">E-mail não público</span>
                          )}
                          {directPhone?.phone && (
                            <div className="text-slate-700 font-semibold">
                              📞 {directPhone.phone}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <a
                            href={directLinkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0077b5] text-white rounded-lg text-[10px] font-bold hover:bg-[#006297] transition-all shadow-sm"
                          >
                            <span>Abrir</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRolesModalList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs italic">
                        Nenhum cargo encontrado para o termo pesquisado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
