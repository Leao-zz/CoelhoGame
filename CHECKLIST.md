# Checklist mestre — CoelhoGame

Última atualização: 17/07/2026

Legenda:

- `[x]` concluído e validado.
- `[ ]` pendente.
- `[~]` parcialmente implementado.
- `P0` fechar versão gráfica e funcional atual.
- `P1` preparar produção, integração e persistência.
- `FAZER ALGUM DIA` fora do escopo atual; não conta como pendência do projeto.

## Concluído

### Levantamento e referências

- [x] Analisar jogo de referência em viewport mobile.
- [x] Documentar composição vertical e proporções.
- [x] Confirmar estrutura dos cilindros `3 / 4 / 3`.
- [x] Confirmar 10 linhas fixas.
- [x] Registrar tabela de pagamentos.
- [x] Registrar regras de Wild e símbolos de Prêmio.
- [x] Registrar feature com 8 rodadas.
- [x] Registrar ganho máximo de `5.000×`.
- [x] Registrar controles, auto-spin, turbo e histórico.
- [x] Salvar capturas completas de regras, pagamentos e histórico.
- [x] Preservar pacote de imagens recebido dentro de `reference/`.
- [x] Inventariar arquivos recebidos e registrar SHA-256.
- [x] Manter o pacote antigo capturado do site apenas como referência.
- [x] Executar nova sessão contínua de mais de 20 minutos no jogo original em 17/07/2026.
- [x] Documentar giro, parada, turbo, vitória, linhas, Prêmios, personagem, painel e direção de áudio em `ANIMATION_REFERENCE_2026-07-17.md`.
- [x] Salvar as novas capturas em `references/original-2026-07-17/`.

### Estrutura e mobile

- [x] Criar shell HTML mínimo.
- [x] Criar Canvas lógico `780 × 1688`.
- [x] Exibir normalmente em `390 × 844`.
- [x] Implementar escala uniforme sem deformação.
- [x] Implementar letterbox para proporções diferentes.
- [x] Remover limite fixo de `390 × 844` em celulares.
- [x] Ajustar automaticamente por largura ou altura disponível.
- [x] Preservar proporção `780 / 1688` em todos os viewports.
- [x] Centralizar e limitar o jogo a `520 × 1125` em telas maiores.
- [x] Separar matemática em `game-core.js`.
- [x] Manter estados e renderização em `app.js`.
- [x] Criar testes sem dependências externas.
- [x] Criar comando `npm test`.
- [x] Documentar execução local no `README.md`.

### Arte e identidade visual

- [x] Remover emojis dos símbolos do protótipo inicial.
- [x] Remover dependência de imagens proprietárias no runtime.
- [x] Criar fundo festivo original em Canvas.
- [x] Criar título Lucky Moon.
- [x] Criar moldura dourada original dos cilindros.
- [x] Criar fundos individuais dos cilindros.
- [x] Criar trilhos laterais com números das 10 linhas.
- [x] Criar símbolo Wild original.
- [x] Criar símbolo Coelho original.
- [x] Criar símbolo Fortuna original.
- [x] Criar símbolo Cartas original.
- [x] Criar símbolo Moedas original.
- [x] Criar símbolo Fogos original.
- [x] Criar símbolo Cenoura original.
- [x] Criar placa de Prêmio original.
- [x] Criar personagem procedural original.
- [x] Criar estados idle, giro, vitória e feature do personagem.
- [x] Criar brilho, halo e partículas.
- [x] Copiar e organizar o novo pacote em `assets/fortune-deluxe/`.
- [x] Preservar referências e hashes em `reference/new-layout/`.
- [x] Integrar composição completa como base do novo cenário.
- [x] Sobrepor moldura 3/4/3 vazia aos símbolos estáticos da referência.
- [x] Substituir os símbolos procedurais pelos novos PNGs dinâmicos.
- [x] Preservar e limpar o pacote de símbolos v2 em alta qualidade.
- [x] Integrar Wild, Coelho, Fortuna, Coelho Dourado, Moeda, Lanterna e Cenoura v2.
- [x] Integrar a nova placa de Prêmio e exibir nela o valor monetário real.
- [x] Usar o lingote v2 nas celebrações de ganhos altos.
- [x] Integrar novo menu, personagem, banner, HUD e painel de controles.
- [x] Manter fallback procedural para falha de carregamento.

### Composição separada v2

