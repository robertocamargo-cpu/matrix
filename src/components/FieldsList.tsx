/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lead, LeadDiscovery } from '../types';
import { 
  Building, Globe, Phone, Mail, MapPin, DollarSign, Users, Award, 
  Search, ShieldCheck, HelpCircle, Layers, FileText, CheckCircle2 
} from 'lucide-react';

interface FieldsListProps {
  lead: Lead;
  discoveries: LeadDiscovery[];
}

interface FieldDefinition {
  key: string;
  label: string;
  category: 'Cadastro' | 'Digital' | 'Comercial' | 'Estratégico';
  description: string;
  sources: string[];
  getValue: (lead: Lead, discoveries: LeadDiscovery[]) => string | null;
}

export const FieldsList: React.FC<FieldsListProps> = ({ lead, discoveries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Cadastro' | 'Digital' | 'Comercial' | 'Estratégico'>('all');

  // Generic helper to fetch discovered value by key
  const getDiscoveredValue = (keys: string[], labelSubstrings: string[], discoveries: LeadDiscovery[]): string | null => {
    const found = discoveries.find(d => {
      const fieldLower = (d.field || '').toLowerCase().replace(/_/g, '');
      const labelLower = (d.fieldLabel || '').toLowerCase();
      return keys.some(k => fieldLower === k.toLowerCase().replace(/_/g, '')) || 
             labelSubstrings.some(sub => labelLower.includes(sub.toLowerCase()));
    });
    return found ? found.cleanValue : null;
  };

  const fields: FieldDefinition[] = [
    // CADASTRO
    {
      key: 'cnpj',
      label: 'CNPJ',
      category: 'Cadastro',
      description: 'Cadastro Nacional da Pessoa Jurídica da empresa.',
      sources: ['Receita Federal (Nível 1)', 'Ficha Inicial'],
      getValue: (l, d) => l.cnpjOficial || l.cnpj || getDiscoveredValue(['cnpj', 'cnpjoficial'], ['cnpj'], d)
    },
    {
      key: 'razaoSocial',
      label: 'Razão Social',
      category: 'Cadastro',
      description: 'Nome empresarial oficial registrado nos órgãos competentes.',
      sources: ['Receita Federal (Nível 1)', 'Ficha Inicial'],
      getValue: (l, d) => l.razaoSocialOficial || l.razaoSocial || getDiscoveredValue(['razaosocial', 'razaosocialoficial'], ['razão', 'razao'], d)
    },
    {
      key: 'nomeFantasia',
      label: 'Nome Fantasia',
      category: 'Cadastro',
      description: 'Nome de fachada ou marca de mercado visível aos clientes.',
      sources: ['Receita Federal (Nível 1)', 'Google Maps (Nível 2)', 'Ficha Inicial'],
      getValue: (l, d) => l.nomeFantasiaOficial || l.nomeFantasia || getDiscoveredValue(['nomefantasia', 'nomefantasiaoficial'], ['fantasia'], d)
    },
    {
      key: 'cnaePrincipal',
      label: 'CNAE Principal',
      category: 'Cadastro',
      description: 'Código de Atividade Econômica Principal que define a operação primária.',
      sources: ['Receita Federal (Nível 1)'],
      getValue: (l, d) => l.cnaesOficial?.join(', ') || l.cnaePrincipal || getDiscoveredValue(['cnaes', 'cnaeprincipal', 'cnaedesc', 'cnae', 'cnaesoficial'], ['cnae'], d)
    },
    {
      key: 'situacaoCadastral',
      label: 'Situação Cadastral',
      category: 'Cadastro',
      description: 'Estado fiscal da empresa na Receita Federal (ex: Ativa, Baixada).',
      sources: ['Receita Federal (Nível 1)'],
      getValue: (l, d) => l.situacaoOficial || getDiscoveredValue(['situacao', 'situacaooficial'], ['situação', 'situacao'], d)
    },
    {
      key: 'capitalSocial',
      label: 'Capital Social',
      category: 'Cadastro',
      description: 'Capital total integralizado ou registrado na Junta Comercial.',
      sources: ['Receita Federal (Nível 1)'],
      getValue: (l, d) => l.capitalSocialOficial || l.capitalSocial || getDiscoveredValue(['capitalsocial', 'capitalsocialoficial', 'capital_social'], ['capital social'], d)
    },
    {
      key: 'socios',
      label: 'Sócios & Administradores (QSA)',
      category: 'Cadastro',
      description: 'Quadro de Sócios e Administradores com seus papéis cadastrais.',
      sources: ['Receita Federal (Nível 1)', 'Estatuto de Governança (Nível 3)'],
      getValue: (l, d) => l.sociosOficial?.join(', ') || getDiscoveredValue(['socios', 'sociosoficial'], ['sócio', 'socio'], d)
    },
    {
      key: 'endereco',
      label: 'Endereço Completo',
      category: 'Cadastro',
      description: 'Localização da sede oficial ou principal estabelecimento.',
      sources: ['Receita Federal (Nível 1)', 'Google Maps (Nível 2)', 'Ficha Inicial'],
      getValue: (l, d) => l.enderecoOficial || getDiscoveredValue(['endereco', 'enderecooficial'], ['endereço', 'endereco', 'logradouro'], d)
    },
    {
      key: 'porte',
      label: 'Porte da Empresa',
      category: 'Cadastro',
      description: 'Classificação oficial do tamanho do negócio (Micro, EPP, Médio, Grande).',
      sources: ['Receita Federal (Nível 1)', 'SimilarWeb (Nível 2)', 'Faturamento Estimado (Nível 3)'],
      getValue: (l, d) => l.porteOficial || getDiscoveredValue(['porte', 'porteoficial'], ['porte'], d)
    },

    // DIGITAL
    {
      key: 'site',
      label: 'Website Oficial',
      category: 'Digital',
      description: 'Endereço oficial na internet (URL) da empresa.',
      sources: ['Google Maps (Nível 2)', 'Ficha Inicial', 'Metadados WHOIS'],
      getValue: (l, d) => l.siteOficial || l.site || getDiscoveredValue(['site', 'siteoficial', 'website'], ['site', 'website'], d)
    },
    {
      key: 'instagram',
      label: 'Perfil Instagram',
      category: 'Digital',
      description: 'Canal oficial de comunicação visual e engajamento no Instagram.',
      sources: ['Instagram Search (Nível 2)', 'Ficha Inicial'],
      getValue: (l, d) => l.instagram || getDiscoveredValue(['instagram', 'instagramoficial'], ['instagram'], d)
    },
    {
      key: 'linkedin',
      label: 'Perfil LinkedIn Corporativo',
      category: 'Digital',
      description: 'Página profissional da empresa no LinkedIn para talentos e B2B.',
      sources: ['LinkedIn Search (Nível 2)', 'API Apollo / PDL'],
      getValue: (l, d) => l.linkedin || getDiscoveredValue(['linkedin', 'linkedinoficial'], ['linkedin'], d)
    },
    {
      key: 'facebook',
      label: 'Página Facebook',
      category: 'Digital',
      description: 'Canal corporativo de mídias e postagens no Facebook.',
      sources: ['Facebook Crawler (Nível 2)'],
      getValue: (l, d) => l.facebook || getDiscoveredValue(['facebook', 'facebookoficial'], ['facebook'], d)
    },
    {
      key: 'tecnologias',
      label: 'Tecnologias do Site',
      category: 'Digital',
      description: 'Lista de ferramentas, scripts de analytics, pixels de anúncios e CMSs do site.',
      sources: ['Wappalyzer / Web Scraping (Nível 2)'],
      getValue: (l, d) => getDiscoveredValue(['tecnologias', 'tecnologiassiteoficial'], ['tecnologia', 'tag', 'analytics', 'pixel'], d)
    },
    {
      key: 'whois',
      label: 'Registro WHOIS',
      category: 'Digital',
      description: 'Dados técnicos de criação e expiração do domínio na internet.',
      sources: ['API WHOIS (Nível 2)'],
      getValue: (l, d) => l.siteOficial || getDiscoveredValue(['whois', 'whoisdata', 'whoisdataoficial'], ['whois', 'domínio', 'criado em'], d)
    },
    {
      key: 'similarweb',
      label: 'Popularidade Digital (SimilarWeb)',
      category: 'Digital',
      description: 'Estimativa de visitas mensais e ranking do site.',
      sources: ['API SimilarWeb (Nível 2)'],
      getValue: (l, d) => getDiscoveredValue(['scoresimilarweboficial', 'similarweb', 'popularidade'], ['similarweb', 'tráfego', 'visitas'], d)
    },
    {
      key: 'email',
      label: 'E-mail de Contato',
      category: 'Digital',
      description: 'E-mails de contato público ou canais eletrônicos encontrados.',
      sources: ['Google Maps (Nível 2)', 'Ficha Inicial', 'API Hunter (Nível 4)'],
      getValue: (l, d) => l.emailsOficiais?.join(', ') || l.email || getDiscoveredValue(['email', 'emailsoficiais', 'e_mail'], ['e-mail', 'email', 'correio'], d)
    },
    {
      key: 'telefone',
      label: 'Telefone Comercial',
      category: 'Digital',
      description: 'Linhas de telefone fixo ou corporativo encontradas.',
      sources: ['Google Maps (Nível 2)', 'Receita Federal (Nível 1)', 'Ficha Inicial'],
      getValue: (l, d) => l.telefonesOficiais?.join(', ') || l.telefone || getDiscoveredValue(['telefone', 'telefonesoficiais'], ['telefone', 'fone', 'celular'], d)
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp Comercial',
      category: 'Digital',
      description: 'Canal de WhatsApp direto detectado nas páginas ou site.',
      sources: ['Web Scraping & APIs (Nível 2)'],
      getValue: (l, d) => l.whatsappOficial || l.whatsapp || getDiscoveredValue(['whatsapp', 'whatsappoficial'], ['whatsapp', 'whats'], d)
    },
    {
      key: 'links',
      label: 'Links Coletados',
      category: 'Digital',
      description: 'URLs, PDFs de cardápios, catálogos e links correlatos mapeados na varredura do robô.',
      sources: ['Google Maps (Nível 2)', 'Web Crawler (Nível 2)'],
      getValue: (l, d) => getDiscoveredValue(['links', 'links_coletados', 'urlsoficiais'], ['link', 'pdf', 'catálogo', 'cardápio'], d)
    },

    // COMERCIAL
    {
      key: 'produtos',
      label: 'Serviços & Produtos Oficiais',
      category: 'Comercial',
      description: 'Mapeamento real do que a empresa produz, vende ou oferece comercialmente.',
      sources: ['AI Website Reader (Nível 2)', 'Estatuto de Governança (Nível 3)'],
      getValue: (l, d) => l.produtosOficiais?.join(', ') || l.produtosServicos || getDiscoveredValue(['produtos', 'produtosservicos', 'produtosoficiais'], ['produto', 'serviço', 'servico'], d)
    },
    {
      key: 'filiais',
      label: 'Estrutura de Filiais',
      category: 'Comercial',
      description: 'Identificação de unidades ativas adicionais, filiais e plantas operacionais.',
      sources: ['Receita Federal (Nível 1)', 'AI Website Reader (Nível 2)'],
      getValue: (l, d) => l.filiaisOficiais?.join(', ') || getDiscoveredValue(['filiais', 'filiaisoficiais'], ['filial', 'unidades', 'plantas'], d)
    },
    {
      key: 'reputacao',
      label: 'Reputação Online',
      category: 'Comercial',
      description: 'Indicadores de satisfação de clientes em plataformas abertas.',
      sources: ['ReclameAqui Crawler / Google Reviews (Nível 2)'],
      getValue: (l, d) => getDiscoveredValue(['reputacao', 'reputação'], ['reputação', 'reclame aqui', 'nota', 'avaliação'], d)
    },

    // ESTRATEGICO
    {
      key: 'faturamento',
      label: 'Faturamento Anual Estimado',
      category: 'Estratégico',
      description: 'Estimativa de receita do estabelecimento baseado em dados cadastrais e de mercado.',
      sources: ['AI Insights (Nível 3)'],
      getValue: (l, d) => getDiscoveredValue(['faturamento', 'receita_anual', 'faturamento_estimado'], ['faturamento', 'receita'], d)
    },
    {
      key: 'vagas',
      label: 'Vagas Disponíveis / Vagas em Aberto',
      category: 'Estratégico',
      description: 'Vagas de emprego publicadas ativamente pela empresa em portais (Gupy, LinkedIn, Catho).',
      sources: ['Vagas Job Crawler (Nível 3)', 'API Apollo (Nível 4)'],
      getValue: (l, d) => Array.isArray(l.vagasOficial) ? l.vagasOficial.join(', ') : (l.vagasOficial || l.vagasAbertas || getDiscoveredValue(['vagas', 'vagasabertas', 'vagasoficial', 'vagasdisponiveis', 'vagas_disponiveis', 'contratacoes'], ['vaga', 'gupy', 'contrata', 'emprego'], d))
    },
    {
      key: 'sinaisExpansao',
      label: 'Sinais de Expansão',
      category: 'Estratégico',
      description: 'Evidências públicas de reformas, novos contratos, expansão física ou contratação massiva.',
      sources: ['Google Notícias Crawler (Nível 3)'],
      getValue: (l, d) => l.expansaoOficial || getDiscoveredValue(['expansao', 'novasunidades', 'reformas', 'contratacoes'], ['expansão', 'reforma', 'unidade', 'obras'], d)
    },
    {
      key: 'proprietario',
      label: 'Decisor Proprietário / CEO',
      category: 'Estratégico',
      description: 'Identificação do sócio-fundador, proprietário master ou CEO oficial.',
      sources: ['QSA Receita (Nível 1)', 'API Apollo / RocketReach (Nível 4)', 'LinkedIn Search (Nível 3)'],
      getValue: (l, d) => l.diretorOficial || l.nomeContato || getDiscoveredValue(['proprietario', 'proprietário', 'ceo', 'fundador'], ['proprietário', 'ceo', 'fundador', 'dono'], d)
    },
    {
      key: 'diretor',
      label: 'Decisores C-Level / Diretores',
      category: 'Estratégico',
      description: 'Diretores executivos, CFOs, CMOs ou superintendentes tomadores de decisão.',
      sources: ['Estatuto de Governança (Nível 3)', 'API Apollo (Nível 4)'],
      getValue: (l, d) => getDiscoveredValue(['diretor', 'diretores', 'c_level'], ['diretor', 'diretoria', 'c-level'], d)
    },
    {
      key: 'compras',
      label: 'Decisor Compras / Suprimentos',
      category: 'Estratégico',
      description: 'Gestores de suprimentos ou compradores seniores responsáveis por novas aquisições.',
      sources: ['Apollo People Filter (Nível 4)', 'LinkedIn Search (Nível 3)'],
      getValue: (l, d) => getDiscoveredValue(['compras', 'compradores', 'suprimentos'], ['compras', 'comprador', 'suprimentos', 'procurement'], d)
    },
    {
      key: 'operacoes',
      label: 'Decisor Operações',
      category: 'Estratégico',
      description: 'Gestores de supply chain, logística, operações ou produção.',
      sources: ['Apollo People Filter (Nível 4)', 'LinkedIn Search (Nível 3)'],
      getValue: (l, d) => getDiscoveredValue(['operacoes', 'operacao', 'operations'], ['operações', 'gerente de operações', 'operations'], d)
    },
    {
      key: 'facilities',
      label: 'Decisor Facilities / Manutenção',
      category: 'Estratégico',
      description: 'Gestores de manutenção, facilities, patrimônio ou infraestrutura física.',
      sources: ['Apollo People Filter (Nível 4)', 'LinkedIn Search (Nível 3)'],
      getValue: (l, d) => getDiscoveredValue(['facilities', 'infraestrutura', 'manutencao'], ['facilities', 'manutenção', 'infraestrutura', 'patrimônio'], d)
    }
  ];

  // Filter fields based on search and selected category
  const filteredFields = fields.filter(field => {
    const matchesSearch = field.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          field.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          field.key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || field.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (cat: 'Cadastro' | 'Digital' | 'Comercial' | 'Estratégico') => {
    switch (cat) {
      case 'Cadastro': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Digital': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Comercial': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Estratégico': return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Campos de Identificação & Schema do Lead
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Dicionário unificado de atributos e dados cadastrais. Visualize as fontes mapeadas para cada campo e o valor atualmente consolidado de forma transparente para compreender a arquitetura de varredura do CRM:
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
            Atributos Ativos no Sistema
          </span>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 mt-1 inline-block">
            {fields.length} Campos Monitorados
          </span>
        </div>
      </div>

      {/* Filter and search row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome do campo ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'Cadastro', label: 'Cadastro' },
            { id: 'Digital', label: 'Digital' },
            { id: 'Comercial', label: 'Comercial' },
            { id: 'Estratégico', label: 'Estratégico' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-4">
        {filteredFields.map((field) => {
          const value = field.getValue(lead, discoveries);
          const catStyle = getCategoryColor(field.category);

          return (
            <div
              key={field.key}
              id={`field-row-${field.key}`}
              className={`border rounded-xl p-4 transition-all hover:shadow-sm ${
                value 
                  ? 'border-indigo-100 bg-slate-50/20' 
                  : 'border-slate-100 bg-white opacity-90'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  {/* Category and field tag line */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 border rounded-full uppercase tracking-wider ${catStyle}`}>
                      {field.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {field.label}
                      {value && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" title="Informação encontrada e ativa" />
                      )}
                    </h4>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    {field.description}
                  </p>

                  {/* Sources Tag Line */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Fontes Ativas:</span>
                    {field.sources.map((src) => (
                      <span key={src} className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded font-mono">
                        {src}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Live value box */}
                <div className="w-full md:w-80 shrink-0">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Valor Consolidado Atual no CRM:
                  </div>
                  {value ? (
                    <div className="bg-white border border-indigo-100 rounded-lg p-2.5 shadow-sm">
                      <div className="text-xs font-mono font-semibold text-slate-800 break-words line-clamp-3 select-all">
                        {value}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 rounded-lg p-2.5 bg-slate-50/50 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-[11px] text-slate-400 font-medium italic">
                        Não descoberto ainda. Dispare o enriquecimento correspondente.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredFields.length === 0 && (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs shadow-sm bg-slate-50/50">
            Nenhum campo localizado correspondente aos filtros de pesquisa atuais.
          </div>
        )}
      </div>

    </div>
  );
};
