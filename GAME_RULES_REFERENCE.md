# Regras completas de referência

Fonte visual: `reference/fortune-rabbit/full-rules/`.

## Estrutura e aposta

- Slot com três cilindros.
- Cilindros 1 e 3 possuem três posições.
- Cilindro 2 possui quatro posições.
- Dez linhas de aposta fixas.
- Valor de aposta selecionável entre `0,05` e `4,00`.
- Nível de aposta entre `1` e `10`.
- Moeda: `R$`.
- Montante total da aposta:

```text
valor de aposta × nível de aposta × 10 linhas
```

Exemplo observado:

```text
R$ 0,05 × nível 4 × 10 linhas = R$ 2,00
```

- Carteira mostra dinheiro disponível.
- Aposta máxima define valor e nível nos máximos.

## Pagamentos comuns

| Símbolo | Valor da tabela |
|---|---:|
| Wild | 200 |
| Coelho na barra dourada | 100 |
| Bolsa de fortuna | 50 |
| Cartas vermelhas | 10 |
| Moedas | 5 |
| Fogos | 3 |
| Cenoura | 2 |

- Wild substitui todos os símbolos, exceto Prémio.
- Ganho de linha em dinheiro = valor da tabela × valor de aposta × nível de aposta.
- Apenas maior ganho por linha é pago.
- Combinações vencem em sucessão do cilindro esquerdo para o direito.
- Ganhos simultâneos em linhas diferentes são somados.
- Ganhos são apresentados em dinheiro.

## Linhas de aposta

Índices abaixo começam em zero. Ordem: `[cilindro 1, cilindro 2, cilindro 3]`.

| Linha | Posições |
|---:|---|
| 01 | `[0, 0, 0]` |
| 02 | `[0, 1, 0]` |
| 03 | `[0, 1, 1]` |
| 04 | `[1, 1, 0]` |
| 05 | `[1, 1, 1]` |
| 06 | `[1, 2, 1]` |
| 07 | `[1, 2, 2]` |
| 08 | `[2, 2, 1]` |
| 09 | `[2, 2, 2]` |
| 10 | `[2, 3, 2]` |

## Símbolos de Prémio

- Um ou mais podem aparecer durante qualquer rodada.
- Cada símbolo vale de `0,5×` a `500×` o montante total da aposta.
- Com cinco ou mais Prémios em qualquer posição, todos os Prémios pagam.
- Prémios não fazem parte das linhas comuns.
- Wild não substitui Prémio.

## Funcionalidade Coelho da Fortuna

- Pode ativar aleatoriamente durante qualquer giro.
- Concede oito Rodadas da Fortuna.
- Durante a funcionalidade aparecem apenas símbolos de Prémio.
- Ganhos da funcionalidade acumulam no total exibido.

## Ganho máximo

- Ganho máximo: `5.000×` o montante da aposta.
- Rodada termina quando jogo-base ou funcionalidade atinge `5.000×`.

## Giro e controles

- Botão Rodar inicia com configurações atuais.
- Durante giro, tocar botão ou área do jogo para cilindros.
- No PC, Espaço inicia giro.
- Manter Espaço pressionado continua girando até soltar.
- Durante giro, Espaço pula animação e revela resultado, condicionado à conexão.
- Quando somente um botão estiver disponível, Espaço o ativa.
- Botão Parar da rodada automática mostra número restante.
- Menos reduz montante da aposta.
- Mais aumenta montante da aposta.
- Perfil mostra saldo e configurações adicionais.
- Montante de Aposta abre valor, nível, montante e aposta máxima.
- Verificar confirma jogo oficial/genuíno.
- Turbo reduz duração das rotações.
- Regras mostra regras e funções dos botões.
- Tabela de Pagamentos mostra combinações e valores.
- Histórico mostra jogos anteriores, paginação e filtro personalizado por data.
- Som liga/desliga áudio.
- Fechar retorna ao jogo principal/site.

## Rodada automática

- Executa quantidade selecionada de rodadas.
- Quantidades observadas: 10, 30, 50, 80 e 100.
- Pode parar quando saldo diminuir por valor definido em relação ao saldo inicial.
- `Mais` revela opções adicionais.
- Pode parar quando saldo aumentar por valor definido em relação ao saldo inicial.
- Pode parar quando um ganho individual exceder valor definido.

## Histórico do jogo

- Título: `Histórico do Jogo`.
- Filtros superiores:
  - Hoje.
  - Últimos 7 dias.
  - Personalizado.
- Colunas:
  - Hora no fuso `GMT−3`, acompanhada da data.
  - ID da transação.
  - Aposta.
  - Lucro.
- Cada linha possui chevron para abrir detalhes da transação.
- Lucro negativo é exibido com sinal de menos.
- Lucro positivo recebe destaque laranja mais intenso.
- Rodada sem retorno mostra `R$ 0,00`.
- Rodapé informa quantidade total de registros.
- Rodapé soma montante apostado e lucro do período filtrado.
- Bloco de verificação orienta selecionar uma ID de transação e verificar em `verify.pgsoft.com`.
- Navegação inferior mantém Som, Tabela de Pagamentos, Regras e Histórico.
- Histórico selecionado usa ícone e texto laranja.
- Deslizar até final carrega mais registros.
- Filtro Personalizado permite selecionar datas.

## RTP e informações adicionais

- RTP teórico: `96,75%`.
- RTP representa retorno estatístico de longo prazo.
- Jogo retorna automaticamente ao estado inicial após 90 dias de inatividade.
- Progresso de jogos de recolha, grátis ou extra não acabados deixa de ser mantido após esse período.
- Mau funcionamento anula pagamentos e jogadas.
- Em disputas, resultados do histórico são absolutos e finais.
