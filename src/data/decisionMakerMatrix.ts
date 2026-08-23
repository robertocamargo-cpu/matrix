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

export interface TargetRoleFocusDetail {
  cargo: string;
  setor: string;
  papelOuResponsabilidade: string;
  doresResolvidas: string;
  termosTecnicos?: string;
}

export const NEVINE_TARGET_ROLES_DETAILED: TargetRoleFocusDetail[] = [
  {
    cargo: "Governanta Executiva",
    setor: "Hotelaria de Luxo",
    papelOuResponsabilidade: "Analisa a qualidade tátil e a conformidade estética com o padrão da marca.",
    doresResolvidas: "Percepção de limpeza, padronização visual e proteção contra contaminação ambiental.",
    termosTecnicos: "Padrão de enxoval, relevo seco, toque de linho, assepsia de leito."
  },
  {
    cargo: "Gerente de A&B",
    setor: "Hotelaria / Resorts",
    papelOuResponsabilidade: "Homologa itens para serviço de quarto (room service) e restaurantes internos.",
    doresResolvidas: "Redução de ruído metálico, proteção de talheres em trânsito e agilidade no serviço.",
    termosTecnicos: "Room service, mise en place, envelopados, cap-copo."
  },
  {
    cargo: "Diretor de Compras",
    setor: "Hotelaria Triple A",
    papelOuResponsabilidade: "Negocia contratos, valida a saúde financeira do fornecedor e prazos.",
    doresResolvidas: "Ruptura de estoque, inflação de insumos e conformidade com metas de ESG.",
    termosTecnicos: "SLA de entrega, ESG, contrato guarda-chuva, curva ABC."
  },
  {
    cargo: "Gerente de Motel",
    setor: "Motéis Design",
    papelOuResponsabilidade: "Centraliza a escolha de fornecedores de higiene e enxoval.",
    doresResolvidas: "Agilidade no giro de suítes, controle de custos fixos e garantia de assepsia.",
    termosTecnicos: "Giro de suíte, envelopamento lacrado, desinfecção express, OPEX."
  },
  {
    cargo: "Guest Experience Manager",
    setor: "Luxo / Boutique",
    papelOuResponsabilidade: "Avalia o impacto sensorial e emocional dos descartáveis.",
    doresResolvidas: "Quebra de expectativa de luxo e falta de personalização da jornada.",
    termosTecnicos: "Touchpoints de marca, relevo sem tinta, branding sensorial, NPS."
  },
  {
    cargo: "Coordenador de SCIH",
    setor: "Hospitais / Clínicas de Elite",
    papelOuResponsabilidade: "Validador técnico de segurança e assepsia.",
    doresResolvidas: "Contaminação cruzada, riscos biológicos e adesão a normas da Anvisa.",
    termosTecnicos: "Barreira física, RDC 45, assepsia, patógenos."
  },
  {
    cargo: "Gestor de Hotelaria Hospitalar",
    setor: "Hospitais / Clínicas de Elite",
    papelOuResponsabilidade: "Decide pela estética e conforto do ambiente.",
    doresResolvidas: "Impessoalidade do hospital, satisfação do paciente e humanização.",
    termosTecnicos: "Conforto térmico, design inclusivo, experiência do paciente."
  },
  {
    cargo: "Nutricionista Responsável (RT)",
    setor: "Hospitais / SND",
    papelOuResponsabilidade: "Decide sobre a proteção de utensílios na dieta.",
    doresResolvidas: "Segurança alimentar, agilidade no serviço de copearia e higiene visual.",
    termosTecnicos: "Dieta pastosa/livre, protocolo de bandeja, lacre de segurança."
  },
  {
    cargo: "Gerente de Suprimentos Hospitalares",
    setor: "Hospitais de Elite",
    papelOuResponsabilidade: "Homologação de fornecedores e gestão de custos.",
    doresResolvidas: "Ruptura de insumos críticos e gestão de resíduos de saúde.",
    termosTecnicos: "Padronização de SKU, lote de fabricação, rastreabilidade."
  },
  {
    cargo: "Maître d'Hôtel",
    setor: "Restaurantes Premium",
    papelOuResponsabilidade: "Apresentação e protocolo de serviço.",
    doresResolvidas: "Higiene percebida, etiqueta à mesa e organização do salão.",
    termosTecnicos: "Mise en place, couvert, serviço à francesa."
  },
  {
    cargo: "Chef Executivo",
    setor: "Alta Gastronomia",
    papelOuResponsabilidade: "Harmonia estética e identidade da marca.",
    doresResolvidas: "Despadronização visual e interferência no design do prato.",
    termosTecnicos: "Empratamento, guarnição, identidade visual."
  },
  {
    cargo: "Sommelier",
    setor: "Restaurantes Premium",
    papelOuResponsabilidade: "Proteção de taças e acessórios de vinho.",
    doresResolvidas: "Odores residuais no cristal e poeira em taças pré-montadas.",
    termosTecnicos: "Polimento de cristal, decantação, serviço de vinhos."
  },
  {
    cargo: "Gerente de Operações",
    setor: "Restaurantes Premium",
    papelOuResponsabilidade: "Eficiência financeira e logística.",
    doresResolvidas: "Custos de lavanderia, perdas de enxoval e demora no giro de mesas.",
    termosTecnicos: "Food cost, giro de mesa, OPEX (Operational Excellence)."
  }
];

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

  // Check explicit detailed focus roles first
  const matchedDetail = NEVINE_TARGET_ROLES_DETAILED.find(d => normRole.includes(d.cargo.toLowerCase()) || d.cargo.toLowerCase().includes(normRole));
  if (matchedDetail) {
    return {
      isTarget: true,
      category: 'Cargo Foco Nevine',
      ruleMatched: null,
      keyMetric: `${matchedDetail.doresResolvidas} | Termos: ${matchedDetail.termosTecnicos || 'Qualidade Nevine'}`
    };
  }

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
  const generalDeciders = ['proprietario', 'proprietário', 'sócio', 'socio', 'ceo', 'diretor', 'gerente de compras', 'facilities', 'gerente geral', 'governanta', 'maitre', 'maître', 'chef', 'sommelier', 'nutricionista', 'scih'];
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
