# Plano de reconstrução original

## Direção técnica

Substituir protótipo DOM por renderização canvas mobile-first.

- Base lógica: `780 × 1688`.
- Exibição de referência: `390 × 844`, com ajuste responsivo para outros tamanhos.
- Escala uniforme com letterbox somente quando proporção do aparelho divergir.
- Canvas único para palco, rolos, partículas e controles.
- Camada HTML mínima apenas para acessibilidade e bootstrap.
- Motor de áudio próprio via Web Audio API.

## Arquitetura

```text
GameApp
├── AssetLoader
├── AudioManager
├── GameStateMachine
├── MathEngine
├── SceneRenderer
│   ├── BackgroundScene
│   ├── RabbitActor
│   ├── ReelSet
│   ├── PaylineOverlay
│   ├── ParticleLayer
│   └── BottomHUD
├── AutoSpinController
└── HistoryStore
```

Estados principais:

```text
BOOT → INTRO → IDLE → SPIN_START → SPIN_LOOP
→ STOP_REEL_1 → STOP_REEL_2 → STOP_REEL_3
→ EVALUATE → NO_WIN | WIN_LINE → WIN_TOTAL → IDLE
                         └→ FEATURE_TRIGGER → 8 FEATURE_SPINS → FEATURE_TOTAL
```

## Fases

### 1. Shell mobile

- Travar composição em proporção 390 × 844.
- Implementar safe areas de iPhone/Android.
- Recriar palco, trilhos laterais, barra de ganho, barra financeira e controles.
- Remover emojis e layout desktop.

### 2. Assets visuais

- Organizar coelho, templo, molduras, símbolos e ornamentos fornecidos pelo usuário.
- Exportar atlas 2× em WebP/PNG.
- Criar animações do personagem: idle, antecipação, vitória curta, vitória longa, feature e retorno.
- Usar `reference/new-layout/` para rastrear a composição aprovada e os hashes dos arquivos.
- Manter o pacote anterior capturado do site apenas em `reference/fortune-rabbit/`.

### 3. Rolos

- Cada cilindro usa faixa circular com símbolos duplicados.
- Máscaras independentes 3/4/3.
- Curva por giro: aceleração curta, velocidade constante, desaceleração e overshoot.
- Parada escalonada configurável.
- Turbo usa mesma física em duração reduzida.

### 4. Avaliação e vitórias

- Integrar as 10 linhas exatas documentadas em `GAME_RULES_REFERENCE.md` ao `MathEngine`.
- Calcular aposta total como `valor × nível × 10 linhas`.
- Escurecer símbolos não vencedores.
- Desenhar linha segmentada com glow.
- Acender identificadores laterais.
- Animar halo, pulso e partículas.
- Ciclar linhas; depois mostrar total.
- Implementar contador de ganho sincronizado ao áudio.

### 5. Fortune Rabbit

- Transição de entrada dedicada.
- Oito rodadas automáticas.
- Apenas Prémios durante feature.
- Flip 3D das placas e revelação do valor.
- Contador no lugar do botão central.
- Total acumulado e saída dedicada.

### 6. Controles e modais

- Aposta, nível, menos/mais.
- Turbo com confirmação visual.
- Auto-spin 10/30/50/80/100 e três limites.
- Paytable e regras roláveis.
- Histórico com Hoje, últimos 7 dias, intervalo personalizado, paginação, detalhes por transação e totais do filtro.
- Áudio e autenticidade.
- Bloqueio correto durante estados não interativos.

### 7. Áudio original

- Compor/selecionar faixas com licença comprovada.
- Registrar origem, licença e atribuição de cada arquivo.
- Sincronizar reel stops e count-up com eventos do motor.
- Suportar mute, suspensão do AudioContext e retomada mobile.

### 8. Validação

- Comparar screenshots nas dimensões 390 × 844 e 360 × 800.
- Testar 500 giros automatizados sem travamentos.
- Testar todas as 10 linhas e combinações com Wild.
- Testar feature, teto de 5.000×, saldo insuficiente e auto-spin.
- Medir duração e frame pacing em aparelhos móveis.

## Ordem recomendada

Primeiro implementar shell 390 × 844 e motor de rolos. Depois vitória. Depois personagem e partículas. Por último feature, som e telas auxiliares. Essa ordem elimina maiores diferenças visuais cedo e evita polir UI sobre motor provisório.

## Andamento — 16/07/2026

- [x] Protótipo DOM/emoji substituído por Canvas `780 × 1688`.
- [x] Escala uniforme validada em `390 × 844` e `360 × 800`.
- [x] Layout responsivo validado em `320 × 568`, `360 × 800`, `390 × 844`, `412 × 915`, `430 × 932`, `1024 × 900` e `1440 × 1000`.
- [x] Proporção preservada sem rolagem e sem deformação; limite desktop de `520 × 1125`.
- [x] Palco vertical, moldura 3/4/3, trilhos laterais das 10 linhas, HUD e controles implementados.
- [x] Atlas PNG de referência carregado sem alterar os arquivos originais.
- [x] Giro com aceleração, blur, velocidade contínua, parada escalonada e overshoot.
- [x] Turbo e toque para antecipar a parada.
- [x] Avaliação das 10 linhas, Wild, Prémios e teto de `5.000×`.
- [x] Vitória com escurecimento, halo, linha luminosa, partículas, mensagem e áudio sintetizado.
- [x] Linhas vencedoras apresentadas uma por vez e todas juntas no final.
- [x] Nível atual persistente nos trilhos e prévia simultânea das linhas ao usar `+`/`−`.
- [x] Painel inferior com fila, mensagens centrais em fade e rolagem somente para textos longos.
- [x] Modo de validação favorecendo múltiplas linhas e grupos de símbolos de Prêmio.
- [x] Ativação aleatória da feature e oito rodadas somente com Prémios.
- [x] Entrada/saída cinematográfica da feature, total acumulado e flip das placas.
- [x] Auto-spin 10/30/50/80/100 com três limites e parada manual.
- [x] Paytable, regras e histórico de sessão em telas roláveis.
- [x] Novo cenário, personagem, moldura, símbolos, banner, HUD e controles integrados a partir do pacote fornecido pelo usuário.
- [x] Valores, símbolos, linhas, saldo, ganho e aposta continuam dinâmicos no Canvas.
- [x] Fallback procedural mantido para falha de carregamento de imagem.
- [x] Pacote final de áudio sintetizado e licença documentada.
- [x] Opções de aposta, filtros e detalhes do histórico e autenticidade local.
- Fora do escopo atual: calibração estatística/RTP e bateria extensa de giros.
