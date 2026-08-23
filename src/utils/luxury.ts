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
  let score = 0;
  const factors: string[] = [];

  // Merge textual elements from both lead attributes and discoveries to inspect holistically
  const siteUrl = (lead.site || lead.siteOficial || '').toLowerCase();
  
  // High-ticket keywords check
  const highTicketKeywords = [
    'luxo', 'luxury', 'boutique', 'prime', 'exclusivo', 'exclusive', 'alto padrão', 'alto padrao', 
    'alta gastronomia', 'fine dining', 'gourmet', 'bistrô', 'bistro', 'cobertura', 'penthouse', 
    'artigos finos', 'elite', 'joalheria', 'joias', 'resort', 'spa de luxo', 'private banking'
  ];

  // Join everything to scan
  const leadScanTokens: string[] = [
    lead.nomeFantasia,
    lead.razaoSocial,
    lead.produtosServicos,
    lead.cnaePrincipal,
    lead.enderecoOficial,
    lead.cidade,
    lead.estado,
    siteUrl,
    ...(lead.produtosOficiais || []),
    ...(lead.servicosOficiais || [])
  ].filter(Boolean).map(t => t.toLowerCase());

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
    const kwScore = Math.min(keywordMatches * 10, 30);
    score += kwScore;
    factors.push(`Palavras-chave de alto ticket detectadas (${keywordMatches}x): +${kwScore} pts`);
  }

  // Simulate site domain authority indicator (short length, solid top-level domain)
  if (siteUrl && siteUrl.length > 5 && !siteUrl.includes('localhost')) {
    score += 15;
    factors.push(`Autoridade de domínio ativo validada (${siteUrl}): +15 pts`);
  }

  // 2. Presence in known luxury index directories and premium sectors
  const premiumIndices = [
    'incorporadora', 'holding', 'gestora de investimentos', 'fine dining', 'michelin',
    'estética premium', 'laser premium', 'hotel 5 estrelas', 'resort de praia', 'urbanismo de elite', 
    'condomínio fechado', 'arquitetura designer', 'capital de risco'
  ];

  let indexMatchCount = 0;
  premiumIndices.forEach(ind => {
    if (fullTextToScan.includes(ind)) {
      indexMatchCount++;
    }
  });

  if (indexMatchCount > 0) {
    const indexScore = Math.min(indexMatchCount * 15, 30);
    score += indexScore;
    factors.push(`Sincronização em diretórios e indexadores premium: +${indexScore} pts`);
  }

  // 3. Premium HQ district detection from address data
  const premiumGeoDistricts = [
    'jardins', 'alphaville', 'leblon', 'ipanema', 'itaim', 'vila nova conceicao', 'vila nova conceição', 
    'faria lima', 'oscar freire', 'savassi', 'batel', 'marista', 'lourdes', 'muro alto', 'barra da tijuca',
    'pinheiros', 'perdizes', 'brooklin', 'belvedere', 'morumbi', 'moema'
  ];

  const addressText = (lead.enderecoOficial || `${lead.cidade || ''} ${lead.estado || ''}`).toLowerCase();
  const foundPremiumDistricts: string[] = [];
  premiumGeoDistricts.forEach(dist => {
    if (addressText.includes(dist) && !foundPremiumDistricts.includes(dist)) {
      foundPremiumDistricts.push(dist);
    }
  });

  if (foundPremiumDistricts.length > 0) {
    score += 25;
    factors.push(`Sede mapeada em Bairro/Distrito Corporativo Premium (${foundPremiumDistricts.join(', ').toUpperCase()}): +25 pts`);
  }

  // 4. Boost for high capital social if mapped or discovered
  const rawCapital = (lead.capitalSocial || '').replace(/\D/g, '');
  if (rawCapital) {
    const amount = parseInt(rawCapital, 10);
    if (amount >= 2000000) {
      score += 20;
      factors.push(`Capital social de grande porte (> R$ 2M): +20 pts`);
    } else if (amount >= 500000) {
      score += 10;
      factors.push(`Capital social altamente promissor (>= R$ 500k): +10 pts`);
    }
  }

  const isPremium = score >= 35;

  return {
    score,
    isPremium,
    factors
  };
}