- [x] Preservar os 15 arquivos novos em `assets/layout-v2/source/`.
- [x] Detectar que o xadrez estava incorporado e não era transparência real.
- [x] Remover o fundo dos elementos preservando bordas e sombras.
- [x] Salvar versões prontas em `assets/layout-v2/clean/`.
- [x] Usar `ceu` como fundo responsivo.
- [x] Posicionar casas e lanternas como camadas laterais.
- [x] Posicionar o novo logo sem fundo branco.
- [x] Posicionar o novo mascote sem sobrepor o logo.
- [x] Integrar a nova moldura 3/4/3 sem números estáticos.
- [x] Manter o interior dos três cilindros em azul uniforme.
- [x] Integrar display, placar e arabesco inferior separados.
- [x] Integrar Menu, Turbo, Menos, Girar, Mais e Auto separados.
- [x] Usar `base.png` somente como gabarito, fora do runtime.
- [x] Recalibrar coordenadas dos símbolos, linhas e áreas de toque.

### Composição responsiva v3 — pacote final 17/07/2026

- [x] Preservar o novo pacote-fonte em `PSD e originais/arquivos/`.
- [x] Medir `referencia_posicao.png` e mapear proporções para o Canvas lógico.
- [x] Integrar os elementos finais em `assets/layout-v3/` sem distorção.
- [x] Reposicionar logo, menu, telhados, balões, nuvens e mascote conforme a referência.
- [x] Reposicionar a moldura `3 / 4 / 3`, display, saldo/aposta e controles.
- [x] Remover `GANHO TOTAL` do placar inferior; o ganho permanece no display animado.
- [x] Remover títulos duplicados de `SALDO` e `APOSTA` no runtime.
- [x] Substituir os nove símbolos por PNGs uniformes de `300 × 300`.
- [x] Substituir animações idle e de vitória pelas versões compactadas de `500 × 500`.
- [x] Manter somente os quadros `animacao_ganhou1` a `animacao_ganhou5` no runtime.
- [x] Validar enquadramento em viewport equivalente ao iPhone 15 Pro Max (`430 × 932`).
- [x] Executar giro completo no navegador com prêmio e console sem erros.

### Cilindros e giro

- [x] Implementar três cilindros.
- [x] Implementar 3 posições no cilindro esquerdo.
- [x] Implementar 4 posições no cilindro central.
- [x] Implementar 3 posições no cilindro direito.
- [x] Implementar faixas circulares de símbolos.
- [x] Implementar aceleração e velocidade contínua.
- [x] Implementar blur durante movimento.
- [x] Implementar parada escalonada 1/2/3.
- [x] Implementar overshoot/bounce na parada.
- [x] Implementar toque para antecipar parada.
- [x] Implementar modo turbo.

### Motor e pagamentos

- [x] Implementar aposta total: valor-base × nível × 10 linhas.
- [x] Implementar valores-base de R$0,05 até R$4,00.
- [x] Implementar níveis de 1 até 10.
- [x] Implementar as 10 linhas documentadas.
- [x] Avaliar linhas da esquerda para a direita.
- [x] Somar ganhos de linhas diferentes.
- [x] Implementar Wild substituindo símbolos comuns.
- [x] Impedir Wild de substituir Prêmio.
- [x] Implementar pagamento de 5 ou mais Prêmios.
- [x] Implementar valores de Prêmio entre 0,5× e 500×.
- [x] Implementar teto de ganho de 5.000×.
- [x] Implementar saldo fictício.
- [x] Implementar bloqueio por saldo insuficiente.
- [x] Criar testes unitários das linhas, Wild, Prêmios e teto.

### Vitória e linhas vencedoras

