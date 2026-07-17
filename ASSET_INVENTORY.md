# Inventário de assets recebidos

## Origem

- Arquivo recebido: `imagens.zip`.
- SHA-256 do ZIP: `65ee55945478fe251fb96be9fc6f9b327312cbd91f8d44bcdb342ba55a9b602c`.
- Extraído para `reference/fortune-rabbit/original-site-assets/`.
- Metadados `__MACOSX` foram ignorados.
- Nomes originais foram preservados para rastreabilidade.

## Conteúdo

| Formato | Quantidade | Uso recomendado |
|---|---:|---|
| PNG | 36 | Referência principal; todos possuem canal alfa |
| JPG | 32 | Previews e imagens achatadas, sem transparência |
| SVG | 10 | Ícones e elementos vetoriais auxiliares |
| Total | 78 | 13 MB extraídos |

## Grupos identificados

- Atlas grandes do personagem com poses, partes corporais e efeitos.
- Atlas de símbolos comuns e seus estados iluminados/escurecidos.
- Molduras de Prémio, placas numéricas e fundos de célula.
- Elementos do templo, colunas laterais e ornamentos dourados.
- Moedas, partículas, fogos e brilhos.
- Elementos de interface, painéis e ícones.
- JPGs de referência que parecem versões compostas ou previews dos PNGs.

## Arquivos principais

- `a74b4216-1041-4fd4-a2b7-91fd4fa396ad.png`: atlas de poses do personagem e efeitos.
- `790869d1-0e7d-4368-8fea-151be7dd5064.png`: personagem e estruturas douradas.
- `89301af1-90e9-4ade-a3a5-d4d0f201742c.png`: símbolos e efeitos de partículas.
- `10c0ff86-b6e8-4d8d-b1b7-673c26206ad4.png`: molduras, células e símbolos.
- `0709ff30-28a0-4795-bbcc-322087985f19.png`: atlas extenso do personagem.
- `download-1.png`: templo, colunas, personagem e painéis.

## Decisão de uso

- Manter pacote intacto como referência visual e técnica.
- Preferir PNG sobre JPG para análise de recorte, proporção e animação.
- Não alterar os arquivos originais dentro de `reference/`.
- Assets finais do produto devem ir para diretório separado e possuir origem/licença documentada.
- Uso direto das artes originais depende de autorização para redistribuição; captura pública do site, por si só, não comprova essa autorização.

## Estado do runtime final

- O pacote antigo extraído de `imagens.zip` não é carregado pelo runtime e permanece somente em `reference/fortune-rabbit/`.
- O pacote visual anterior permanece em `assets/fortune-deluxe/` como fallback e referência interna.
- O runtime principal carrega a composição `assets/layout-v2/clean/` e os símbolos `assets/symbols-v2/clean/`.
- A composição completa, moldura vazia, dez símbolos, banner, barra de status e painel de controles são utilizados.
- Os hashes do novo pacote estão em `reference/new-layout/assets.sha256`.
- `99_referencia_completa.png` e a prancha Gemini também foram preservados em `reference/new-layout/`.

## Composição separada v2

- Arquivos recebidos em 16/07/2026 preservados em `assets/layout-v2/source/`.
- Os PNGs recebidos tinham o xadrez de transparência incorporado nos pixels.
- Versões com fundo removido e bordas preservadas ficam em `assets/layout-v2/clean/`.
- `ceu.jpg` é o único fundo opaco da nova composição.
- `reference/layout-v2/base.png` é somente gabarito de posicionamento e não integra o runtime.
- Logo, mascote, casas, moldura, display, placar, arabesco e cinco botões são carregados separadamente.

## Símbolos v2

- Nove arquivos recebidos em 16/07/2026 foram preservados sem alteração em `assets/symbols-v2/source/`.
- O xadrez visual estava incorporado nos pixels; versões recortadas e transparentes ficam em `assets/symbols-v2/clean/`.
- O runtime usa Wild, Coelho Branco, Saco da Fortuna, Coelho Dourado, Moeda, Lanterna, Cenoura e placa de Prêmio.
- O Lingote é usado nas celebrações de ganho alto.
- As casas foram separadas das lanternas para permitir balanço e iluminação independentes.
- Capturas de referência do valor piscando ficam em `reference/win-value/`.
- Os hashes completos estão em `assets/symbols-v2/assets.sha256`.
