// PIXIJS 8 - Exemplo de carregamento do WILD animado
import { Application, Assets, AnimatedSprite } from 'pixi.js';

const app = new Application();
await app.init({
  resizeTo: window,
  backgroundAlpha: 0,
  antialias: true
});
document.body.appendChild(app.canvas);

// Carrega os dois atlases.
const atlas1 = await Assets.load('/assets/wild/wild_atlas_1.json');
const atlas2 = await Assets.load('/assets/wild/wild_atlas_2.json');

// Mantém a ordem correta dos 240 frames.
const textures = [];
for (let i = 0; i < 240; i++) {
  const frameName = `wild_${String(i).padStart(5, '0')}.png`;
  const texture =
    atlas1.textures?.[frameName] ??
    atlas2.textures?.[frameName];

  if (!texture) {
    throw new Error(`Frame não encontrado: ${frameName}`);
  }

  textures.push(texture);
}

const wild = new AnimatedSprite(textures);
wild.anchor.set(0.5);
wild.animationSpeed = 0.5; // 0.5 em 60 FPS = aproximadamente 30 FPS
wild.loop = true;
wild.play();

wild.position.set(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(wild);

// Para substituir o antigo wild.png:
// use a variável `wild` no mesmo container/posição/escala
// onde antes era criado o Sprite com a textura wild.png.