- [x] Escurecer símbolos não vencedores.
- [x] Destacar símbolos vencedores.
- [x] Desenhar linha luminosa.
- [x] Traçar cada linha completa desde o número correspondente à esquerda até o mesmo número à direita.
- [x] Respeitar as posições assimétricas dos números nos dois trilhos laterais.
- [x] Sobrepor corretamente vários traçados completos em ganhos simultâneos.
- [x] Mostrar números das 10 linhas nos dois trilhos laterais.
- [x] Manter acesos em idle todos os números do nível 1 até o nível atual nos dois trilhos.
- [x] Mostrar o mesmo número ativo nos trilhos esquerdo e direito.
- [x] Mostrar simultaneamente todas as linhas do nível ao tocar `+` ou `−`.
- [x] Remover alternância/piscada da prévia de linhas.
- [x] Ocultar traçados da prévia com fade após 2,8 segundos.
- [x] Acender linha vencedora nos dois lados.
- [x] Suportar várias linhas vencedoras na mesma rodada.
- [x] Apresentar cada linha vencedora individualmente.
- [x] Acender todas as linhas vencedoras no início do ciclo.
- [x] Depois apresentar cada linha individual, encerrando na última linha vencedora.
- [x] Aumentar a duração de cada fase para facilitar leitura.
- [x] Piscar o valor monetário de cada linha sobre a coluna central.
- [x] Criar teste determinístico `?demo=lines` com 10 linhas e ganho R$6,00.
- [x] Criar testes visuais determinísticos `?demo=line1` e `?demo=lines35` para validar os traçados laterais.
- [x] Mostrar ganho da rodada.
- [x] Implementar contador animado de ganho.
- [x] Implementar partículas de vitória.
- [x] Implementar reação do personagem.
- [x] Sincronizar acorde de vitória.
- [x] Manter vencedores sem máscara preta, com aumento, halo, contorno neon e brilhos.
- [x] Escurecer individualmente somente as células que não participaram do ganho.
- [x] Integrar cinco quadros transparentes do mascote comemorando, sem usar o sexto quadro.
- [x] Remover o chroma verde dos cinco quadros de comemoração sem substituir a arte recebida.
- [x] Integrar cinco quadros transparentes do mascote parado em ciclo contínuo.
- [x] Baixar o mascote para que a parte inferior fique atrás da moldura dos rolos.
- [x] Aumentar fortemente a frequência de vitórias com múltiplas linhas para validação visual.
- [x] Aumentar frequência de combinações com 5 ou mais símbolos de Prêmio.

### Letreiro inferior

- [x] Criar faixa de letreiro logo abaixo dos cilindros.
- [x] Mover somente textos longos da direita para a esquerda.
- [x] Mostrar mensagens curtas centralizadas com fade-in/fade-out.
- [x] Manter mensagem atual até terminar antes de exibir próxima.
- [x] Preservar mensagem atual durante giro.
- [x] Mostrar ganho total centralizado.
- [x] Exibir “5 ou mais símbolos de Prêmio pagam todos”.
- [x] Exibir “8 Rodadas da Fortuna com símbolos de Prêmio”.
- [x] Exibir regra do Wild.
- [x] Exibir “Ganhe até 5000x”.
- [x] Exibir regra das 10 linhas.
- [x] Exibir valor ganho durante vitória.
- [x] Exibir rodadas restantes e total acumulado durante feature.

### Feature Coelho da Fortuna

- [x] Implementar ativação aleatória.
- [x] Implementar entrada cinematográfica.
- [x] Mostrar texto “8 Rodadas da Fortuna”.
- [x] Mostrar contador central de rodadas.
- [x] Executar 8 rodadas automáticas.
- [x] Mostrar somente símbolos de Prêmio.
- [x] Implementar flip/revelação das placas.
- [x] Acumular ganho da feature.
- [x] Implementar tela de total.
- [x] Implementar saída da feature.
- [x] Criar URL de teste `?demo=feature`.

### Controles, aposta e auto-spin

- [x] Botão Girar/Parar.
- [x] Botões Menos/Mais.
- [x] Controle Turbo.
- [x] Controle Auto.
- [x] Menu principal.
- [x] Controle de som.
- [x] Toque no painel de aposta abre opções.
- [x] Bloqueio de controles durante estados críticos.
- [x] Tecla Espaço para girar/parar no computador.
- [x] Tela de opções de aposta.
- [x] Seleção de valor-base e nível.
- [x] Cálculo imediato da aposta total.
- [x] Botão Confirmar.
- [x] Auto-spin com opções 10/30/50/80/100.
- [x] Contador de rodadas restantes e parada manual.
- [x] Exibir selo `AUTO` com a quantidade restante durante o giro automático.
- [x] Permitir interromper o automático por Girar, Auto, Menu, Menos ou Mais.
- [x] Permitir ativar/desativar Turbo durante o automático sem interromper as rodadas.
- [x] Manter a rotação do botão Girar contínua entre giros, sem reiniciar o ângulo.
- [x] Aplicar feedback visual de pressão em todos os controles principais.
- [x] Exibir estado ativo/inativo do Turbo e do Auto dentro do próprio botão.
- [x] Substituir o botão central por indicador `AUTO` distinto, centralizado e com rodadas restantes.
- [x] Limite por queda de saldo.
- [x] Limite por aumento de saldo.
- [x] Limite por ganho individual.

### Pagamentos, regras e histórico

