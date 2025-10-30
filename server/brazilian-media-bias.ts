/**
 * Mapeamento de viés político de veículos de mídia brasileiros
 * 
 * Classificação baseada em análise de linha editorial e posicionamento político
 * Fontes oficiais (.gov.br, .edu.br) são classificadas como CENTRO por serem institucionais
 */

import { PoliticalBias } from "@shared/schema";

export interface MediaSource {
  domain: string;
  name: string;
  bias: typeof PoliticalBias._type;
}

export const BRAZILIAN_MEDIA_BIAS: MediaSource[] = [
  // ESQUERDA
  { domain: "brasil247.com", name: "Brasil 247", bias: "ESQUERDA" },
  { domain: "cartacapital.com.br", name: "Carta Capital", bias: "ESQUERDA" },
  { domain: "theintercept.com", name: "The Intercept Brasil", bias: "ESQUERDA" },
  { domain: "brasildefato.com.br", name: "Brasil de Fato", bias: "ESQUERDA" },
  { domain: "jornalggn.com.br", name: "GGN", bias: "ESQUERDA" },
  { domain: "redebrasilatual.com.br", name: "Rede Brasil Atual", bias: "ESQUERDA" },
  { domain: "diariodocentrodomundo.com.br", name: "DCM", bias: "ESQUERDA" },
  
  // CENTRO
  { domain: "g1.globo.com", name: "G1", bias: "CENTRO" },
  { domain: "globo.com", name: "Globo", bias: "CENTRO" },
  { domain: "uol.com.br", name: "UOL", bias: "CENTRO" },
  { domain: "folha.uol.com.br", name: "Folha de S.Paulo", bias: "CENTRO" },
  { domain: "estadao.com.br", name: "Estadão", bias: "CENTRO" },
  { domain: "bbc.com", name: "BBC Brasil", bias: "CENTRO" },
  { domain: "bbc.co.uk", name: "BBC", bias: "CENTRO" },
  { domain: "oglobo.globo.com", name: "O Globo", bias: "CENTRO" },
  { domain: "cnnbrasil.com.br", name: "CNN Brasil", bias: "CENTRO" },
  { domain: "valor.globo.com", name: "Valor Econômico", bias: "CENTRO" },
  { domain: "exame.com", name: "Exame", bias: "CENTRO" },
  { domain: "band.uol.com.br", name: "Band", bias: "CENTRO" },
  { domain: "sbt.com.br", name: "SBT", bias: "CENTRO" },
  { domain: "r7.com", name: "R7", bias: "CENTRO" },
  { domain: "ig.com.br", name: "iG", bias: "CENTRO" },
  { domain: "terra.com.br", name: "Terra", bias: "CENTRO" },
  { domain: "poder360.com.br", name: "Poder360", bias: "CENTRO" },
  { domain: "metropoles.com", name: "Metrópoles", bias: "CENTRO" },
  { domain: "nexojornal.com.br", name: "Nexo", bias: "CENTRO" },
  { domain: "agenciabrasil.ebc.com.br", name: "Agência Brasil", bias: "CENTRO" },
  
  // DIREITA
  { domain: "gazetadopovo.com.br", name: "Gazeta do Povo", bias: "DIREITA" },
  { domain: "jovempan.com.br", name: "Jovem Pan", bias: "DIREITA" },
  { domain: "veja.abril.com.br", name: "Veja", bias: "DIREITA" },
  { domain: "revistaoeste.com", name: "Revista Oeste", bias: "DIREITA" },
  { domain: "conexaopolitica.com.br", name: "Conexão Política", bias: "DIREITA" },
  { domain: "oantagonista.com", name: "O Antagonista", bias: "DIREITA" },
  { domain: "tercalivre.com.br", name: "Terça Livre", bias: "DIREITA" },
  
  // FONTES OFICIAIS E ACADÊMICAS (CENTRO)
  { domain: ".gov.br", name: "Governo Federal", bias: "CENTRO" },
  { domain: ".edu.br", name: "Instituição de Ensino", bias: "CENTRO" },
  { domain: "ibge.gov.br", name: "IBGE", bias: "CENTRO" },
  { domain: "ipea.gov.br", name: "IPEA", bias: "CENTRO" },
  { domain: "planalto.gov.br", name: "Planalto", bias: "CENTRO" },
  { domain: "senado.leg.br", name: "Senado Federal", bias: "CENTRO" },
  { domain: "camara.leg.br", name: "Câmara dos Deputados", bias: "CENTRO" },
  { domain: "stf.jus.br", name: "STF", bias: "CENTRO" },
  { domain: "tse.jus.br", name: "TSE", bias: "CENTRO" },
];

/**
 * Classifica o viés político de uma fonte baseado no domínio
 */
export function classifySourceBias(url: string, sourceName: string): typeof PoliticalBias._type {
  if (!url) return "DESCONHECIDO";
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    
    // Busca exata no domínio
    const exactMatch = BRAZILIAN_MEDIA_BIAS.find(source => domain.includes(source.domain));
    if (exactMatch) {
      return exactMatch.bias;
    }
    
    // Verifica se é .gov.br ou .edu.br (fontes oficiais)
    if (domain.endsWith('.gov.br') || domain.endsWith('.edu.br')) {
      return "CENTRO";
    }
    
    // Busca por nome da fonte
    const nameMatch = BRAZILIAN_MEDIA_BIAS.find(source => 
      sourceName.toLowerCase().includes(source.name.toLowerCase()) ||
      source.name.toLowerCase().includes(sourceName.toLowerCase())
    );
    
    if (nameMatch) {
      return nameMatch.bias;
    }
    
    return "DESCONHECIDO";
  } catch {
    return "DESCONHECIDO";
  }
}

/**
 * Calcula a distribuição percentual de viés das fontes
 */
export function calculateBiasDistribution(sources: Array<{ political_bias?: typeof PoliticalBias._type }>) {
  const total = sources.length;
  if (total === 0) {
    return {
      esquerda: 0,
      centro: 0,
      direita: 0,
      desconhecido: 0
    };
  }
  
  const counts = {
    esquerda: sources.filter(s => s.political_bias === "ESQUERDA").length,
    centro: sources.filter(s => s.political_bias === "CENTRO").length,
    direita: sources.filter(s => s.political_bias === "DIREITA").length,
    desconhecido: sources.filter(s => !s.political_bias || s.political_bias === "DESCONHECIDO").length
  };
  
  return {
    esquerda: Math.round((counts.esquerda / total) * 100),
    centro: Math.round((counts.centro / total) * 100),
    direita: Math.round((counts.direita / total) * 100),
    desconhecido: Math.round((counts.desconhecido / total) * 100)
  };
}
