# CoelhoGame — Fortune Rabbit Deluxe

Jogo mobile demonstrativo, original, inspirado em slots 3/4/3. Usa saldo fictício. Não executa apostas reais.

## Executar

Na pasta do projeto:

```bash
q
```

Abrir `http://127.0.0.1:4173/`.

Alternativa com Python:

```bash
python3 -m http.server 4173
```

Não use `bash python3 -m http.server 4173`: isso manda o Bash tentar executar o binário do Python como script e causa `cannot execute binary file`.

## Funcionalidades

- Canvas lógico `780 × 1688`, responsivo em diferentes celulares.
- Escala uniforme, sem cortes ou deformação; em desktop o jogo fica centralizado em até `430 px`, equivalente ao iPhone 15 Pro Max.
- Três cilindros com posições `3 / 4 / 3`.
- Giro normal, parada antecipada e turbo.
- Dez linhas disponíveis; ficam marcados nos trilhos todos os níveis até o nível atual.
- Ao tocar `+` ou `−`, todas as linhas do nível aparecem juntas por 2,8 segundos.
- Indicadores laterais: todas as linhas vencedoras acendem primeiro; depois cada linha aparece individualmente com seu valor monetário na coluna central.
- Painel inferior com fila de mensagens: textos curtos centralizados e textos longos rolantes.
- Modo atual favorece vitórias de múltiplas linhas e símbolos de Prêmio para validar animações.
- Wild, símbolos comuns e símbolos de Prêmio.
- Animação de vitória, linha luminosa, contador e partículas.
- Símbolos vencedores preservam a cor, crescem levemente e recebem contorno neon; somente os demais escurecem.
- Sequência de cinco poses transparentes do mascote para comemorações maiores.
- Sequência contínua de cinco poses transparentes para o mascote parado.
- Feature aleatória com oito rodadas somente de Prêmios.
- Auto-spin 10/30/50/80/100, contador restante, interrupção manual e limites de parada.
- Seletor de valor-base e nível.
- Pagamentos, regras, histórico, detalhe e autenticidade.
- Música ambiente `Bamboo_and_Morning_Light.mp3` e efeitos procedurais, com controles independentes.
- Tela de abertura com pré-carregamento visual de quatro segundos e toque para iniciar.
- Cenário vivo com nuvens lentas, lanternas oscilantes e luz interna pulsante.
- Novo layout composto peça a peça com os PNGs limpos em `assets/layout-v2/clean/`.
- `reference/layout-v2/base.png` é usado somente como referência visual, nunca no runtime.
- Símbolos, linhas, letreiro, HUD e controles continuam dinâmicos.

## Validação

```bash
npm test
```

Teste visual determinístico da feature:

```text
http://127.0.0.1:4173/?demo=feature
```

Teste visual determinístico das 10 linhas vencedoras:

```text
http://127.0.0.1:4173/?demo=lines
```

Teste visual do traçado completo da linha 1, de número a número:

```text
http://127.0.0.1:4173/?demo=line1
```

Teste visual simultâneo das linhas 3 e 5, incluindo as posições assimétricas dos trilhos:

```text
http://127.0.0.1:4173/?demo=lines35
```

Teste visual de cinco símbolos de Prêmio com valores monetários:

```text
http://127.0.0.1:4173/?demo=prize
```

Teste visual da animação dedicada ao teto de 5.000×:

```text
http://127.0.0.1:4173/?demo=max
```

## Arquivos importantes

- `game-core.js`: matemática pura.
- `app.js`: estados, Canvas, áudio e interação.
- `styles.css`: escala responsiva mobile/desktop.
- `IMPLEMENTATION_PLAN.md`: plano e andamento.
- `GAME_RULES_REFERENCE.md`: regras levantadas.
- `AUDIO_LICENSES.md`: origem do áudio.
- `ANIMATION_REFERENCE_2026-07-17.md`: observações da sessão de mais de 20 minutos no jogo de referência.
