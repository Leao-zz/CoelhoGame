# Validação funcional — 16/07/2026

## Telas

| Área | Resultado |
|---|---|
| Jogo principal 390 × 844 | Aprovado |
| Jogo principal 360 × 800 | Aprovado |
| Jogo principal 320 × 568 com letterbox | Aprovado |
| Jogo principal 430 × 932 | Aprovado |
| Desktop 1024 × 900 | Aprovado |
| Menu | Aprovado |
| Opções de aposta | Aprovado |
| Auto-spin e limites | Aprovado |
| Tabela de pagamentos e 10 linhas | Aprovado |
| Tabela com símbolos v2 e nova placa de Prêmio | Aprovado |
| Regras com rolagem | Aprovado |
| Histórico e filtros | Aprovado |
| Detalhe da transação | Aprovado |
| Autenticidade | Aprovado |

## Jogo

| Fluxo | Resultado |
|---|---|
| Giro normal | Aprovado |
| Parada antecipada | Aprovado |
| Turbo | Aprovado |
| Parada escalonada 1/2/3 | Aprovado |
| Vitória com linha luminosa | Aprovado |
| Todas as linhas primeiro, depois linhas individuais | Aprovado |
| Valor monetário piscando na coluna central | Aprovado |
| Contador de ganho | Aprovado |
| Partículas e personagem vencedor | Aprovado |
| Feature forçada de teste | Aprovado |
| Entrada “8 Rodadas da Fortuna” | Aprovado |
| Contador central de rodadas | Aprovado |
| Placas com flip | Aprovado |
| Total e saída da feature | Aprovado |
| Auto-spin manualmente interrompido | Aprovado |
| Saldo insuficiente | Implementado |

## Runtime

- Console do navegador: sem erros ou avisos.
- Sintaxe JavaScript: aprovada.
- Testes unitários do motor: aprovados.
- Runtime sem imagens externas/proprietárias.
- Áudio sem arquivos externos.

## Fora desta etapa

Calibração estatística/RTP e auditoria extensa de distribuição foram adiadas por solicitação do usuário. Motor permanece preparado para etapa futura em `game-core.js`.
