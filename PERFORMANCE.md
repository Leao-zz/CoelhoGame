# Desempenho do CoelhoGame

## Pacote raster

- Imagens carregadas pelo jogo: 44 arquivos únicos.
- PNG original: 3.507.786 bytes.
- WebP lossless: 2.879.276 bytes.
- Redução de transferência: 628.510 bytes (17,9%).
- Memória estimada após decodificação RGBA: 36,8 MiB.
- PNG permanece como fallback automático quando WebP não puder ser carregado.

Um atlas único foi descartado. Ele não reduz a memória decodificada, exigiria uma textura grande e adicionaria recortes específicos para símbolos e animações. Como os assets são carregados uma vez e reutilizados pelo canvas, o ganho esperado de frames seria desprezível.

## Medição de frames

Abra uma cena com `?perf=1`, por exemplo:

```text
http://IP-DO-COMPUTADOR:4173/?skipOpening=1&demo=feature&perf=1
```

A cada cinco segundos o jogo publica em `window.__coelhoPerf`, no atributo
`data-coelho-perf` do elemento `<html>` e no console em JSON:

- `fps`: frames desenhados por segundo;
- `frameTimeP95`: p95 do intervalo entre frames;
- `renderTimeP95`: p95 do tempo gasto em update + draw;
- `droppedFrames` e `droppedRatio`: frames acima de 1,5 vez o orçamento;
- `longTasks`: tarefas do navegador acima de 50 ms, quando suportado;
- `profile`: perfil móvel/baixo consumo e FPS-alvo selecionado.

No console do navegador:

```js
window.__coelhoPerf.latest
window.__coelhoPerf.history
JSON.parse(document.documentElement.dataset.coelhoPerf)
```

## Validação local em 20/07/2026

O giro e a feature de oito rodadas foram executados integralmente no navegador
local com WebP. Não houve erro de carregamento, long task ou incompatibilidade
visual. Os 44 WebPs preservaram exatamente largura, altura, canal alpha e todos
os pixels visíveis dos PNGs; só bytes RGB de pixels 100% transparentes podem
diferir, sem impacto renderizado.

| Cena | FPS observado | Frame p95 | Render p95 | Long tasks |
| --- | ---: | ---: | ---: | ---: |
| Ocioso | 52,1 | 24,3 ms | 0,4 ms | 0 |
| Feature ativa | 40,7–44,2 | 36,5–42,5 ms | 0,5–0,6 ms | 0 |

O ritmo de `requestAnimationFrame` foi limitado pelo navegador de automação,
inclusive com aba visível. O custo medido de `update + draw` permaneceu abaixo
de 1 ms no p95; estes números validam o harness, mas não substituem a medição em
Safari/Chrome de aparelho físico.

## Matriz física pendente

| Dispositivo | Cena | Duração | Estado |
| --- | --- | ---: | --- |
| iPhone 15 Pro Max / Safari | giro, vitória grande, feature | 10 min | aparelho offline em 20/07/2026 |
| Android intermediário / Chrome | giro, vitória grande, feature | 10 min | nenhum aparelho conectado |
| Android de entrada / Chrome | perfil leve e feature | 10 min | nenhum aparelho conectado |

Critério sugerido: manter o FPS-alvo do perfil, `renderTimeP95` abaixo do orçamento de frame e `droppedRatio` menor que 5% durante giro e feature.
