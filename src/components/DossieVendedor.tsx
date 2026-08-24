/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Componente: Dossiê Pré-Abordagem Comercial Inteligente (Nevine CRM)
 */

import React, { useState } from 'react';
import { Lead, LeadDecisionMaker, LeadDiscovery, LeadAIAnalysis } from '../types';
import { 
  FileText, Copy, Check, Sparkles, Send, Edit3, 
  RotateCcw, Download, Share2, AlertCircle, Award, Target, MessageSquare, Zap
} from 'lucide-react';

interface DossieVendedorProps {
  lead: Lead | null;
  aiAnalysis: LeadAIAnalysis | null;
  decisionMakers: LeadDecisionMaker[];
  discoveries: LeadDiscovery[];
  onUpdateDossie?: (newText: string) => void;
}

export const DossieVendedor: React.FC<DossieVendedorProps> = ({
  lead,
  aiAnalysis,
  decisionMakers,
  discoveries,
  onUpdateDossie
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>('');

  if (!lead) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
        Selecione um lead para visualizar o Dossiê Pré-Abordagem Comercial.
      </div>
    );
  }

  const defaultDossie = aiAnalysis?.dossieTexto || `======================================================
📋 DOSSIÊ PRÉ-ABORDAGEM COMERCIAL | NEVINE INTEL
======================================================

1. 🏢 QUEM É ESSE POTENCIAL CLIENTE
- Razão Social: ${lead.razaoSocial || lead.nomeFantasia}
- Nome Fantasia: ${lead.nomeFantasia}
- Segmento & Setor: ${lead.segmento || 'Indústria/Serviços'} | ${lead.setorAtuacao || lead.segmento || ''}
- Porte & Unidades: ${lead.porteOficial || 'Porte Médio/Grande'}
- Localização: ${lead.cidade || ''} / ${lead.estado || ''}
- Posicionamento: ${lead.isLuxuryProfile ? 'Premium / Alto Padrão' : 'Intermediário / Qualificado'}

2. 📦 PRODUTOS NEVINE MAIS ADERENTES (FOCO PRECISO)
- Guardanapos em Alto Relevo Seco Master Trevo Folha Dupla
- Tampas protetoras Cap-Copo para taças e copos
- Toalhas de lavabo interfolhadas com toque de tecido

3. 🔍 O QUE ELE PROVAVELMENTE UTILIZA HOJE (CENÁRIO ATUAL)
- Copos e taças desprotegidos ou cobertos com filme plástico
- Descartáveis genéricos sem personalização na mesa ou lavabo

4. 💡 QUAL PROBLEMA OU OPORTUNIDADE A NEVINE RESOLVE AQUI
- Higiene e assepsia visível para o cliente/hóspede
- Reforço de branding e sofisticação tátil na mesa e lavabos

5. 💎 POTENCIAL COMERCIAL & CLASSIFICAÇÃO
- Potencial: ${lead.isLuxuryProfile ? 'A (Grande Potencial Comercial)' : 'B (Bom Potencial Comercial)'}

6. 👥 QUEM ABORDAR (DECISORES MAPEADOS)
- Contato Principal: ${lead.nomeContato || 'Diretoria / Gerência de Compras'}
${decisionMakers.length > 0 ? decisionMakers.slice(0, 3).map(dm => `  └─ ${dm.name} (${dm.role} - ${dm.department})`).join('\n') : ''}

7. 🗣️ COMO O CLIENTE SE POSICIONA
- Palavras-chave: Cuidado nos detalhes, experiência do cliente, higiene, sofisticação.

8. 🚀 GATILHOS & SINAIS DE OPORTUNIDADE AGORA
- Empresa ativa em busca de modernização e eficiência de suprimentos.

======================================================
⭐ A PERGUNTA DE OURO DO VENDEDOR
"Por que esse cliente deveria falar com a Nevine agora?"
👉 "Empresa de prestígio no segmento de ${lead.setorAtuacao || lead.segmento || 'mercado'}; produtos Nevine elevam a percepção de luxo e higiene imediata."
======================================================

💬 SCRIPT DE ABORDAGEM SUGERIDO
"Olá ${lead.nomeContato || 'Gestor'}, tudo bem? Sou da Nevine. Acompanhamos o posicionamento do ${lead.nomeFantasia}. Desenvolvemos descartáveis personalizados de alto padrão em relevo seco que elevam a sofisticação da mesa e a assepsia de copos/taças. Gostaria de enviar um kit de amostras físicas de cortesia para vocês conhecerem?"`;

  const displayText = isEditing ? editedText : (aiAnalysis?.dossieTexto || defaultDossie);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartEdit = () => {
    setEditedText(displayText);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onUpdateDossie) {
      onUpdateDossie(editedText);
    }
    setIsEditing(false);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([displayText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dossie_pre_abordagem_${(lead.nomeFantasia || 'lead').toLowerCase().replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerateWithAi = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/generate-dossie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          decisionMakers,
          discoveries
        })
      });
      const data = await res.json();
      if (data.success && data.dossieTexto && onUpdateDossie) {
        onUpdateDossie(data.dossieTexto);
      }
    } catch (e) {
      console.warn('[Regenerate Dossie Error]:', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-300 shadow-inner">
            <Target className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight text-white font-sans">
                Dossiê Pré-Abordagem Comercial
              </h3>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase font-bold font-mono">
                INTELIGÊNCIA NEVINE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Resumo estratégico consolidado para leitura do vendedor em 60 segundos antes do contato.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRegenerateWithAi}
            disabled={isRegenerating}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow active:scale-95"
            title="Recalcular resumo executivo com Inteligência Artificial"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : 'text-amber-300'}`} />
            <span>{isRegenerating ? 'Gerando IA...' : 'Atualizar com IA'}</span>
          </button>

          <button
            onClick={handleCopy}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5 text-indigo-400" />}
            <span>{copied ? 'Copiado!' : 'Copiar Resumo'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Baixar em arquivo TXT"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all cursor-pointer"
              title="Editar texto manualmente"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSaveEdit}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow active:scale-95"
            >
              Salvar Ajustes
            </button>
          )}
        </div>
      </div>

      {/* Main Text Content Box */}
      <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-6 shadow-inner relative font-mono text-xs leading-relaxed text-slate-200 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={22}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-y"
              placeholder="Edite o dossiê do vendedor..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Salvar Texto
              </button>
            </div>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 selection:bg-indigo-600 selection:text-white leading-relaxed">
            {displayText}
          </pre>
        )}
      </div>

      {/* Quick Footer Advice Card */}
      <div className="bg-indigo-950/30 border border-indigo-900/40 rounded-xl p-4 flex items-start gap-3 text-xs text-indigo-200">
        <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block mb-0.5">Dica de Prospecção Consultiva Nevine:</span>
          Nunca inicie oferecendo catálogo completo. Foque no problema específico observado (ex: proteção de taças nas suítes ou guardanapos em alto relevo para a mesa posta) e convide para o envio sem custo de um estojo de amostras físicas.
        </div>
      </div>
    </div>
  );
};
