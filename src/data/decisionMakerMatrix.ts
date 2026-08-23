/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Matriz Oficial Nevine de Decisores e Influenciadores por Segmento Vertical
 */

export interface SegmentTargetRule {
  segmentId: string;
  segmentName: string;
  keywords: string[];
  budgetDeciders: string[];
  experienceInfluencers: string[];
  keyMetric: string;
}

export const NEVINE_TARGET_MATRIX: SegmentTargetRule[] = [
  {
    segmentId: 'resorts_hoteis_passeio',
    segmentName: 'Hotéis de Passeio e Resorts',
    keywords: ['resort', 'hotel de passeio', 'pousada resort', 'ecoresort', 'hotel fazenda', 'complexo hoteleiro', 'hotelaria de lazer'],
    budgetDeciders: ['Gerente Financeiro', 'Diretor de Suprimentos', 'Gerente de Compras', 'Diretor Financeiro'],
    experienceInfluencers: ['Gerente de Experiência do Hóspede (CX)', 'Gerente de Marketing', 'Coordenador de CX', 'Head de Customer Experience'],
    keyMetric: 'Reputação Online (Reviews), NPS, Fidelização'
  },
  {
    segmentId: 'hoteis_executivos',
    segmentName: 'Hotéis Executivos',
    keywords: ['hotel executivo', 'hotel corporativo', 'hotel de negocios', 'flat', 'hotel centro de convencoes'],
    budgetDeciders: ['Gerente Administrativo', 'Facilities Manager', 'Gerente de Operações', 'Diretor de Operações'],
    experienceInfluencers: ['Gerente de Eventos Corporativos', 'Recepção Executiva', 'Coordenador de Eventos B2B', 'Chefe de Recepção'],
    keyMetric: 'Consistência de Padrão em Eventos B2B e Salas VIP'
  },
  {
    segmentId: 'pousadas_alto_padrao',
    segmentName: 'Pousadas (Alto Padrão)',
    keywords: ['pousada', 'pousada de charmo', 'pousada boutique', 'pousada de luxo', 'chale de luxo'],
    budgetDeciders: ['Proprietário', 'Gerente Geral', 'Sócio-Proprietário', 'Dono'],
    experienceInfluencers: ['Gerente de A&B (Alimentos e Bebidas)', 'Chefe de Cozinha', 'Maitre', 'Responsável pela Copa'],
    keyMetric: 'Charme, Exclusividade e Detalhe Personalizado'
  },
  {
    segmentId: 'spas',
    segmentName: 'Spas e Centros de Bem-Estar',
    keywords: ['spa', 'wellness', 'centro de bem-estar', 'spa urbano', 'resort spa', 'clinica estetica premium'],
    budgetDeciders: ['Diretor de Operações', 'Gerente de Wellness', 'Gerente Geral de Spa', 'Diretor de Spa'],
    experienceInfluencers: ['Terapeutas Líderes', 'Branding Manager', 'Coordenador de Terapias', 'Gerente de Estética'],
    keyMetric: 'Sensação de Cuidado Premium e Bem-Estar (Luxo)'
  },
  {
    segmentId: 'hospitais_clinicas_elite',
    segmentName: 'Hospitais e Clínicas de Elite',
    keywords: ['hospital', 'clinica de elite', 'centro medico', 'maternidade premium', 'hospital dia', 'clinica cirurgica'],
    budgetDeciders: ['Diretor Administrativo', 'Facilities Management', 'Gerente de Suprimentos Hospitalares', 'Diretor de Operações Hospitalares'],
    experienceInfluencers: ['Gerente de Hotelaria Hospitalar', 'Chefia de Enfermagem', 'Coordenador de Atendimento ao Paciente VIP', 'Gestor de A&B Hospitalar'],
    keyMetric: 'Percepção de Higiene Elevada, Conforto e Cuidado'
  },
  {
    segmentId: 'moteis_luxo',
    segmentName: 'Motéis (Luxo)',
    keywords: ['motel', 'motel de luxo', 'suites de luxo', 'motel boutique'],
    budgetDeciders: ['Proprietário', 'Gerente Geral', 'Sócio-Administrador'],
    experienceInfluencers: ['Marketing e Branding', 'Gerente de Salão / Recepção', 'Coordenador de Enxoval'],
    keyMetric: 'Discrição e Experiência Temática Premium'
  },
  {
    segmentId: 'restaurantes_cafes_premium',
    segmentName: 'Restaurantes e Cafés Premium',
    keywords: ['restaurante', 'bistro', 'cafe premium', 'hamburgueria gourmet', 'alta gastronomia', 'fine dining', 'gastronomia'],
    budgetDeciders: ['Proprietário', 'Gerente de Compras', 'Sócio-Proprietário', 'Gerente Geral'],
    experienceInfluencers: ['Chef Executivo', 'Gerente de Salão', 'Maitre', 'Sommelier', 'Barista Chefe'],
    keyMetric: 'Ambiente, Ticket Médio e Diferenciação Gastronômica'
  },
  {
    segmentId: 'escritorios_advocacia_elite',
    segmentName: 'Escritórios de Advocacia (Elite)',
    keywords: ['advocacia', 'escritorio de advocacia', 'banca de advogados', 'juridico', 'law firm', 'sociedade de advogados'],
    budgetDeciders: ['Facilities Manager', 'Gerente Administrativo', 'Diretor Executivo (COO)', 'Gerente de Operações'],
    experienceInfluencers: ['Sócios Sênior', 'Gerente de Marketing Institucional', 'Coordenador de Relacionamento VIP', 'Chefe de Copa e Eventos'],
    keyMetric: 'Status, Exclusividade e Hospitalidade ao Cliente VIP'
  },
  {
    segmentId: 'bancos_investimento',
    segmentName: 'Bancos e Empresas de Investimento',
    keywords: ['banco', 'corretora', 'family office', 'investimento', 'gestora de recursos', 'asset management', 'private banking', 'holding'],
    budgetDeciders: ['Facilities Management', 'Gerente de Marketing Institucional', 'Diretor de Operações (COO)', 'Head de Infraestrutura'],
    experienceInfluencers: ['Gerente Bancário Personalizado', 'VP de Relacionamento (Private)', 'Wealth Manager', 'Assessor Private'],
    keyMetric: 'Imagem de Confiança, Status e Serviço Exclusivo'
  }
];

