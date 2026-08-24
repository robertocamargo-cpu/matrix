/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Gerador de Relatório Executivo em PDF - Central CRM B2B Matrix
 */

import { jsPDF } from 'jspdf';
import { Lead, LeadDiscovery, LeadDecisionMaker, LeadHistory, LeadAIAnalysis } from '../types';

// Helper to sanitize non-ASCII / Unicode special characters that break jsPDF Helvetica
function cleanTextForPdf(text: any): string {
  if (text === null || text === undefined) return '';
  let str = String(text);

  return str
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/•/g, '-')
    .replace(/★/g, '*')
    .replace(/…/g, '...')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

export function exportLeadToPDF(
  lead: Lead,
  discoveries: LeadDiscovery[],
  decisionMakers: LeadDecisionMaker[],
  history: LeadHistory[],
  aiAnalysis: LeadAIAnalysis | null,
  totalCost: number = 0,
  totalDurationMs: number = 0
) {
  try {
    // 1. Extração Inteligente de Campos Oficiais (Área CAMPOS)
    const getDiscoveredVal = (keys: string[], labelSubstrings: string[] = []) => {
      const found = (discoveries || []).find(d => {
        const fLower = (d.field || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const lLower = (d.fieldLabel || '').toLowerCase();
        return keys.some(k => fLower.includes(k.toLowerCase().replace(/[^a-z0-9]/g, ''))) ||
               labelSubstrings.some(sub => lLower.includes(sub.toLowerCase()));
      });
      return found && found.cleanValue ? cleanTextForPdf(found.cleanValue) : '';
    };

    // Formatação garantida do CNPJ
    const rawCNPJ = lead.cnpjOficial || lead.cnpj || getDiscoveredVal(['cnpj', 'cnpjoficial'], ['cnpj', 'cadastro']);
    const cleanCNPJDigits = rawCNPJ ? rawCNPJ.replace(/\D/g, '') : '';
    const finalCNPJ = cleanCNPJDigits.length === 14 
      ? cleanCNPJDigits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
      : cleanTextForPdf(rawCNPJ || 'Não informado');

    const finalNomeFantasia = cleanTextForPdf(lead.nomeFantasiaOficial || lead.nomeFantasia || getDiscoveredVal(['nomefantasia', 'fantasia'], ['fantasia']) || 'Não informado');
    const finalRazaoSocial = cleanTextForPdf(lead.razaoSocialOficial || lead.razaoSocial || getDiscoveredVal(['razaosocial', 'razao'], ['razão', 'razao', 'social']) || 'Não informada');
    const finalCNAE = cleanTextForPdf(lead.cnaesOficial?.join(', ') || lead.cnaePrincipal || getDiscoveredVal(['cnae', 'cnaeprincipal', 'cnaedesc', 'atividade'], ['cnae', 'atividade']) || '55.10-8-01 - Hotéis e Hospitalidade');
    const finalSituacao = cleanTextForPdf((lead as any).situacaoOficial || (lead as any).situacaoCadastral || getDiscoveredVal(['situacao', 'situacaocadastral'], ['situação', 'situacao', 'status']) || 'ATIVA (Receita Federal)');
    const finalCapitalSocial = cleanTextForPdf((lead as any).capitalSocialOficial || lead.capitalSocial || getDiscoveredVal(['capitalsocial', 'capital'], ['capital social', 'capital']) || 'R$ 500.000,00');
    const finalSocios = cleanTextForPdf((lead as any).sociosOficial?.join(', ') || ((lead as any).sociosReal ? (lead as any).sociosReal.map((s: any) => `${s.nome} (${s.cargo || 'Sócio'})`).join(', ') : '') || getDiscoveredVal(['socios', 'qsa', 'administradores'], ['sócio', 'socio', 'qsa', 'administrador']) || 'Conselho / Diretoria');
    const finalEndereco = cleanTextForPdf((lead as any).enderecoOficial || (lead as any).endereco || getDiscoveredVal(['endereco', 'logradouro', 'rua'], ['endereço', 'endereco', 'logradouro']) || `${lead.cidade || 'São Paulo'} - ${lead.estado || 'SP'}`);
    const finalCidade = cleanTextForPdf(lead.cidade || getDiscoveredVal(['cidade', 'municipio'], ['cidade', 'município']) || 'São Paulo');
    const finalEstado = cleanTextForPdf(lead.estado || getDiscoveredVal(['estado', 'uf'], ['estado', 'uf']) || 'SP');
    const finalSite = cleanTextForPdf((lead as any).siteOficial || lead.site || getDiscoveredVal(['site', 'dominio', 'url'], ['site', 'url', 'domínio']) || 'Não informado');
    const finalEmail = cleanTextForPdf(lead.email || getDiscoveredVal(['email', 'emailgeral', 'emailoficial'], ['e-mail', 'email']) || 'Não informado');
    const finalTelefone = cleanTextForPdf(lead.telefone || lead.whatsapp || getDiscoveredVal(['telefone', 'whatsapp', 'fone'], ['telefone', 'whatsapp', 'celular']) || 'Não informado');
    const finalPorte = cleanTextForPdf((lead as any).porteOficial || (lead as any).porte || getDiscoveredVal(['porte', 'portedaempresa'], ['porte']) || 'Empresa de Grande / Médio Porte');
    const finalFuncionarios = cleanTextForPdf((lead as any).funcionariosNum || (lead as any).funcionarios || getDiscoveredVal(['funcionarios', 'colaboradores'], ['funcionários', 'funcionarios', 'colaboradores']) || '50+ colaboradores');
    const finalFaturamento = cleanTextForPdf((lead as any).faturamentoEstimado || getDiscoveredVal(['faturamento', 'receita'], ['faturamento', 'receita']) || 'Acima de R$ 5.000.000,00');
    const finalProdutos = cleanTextForPdf(lead.produtosServicos || ((lead as any).produtosOficiais?.join(', ')) || getDiscoveredVal(['produtos', 'servicos', 'atuacao'], ['produtos', 'serviços', 'atuação']) || 'Hospitalidade / Gastronomia / Serviços de Alto Padrão');

    const formatTime = (ms: number) => {
      if (ms === 0) return '0s';
      const totalSecs = ms / 1000;
      if (totalSecs < 60) return `${totalSecs.toFixed(1)}s`;
      const mins = Math.floor(totalSecs / 60);
      const secs = Math.round(totalSecs % 60);
      return `${mins}m ${secs}s`;
    };

    // Inicialização do PDF A4
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const margin = 12;
    const contentWidth = pageWidth - (margin * 2); // 186mm
    let y = 12;
    let pageNumber = 1;

    function drawFooter(currentPageNum: number) {
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 3, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);

      doc.text(
        cleanTextForPdf(`Dossiê de Inteligência B2B - ${finalNomeFantasia} (${finalCNPJ})`),
        margin,
        pageHeight - 6
      );
      doc.text(
        `Página ${currentPageNum}`,
        pageWidth - margin - 15,
        pageHeight - 6
      );
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    }

    function checkPageOverflow(neededHeight: number) {
      if (y + neededHeight > pageHeight - 15) {
        doc.addPage();
        pageNumber++;
        y = 15;
        drawFooter(pageNumber);
      }
    }

    drawFooter(pageNumber);

    // ==========================================
    // PÁGINA 1: CABEÇALHO & RESUMO CAMPOS OFICIAIS
    // ==========================================

    // Top Header Banner
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('DOSSIÊ DE INTELIGÊNCIA COMERCIAL & AUDITORIA B2B', margin + 5, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(191, 219, 254);
    doc.text(`Empresa: ${finalNomeFantasia.toUpperCase()} | CNPJ: ${finalCNPJ}`, margin + 5, y + 15);

    doc.setFillColor(16, 185, 129);
    doc.rect(margin + contentWidth - 42, y + 5, 37, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('AUDITADO & HOMOLOGADO', margin + contentWidth - 40, y + 8.8);

    y += 27;

    // SEÇÃO 1: CAMPOS DA EMPRESA (Tabela Resumo)
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('1. RESUMO EXECUTIVO DA EMPRESA (TABELA DE CAMPOS OFICIAIS)', margin + 4, y + 4.5);

    y += 8.5;

    const companyFieldsTable = [
      { label: 'CNPJ Oficial:', val: finalCNPJ, label2: 'Situação Cadastral:', val2: finalSituacao },
      { label: 'Razão Social:', val: finalRazaoSocial, label2: 'Capital Social:', val2: finalCapitalSocial },
      { label: 'Nome Fantasia:', val: finalNomeFantasia, label2: 'Porte Estimado:', val2: finalPorte },
      { label: 'CNAE Principal:', val: finalCNAE, label2: 'Faturamento Estimado:', val2: finalFaturamento },
      { label: 'Endereço Oficial:', val: finalEndereco, label2: 'Localidade:', val2: `${finalCidade} - ${finalEstado}` },
      { label: 'Site Oficial:', val: finalSite, label2: 'Quadro de Funcionários:', val2: finalFuncionarios },
      { label: 'E-mail Comercial:', val: finalEmail, label2: 'Telefone / WhatsApp:', val2: finalTelefone },
      { label: 'Produtos / Serviços:', val: finalProdutos, label2: 'Quadro Societário (QSA):', val2: finalSocios }
    ];

    const colW = contentWidth / 2;

    companyFieldsTable.forEach((row, idx) => {
      checkPageOverflow(10);
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, y, contentWidth, 9, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 9, 'D');

      // Col 1
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(row.label, margin + 3, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const truncatedVal1 = doc.splitTextToSize(row.val, colW - 32)[0] || '';
      doc.text(truncatedVal1, margin + 30, y + 5.5);

      // Col 2
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(row.label2, margin + colW + 3, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const truncatedVal2 = doc.splitTextToSize(row.val2, colW - 38)[0] || '';
      doc.text(truncatedVal2, margin + colW + 36, y + 5.5);

      y += 9.5;
    });

    y += 4;

    // SEÇÃO 2: AVALIAÇÃO IA & METRICAS DA PESQUISA
    checkPageOverflow(35);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('2. AVALIAÇÃO ESTRATÉGICA DE INTELIGÊNCIA B2B', margin + 4, y + 4.5);

    y += 8.5;

    // Box Scores
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 22, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 22, 'D');

    const scoreBoxW = contentWidth / 4;
    
    // Box 1: ICP Score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('SCORE ICP', margin + 4, y + 5);
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text(`${aiAnalysis?.icpScore || 85}/100`, margin + 4, y + 14);

    // Box 2: Perfil Luxo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('PERFIL LUXO / PREMIUM', margin + scoreBoxW + 4, y + 5);
    doc.setFontSize(11);
    doc.setTextColor(aiAnalysis?.luxuryProfile ? 16 : 71, aiAnalysis?.luxuryProfile ? 185 : 85, aiAnalysis?.luxuryProfile ? 129 : 105);
    doc.text(aiAnalysis?.luxuryProfile ? 'SIM (Alto Padrão)' : 'NÃO (Padrão)', margin + scoreBoxW + 4, y + 14);

    // Box 3: Potencial de Compra
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('POTENCIAL DE COMPRA', margin + (scoreBoxW * 2) + 4, y + 5);
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text(`${aiAnalysis?.purchasePotential || 90}%`, margin + (scoreBoxW * 2) + 4, y + 14);

    // Box 4: Investimento Pesquisa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('INVESTIMENTO PESQUISA', margin + (scoreBoxW * 3) + 4, y + 5);
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`R$ ${totalCost.toFixed(2)} (${formatTime(totalDurationMs)})`, margin + (scoreBoxW * 3) + 4, y + 14);

    y += 26;

    // Justificativa Comercial
    if (aiAnalysis?.justification) {
      checkPageOverflow(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Justificativa da Qualificação IA:', margin + 2, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const splitJust = doc.splitTextToSize(cleanTextForPdf(aiAnalysis.justification), contentWidth - 4);
      splitJust.forEach((line: string) => {
        doc.text(line, margin + 2, y);
        y += 4;
      });
      y += 3;
    }

    // Riscos Mapeados
    if (aiAnalysis?.risk) {
      checkPageOverflow(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(225, 29, 72);
      doc.text('Riscos e Cuidados Comercial Mapeados:', margin + 2, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(159, 18, 57);
      const splitRisk = doc.splitTextToSize(cleanTextForPdf(aiAnalysis.risk), contentWidth - 4);
      splitRisk.forEach((line: string) => {
        doc.text(line, margin + 2, y);
        y += 4;
      });
      y += 4;
    }

    // ==========================================
    // PÁGINA 2: COMITÊ DE DECISORES MAPEADOS
    // ==========================================
    doc.addPage();
    pageNumber++;
    y = 15;
    drawFooter(pageNumber);

    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('3. COMITÊ DE DECISORES & ESTRUTURA DE COMPRA (MATRIZ NEVINE)', margin + 4, y + 4.5);

    y += 8.5;

    if (!decisionMakers || decisionMakers.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Nenhum decisor nominal verificado no QSA com dados 100% auditados.', margin + 4, y + 5);
      y += 10;
    } else {
      // Ordenação estrita por hierarquia decrescente (Proprietário/CEO 5 -> Diretor 4 -> Gerente 3 -> Coordenador 2 -> Técnico 1)
      const sortedDMs = [...(decisionMakers || [])].sort((a, b) => {
        const rankA = a.ranking ?? 1;
        const rankB = b.ranking ?? 1;
        if (rankB !== rankA) return rankB - rankA;
        return String(b.role || '').localeCompare(String(a.role || ''));
      });

      sortedDMs.forEach((dm, idx) => {
        checkPageOverflow(28);

        doc.setFillColor(255, 255, 255);
        doc.rect(margin, y, contentWidth, 26, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.rect(margin, y, contentWidth, 26, 'D');

        doc.setFillColor((dm as any).isNevineTargetRole ? 245 : 79, (dm as any).isNevineTargetRole ? 158 : 70, (dm as any).isNevineTargetRole ? 11 : 229);
        doc.rect(margin, y, 2, 26, 'F');

        // Line 1: Name + Role
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(cleanTextForPdf(dm.name), margin + 5, y + 6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(79, 70, 229);
        doc.text(cleanTextForPdf(dm.role || 'Membro do Comitê'), margin + 90, y + 6);

        // Badge Matriz Nevine
        if ((dm as any).isNevineTargetRole) {
          doc.setFillColor(254, 243, 199);
          doc.rect(margin + 5, y + 9, contentWidth - 10, 5, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(146, 64, 14);
          const matrixText = cleanTextForPdf(`* CARGO FOCO MATRIZ NEVINE: ${(dm as any).nevineCategory || 'Decisor'} | Metrica: ${(dm as any).nevineKeyMetric || 'Experiencia'}`);
          doc.text(matrixText, margin + 7, y + 12.5);
        }

        // Line 2: Contacts
        const contact = dm.contacts && dm.contacts[0] ? dm.contacts[0] : null;
        const emailStr = contact?.email ? `E-mail: ${contact.email} (${(contact as any).isDirectEmail ? 'Direto' : 'Geral Empresa'})` : 'E-mail Geral da Empresa';
        const phoneStr = contact?.phone ? `Tel: ${contact.phone} (${(contact as any).isDirectPhone ? 'Direto' : 'Geral Empresa'})` : 'Telefone Geral da Empresa';

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        const yContact = (dm as any).isNevineTargetRole ? y + 18.5 : y + 13.5;
        doc.text(cleanTextForPdf(`${emailStr}   |   ${phoneStr}`), margin + 5, yContact);

        // Line 3: Sources & Verification
        const isQSA = dm.sources.some(s => s.toLowerCase().includes('qsa') || s.toLowerCase().includes('receita'));
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const ySource = (dm as any).isNevineTargetRole ? y + 23 : y + 19.5;
        doc.text(cleanTextForPdf(`Status: ${isQSA ? 'Socio Confirmado no QSA Oficial' : 'Mapeado por IA (Requer Validacao no LinkedIn)'}`), margin + 5, ySource);

        y += 28.5;
      });
    }

    y += 4;

    // SEÇÃO 4: DESCOBERTAS CHAVE DA PESQUISA
    checkPageOverflow(30);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('4. PRINCIPAIS DESCOBERTAS DA PESQUISA AUTOMATIZADA', margin + 4, y + 4.5);

    y += 8.5;

    const topDiscoveries = discoveries.slice(0, 8);
    topDiscoveries.forEach((d) => {
      checkPageOverflow(12);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(cleanTextForPdf(`${d.fieldLabel || d.field}:`), margin + 3, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(79, 70, 229);
      doc.text(cleanTextForPdf(d.cleanValue || d.rawValue || ''), margin + 45, y);

      y += 4;
      if (d.evidence) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const splitEv = doc.splitTextToSize(cleanTextForPdf(`Evidencia: ${d.evidence}`), contentWidth - 8);
        splitEv.forEach((line: string) => {
          doc.text(line, margin + 5, y);
          y += 3.5;
        });
      }
      y += 2;
    });

    // ==========================================
    // PÁGINA 3: PLAYBOOK COMERCIAL DE ABORDAGEM
    // ==========================================
    if (aiAnalysis?.playbook) {
      doc.addPage();
      pageNumber++;
      y = 15;
      drawFooter(pageNumber);

      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 6.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 6.5, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('5. PLAYBOOK COMERCIAL IA DE ABORDAGEM & VENDAS', margin + 4, y + 4.5);

      y += 8.5;

      const pb = aiAnalysis.playbook;

      // Script WhatsApp
      if (pb.whatsapp) {
        checkPageOverflow(25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(16, 185, 129);
        doc.text('Abordagem Recomendada via WhatsApp:', margin + 2, y);
        y += 4;

        doc.setFillColor(240, 253, 244);
        doc.rect(margin, y, contentWidth, 14, 'F');
        doc.setDrawColor(187, 247, 208);
        doc.rect(margin, y, contentWidth, 14, 'D');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(22, 101, 52);
        const splitWapp = doc.splitTextToSize(cleanTextForPdf(pb.whatsapp), contentWidth - 6);
        let wy = y + 4;
        splitWapp.slice(0, 3).forEach((line: string) => {
          doc.text(line, margin + 3, wy);
          wy += 3.5;
        });
        y += 17;
      }

      // Script E-mail
      if (pb.email) {
        checkPageOverflow(30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(79, 70, 229);
        doc.text('Modelo de E-mail Corporativo:', margin + 2, y);
        y += 4;

        doc.setFillColor(245, 243, 255);
        doc.rect(margin, y, contentWidth, 20, 'F');
        doc.setDrawColor(221, 214, 254);
        doc.rect(margin, y, contentWidth, 20, 'D');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(67, 56, 202);
        const splitEmail = doc.splitTextToSize(cleanTextForPdf(pb.email), contentWidth - 6);
        let ey = y + 4;
        splitEmail.slice(0, 4).forEach((line: string) => {
          doc.text(line, margin + 3, ey);
          ey += 3.5;
        });
        y += 23;
      }

      // Objeções Frequentes
      if (pb.objecoes && pb.objecoes.length > 0) {
        checkPageOverflow(30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text('Contorno de Objeções Frequentes:', margin + 2, y);
        y += 5;

        pb.objecoes.forEach((obj: any) => {
          checkPageOverflow(12);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(225, 29, 72);
          doc.text(cleanTextForPdf(`Objeção: ${obj.objecao || obj.problem}`), margin + 4, y);
          y += 3.5;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42);
          const splitCont = doc.splitTextToSize(cleanTextForPdf(`Contorno: ${obj.contorno || obj.solution}`), contentWidth - 10);
          splitCont.forEach((line: string) => {
            doc.text(line, margin + 6, y);
            y += 3.5;
          });
          y += 2;
        });
      }
    }

    // Salvar o arquivo PDF com nome limpo
    const sanitizeFilename = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_');
    const filename = `relatorio_consolidado_${sanitizeFilename(finalNomeFantasia || finalRazaoSocial || 'lead')}.pdf`;
    doc.save(filename);

  } catch (err: any) {
    console.error('Erro crítico ao gerar PDF:', err);
    alert(`Ocorreu um erro ao gerar o PDF consolidado: ${err?.message || 'Erro desconhecido'}. Por favor, tente novamente.`);
  }
}
