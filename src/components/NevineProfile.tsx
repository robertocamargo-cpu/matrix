import React, { useState } from 'react';
import { 
  Award, Shield, MapPin, Target, Sparkles, Coffee, 
  Hotel, Utensils, HeartPulse, Building2, ChevronRight, CheckCircle2 
} from 'lucide-react';

export const NevineProfile: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<'gastronomia' | 'hotelaria' | 'saude' | 'corporativo'>('gastronomia');
  const [seatingCount, setSeatingCount] = useState<number>(120);

  // Dynamic calculation for Nevine commercial potential
  const getSuitabilityDetails = () => {
    switch (selectedSegment) {
      case 'gastronomia':
        return {
          title: "Alta Gastronomia (Restaurantes Fine Dining, Bistrôs e Cafés)",
          focus: "Mesas Postas, Serviço de Coquetéis e Áreas Comuns",
          recommended: [
            "Guardanapo em Alto Relevo Seco Master Trevo (Substitui tecido, livre de odor de tinta)",
            "Descanso de Copos Absorvente (Posicopos) Especial",
            "Protetores de Talheres Envelopados Personalizados"
          ],
          dealSize: seatingCount * 750, // estimated yearly contract R$
          pitchAngle: "Foco na redução de perdas operacionais por reuso de tecidos e elevação da assinatura tátil do banho de marca do logotipo em relevo.",
          objectionTip: "Se disserem que usam guardanapo de papel comum, argumente sobre o desperdício: a folha premium dupla absorve 3x mais, resultando em 1 guardanapo por cliente, o que equilibra o custo unitário e melhora a experiência."
        };
      case 'hotelaria':
        return {
          title: "Hotelaria & Hospitalidade (Hotéis Boutique e Resorts Sênior)",
          focus: "Suítes Presidenciais, Room Service e Copas Executivas",
          recommended: [
            "Tampas Customizadas Cap-Copo (Garante assepsia de copos e taças nas suítes)",
            "Toalhas de Lavabo Interfolhadas (Toque macio de tecido em alta gramatura)",
            "Guardanapos de Relevo para Bandejas"
          ],
          dealSize: seatingCount * 1200,
          pitchAngle: "Experiência sanitária do hóspede e autoridade de marca corporativa em cada quarto.",
          objectionTip: "Argumente que o Cap-Copo é um requisito de governança de alta hotelaria que valida visualmente a limpeza das taças de forma lacrada para o hóspede sênior."
        };
      case 'saude':
        return {
          title: "Saúde & Estética Sênior (Clínicas Premium, Dermatologia e SPAs)",
          focus: "Copas de recepção, Bancadas de Lavabos e Salas Clínicas",
          recommended: [
            "Toalha Internada Toque de Algodão (Assepsia total de uso individual)",
            "Suportes Organizadores Sob Medida em Acrílico Maciço Nevine",
            "Proteção Cap-Copo de Xícaras para Recepção"
          ],
          dealSize: seatingCount * 900,
          pitchAngle: "Fusão ideal de higiene hospitalar rígida e acolhimento em recepções boutique.",
          objectionTip: "Toalhas descartáveis tradicionais rasgam e soltam fiapos, comprometendo a estética da clínica. Nossas toalhas com gravação em relevo seco mantêm o requinte tátil intocado."
        };
      case 'corporativo':
        return {
          title: "Corporativos Sênior (Assessoria, Escritórios de Advocacia, Bancos e Holdings)",
          focus: "Ecopas, Salas de Assinatura, Reuniões do Conselho, Diretoria",
          recommended: [
            "Descansos de Xícaras de Café Estampados (Posicopos)",
            "Envelopes e Tampas Protetoras de Jarra de Vidro",
            "Guardanapo de Coquetel Pequeno em Relevo"
          ],
          dealSize: seatingCount * 600,
          pitchAngle: "Profissionalismo cirúrgico nas Copas Executivas de fechamento de novos negócios.",
          objectionTip: "Substituir porta-copos laváveis de couro ou madeira que acumulam poeira por uma folha descartável com toque aveludado e logotipo gravado."
        };
    }
  };

  const currentDet = getSuitabilityDetails();

  return (
    <div id="nevine-commercial-playbook-page" className="p-6 bg-white rounded-2xl border border-slate-150 shadow-sm space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-850 text-white shadow-lg overflow-hidden relative">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest border border-indigo-500/20">
              Diretriz de Sucesso Comercial
            </span>
            <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Manual Estratégico
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Nevine — Perfil Comercial, Foco e Produtos</h2>
          <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
            Consulte o posicionamento, manual operacional, táticas de contorno de objeções oficiais e portfólio da marca Nevine para guiar suas prospecções de alta performance.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 bg-white/5 p-3 rounded-xl border border-white/10 relative z-10 self-start md:self-auto font-mono text-xs">
          <div>
            <span className="text-[9px] text-indigo-200 block font-bold leading-none">MÁXIMO APERFEIÇOAMENTO</span>
            <span className="text-sm font-black text-emerald-400 mt-1 block">Líder há 30+ Anos</span>
          </div>
        </div>
      </div>

      {/* Manual Document Structure Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Section 1 & 2 */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3.5">
          <div className="flex items-center gap-2 text-indigo-700">
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-700">
              <Award className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">1. Posicionamento de Mercado</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            A <b>Nevine</b> é a maior referência nacional em <b>descartáveis de luxo e descartáveis de mesa personalizados</b>. Pioneira em criar guardanapos em relevo seco sem uso de tintas, permitindo que marcas de alta costura e alta gastronomia ofereçam Toalhas de Lavabo e Guardanapos livres de odores químicos e com toque aveludado de algodão.
          </p>

          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-indigo-700">
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-700">
              <MapPin className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">2. Estrutura e Distribuição</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Com parque fabril tecnológico e estúdio integrado de clicharia premium, a Nevine garante pós-venda assistido e entrega em tempo recorde no estado de São Paulo e redes logísticas homologadas para todas as capitais do Brasil, prestando garantia incondicional de qualidade.
          </p>
        </div>

        {/* Section 3 & 4 */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3.5">
          <div className="flex items-center gap-2 text-indigo-700">
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-700">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">3. Segmentação B2B</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans mt-0.5">
            O foco estratégico da Nevine é o mercado corporativo de alto ticket e comércio boutique. Os leads ideais compreendem:
          </p>
          <ul className="text-[11px] text-slate-700 space-y-1.5 pl-1">
            <li className="flex items-center gap-1.5"><Utensils className="h-3 w-3 shrink-0 text-emerald-600" /> Alta Gastronomia / Estrelados Michelin</li>
            <li className="flex items-center gap-1.5"><Hotel className="h-3 w-3 shrink-0 text-amber-600" /> Hotelaria e Resorts Boutique de Elite</li>
            <li className="flex items-center gap-1.5"><HeartPulse className="h-3 w-3 shrink-0 text-rose-600" /> Clínicas de Estética, Dermatologia e SPAs</li>
            <li className="flex items-center gap-1.5"><Building2 className="h-3 w-3 shrink-0 text-indigo-600" /> Sedes de Holdings, Advocacia e Assessorias</li>
          </ul>

          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-indigo-700">
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-700">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">4. Proposta de Valor Real</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Transformamos insumos sanitários descartáveis comuns em valiosos <b>pontos de contato sensoriais de branding</b>. Evitamos custos astronômicos de lavanderia têxtil de enxoval mantendo o máximo refinamento e segurança contra contaminação cruzada.
          </p>
        </div>

        {/* Section 5 - Products List */}
        <div className="bg-indigo-950 p-5 rounded-2xl border border-slate-800 text-slate-200 space-y-3.5">
          <div className="flex items-center gap-2 text-emerald-400">
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">5. Portfólio de Produtos</h3>
          </div>
          
          <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1 text-slate-300 font-sans text-xs scrollbar-thin">
            <div className="bg-white/5 p-2 rounded border border-white/10">
              <span className="font-extrabold text-[11px] text-white block">★ Guardanapo de Alto Relevo</span>
              <span className="text-[10px] text-slate-400">Prensagem seca sem tinta, folha dupla encorpada premium (Master Trevo).</span>
            </div>
            <div className="bg-white/5 p-2 rounded border border-white/10">
              <span className="font-extrabold text-[11px] text-white block">★ Toalhas de Lavabo Interfolhadas</span>
              <span className="text-[10px] text-slate-400">Absorção extra com o toque macio do linho descartável nevado de uso individual.</span>
            </div>
            <div className="bg-white/5 p-2 rounded border border-white/10">
              <span className="font-extrabold text-[11px] text-white block">★ Cap-Copos e Covers</span>
              <span className="text-[10px] text-slate-400">Tampas de proteção lacradas para jarras de água, taças e xícaras de café de recepção.</span>
            </div>
            <div className="bg-white/5 p-2 rounded border border-white/10">
              <span className="font-extrabold text-[11px] text-white block">★ Posicopos e Protetores de Talher</span>
              <span className="text-[10px] text-slate-400">Sob-base e envelopes higiênicos que garantem mesa posta elegante.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Suitability Evaluator */}
      <div className="border border-slate-150 rounded-2xl bg-slate-50/50 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600 fill-indigo-100" />
          <h3 className="text-sm font-black uppercase text-slate-800 tracking-tight">
            Simulador de Viabilidade e Potencial de Lead para Vendas Nevine
          </h3>
        </div>
        
        <p className="text-xs text-slate-500 max-w-2xl font-sans">
          Use esta calculadora inteligente para analisar o lead prospectado. Selecione o segmento e ajuste o volume de assentos / quartos / capacidade estimada para formular as melhores peças de ataque comercial da Nevine B2B.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
          
          {/* Controls Box */}
          <div className="md:col-span-4 bg-white p-4 rounded-xl border border-slate-150 space-y-4">
            <div>
              <label className="text-[11px] uppercase font-bold text-slate-500 block mb-2">Segmento do Lead</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'gastronomia', label: 'Gastronomia', icon: Utensils },
                  { key: 'hotelaria', label: 'Hotelaria', icon: Hotel },
                  { key: 'saude', label: 'Saúde/Estética', icon: HeartPulse },
                  { key: 'corporativo', label: 'Corporativo', icon: Building2 }
                ].map((seg) => (
                  <button
                    key={seg.key}
                    onClick={() => setSelectedSegment(seg.key as any)}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between h-20 transition-all ${
                      selectedSegment === seg.key
                        ? 'bg-slate-800 text-white border-slate-850 shadow-inner'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <seg.icon className={`h-4 w-4 ${selectedSegment === seg.key ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-[11px] font-bold mt-1.5 truncate leading-tight">{seg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] uppercase font-bold text-slate-500 block">Capacidade Estimada</label>
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border">
                  {seatingCount} {selectedSegment === 'hotelaria' ? 'Quartos' : 'Lugares'}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={seatingCount}
                onChange={(e) => setSeatingCount(parseInt(e.target.value))}
                className="w-full accent-slate-800 mt-2 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
              />
              <span className="text-[10px] text-slate-400 font-sans block mt-1.5">Mapeado sobre capacidade operacional / fluxo sênior.</span>
            </div>
          </div>

          {/* Results Box */}
          <div className="md:col-span-8 bg-indigo-900/5 rounded-xl border border-slate-150 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-150 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {selectedSegment[0]}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase leading-none block">Categoria Mapeada</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">{currentDet.title}</h4>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[9px] text-slate-400 block font-bold">POTENCIAL DE CONTRATO ESTIMADO (ANUAL)</span>
                  <span className="text-lg font-black text-indigo-700">R$ {currentDet.dealSize.toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Produtos Direcionados</span>
                  <div className="space-y-1.5">
                    {currentDet.recommended.map((item, id) => (
                      <div key={id} className="flex gap-1.5 text-xs text-slate-700 font-sans leading-tight">
                        <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Ângulo Comercial</span>
                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    {currentDet.pitchAngle}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 bg-white/70 p-3 rounded-lg border">
              <div className="flex items-start gap-2">
                <div className="bg-amber-100 p-1 rounded text-amber-800 font-semibold text-[10px] uppercase font-mono tracking-wider shrink-0 mt-0.5">Dica de Objeção</div>
                <p className="text-[11px] text-slate-600 leading-normal italic">
                  "{currentDet.objectionTip}"
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Detailed Target Roles & Pain Points Matrix Table */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                ★ Matriz de Decisão Estratégica
              </span>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Cargos Foco Nevine, Dores Resolvidas & Termos Técnicos
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Mapeamento detalhado dos cargos prioritários por segmento, papel na decisão de compra e linguagem técnica recomendada.
            </p>
          </div>
        </div>

        {/* Roles Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="p-3">Cargo Foco</th>
                <th className="p-3">Setor / Vertical</th>
                <th className="p-3">Papel / Responsabilidade na Compra</th>
                <th className="p-3">Principais Dores Resolvidas</th>
                <th className="p-3">Termos Técnicos Recomendados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-sans">
              {[
                {
                  cargo: "Governanta Executiva",
                  setor: "Hotelaria de Luxo",
                  papel: "Analisa a qualidade tátil e a conformidade estética com o padrão da marca.",
                  dores: "Percepção de limpeza, padronização visual e proteção contra contaminação ambiental.",
                  termos: "Padrão de enxoval, relevo seco, toque de linho, assepsia de leito"
                },
                {
                  cargo: "Gerente de A&B",
                  setor: "Hotelaria / Resorts",
                  papel: "Homologa itens para serviço de quarto (room service) e restaurantes internos.",
                  dores: "Redução de ruído metálico, proteção de talheres em trânsito e agilidade no serviço.",
                  termos: "Room service, mise en place, envelopados, cap-copo"
                },
                {
                  cargo: "Diretor de Compras",
                  setor: "Hotelaria Triple A",
                  papel: "Negocia contratos, valida a saúde financeira do fornecedor e prazos.",
                  dores: "Ruptura de estoque, inflação de insumos e conformidade com metas de ESG.",
                  termos: "SLA de entrega, ESG, contrato guarda-chuva, curva ABC"
                },
                {
                  cargo: "Gerente de Motel",
                  setor: "Motéis Design",
                  papel: "Centraliza a escolha de fornecedores de higiene e enxoval.",
                  dores: "Agilidade no giro de suítes, controle de custos fixos e garantia de assepsia.",
                  termos: "Giro de suíte, envelopamento lacrado, desinfecção express, OPEX"
                },
                {
                  cargo: "Guest Experience Manager",
                  setor: "Luxo / Boutique",
                  papel: "Avalia o impacto sensorial e emocional dos descartáveis.",
                  dores: "Quebra de expectativa de luxo e falta de personalização da jornada.",
                  termos: "Touchpoints de marca, relevo sem tinta, branding sensorial, NPS"
                },
                {
                  cargo: "Coordenador de SCIH",
                  setor: "Hospitais / Clínicas de Elite",
                  papel: "Validador técnico de segurança e assepsia.",
                  dores: "Contaminação cruzada, riscos biológicos e adesão a normas da Anvisa.",
                  termos: "Barreira física, RDC 45, assepsia, patógenos"
                },
                {
                  cargo: "Gestor de Hotelaria Hospitalar",
                  setor: "Hospitais / Clínicas de Elite",
                  papel: "Decide pela estética e conforto do ambiente.",
                  dores: "Impessoalidade do hospital, satisfação do paciente e humanização.",
                  termos: "Conforto térmico, design inclusivo, experiência do paciente"
                },
                {
                  cargo: "Nutricionista Responsável (RT)",
                  setor: "Hospitais / SND",
                  papel: "Decide sobre a proteção de utensílios na dieta.",
                  dores: "Segurança alimentar, agilidade no serviço de copearia e higiene visual.",
                  termos: "Dieta pastosa/livre, protocolo de bandeja, lacre de segurança"
                },
                {
                  cargo: "Gerente de Suprimentos Hospitalares",
                  setor: "Hospitais de Elite",
                  papel: "Homologação de fornecedores e gestão de custos.",
                  dores: "Ruptura de insumos críticos e gestão de resíduos de saúde.",
                  termos: "Padronização de SKU, lote de fabricação, rastreabilidade"
                },
                {
                  cargo: "Maître d'Hôtel",
                  setor: "Restaurantes Premium",
                  papel: "Apresentação e protocolo de serviço.",
                  dores: "Higiene percebida, etiqueta à mesa e organização do salão.",
                  termos: "Mise en place, couvert, serviço à francesa"
                },
                {
                  cargo: "Chef Executivo",
                  setor: "Alta Gastronomia",
                  papel: "Harmonia estética e identidade da marca.",
                  dores: "Despadronização visual e interferência no design do prato.",
                  termos: "Empratamento, guarnição, identidade visual"
                },
                {
                  cargo: "Sommelier",
                  setor: "Restaurantes Premium",
                  papel: "Proteção de taças e acessórios de vinho.",
                  dores: "Odores residuais no cristal e poeira em taças pré-montadas.",
                  termos: "Polimento de cristal, decantação, serviço de vinhos"
                },
                {
                  cargo: "Gerente de Operações",
                  setor: "Restaurantes Premium",
                  papel: "Eficiência financeira e logística.",
                  dores: "Custos de lavanderia, perdas de enxoval e demora no giro de mesas.",
                  termos: "Food cost, giro de mesa, OPEX (Operational Excellence)"
                }
              ].map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100/80'}>
                  <td className="p-3 font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span className="text-amber-500">★</span> {row.cargo}
                  </td>
                  <td className="p-3 text-slate-700 font-semibold">{row.setor}</td>
                  <td className="p-3 text-slate-600 leading-relaxed">{row.papel}</td>
                  <td className="p-3 text-emerald-950 font-medium bg-emerald-50/50">{row.dores}</td>
                  <td className="p-3 font-mono text-[11px] text-indigo-900 bg-indigo-50/30">{row.termos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