- [x] Tela rolável de pagamentos.
- [x] Mostrar todos os símbolos e multiplicadores.
- [x] Mostrar regras dos símbolos de Prêmio.
- [x] Mostrar regra da feature.
- [x] Mostrar ganho máximo.
- [x] Mostrar diagramas das 10 linhas.
- [x] Tela rolável de regras.
- [x] Incluir visão geral, aposta, pagamentos, Wild, Prêmios, feature e RTP informado.
- [x] Registrar jogadas da sessão.
- [x] Mostrar hora, transação, aposta e lucro.
- [x] Mostrar totais do filtro.
- [x] Filtros Hoje e Últimos 7 dias.
- [x] Tela de detalhes da transação.
- [x] Mostrar identificador local da sessão.

### Autenticidade, segurança e áudio

- [x] Tela de autenticidade local.
- [x] Identificador aleatório da sessão.
- [x] Aviso de saldo fictício e ausência de apostas reais.
- [x] Runtime sem comunicação com cassino.
- [x] Runtime usa somente código local e o pacote visual fornecido pelo usuário.
- [x] Materiais de referência isolados.
- [x] Trilha ambiente `Bamboo_and_Morning_Light.mp3` em loop.
- [x] Controle independente de música de fundo.
- [x] Controle independente de efeitos do jogo.
- [x] Som de toque para todos os botões principais.
- [x] Som contínuo do giro.
- [x] Ataque sonoro no início do giro.
- [x] Sons separados das três paradas.
- [x] Sino individual por linha vencedora.
- [x] Acorde de vitória e de grande ganho/feature.
- [x] Mute e retomada de AudioContext mobile.
- [x] Licença/origem documentada.
- [x] Corrigir a transparência do quadrado central da moeda chinesa.
- [x] Criar tela de abertura com fundo fornecido, pré-carregamento de quatro segundos e toque para iniciar.
- [x] Baixar o indicador de carregamento e reduzir em 50% o botão de início, aproximando-o da base.
- [x] Reduzir em 50% o volume padrão da música ambiente.
- [x] Animar nuvens lentamente, balanço das lanternas e pulsação da luz interna.
- [x] Estilizar o painel de ganho no formato `WIN 0,30`, com texto dourado, contorno escuro e explosão.
- [x] Misturar símbolos diferentes entre várias linhas vencedoras do mesmo giro.
- [x] Somar o valor de `WIN` progressivamente durante a exibição de cada linha.
- [x] Iniciar `WIN` no menor prêmio real da rodada e acelerar a contagem em 3×.
- [x] Animar moedas saindo da linha marcada em direção ao painel de ganho.
- [x] Transferir `GANHO TOTAL` para `SALDO` com contagem animada.
- [x] Alterar a cor do painel `WIN` conforme a categoria do prêmio.
- [x] Criar URL de teste `?demo=mixed&skipOpening=1` para vitórias mistas.
- [x] Criar servidor local com `npm start` e documentar por que `bash python3 ...` falha.

### Validação técnica concluída

- [x] Sintaxe de `app.js` e `game-core.js` validada.
- [x] Testes unitários aprovados.
- [x] Console do navegador sem erros ou avisos.
- [x] Viewport `390 × 844` aprovado.
- [x] Viewport `360 × 800` aprovado.
- [x] Viewport `320 × 568` aprovado.
- [x] Viewport `412 × 915` aprovado.
- [x] Viewport `430 × 932` aprovado.
- [x] Viewport compacto `375 × 667` aprovado com escala uniforme e letterbox.
- [x] Viewport desktop `1024 × 900` aprovado.
- [x] Viewport desktop `1440 × 1000` aprovado.
- [x] Todos os viewports testados sem rolagem, corte ou deformação.
- [x] Giro normal, turbo e vitória aprovados.
- [x] Fase inicial com todas as linhas e fases individuais aprovadas.
- [x] Letreiro rolante aprovado nos dois viewports.
- [x] Feature e auto-spin aprovados.
- [x] Menu, telas auxiliares, histórico e detalhe aprovados.
- [x] Nova abertura, giro, Prêmio, comemoração, Turbo, Auto e interrupção manual aprovados no navegador local em 17/07/2026.
- [x] Controles separados de música e efeitos aprovados no menu local.

## Pendências P0 — fechar versão gráfica e funcional

### Fidelidade visual e animações

- [x] Refinar ilustrações dos símbolos com mais volume, sombras e detalhes usando o novo pacote.
- [x] Refinar templo, ornamentos e profundidade do cenário usando a nova composição.
- [x] Adicionar animações secundárias: lanternas, moedas, brilhos e fumaça.
- [x] Criar poses intermediárias por transformação: respiração, inclinação, salto e reação por estado.
- [x] Comparar enquadramento tela a tela com referências e corrigir diferenças.
- [x] Ajustar curvas e durações do giro em validação visual local.
- [x] Criar categorias visuais: ganho pequeno, médio, grande, mega e máximo.
- [x] Adicionar animação dedicada ao atingir 5.000×.
- [x] Refinar ritmo entre linha vencedora, total e retorno ao idle.

