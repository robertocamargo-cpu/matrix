/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Lead {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  site: string;
  instagram: string;
  linkedin: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  whatsapp: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  nomeContato: string;
  createdAt: string;

  // New fields for manual editing & custom research context
  capitalSocial?: string;
  cnaePrincipal?: string;
  produtosServicos?: string;
  vagasAbertas?: string;

  // Official confirmed fields
  cnpjOficial?: string;
  razaoSocialOficial?: string;
  nomeFantasiaOficial?: string;
  cnaesOficial?: string[];
  situacaoOficial?: string;
  capitalSocialOficial?: string;
  sociosOficial?: string[];
  enderecoOficial?: string;

  siteOficial?: string;
  redesOficiais?: string[];
  produtosOficiais?: string[];
  servicosOficiais?: string[];
  telefonesOficiais?: string[];
  emailsOficiais?: string[];
  whatsappOficial?: string;
  filiaisOficiais?: string[];
  estruturaOficial?: string;
  porteOficial?: string;
  perfilPremiumOficial?: string;

  expansaoOficial?: string;
  novasUnidadesOficiais?: string;
  reformasOficiais?: string;
  contratacoesOficiais?: string;
  compradoresOficiais?: string[];
  operacoesOficiais?: string;
  facilitiesOficiais?: string;
  governancaOficial?: string;
  diretorOficial?: string;
  proprietarioOficial?: string;
  vagasOficial?: string[] | string;
}

export interface LeadEnrichmentRun {
  id: string;
  leadId: string;
  buttonId: string;
  buttonName: string;
  date: string;
  time: string;
  durationMs: number;
  cost: number;
  apiCallsCount: number;
}

export interface LeadSource {
  id: string;
  runId: string;
  name: string;
  url: string;
  queryUsed: string;
  success: boolean;
}

export type DiscoveryStatus = 'Encontrado' | 'Sugerido' | 'Confirmado' | 'Rejeitado' | 'Conflitante' | 'Atualizado';
export type UtilityLevel = 'Muito Alta' | 'Alta' | 'Média' | 'Baixa';
export type ImportanceLevel = 'Máxima' | 'Alta' | 'Média' | 'Baixa';

export interface LeadDiscovery {
  id: string;
  leadId: string;
  field: string;
  fieldLabel: string;
  rawValue: string;
  cleanValue: string;
  sourceName: string;
  sourceUrl: string;
  confidence: number; // 0 - 100
  importance: ImportanceLevel;
  utility: UtilityLevel;
  evidence: string;
  status: DiscoveryStatus;
  authorIA: string;
  date: string;
  time: string;
  runId: string;
  buttonId: string;
  rawJSON: string;
}

export interface LeadDecisionMaker {
  id: string;
  leadId: string;
  name: string;
  role: string;
  department: string;
  ranking: number; // 1 to 5
  confidence: number;
  contacts: { email?: string; phone?: string; linkedin?: string }[];
  sources: string[];
  runId: string;
  status?: 'Encontrado' | 'Confirmado' | 'Rejeitado' | 'Trabalha em outro lugar';
  linkedinVerified?: boolean;
  linkedinVerificationDetails?: string;
  isNevineTargetRole?: boolean;
  nevineCategory?: 'Decisor de Orçamento (Compra)' | 'Influenciador de Experiência (Usuário Final)' | 'Cargo Foco Nevine';
  nevineKeyMetric?: string;
  nevineSegmentName?: string;
}

export interface LeadContact {
  id: string;
  leadId: string;
  type: 'email' | 'telefone' | 'whatsapp' | 'social';
  value: string;
  label: string;
  confidence: number;
  runId: string;
}

export interface Playbook {
  whatsapp: string;
  email: string;
  ligacao: string;
  objecoes: { objecao: string; contorno: string }[];
  produtosIndicados: string[];
}

export interface LeadAIAnalysis {
  id: string;
  leadId: string;
  icpScore: number; // 0 - 100
  purchasePotential: number; // 0 - 100
  luxuryProfile: boolean;
  luxuryScore?: number;
  luxuryFactors?: string[];
  priority: 'Alta' | 'Média' | 'Baixa';
  justification: string;
  risk: string;
  playbook: Playbook;
  date: string;
  time: string;
  apiDossier?: string;
  dossieTexto?: string;
  resumoVendedor?: string;
}

export interface LeadScoreCriteria {
  id: string;
  leadId: string;
  criteria: string;
  score: number;
  explanation: string;
}

export interface LeadCost {
  id: string;
  leadId: string;
  apiName: string;
  costType: 'Gratuito' | 'Pago';
  amount: number; // em R$ / Créditos
  creditsUsed: number;
  confirmed: boolean;
}

export interface LeadLog {
  id: string;
  leadId: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'api' | 'ai';
  timestamp: string;
}

export interface LeadHistory {
  id: string;
  leadId: string;
  field: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
  date: string;
  time: string;
  user: string;
}

export interface LeadConflict {
  id: string;
  leadId: string;
  field: string;
  fieldLabel: string;
  currentValue: string;
  valueA: string;
  sourceA: string;
  valueB: string;
  sourceB: string;
  status: 'Pendente' | 'Resolvido';
}

export interface LeadConfirmation {
  id: string;
  leadId: string;
  field: string;
  valueConfirmed: string;
  user: string;
  timestamp: string;
}
