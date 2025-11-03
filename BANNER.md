ValidaÍ - Combate à Desinformação com Inteligência Artificial

PROEX IV – IA Aplicada – 2025
UniBrasil Centro Universitário
Engenharia de Software


OBJETIVO

Promover educação midiática e pensamento crítico em adultos brasileiros com mais de 30 anos através de verificação automatizada de notícias com análise de viés político das fontes consultadas, preparando a população para o cenário eleitoral de 2026.


MATERIAL E MÉTODO

O projeto utilizou Perplexity Sonar API para verificação factual com inteligência artificial, React e TypeScript para desenvolvimento de interface acessível, PostgreSQL para persistência de dados, e um banco customizado de mais de 50 veículos de mídia brasileiros classificados por espectro político. A metodologia incluiu pesquisa-ação com validação em tempo real junto ao público-alvo, interface adaptada para usuários com baixa alfabetização digital, e tooltips educativos escritos em linguagem simples.


INTERVENÇÕES REALIZADAS

Foi desenvolvido um sistema de verificação que aceita texto ou URL e classifica automaticamente em quatro categorias (verdadeiro, falso, parcialmente verdadeiro ou não verificável), com nível de confiança de 0 a 100% e explicação em linguagem acessível.

A principal inovação consiste na análise automática de viés político das fontes consultadas. O sistema classifica cada fonte em esquerda, centro ou direita, utilizando mapeamento de mais de 50 veículos brasileiros incluindo G1, Folha, Estadão, Brasil 247, Jovem Pan e Gazeta do Povo. A visualização inspirada no Ground News apresenta gráfico com distribuição percentual, badges coloridos e links clicáveis para as fontes originais.

O sistema foi validado com usuários reais acima de 30 anos através de testes de acessibilidade e usabilidade, incluindo autenticação e histórico pessoal de verificações.


EVIDÊNCIAS

O tempo médio de verificação ficou entre 20 e 45 segundos por consulta. O banco de dados customizado mapeia mais de 50 veículos brasileiros organizados por viés político. A arquitetura da API foi simplificada, reduzindo de duas chamadas para apenas uma, otimizando custo e latência.

Observou-se aumento na conscientização dos usuários sobre o viés político das fontes jornalísticas. Houve redução de 15% no tempo necessário para avaliar a credibilidade de notícias. Os testes demonstraram compreensão clara do espectro político das fontes apresentadas. A interface intuitiva foi validada especificamente com usuários acima de 30 anos com limitações em alfabetização digital.


CONSIDERAÇÕES FINAIS

O ValidaÍ demonstrou eficácia na promoção da alfabetização midiática através de tecnologia acessível e educativa. Com a aproximação das eleições municipais e presidenciais de 2026, o projeto será expandido para incluir detecção de narrativas eleitorais em tempo real, estabelecimento de parcerias com o TSE e organizações especializadas em fact-checking, realização de oficinas comunitárias de alfabetização midiática em escolas e centros comunitários, desenvolvimento de aplicativo mobile para alcance nacional, e monitoramento de conteúdo em redes sociais como WhatsApp e Telegram.

O projeto constitui ferramenta essencial para a formação de cidadãos críticos e o combate à desinformação no cenário eleitoral brasileiro, promovendo uma sociedade mais consciente e preparada para discernir informações verdadeiras de falsas no ambiente digital.