### Feature

- [x] Refinar transição entre giro normal e feature.
- [x] Criar animações únicas para valores altos de Prêmio.
- [x] Criar chuva de moedas mais rica na saída.
- [x] Adicionar animação especial quando contador chega a zero.

### Controles e regras

- [x] Manter fechamento externo fora da composição atual; callback real permanece como integração P1.
- [x] Usar incrementos provisórios entre R$0,05 e R$4,00 documentados no projeto.
- [x] Limites do auto-spin aceitam valores monetários independentes da aposta.
- [x] Permitir valor monetário digitado para cada limite do auto-spin.
- [x] Revisar texto final usando capturas completas anexadas.
- [x] Ajustar tipografia, espaçamento e altura das telas auxiliares.

### Histórico

- [x] Filtro Personalizado permite definir data inicial e final.
- [x] Implementar seletor real de data inicial/final.

### Áudio

- [x] Refinar mixagem inicial, volumes e variações no ambiente local.
- [x] Criar mais variações de vitória e feature.
- [x] Sincronizar sons com flips, contador e partículas.

## Validação externa pendente — não bloqueia o build local

Itens dependentes de hardware, API hospedeira ou material externo de comparação:

- [ ] Testar Safari em iPhone físico.
- [ ] Testar Chrome em Android físico.
- [ ] Testar aparelho lento/baixo desempenho.
- [ ] Testar orientação, interrupção e retomada do app.
- [ ] Fazer sessão manual contínua de 10–15 minutos na versão final.
- [ ] Refinar mixagem final em alto-falantes de celulares físicos.
- [ ] Comparar giro quadro a quadro quando houver vídeo de referência disponível.

## Pendências P1 — produção e integrações

### Integração, acessibilidade e desempenho

- [ ] Medir estabilidade de frames em celulares físicos.
- [ ] Implementar callback real de fechar para iframe/app hospedeiro.
- [ ] Confirmar com fonte oficial a lista exata de incrementos entre R$0,05 e R$4,00.
- [ ] Criar tela real de perfil/carteira fictícia, se necessária.
- [ ] Melhorar navegação completa por teclado.
- [ ] Criar controles HTML invisíveis para leitores de tela.
- [ ] Adicionar botão Aposta Máxima explícito.
- [ ] Confirmar comportamento dos limites do auto-spin durante feature.

### Histórico e rastreabilidade

- [ ] Implementar paginação/carregamento de registros antigos.
- [ ] Persistir histórico após recarregar página.
- [ ] Armazenar grade/resultados completos para replay.
- [ ] Gerar hash verificável de cada resultado caso exista backend futuro.

### Publicação e aspectos legais

- [ ] Escolher hospedagem.
- [ ] Criar configuração de build/deploy.
- [ ] Configurar domínio e HTTPS.
- [ ] Adicionar cache/versionamento dos arquivos.
- [ ] Criar favicon, ícones e metadados sociais.
- [ ] Criar PWA/manifest, se desejado.
- [ ] Definir política de privacidade e termos.
- [ ] Revisar textos jurídicos antes de publicação pública.
- [ ] Revisar requisitos legais/regulatórios antes de qualquer uso com dinheiro real.
- [ ] Criar backend seguro somente se escopo futuro exigir persistência ou dinheiro real.

## FAZER ALGUM DIA — fora do escopo atual

Itens abaixo não fazem parte do projeto atual e não bloqueiam conclusão:

- Calibrar probabilidades e RTP.
- Definir strips/pesos versionados para produção.
- Executar auditoria estatística extensa.
- Criar seed auditável caso necessário.
- Otimizar o novo pacote raster em atlas/WebP caso tamanho ou desempenho exijam.

## Critério para concluir versão gráfica/funcional

- [x] Todos os itens P0 locais concluídos ou movidos para validação externa/P1.
- [ ] Comparação visual aprovada pelo usuário.
- [ ] Sessão manual de 10–15 minutos sem travamento.
- [ ] Giro, vitória, feature e auto-spin aprovados em iPhone e Android físicos.
- [x] Nenhum erro no console nos testes locais.
- [x] Textos, números e controles sem corte em `360 × 800` e `390 × 844`.
