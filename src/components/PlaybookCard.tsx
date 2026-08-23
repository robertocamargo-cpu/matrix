/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Playbook, Lead } from '../types';
import { 
  Send, Mail, Phone, ShieldCheck, Copy, Check,
  Sparkles, Award, Tag, Edit3, Eye, Type, Bold, Italic, List, RefreshCw, AlertCircle
} from 'lucide-react';

interface PlaybookCardProps {
  playbook: Playbook | null;
  lead: Lead | null;
  onUpdatePlaybook?: (updatedPlaybook: Playbook) => void;
}

export const PlaybookCard: React.FC<PlaybookCardProps> = ({ playbook, lead, onUpdatePlaybook }) => {
  const [subTab, setSubTab] = useState<'whatsapp' | 'email' | 'ligacao' | 'objecoes'>('whatsapp');
  const [copied, setCopied] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  
  // State for holding edited contents
  const [localWhatsapp, setLocalWhatsapp] = useState<string>('');
  const [localEmail, setLocalEmail] = useState<string>('');
  const [localLigacao, setLocalLigacao] = useState<string>('');
  const [localObjecoes, setLocalObjecoes] = useState<{ objecao: string; contorno: string }[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state when playbook prop changes (e.g. user selects a different lead)
  useEffect(() => {
    if (playbook) {
      setLocalWhatsapp(playbook.whatsapp || '');
      setLocalEmail(playbook.email || '');
      setLocalLigacao(playbook.ligacao || '');
      setLocalObjecoes(playbook.objecoes || []);
    }
  }, [playbook]);

  if (!playbook) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-6 text-center text-slate-400 text-xs">
        Mídia de Playbook Comercial ainda não gerada. Execute etapas estratégicas como "Estratégia Comercial" no Nível 3!
      </div>
    );
  }

  const handleCopy = (text: string, label: string) => {
    // Replace variables with actual values before copying to clipboard for convenience!
    const processedText = replaceVariablesWithValues(text);
    navigator.clipboard.writeText(processedText);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const openWhatsAppUrl = (text: string) => {
    const processedText = replaceVariablesWithValues(text);
    const encoded = encodeURIComponent(processedText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Helper to replace the dynamic placeholders with real values
  const replaceVariablesWithValues = (text: string): string => {
    if (!text) return '';
    const varMap: Record<string, string> = {
      '{{NOME_CONTATO}}': lead?.nomeContato || 'Contato Comercial',
      '{{EMPRESA}}': lead?.nomeFantasia || lead?.razaoSocial || 'sua Empresa',
      '{{SITE}}': lead?.site || 'site-do-lead.com',
      '{{CIDADE}}': lead?.cidade || 'sua Cidade',
      '{{ESTADO}}': lead?.estado || 'SP',
      '{{TELEFONE}}': lead?.telefone || lead?.whatsapp || 'seu Telefone'
    };

    let result = text;
    Object.entries(varMap).forEach(([key, val]) => {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escapedKey, 'g'), val);
    });
    return result;
  };

  // Custom visual parsing for the Preview tab
  const renderFormattedPreview = (text: string) => {
    if (!text) {
      return (
        <div className="text-slate-400 italic text-center py-6 flex items-center justify-center gap-1.5">
          <AlertCircle className="h-4 w-4" /> Escreva algo no editor para ver a prévia
        </div>
      );
    }
    
    // First, convert variables into high-contrast badges
    const varMap: Record<string, string> = {
      '{{NOME_CONTATO}}': lead?.nomeContato || 'Contato Comercial',
      '{{EMPRESA}}': lead?.nomeFantasia || lead?.razaoSocial || 'sua Empresa',
      '{{SITE}}': lead?.site || 'site-do-lead.com',
      '{{CIDADE}}': lead?.cidade || 'sua Cidade',
      '{{ESTADO}}': lead?.estado || 'SP',
      '{{TELEFONE}}': lead?.telefone || lead?.whatsapp || 'seu Telefone'
    };

    let replaced = text;
    Object.entries(varMap).forEach(([key, value]) => {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Wrap real value in a beautiful visual badge
      const badgeHtml = `<span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200 transition-colors cursor-help" title="Variável: ${key}">${value}</span>`;
      replaced = replaced.replace(new RegExp(escapedKey, 'g'), badgeHtml);
    });

    // Simple markdown helper replacements
    // Bold: **text**
    replaced = replaced.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    // Italic: *text*
    replaced = replaced.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>');
    // Bullet list: Lines starting with "- "
    replaced = replaced.split('\n').map(line => {
      if (line.trim().startsWith('- ')) {
        return `<li class="ml-4 list-disc text-slate-700 mt-1">${line.trim().substring(2)}</li>`;
      }
      return line;
    }).join('\n');
    
    // Replace double newlines with spacing, single with breaks
    replaced = replaced.split('\n\n').map(p => `<p class="mb-3 leading-relaxed">${p}</p>`).join('');
    replaced = replaced.split('\n').join('<br />');

    return (
      <div 
        className="text-xs text-slate-700 font-sans leading-relaxed space-y-2 bg-white p-4 rounded-lg border border-slate-200 shadow-inner select-text"
        dangerouslySetInnerHTML={{ __html: replaced }}
      />
    );
  };

  // Editor actions (bold, italic, list)
  const insertTextAtCursor = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = before + selectedText + after;

    let nextText = text.substring(0, start) + replacement + text.substring(end);

    // Update active field local state
    if (subTab === 'whatsapp') {
      setLocalWhatsapp(nextText);
      triggerSave('whatsapp', nextText);
    } else if (subTab === 'email') {
      setLocalEmail(nextText);
      triggerSave('email', nextText);
    } else if (subTab === 'ligacao') {
      setLocalLigacao(nextText);
      triggerSave('ligacao', nextText);
    }

    // Refocus and select
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  // Propagate and save local changes
  const triggerSave = (field: 'whatsapp' | 'email' | 'ligacao', newValue: string) => {
    if (!onUpdatePlaybook) return;

    const updated: Playbook = {
      whatsapp: field === 'whatsapp' ? newValue : localWhatsapp,
      email: field === 'email' ? newValue : localEmail,
      ligacao: field === 'ligacao' ? newValue : localLigacao,
      objecoes: localObjecoes,
      produtosIndicados: playbook.produtosIndicados || []
    };
    onUpdatePlaybook(updated);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (subTab === 'whatsapp') {
      setLocalWhatsapp(val);
      triggerSave('whatsapp', val);
    } else if (subTab === 'email') {
      setLocalEmail(val);
      triggerSave('email', val);
    } else if (subTab === 'ligacao') {
      setLocalLigacao(val);
      triggerSave('ligacao', val);
    }
  };

  const getActiveText = (): string => {
    if (subTab === 'whatsapp') return localWhatsapp;
    if (subTab === 'email') return localEmail;
    if (subTab === 'ligacao') return localLigacao;
    return '';
  };

  return (
    <div id="playbook-custom-card" className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
      
      {/* Header title */}
      <div className="flex border-b border-slate-100 pb-3 justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-amber-500 fill-amber-100 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Playbook & Editor de Modelos de Abordagem B2B
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded transition-all cursor-pointer border ${
              editMode 
                ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {editMode ? <Eye className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
            {editMode ? 'Ver Prévia Real' : 'Modo Editor'}
          </button>
          <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">
            ✓ Pronto Para Uso
          </span>
        </div>
      </div>

      {/* Tabs list inside card */}
      <div className="flex gap-1.5 border-b border-slate-50 pb-2 overflow-x-auto">
        <button
          onClick={() => setSubTab('whatsapp')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            subTab === 'whatsapp' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Send className="h-3.5 w-3.5 text-emerald-600" />
          WhatsApp
        </button>

        <button
          onClick={() => setSubTab('email')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            subTab === 'email' ? 'bg-sky-50 text-sky-700' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Mail className="h-3.5 w-3.5 text-sky-600" />
          E-mail Cold
        </button>

        <button
          onClick={() => setSubTab('ligacao')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            subTab === 'ligacao' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Phone className="h-3.5 w-3.5 text-indigo-600" />
          Roteiro Ligação
        </button>

        <button
          onClick={() => setSubTab('objecoes')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            subTab === 'objecoes' ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-rose-600" />
          Contorno de Objeções
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 min-h-[220px]">
        {subTab !== 'objecoes' ? (
          <div className="space-y-3">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-slate-100/70 p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                {subTab === 'whatsapp' ? 'TEMPLATE WHATSAPP' : subTab === 'email' ? 'E-MAIL COLD COMERCIAL' : 'ROTEIRO DE LIGAÇÃO'} 
                {editMode && ' (MODO EDIÇÃO)'}
              </span>
              
              <div className="flex flex-wrap gap-1.5 items-center">
                {editMode && (
                  <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 mr-1 shadow-sm gap-0.5">
                    <button
                      onClick={() => insertTextAtCursor('**', '**')}
                      title="Negrito"
                      className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => insertTextAtCursor('*', '*')}
                      title="Itálico"
                      className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => insertTextAtCursor('\n- ', '')}
                      title="Lista de Tópicos"
                      className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => handleCopy(getActiveText(), subTab)}
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-indigo-600 font-bold text-[11px] rounded bg-white border border-slate-200 cursor-pointer shadow-sm hover:border-indigo-200 transition-all"
                >
                  {copied === subTab ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === subTab ? 'Copiado!' : 'Copiar'}
                </button>
                
                {subTab === 'whatsapp' && (
                  <button
                    onClick={() => openWhatsAppUrl(getActiveText())}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded shadow-sm transition-colors cursor-pointer"
                  >
                    Disparar WhatsApp
                  </button>
                )}
              </div>
            </div>

            {/* Variable insertion toolbox in edit mode */}
            {editMode && (
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1">
                  <Type className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Clique para inserir variáveis dinâmicas:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { code: '{{NOME_CONTATO}}', label: 'Nome do Contato', desc: lead?.nomeContato || 'Juliana' },
                    { code: '{{EMPRESA}}', label: 'Nome da Empresa', desc: lead?.nomeFantasia || 'Micromed' },
                    { code: '{{SITE}}', label: 'Site Oficial', desc: lead?.site || 'site.com' },
                    { code: '{{CIDADE}}', label: 'Cidade do Lead', desc: lead?.cidade || 'Porto Alegre' },
                    { code: '{{TELEFONE}}', label: 'Telefone/Whats', desc: lead?.telefone || '(51) 3000-0000' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => insertTextAtCursor(item.code)}
                      className="px-2 py-1 text-[10px] font-mono font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 rounded transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      title={`Insere ${item.code} (Valor real: ${item.desc})`}
                    >
                      <span className="font-bold">{item.code}</span>
                      <span className="text-[9px] text-slate-400">({item.desc.split(' ')[0]})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Editor Textarea vs Formatted Preview */}
            {editMode ? (
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={getActiveText()}
                  onChange={handleTextareaChange}
                  rows={8}
                  className="w-full text-xs text-slate-800 bg-white border border-slate-200 p-3 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner select-text leading-relaxed"
                  placeholder={`Escreva ou customize o playbook para este lead. Use as variáveis acima para personalização dinâmica.`}
                />
                <div className="absolute bottom-2 right-2 text-[9px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                  Variáveis são substituídas no envio/cópia
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="text-[9.5px] uppercase font-bold text-slate-400 px-1 flex items-center gap-1">
                  <span>Visualização de Prévia Integrada</span>
                  <span className="text-[9px] text-indigo-500 bg-indigo-50 px-1.5 py-0.1 rounded border border-indigo-100">Dados Reais Injetados</span>
                </div>
                {renderFormattedPreview(getActiveText())}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 font-mono font-semibold block mb-2">OBJEÇÕES ANTECIPADAS & RESPOSTAS PIVÔ (IA)</span>
            <div className="space-y-3">
              {localObjecoes.length > 0 ? (
                localObjecoes.map((obj, i) => (
                  <div key={i} className="bg-white border text-xs p-3 rounded-xl space-y-1.5 shadow-sm">
                    <div className="font-bold text-rose-600 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                      Objeção: "{obj.objecao}"
                    </div>
                    <div className="text-slate-600 leading-relaxed pl-3 border-l-2 text-[11px] border-slate-200 italic">
                      <b className="text-slate-700 not-italic uppercase text-[9px] tracking-wider block mb-0.5">Resposta IA Recomendada: </b>
                      {replaceVariablesWithValues(obj.contorno)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 italic text-xs">
                  Nenhuma objeção mapeada ainda. Ative uma varredura estratégica de Nível 3 para gerar.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recommended products list footer */}
      <div>
        <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-2">
          <Tag className="h-3.5 w-3.5 text-indigo-500" />
          Produtos Oferecidos Indicados para Recomendar
        </h4>
        <div className="flex flex-wrap gap-2">
          {playbook.produtosIndicados && playbook.produtosIndicados.length > 0 ? (
            playbook.produtosIndicados.map((prod, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-indigo-100 transition-all select-none"
              >
                <Award className="h-3.5 w-3.5 shrink-0" />
                {prod}
              </span>
            ))
          ) : (
            <span className="text-slate-400 italic text-xs px-1">Nenhum produto oficial sugerido ainda.</span>
          )}
        </div>

        {/* Portfólio de Produtos & Tipos de Clientes Map */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-2 mt-4 text-[11px] text-slate-600">
          <h5 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            Relação Comercial de Portfólio (Nevine B2B)
          </h5>
          <p className="leading-relaxed">
            Nossos playbooks e comunicações são gerados de forma inteligente, cruzando o perfil específico do lead com a demanda ideal de produtos do portfólio oficial Nevine:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-white p-2.5 rounded-lg border border-slate-150 shadow-sm space-y-1">
              <span className="font-bold text-indigo-700 block">🏨 Hotelaria & Hospitalidade</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Combinação Ideal:</span>
              <p className="text-slate-600 text-[10.5px] leading-tight">
                Cap-Copo (room service), Toalha de Lavabo Premium Interfolha, Guardanapo Relevo.
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-150 shadow-sm space-y-1">
              <span className="font-bold text-indigo-700 block">🍽️ Alta Gastronomia / Bistrôs</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Combinação Ideal:</span>
              <p className="text-slate-600 text-[10.5px] leading-tight">
                Guardanapo Relevo Seco, Posicopos (porta-copos absorvente), Porta-talher.
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-150 shadow-sm space-y-1">
              <span className="font-bold text-indigo-700 block">🏥 Clínicas Médicas & Estéticas</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Combinação Ideal:</span>
              <p className="text-slate-600 text-[10.5px] leading-tight">
                Toalha de Lavabo Interfolha, Suporte Organizador em Acrílico, Guardanapo de Copa.
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-150 shadow-sm space-y-1">
              <span className="font-bold text-indigo-700 block">🏢 Holdings, Bancos & Escritórios</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Combinação Ideal:</span>
              <p className="text-slate-600 text-[10.5px] leading-tight">
                Posicopos (bolachas de café/copo), Cap-Copo premium, Guardanapo Coquetel.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
