// PHASER 3 - Exemplo de carregamento do WILD animado

export class GameScene extends Phaser.Scene {
  preload() {
    this.load.atlas(
      'wild-atlas-1',
      '/assets/wild/wild_atlas_1.png',
      '/assets/wild/wild_atlas_1.json'
    );

    this.load.atlas(
      'wild-atlas-2',
      '/assets/wild/wild_atlas_2.png',
      '/assets/wild/wild_atlas_2.json'
    );
  }

  create() {
    const frames = [];

    for (let i = 0; i < 240; i++) {
      const frameName = `wild_${String(i).padStart(5, '0')}.png`;
      const atlasKey = i < 143 ? 'wild-atlas-1' : 'wild-atlas-2';

      frames.push({
        key: atlasKey,
        frame: frameName
      });
    }

    this.anims.create({
      key: 'wild-idle',
      frames,
      frameRate: 30,
      repeat: -1
    });

    const wild = this.add.sprite(400, 300, 'wild-atlas-1', 'wild_00000.png');
    wild.play('wild-idle');

    // Substitua o antigo sprite que usava wild.png por este sprite animado.
  }
}
