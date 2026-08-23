/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LeadEnrichmentRun, LeadHistory } from '../types';
import { Clock, DollarSign, Database, Tag, ShieldCheck, RefreshCw, Calendar } from 'lucide-react';

interface RunsHistoryProps {
  runs: LeadEnrichmentRun[];
  history: LeadHistory[];
}

export const RunsHistory: React.FC<RunsHistoryProps> = ({ runs, history }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-6">
      
      {/* SECTION 1: EXECUTION RUNS TIMELINE */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Linha do Tempo de Execução (Runs)
          </h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Histórico de cliques do usuário e execuções ativas. Cada botão acionado gera uma atividade auditável isolada com data, tempo de reposta e custo associado:
        </p>

        <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-4 pt-1.5 pb-1">
          {runs.map((run) => (
            <div key={run.id} className="relative group" id={`run-item-${run.id}`}>
              {/* Timeline dot */}
              <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-indigo-500 border-2 border-white group-hover:bg-indigo-600 transition-colors"></div>
              
              <div className="bg-slate-50/50 hover:bg-slate-50 border p-3.5 rounded-xl text-xs space-y-1.5 transition-all">
                <div className="flex justify-between items-start gap-1">
                  <span className="font-bold text-slate-800">{run.buttonName}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-medium">
                    {run.date} às {run.time}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    Tempo: {run.durationMs}ms
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-emerald-500" />
                    Custo: R$ {run.cost.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Database className="h-3 w-3 text-indigo-400" />
                    APIs consultadas: {run.apiCallsCount}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {runs.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs italic">
              Nenhum enriquecimento executado ainda. Use os botões das abas para extrair informações!
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: VALUES AUDIT HISTORY */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Histórico Permanente de Alterações & Auditorias
          </h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Histórico permanente do lead. Toda alteração, confirmação manual ou correção de dados é cadastrada abaixo de forma cumulativa, garantindo rastreabilidade absoluta de dados:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans text-slate-700" id="table-audit-history">
            <thead>
              <tr className="border-b text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-2 px-3">Atributo</th>
                <th className="py-2 px-3">Dado Anterior</th>
                <th className="py-2 px-3">Dado Atualizado / Confirmado</th>
                <th className="py-2 px-3">Responsável</th>
                <th className="py-2 px-3 text-right">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {history.map((hist) => (
                <tr key={hist.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 font-sans">{hist.fieldLabel}</td>
                  <td className="py-2.5 px-3 max-w-[140px] truncate text-slate-400">{hist.oldValue || 'Vazio / Pendente'}</td>
                  <td className="py-2.5 px-3 max-w-[160px] truncate text-emerald-700 font-bold">{hist.newValue}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{hist.user}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{hist.date} {hist.time}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400 font-sans">
                    Nenhuma alteração oficial confirmada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