/**
 * Match vertical segment rule based on lead details
 */
export function findMatchingSegmentRule(lead: any): SegmentTargetRule | null {
  const searchText = [
    lead.nomeFantasia,
    lead.razaoSocial,
    lead.segmento,
    lead.cnaeDesc,
    lead.produtosServicos,
    lead.site
  ].filter(Boolean).join(' ').toLowerCase();

  for (const rule of NEVINE_TARGET_MATRIX) {
    if (rule.keywords.some(kw => searchText.includes(kw))) {
      return rule;
    }
  }

  // Default fallback if no specific vertical is matched
  return null;
}

/**
 * Evaluate if a job role is a Target Budget Decider or Experience Influencer
 */
export function evaluateTargetRoleMatch(roleTitle: string, lead: any): {
  isTarget: boolean;
  category: 'Decisor de Orçamento (Compra)' | 'Influenciador de Experiência (Usuário Final)' | 'Cargo Foco Nevine' | null;
  ruleMatched: SegmentTargetRule | null;
  keyMetric: string | null;
} {
  const normRole = (roleTitle || '').toLowerCase();
  const rule = findMatchingSegmentRule(lead);

  if (rule) {
    const isBudget = rule.budgetDeciders.some(b => normRole.includes(b.toLowerCase()) || b.toLowerCase().includes(normRole));
    if (isBudget) {
      return {
        isTarget: true,
        category: 'Decisor de Orçamento (Compra)',
        ruleMatched: rule,
        keyMetric: rule.keyMetric
      };
    }

    const isInfluencer = rule.experienceInfluencers.some(i => normRole.includes(i.toLowerCase()) || i.toLowerCase().includes(normRole));
    if (isInfluencer) {
      return {
        isTarget: true,
        category: 'Influenciador de Experiência (Usuário Final)',
        ruleMatched: rule,
        keyMetric: rule.keyMetric
      };
    }
  }

  // General check across all rules
  for (const r of NEVINE_TARGET_MATRIX) {
    if (r.budgetDeciders.some(b => normRole.includes(b.toLowerCase()))) {
      return {
        isTarget: true,
        category: 'Decisor de Orçamento (Compra)',
        ruleMatched: r,
        keyMetric: r.keyMetric
      };
    }
    if (r.experienceInfluencers.some(i => normRole.includes(i.toLowerCase()))) {
      return {
        isTarget: true,
        category: 'Influenciador de Experiência (Usuário Final)',
        ruleMatched: r,
        keyMetric: r.keyMetric
      };
    }
  }

  // Check general high-value roles
  const generalDeciders = ['proprietario', 'proprietário', 'sócio', 'socio', 'ceo', 'diretor', 'gerente de compras', 'facilities', 'gerente geral'];
  if (generalDeciders.some(g => normRole.includes(g))) {
    return {
      isTarget: true,
      category: 'Cargo Foco Nevine',
      ruleMatched: rule,
      keyMetric: rule?.keyMetric || 'Elevação de Status e Experiência do Cliente'
    };
  }

  return { isTarget: false, category: null, ruleMatched: null, keyMetric: null };
}
