/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lead } from '../types';
import { Plus, Building2, Search, Trash2, Database, Pencil, Check, Loader2, SearchCode } from 'lucide-react';

interface LeadSelectorProps {
  leads: Lead[];
  selectedLeadId: string | null;
  aiAnalysis?: Record<string, any>;
  onSelectLead: (id: string) => void;
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

export const LeadSelector: React.FC<LeadSelectorProps> = ({
  leads,
  selectedLeadId,
  aiAnalysis,
  onSelectLead,
  onAddLead,
  onEditLead,
  onDeleteLead,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Quick filter states
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterLuxury, setFilterLuxury] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');

  // Form states
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [site, setSite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [nomeContato, setNomeContato] = useState('');

  // New research helper fields
  const [capitalSocial, setCapitalSocial] = useState('');
  const [cnaePrincipal, setCnaePrincipal] = useState('');
  const [produtosServicos, setProdutosServicos] = useState('');
  const [vagasAbertas, setVagasAbertas] = useState('');

  // CNPJ Search state
  const [isSearchingCNPJ, setIsSearchingCNPJ] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [cnpjSuccess, setCnpjSuccess] = useState<string | null>(null);

  const handleSearchCNPJ = async () => {
    const clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14) {
      setCnpjError('Insira um CNPJ válido com 14 dígitos.');
      return;
    }
    setIsSearchingCNPJ(true);
    setCnpjError(null);
    setCnpjSuccess(null);
    try {
      const res = await fetch(`/api/cnpj/${clean}`);
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.razaoSocial) setRazaoSocial(d.razaoSocial);
        if (d.nomeFantasia) setNomeFantasia(d.nomeFantasia);
        if (d.cidade) setCidade(d.cidade);
        if (d.estado) setEstado(d.estado);
        if (d.capitalSocial) setCapitalSocial(d.capitalSocial);
        if (d.cnaeCode) setCnaePrincipal(`${d.cnaeCode} - ${d.cnaeDesc || ''}`);
        if (d.socios && d.socios.length > 0 && (!nomeContato || nomeContato === 'Nenhum' || nomeContato === 'Não informado')) {
          setNomeContato(`${d.socios[0].nome} (${d.socios[0].cargo || 'Sócio-Administrador'})`);
        }
        setCnpjSuccess(`Dados oficiais encontrados via ${d.source}!`);
      } else {
        setCnpjError(json.error || 'Não foi possível encontrar dados para este CNPJ.');
      }
    } catch (err: any) {
      setCnpjError('Erro de comunicação ao consultar servidor de CNPJ.');
    } finally {
      setIsSearchingCNPJ(false);
    }
  };

  const handleStartEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setNomeFantasia(lead.nomeFantasia || '');
    setRazaoSocial(lead.razaoSocial || '');
    setCnpj(lead.cnpj || '');
    setSite(lead.site || '');
    setInstagram(lead.instagram || '');
    setLinkedin(lead.linkedin || '');
    setEmail(lead.email || '');
    setWhatsapp(lead.whatsapp || '');
    setCidade(lead.cidade || '');
    setEstado(lead.estado || '');
    setNomeContato(lead.nomeContato || '');
    setCapitalSocial(lead.capitalSocial || '');
    setCnaePrincipal(lead.cnaePrincipal || '');
    setProdutosServicos(lead.produtosServicos || '');
    setVagasAbertas(lead.vagasAbertas || '');
    setIsOpen(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setNomeFantasia('');
    setRazaoSocial('');
    setCnpj('');
    setSite('');
    setInstagram('');
    setLinkedin('');
    setEmail('');
    setWhatsapp('');
    setCidade('');
    setEstado('');
    setNomeContato('');
    setCapitalSocial('');
    setCnaePrincipal('');
    setProdutosServicos('');
    setVagasAbertas('');
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeFantasia && !razaoSocial && !cnpj) {
      alert("Por favor, preencha pelo menos o Nome Fantasia, Razão Social ou CNPJ para identificar o lead.");
      return;
    }

    if (editingId) {
      // Find current whole lead to preserve other computed/run variables
      const existing = leads.find(l => l.id === editingId);
      if (existing) {
        onEditLead({
          ...existing,
          nomeFantasia,
          razaoSocial,
          cnpj,
          site,
          instagram,
          linkedin,
          whatsapp,
          email,
          telefone: whatsapp || existing.telefone,
          cidade,
          estado,
          nomeContato,
          capitalSocial,
          cnaePrincipal,
          produtosServicos,
          vagasAbertas,
        });
      }
      setEditingId(null);
    } else {
      onAddLead({
        nomeFantasia,
        razaoSocial,
        cnpj,
        site,
        instagram,
        linkedin,
        facebook: '',
        tiktok: '',
        youtube: '',
        whatsapp,
        email,
        telefone: whatsapp,
        cidade,
        estado,
        nomeContato,
        capitalSocial,
        cnaePrincipal,
        produtosServicos,
        vagasAbertas,
      });
    }

    handleCancel();
  };

  const filteredLeads = leads.filter(lead => {
    const term = searchTerm.toLowerCase();
    
    // Basic fields
    const matchesBasic = 
      (lead.nomeFantasia || '').toLowerCase().includes(term) ||
      (lead.razaoSocial || '').toLowerCase().includes(term) ||
      (lead.cnpj || '').includes(searchTerm);

    // Job opening fields
    const matchesVagasManual = (lead.vagasAbertas || '').toLowerCase().includes(term);
    
    let matchesVagasOficial = false;
    if (lead.vagasOficial) {
      if (Array.isArray(lead.vagasOficial)) {
        matchesVagasOficial = lead.vagasOficial.some(v => v.toLowerCase().includes(term));
      } else {
        matchesVagasOficial = lead.vagasOficial.toLowerCase().includes(term);
      }
    }
    
    const matchesContratacoes = (lead.contratacoesOficiais || '').toLowerCase().includes(term);

    const matchesSearch = matchesBasic || matchesVagasManual || matchesVagasOficial || matchesContratacoes;

    // Priority filter
    const leadAi = aiAnalysis ? aiAnalysis[lead.id] : null;
    const priority = leadAi?.priority || 'Média';
    const matchesPriority = filterPriority === 'all' || priority.toLowerCase() === filterPriority.toLowerCase();

    // Luxury Profile filter
    const isLuxury = leadAi?.luxuryProfile || false;
    const matchesLuxury = filterLuxury === 'all' || 
      (filterLuxury === 'luxury' && isLuxury) || 
      (filterLuxury === 'standard' && !isLuxury);

    // Estado filter
    const matchesEstado = filterEstado === 'all' || (lead.estado || '').toUpperCase() === filterEstado.toUpperCase();

    return matchesSearch && matchesPriority && matchesLuxury && matchesEstado;
  });

  const uniqueStates = Array.from(new Set(leads.map(l => (l.estado || '').toUpperCase()).filter(s => s.length > 0))).sort();

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-800 font-sans tracking-tight">Leads Registrados no CRM</h2>
        </div>
        <button
          onClick={() => {
            if (isOpen && editingId) {
              handleCancel();
            } else {
              setIsOpen(!isOpen);
              setEditingId(null);
            }
          }}
          id="btn-register-lead"
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm self-start cursor-pointer transition-all"
        >
          <Plus className="h-4 w-4" />
          {isOpen && editingId ? 'Novo Cadastro' : 'Cadastrar Novo Lead B2B'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} id="form-new-lead" className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 transition-all">
          <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
            {editingId ? '📝 Editando Diretrizes e Dados do Lead' : '✨ Dados Iniciais de Cadastro'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                placeholder="Ex. Cacau Show, TechVibe"
                className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Razão Social</label>
              <input
                type="text"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                placeholder="Ex. Cacau Show Franquias Ltda"
                className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-500">CNPJ</label>
                <button
                  type="button"
                  onClick={handleSearchCNPJ}
                  disabled={isSearchingCNPJ || cnpj.replace(/\D/g, '').length !== 14}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold disabled:opacity-40 flex items-center gap-1 transition-colors"
                  title="Consultar dados oficiais da Receita Federal para este CNPJ"
                >
                  {isSearchingCNPJ ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                      <span>Consultando Receita...</span>
                    </>
                  ) : (
                    <>
                      <SearchCode className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Buscar dados da Receita</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => {
                  setCnpj(e.target.value);
                  if (cnpjError) setCnpjError(null);
                  if (cnpjSuccess) setCnpjSuccess(null);
                }}
                placeholder="Ex. 33.000.167/0001-01 ou apenas números"
                className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
              {cnpjError && (
                <p className="text-xs text-rose-600 font-medium mt-1">{cnpjError}</p>
              )}
              {cnpjSuccess && (
                <p className="text-xs text-emerald-600 font-medium mt-1">{cnpjSuccess}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Site / URL</label>
              <input
                type="text"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="Ex. www.cacaushow.com.br"
                className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Contato Principal / Cargo</label>
              <input
                type="text"
                value={nomeContato}
                onChange={(e) => setNomeContato(e.target.value)}
                placeholder="Ex. Mariana Costa (Diretora)"
                className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">WhatsApp / Telefone</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex. (11) 98888-7777"
                className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">LinkedIn Comercial</label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="Ex. linkedin.com/company/cacaushow"
                className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Instagram (@)</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Ex. @cacaushow"
                className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Cidade / Estado</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Cidade"
                  className="w-2/3 text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
                <input
                  type="text"
                  value={estado}
                  maxLength={2}
                  onChange={(e) => setEstado(e.target.value.toUpperCase())}
                  placeholder="UF"
                  className="w-1/3 text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-slate-800"
                />
              </div>
            </div>

            {/* Automated strategic info notice */}
            <div className="md:col-span-3 border-t border-slate-200 pt-3 mt-1 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 space-y-2">
              <h4 className="text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1 flex items-center gap-1.5">
                💡 Como Obter o Melhor Enriquecimento Inteligente
              </h4>
              <p className="text-xs text-slate-600 leading-normal">
                Para o melhor resultado possível do nosso robô, é altamente recomendado preencher pelo menos:
                <span className="block mt-1 font-sans text-[11px] text-slate-500">
                  • <b>CNPJ</b>: Crucial para o <b>Nível 1 (Identificação CNAE/Capital/Sede)</b>.<br/>
                  • <b>Site / URL</b>: Indispensável para o <b>Nível 2 (Stack/Métricas)</b> e <b>Nível 4 (Tomadores de Decisão PDL)</b>.<br/>
                  • <b>Nome Fantasia / Razão Social</b>: Base para a busca inicial.
                </span>
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 border-t border-slate-200/50 pt-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              {editingId ? 'Confirmar e Atualizar Lead' : 'Salvar Entrada Inicial'}
            </button>
          </div>
        </form>
      )}

      {/* Search and Quick Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
        {/* Search Input (takes 2 columns) */}
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, razão social ou CNPJ..."
            className="w-full text-sm pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 h-[38px] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="all">Prioridade: Todas</option>
            <option value="alta">🔴 Alta Prioridade</option>
            <option value="média">🟡 Média Prioridade</option>
            <option value="baixa">🟢 Baixa Prioridade</option>
          </select>
        </div>

        {/* Luxury / Score Filter */}
        <div>
          <select
            value={filterLuxury}
            onChange={(e) => setFilterLuxury(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 h-[38px] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="all">Perfil: Todos</option>
            <option value="luxury">💎 Luxo / Premium</option>
            <option value="standard">📦 Padrão / Geral</option>
          </select>
        </div>

        {/* State Filter */}
        <div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 h-[38px] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="all">Estado: Todos</option>
            {uniqueStates.map(st => (
              <option key={st} value={st}>📍 {st}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3">
        {filteredLeads.map((lead) => {
          const isSelected = selectedLeadId === lead.id;
          return (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead.id)}
              id={`lead-card-${lead.id}`}
              className={`relative cursor-pointer p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/10 shadow-sm'
                  : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 tracking-tight line-clamp-1">
                      {lead.nomeFantasia || lead.razaoSocial || "Empresa sem Nome"}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500">
                      {lead.cnpj ? `CNPJ: ${lead.cnpj}` : 'Sem CNPJ informado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(lead);
                    }}
                    id={`btn-edit-lead-${lead.id}`}
                    className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100/50 transition-colors cursor-pointer"
                    title="Editar informações do lead"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLead(lead.id);
                    }}
                    id={`btn-delete-lead-${lead.id}`}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100/50 transition-colors cursor-pointer"
                    title="Excluir lead do CRM"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1">
                {lead.site && (
                  <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-100/30 font-mono">
                    {lead.site.replace(/^(https?:\/\/)?(www\.)?/, '').slice(0, 20)}
                  </span>
                )}
                {lead.cidade && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100/30">
                    {lead.cidade}/{lead.estado}
                  </span>
                )}
                {lead.nomeContato && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100/30 font-sans">
                    Ref: {lead.nomeContato}
                  </span>
                )}
                {/* Priority and Luxury Badges inside the Lead Card */}
                {aiAnalysis && aiAnalysis[lead.id] && (
                  <>
                    {aiAnalysis[lead.id].priority === 'Alta' && (
                      <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100/30 font-bold">
                        🔴 Alta
                      </span>
                    )}
                    {aiAnalysis[lead.id].priority === 'Média' && (
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100/30 font-bold">
                        🟡 Média
                      </span>
                    )}
                    {aiAnalysis[lead.id].priority === 'Baixa' && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100/30 font-bold">
                        🟢 Baixa
                      </span>
                    )}
                    {aiAnalysis[lead.id].luxuryProfile && (
                      <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100/30 font-sans font-semibold">
                        💎 Luxo ({aiAnalysis[lead.id].luxuryScore || 70})
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
        {filteredLeads.length === 0 && (
          <div className="col-span-full py-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
            Nenhum lead correspondente encontrado. Cadastre um novo acima para começar!
          </div>
        )}
      </div>
    </div>
  );
};
