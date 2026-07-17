# Arquitetura atual do CoelhoGame

## Escopo

Demonstração mobile original com saldo fictício. Sem backend, cadastro, depósito, saque, apostas reais ou comunicação com cassino.

## Runtime

```text
index.html
├── game-core.js
│   ├── matriz 3/4/3
│   ├── 10 linhas fixas
│   ├── Wild e símbolos de Prêmio
│   ├── pagamentos e limite de 5.000×
│   └── gerador puro usado pelos testes
└── app.js
    ├── máquina de estados
    ├── renderização Canvas
    ├── carregador de assets PNG com fallback procedural
    ├── cenário e símbolos raster dinâmicos
    ├── física dos cilindros
    ├── animações e partículas
    ├── áudio Web Audio
    ├── auto-spin
    └── telas auxiliares
```

## Composição mobile

- Canvas lógico: `780 × 1688`.
- Tamanho de referência: `390 × 844`, sem tamanho físico fixo.
- Escala uniforme, sem deformação.
- Letterbox quando proporção do aparelho diverge.
- Ajuste automático por largura ou altura em qualquer viewport mobile.
- Em telas com `700 px` ou mais, composição central limitada a `430 px` de largura, equivalente ao iPhone 15 Pro Max.
- Janelas dos cilindros: `3 / 4 / 3`.
- Camada HTML mínima: Canvas, carregamento e região de acessibilidade.

## Estados

```text
IDLE
└── SPIN_LOOP
    ├── NO_WIN → IDLE
    ├── WIN → IDLE
    └── FEATURE_INTRO
        └── 8 FEATURE_SPINS
            └── FEATURE_OUTRO → IDLE
```

Estados de interface são sobrepostos ao jogo: menu, aposta, auto-spin, pagamentos, regras, histórico, detalhe e autenticidade.

## Aposta e pagamento

- Aposta total = valor-base × nível × 10 linhas.
- Valor-base: R$0,05 até R$4,00.
- Nível: 1 até 10.
- Linhas avaliadas da esquerda para a direita.
- Wild substitui símbolos comuns.
- Cinco ou mais Prêmios pagam todos.
- Feature: 8 rodadas somente com Prêmios.
- Limite: 5.000× a aposta total.

## Arte

O runtime combina as peças limpas em `assets/layout-v2/clean/`: céu, casas e lanternas em camadas separadas, logo, mascote, moldura 3/4/3, display, placar, botões e arabesco inferior. `reference/layout-v2/base.png` é apenas gabarito e nunca é carregado pelo jogo. Os símbolos principais vêm de `assets/symbols-v2/clean/`; valores, linhas, mensagens, saldo e estados são dinâmicos. O código procedural e o pacote anterior permanecem como fallback.

## Persistência

Saldo e histórico existem apenas em memória. Recarregar página reinicia sessão. Essa escolha é intencional para demonstração sem dinheiro real.
