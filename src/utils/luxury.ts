/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead, LeadDiscovery } from '../types';

/**
 * Calculates a dynamic luxury score for a lead based on several parameters:
 * 1. Site domain authority characteristics & high-ticket marketing keywords
 * 2. Presence in known luxury index directories or premium business sectors
 * 3. Premium HQ district detection mapped from geographic address metadata
 */
export function calculateLuxuryScore(lead: Lead, discoveriesList: LeadDiscovery[] = []): { score: number; isPremium: boolean; factors: string[] } {
  let score = 40; // Baseline score floor for qualified B2B leads
  const factors: string[] = [
    'Empresa B2B ativamente mapeada no funil de prospecção (+40 pts)'
  ];

  // Merge textual elements from both lead attributes and discoveries to inspect holistically
  const siteUrl = (lead.site || lead.siteOficial || '').toLowerCase();
  
  // High-ticket & Sector keywords check
  const highTicketKeywords = [
    'luxo', 'luxury', 'boutique', 'prime', 'exclusivo', 'exclusive', 'alto padrão', 'alto padrao', 
    'alta gastronomia', 'fine dining', 'gourmet', 'bistrô', 'bistro', 'cobertura', 'penthouse', 
    'artigos finos', 'elite', 'joalheria', 'joias', 'resort', 'spa', 'private banking',
    'hotel', 'hoteis', 'hotéis', 'pousada', 'motel', 'moteis', 'motéis', 'hospital', 'maternidade', 
    'clinica', 'clínica', 'dermatologia', 'cirurgia', 'restaurante', 'café', 'advocacia', 'advogados', 
    'banco', 'asset', 'holding', 'wealth', 'investimento', 'corretora', 'gastronomia', 'michelin', 
    '5 estrelas', 'triple a', 'presidencial', 'suíte', 'suite', 'fasano', 'tangará', 'emiliano', 'rosewood', 
    'copacabana', 'unique', 'palácio', 'palacio'
  ];

  // Join everything to scan
  const leadScanTokens: string[] = [
    lead.nomeFantasia,
    lead.razaoSocial,
    (lead as any).segmento,
    (lead as any).setorAtuacao,
    lead.produtosServicos,
    lead.cnaePrincipal,
    (lead as any).cnaeDesc,
    lead.enderecoOficial,
    lead.cidade,
    lead.estado,
    siteUrl,
    ...(lead.produtosOficiais || []),
    ...(lead.servicosOficiais || [])
  ].filter(Boolean).map(t => String(t).toLowerCase());

  // Also include active discoveries values
  discoveriesList
    .filter(d => d.leadId === lead.id)
    .forEach(d => {
      if (d.cleanValue) leadScanTokens.push(String(d.cleanValue).toLowerCase());
      if (d.rawValue) leadScanTokens.push(String(d.rawValue).toLowerCase());
    });

  const fullTextToScan = leadScanTokens.join(' ');

  // 1. Evaluate Site Domain Authority and High-Ticket Keywords
  let keywordMatches = 0;
  highTicketKeywords.forEach(kw => {
    if (fullTextToScan.includes(kw)) {
      keywordMatches++;
    }
  });

  if (keywordMatches > 0) {
    const kwScore = Math.min(keywordMatches * 10, 35);
    score += kwScore;
    factors.push(`Palavras-chave de alto padrão/segmento alvo (${keywordMatches} termos): +${kwScore} pts`);
  }

  // Active website presence bonus
  if (siteUrl && siteUrl.length > 3 && !siteUrl.includes('localhost')) {
    score += 15;
    factors.push(`Presença digital ativa com domínio corporativo (${siteUrl}): +15 pts`);
  }

  // 2. Presence in known luxury index directories and premium sectors
  const premiumIndices = [
    'incorporadora', 'holding', 'gestora de investimentos', 'fine dining', 'michelin',
    'estética premium', 'laser premium', 'hotel 5 estrelas', 'resort de praia', 'urbanismo de elite', 
    'condomínio fechado', 'arquitetura designer', 'capital de risco', 'motel design', 'hospitalidade'
  ];

  let indexMatchCount = 0;
  premiumIndices.forEach(ind => {
    if (fullTextToScan.includes(ind)) {
      indexMatchCount++;
    }
  });

  if (indexMatchCount > 0) {
    const indexScore = Math.min(indexMatchCount * 10, 20);
    score += indexScore;
    factors.push(`Aderência a indexadores de hospitalidade/serviços de elite: +${indexScore} pts`);
  }

  // 3. Premium HQ district or Capital City detection
  const premiumGeoDistricts = [
    'jardins', 'alphaville', 'leblon', 'ipanema', 'itaim', 'vila nova conceicao', 'vila nova conceição', 
    'faria lima', 'oscar freire', 'savassi', 'batel', 'marista', 'lourdes', 'muro alto', 'barra da tijuca',
    'pinheiros', 'perdizes', 'brooklin', 'belvedere', 'morumbi', 'moema', 'são paulo', 'rio de janeiro', 'curitiba', 'porto alegre'
  ];

  const addressText = (lead.enderecoOficial || `${lead.cidade || ''} ${lead.estado || ''}`).toLowerCase();
  const foundPremiumDistricts: string[] = [];
  premiumGeoDistricts.forEach(dist => {
    if (addressText.includes(dist) && !foundPremiumDistricts.includes(dist)) {
      foundPremiumDistricts.push(dist);
    }
  });

  if (foundPremiumDistricts.length > 0) {
    score += 15;
    factors.push(`Localização estratégica em hub corporativo/premium (${foundPremiumDistricts.slice(0, 3).join(', ').toUpperCase()}): +15 pts`);
  }

  // 4. Boost for high capital social or active CNPJ status
  const rawCapital = (lead.capitalSocial || '').replace(/\D/g, '');
  if (rawCapital) {
    const amount = parseInt(rawCapital, 10);
    if (amount >= 2000000) {
      score += 20;
      factors.push(`Capital social de grande porte (> R$ 2M): +20 pts`);
    } else if (amount >= 250000) {
      score += 10;
      factors.push(`Capital social promissor (>= R$ 250k): +10 pts`);
    }
  }

  // Cap max score at 100
  const finalScore = Math.min(100, Math.max(0, score));
  const isPremium = finalScore >= 50;

  return {
    score: finalScore,
    isPremium,
    factors
  };
}
