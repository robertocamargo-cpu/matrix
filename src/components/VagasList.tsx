/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lead, LeadDiscovery } from '../types';
import { Briefcase, ExternalLink, HelpCircle, ShieldCheck } from 'lucide-react';

interface VagasListProps {
  lead: Lead;
  discoveries: LeadDiscovery[];
}

export const VagasList: React.FC<VagasListProps> = ({ lead, discoveries }) => {
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

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200 p-1">
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
  );
};
