# Análise visual e comportamental

## Método

- Sessão autenticada em conta de testes.
- Observação mobile com viewport CSS de `390 × 844`.
- Canvas do jogo medido em `780 × 1688`, renderizado a 2× e reduzido para `390 × 844`.
- 255 quadros salvos durante carregamento, giros, vitórias, bônus e menus.
- Nenhum asset da PG Soft foi incorporado ao produto.

## Composição mobile

O jogo ocupa toda a viewport, sem card flutuante ou coluna desktop. A proporção de referência é `390:844`.

1. Barra superior: nome do jogo à esquerda, relógio à direita e botão fechar verde sobreposto.
2. Palco do personagem: templo ao fundo; coelho ocupa o centro superior e muda de pose conforme o resultado.
3. Área dos rolos: três colunas assimétricas. Rolos externos exibem três posições; rolo central, quatro.
4. Trilhos laterais: números das 10 linhas, acesos quando participam de vitória.
5. Faixa de mensagem/ganho: moldura dourada, fundo magenta, texto central.
6. Barra financeira: saldo, ganho e aposta em três zonas.
7. Controles: turbo, menos, botão de giro, mais e auto-spin.
8. Base ornamental: vermelho e dourado, com curvas integradas ao botão central.

## Símbolos observados

- Wild: coelho deitado, texto `WILD`, paga 200.
- Barra dourada/coelho: 100.
- Bolsa de fortuna: 50.
- Cartas vermelhas: 10.
- Moedas: 5.
- Fogos: 3.
- Cenoura: 2.
- Prémio: moldura dourada com valor monetário/multiplicador.

## Giro

- Botão verde troca desenho para indicar rodada ativa.
- Controles secundários ficam indisponíveis durante partes bloqueadas da sequência.
- Conteúdo dos rolos desloca verticalmente; símbolos entram e saem dentro de máscaras rígidas.
- Parada ocorre por cilindro e não como troca instantânea da matriz inteira.
- Símbolos assentam com pequeno overshoot antes da avaliação.
- Turbo elimina grande parte da espera; toast `Turbo Spin Enabled` confirma mudança.
- Faixa inferior alterna mensagens promocionais, estado de giro e resultado.

## Vitória

- Toda matriz escurece.
- Símbolos vencedores voltam à luminosidade total.
- Halo circular dourado/ciano cresce ao redor de cada símbolo vencedor.
- Partículas douradas percorrem a linha.
- Segmentos luminosos conectam posições da combinação.
- Número da linha acende dos dois lados quando aplicável.
- Símbolos fazem pulso, pequena escala e brilho em ciclos.
- Múltiplas linhas são apresentadas sequencialmente; cada ciclo destaca só uma combinação.
- Faixa inferior conta o ganho e mantém total final.
- Coelho executa animações próprias: salto, pose com braço levantado, sorriso e retorno ao idle.
- Botão central pode acelerar/pular parte da celebração sem criar nova aposta.

## Fortune Rabbit

- Funcionalidade troca foco para Prémios e mantém identidade visual do jogo-base.
- Contador grande verde aparece no lugar do botão de giro, mostrando rodadas restantes.
- Símbolos Prémio usam moldura dourada, brilho quente e partículas verticais.
- Durante flip da placa, valor fica temporariamente comprimido/sem separador decimal.
- Controles laterais somem durante fases bloqueadas.
- Total acumulado permanece na faixa inferior.
- Transição final devolve controles normais e botão verde.

## Auto Spin

Painel modal sobe da parte inferior, escurecendo jogo.

- Quantidades: 10, 30, 50, 80 e 100.
- Limite obrigatório para queda do saldo.
- Modo expandido adiciona parada por aumento do saldo.
- Modo expandido adiciona parada por ganho individual.
- Sliders laranja sobre trilhos cinza.
- Botões `More/Hide` e `Start`.

## Telas auxiliares

Menu interno possui navegação inferior:

- Sound.
- Paytable.
- Rules.
- History.

Histórico oferece Hoje, últimos 7 dias e período personalizado. Lista hora/data em GMT−3, ID da transação, aposta e lucro; cada registro abre detalhes. Rodapé mostra quantidade de registros, soma apostada, lucro agregado e instrução para verificação da ID. Tabela e regras usam fundo grafite, títulos brancos e realce laranja.

As telas completas foram recebidas posteriormente e estão salvas em `reference/fortune-rabbit/full-rules/`, incluindo `history.png`. Texto, fórmulas, controles, histórico e linhas foram consolidados em `GAME_RULES_REFERENCE.md`.

## Linhas confirmadas

O diagrama completo confirma linhas `[0,0,0]`, `[0,1,0]`, `[0,1,1]`, `[1,1,0]`, `[1,1,1]`, `[1,2,1]`, `[1,2,2]`, `[2,2,1]`, `[2,2,2]` e `[2,3,2]`. O índice central usa as quatro posições do segundo cilindro.

Também confirma fórmula do montante total: `valor de aposta × nível × 10 linhas`.

## Áudio

O navegador não expôs arquivos de áudio independentes mesmo com cache desativado. Áudio parece integrado a pacotes/runtime do jogo. Não houve gravação do stream.

Cues necessários para reconstrução original:

- Música ambiente em loop.
- Clique de controle.
- Início do giro.
- Loop mecânico dos rolos.
- Três impactos de parada, um por cilindro.
- Brilho/ativação de símbolo.
- Traçado de linha vencedora.
- Contagem monetária.
- Reação vocal do coelho.
- Entrada da funcionalidade.
- Música própria de bônus.
- Encerramento e retorno ao jogo-base.

## Diferenças do protótipo atual

- Protótipo usa DOM e emoji; referência usa canvas 2× com arte rasterizada e animação esquelética/sprite.
- Protótipo permite até 560 px; referência é desenhada primeiro para 390 × 844.
- Giro atual aplica blur/tumble genérico; falta deslocamento real, máscara, aceleração e parada escalonada.
- Vitória atual pisca células; faltam dim global, linhas luminosas, halos, partículas, count-up e personagem.
- Controles e modais atuais são aproximações, não reproduzem hierarquia mobile observada.

## Assets recebidos

Pacote adicional contém 78 arquivos: 36 PNGs com transparência, 32 JPGs e 10 SVGs. Inclui atlas de personagem, símbolos, molduras, templo, partículas e interface. Arquivos estão preservados em `reference/fortune-rabbit/original-site-assets/`; classificação e origem estão em `ASSET_INVENTORY.md`.
