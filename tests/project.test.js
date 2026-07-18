'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

assert.match(html, /canvas id="gameCanvas" width="1166" height="2434"/);
assert.match(html, /game-core\.js/);
assert.doesNotMatch(app, /original-site-assets|download-\d+\.png/);
assert.match(app, /assets\/symbols-v2\/clean/);
assert.match(app, /assets\/layout-v3/);
assert.match(app, /Bamboo_and_Morning_Light\.mp3/);
assert.match(app, /musicEnabled/);
assert.match(app, /effectsEnabled/);
assert.match(app, /setMusicEnabled/);
assert.match(app, /setEffectsEnabled/);
assert.match(app, /01_normal_win_v2\.ogg/);
assert.match(app, /02_big_win_v2\.ogg/);
assert.match(app, /03_super_win_v2\.ogg/);
assert.match(app, /04_mega_win_v2\.ogg/);
assert.match(app, /playWinTier\(this\.winTier\)/);
assert.match(app, /categoryIntroActive = \(this\.winTier === 'big' \|\| this\.winTier === 'mega'\)/);
assert.match(app, /categoryIntroActive \|\| !phase\.settling/);
assert.match(app, /tier === 'max'[\s\S]*?'mega'[\s\S]*?tier === 'mega'[\s\S]*?'super'[\s\S]*?tier === 'big'[\s\S]*?'big'/);
assert.match(app, /logo\.png/);
assert.match(app, /central_rolos\.png/);
assert.doesNotMatch(app, /reference\/layout-v2\/base\.png/);
assert.match(app, /0\.136/);
assert.match(app, /loadAssets/);
assert.match(app, /drawImage\(/);
assert.match(app, /FEATURE_INTRO/);
assert.match(app, /FEATURE_OUTRO/);
assert.match(app, /\[10, 30, 50, 80, 100\]/);
assert.match(app, /drawRulesOverlay/);
assert.match(app, /drawHistoryOverlay/);
assert.match(app, /drawAuthOverlay/);
assert.match(app, /drawLineRails/);
assert.match(app, /new Set\(PAYLINES\.map\(\(_, index\) => index \+ 1\)\)/);
assert.match(app, /lineShowAll/);
assert.match(app, /drawTicker/);
assert.match(app, /const inner = \{ x: x \+ 28, y: y \+ 46, w: w - 56, h: 86, radius: 38 \}/);
assert.match(app, /roundedRectPath\(inner\.x, inner\.y, inner\.w, inner\.h, inner\.radius\)/);
assert.match(app, /ctx\.fillStyle = '#251760'/);
assert.match(app, /demoMode === 'lines'/);
assert.match(app, /demoMode === 'line1'/);
assert.match(app, /demoMode === 'lines35'/);
assert.match(app, /demoMode === 'prize'/);
assert.match(app, /demoMode === 'max'/);
assert.match(app, /demoMode === 'mixed'/);
assert.match(app, /const demoMode = query\.get\('demo'\) \|\| ''/);
assert.match(app, /SHOWCASE_MULTI_LINE_RATE/);
assert.match(app, /makeMixedWinGrid/);
assert.match(app, /getWinAccounting/);
assert.match(app, /const minimumWin = Math\.min/);
assert.match(app, /\* 2\.6, 0, 1/);
assert.match(app, /completeBalanceTransfer/);
assert.match(app, /launchWinTransfer/);
assert.match(app, /return `WIN \$\{money\(accounting\.counted\)\}`/);
assert.match(app, /drawMoneyTransfers/);
assert.match(app, /WIN_TIER_CONFIG/);
assert.match(app, /minRatio: 0, maxRatio: 2/);
assert.match(app, /minRatio: 2, maxRatio: 10/);
assert.match(app, /minRatio: 10, maxRatio: 50/);
assert.match(app, /minRatio: 50, maxRatio: 100/);
assert.match(app, /minRatio: 100, maxRatio: Infinity/);
assert.match(app, /getWinSteps/);
assert.match(app, /settleDuration/);
assert.match(app, /drawWinAtmosphere/);
assert.match(app, /drawMaxWinOverlay/);
assert.match(app, /if \(this\.winTier === 'max'\) return/);
assert.match(app, /time - this\.winStart > this\.getWinTiming\(\)\.totalDuration/);
assert.match(app, /if \(elapsed > 2000\) return/);
assert.match(app, /ctx\.arc\(390, 640, 318, 0, TAU\)/);
assert.doesNotMatch(app, /TOQUE PARA CONTINUAR/);
assert.match(app, /launchCelebrationConfetti/);
assert.match(app, /getWinBannerText/);
assert.match(app, /const centerDisplay = isWin \|\| this\.tickerMode === 'center'/);
assert.doesNotMatch(app, /GANHO TOTAL/);
assert.match(app, /balancePulseStart/);
assert.match(app, /drawAutoIndicator/);
assert.match(app, /drawAutoOverlay/);
assert.match(app, /if \(this\.overlay === 'auto'\)/);
assert.match(app, /AUTO_STOP_MIN = 1600/);
assert.match(app, /AUTO_STOP_MAX = 3200/);
assert.match(app, /adjustAutoStopAmount/);
assert.doesNotMatch(app, /autoSelectedCount/);
assert.match(app, /\(\) => this\.startAuto\(count\), id/);
assert.doesNotMatch(app, /ASSETS\.autoStart/);
assert.match(app, /target\.id !== 'turbo'/);
assert.match(app, /panelQueue/);
assert.doesNotMatch(app, /drawOpeningOverlay/);
assert.match(app, /loadAssets\(onProgress/);
assert.match(app, /setTimeout\(finish, 6000\)/);
assert.match(html, /app\.js\?v=27/);
assert.match(app, /if \(elapsed < timing\.settleDuration\) \{\s*this\.drawWinCategory\(time\);\s*return;/);
assert.match(app, /const ASSET_VERSION = '27'/);
assert.match(app, /image\.src = `\$\{src\}\?v=\$\{ASSET_VERSION\}`/);
assert.match(app, /categoryIntroDuration/);
assert.match(app, /this\.turbo \? 1050 : 2550/);
assert.match(app, /this\.turbo \? 760 : 1800/);
assert.match(app, /drawBigWinArtwork/);
assert.match(app, /drawMegaWinArtwork/);
assert.match(app, /drawCelebrationCoin/);
assert.match(app, /winVisualVariant/);
assert.match(app, /brightness\(0\) blur/);
assert.match(app, /GRANDE GANHO: medalhão dourado/);
assert.match(app, /MEGA GANHO: portal vivo/);
assert.match(app, /VITÓRIA MÁXIMA: coroação solar/);
assert.match(app, /ctx\.setLineDash/);
assert.match(app, /for \(let coin = 0; coin < 14; coin \+= 1\)/);
assert.doesNotMatch(app, /fillRect\(20, 395, 740, 820\)/);
assert.doesNotMatch(app, /const isMega = this\.winTier === 'mega'/);
assert.match(app, /loadingProgress\.style\.width/);
assert.match(app, /stopAuto/);
assert.match(app, /drawCelebrationMascot/);
assert.match(app, /drawWinCategoryArtwork/);
assert.match(app, /ASSETS\.bigWinTitle/);
assert.match(app, /ASSETS\.megaWinTitle/);
assert.match(app, /getIdleMascotFrame/);
assert.match(app, /assets\/idle\/clean/);
assert.match(app, /music\.volume = 0\.15/);
assert.match(app, /drawSkyAtmosphere/);
assert.match(app, /drawTwinklingStars/);
assert.match(app, /drawFallingSkyDust/);
assert.match(app, /drawSkyComet/);
assert.match(app, /SKY_STAR_POINTS/);
assert.match(app, /overlayPhase = name === 'auto' \? 'opening' : 'open'/);
assert.match(app, /overlayPhase = 'closing'/);
assert.match(app, /getAutoOverlayTransition/);
assert.match(app, /this\.closeOverlay\(activate\)/);
assert.doesNotMatch(app, /ASSETS\.celebration6/);
assert.match(app, /drawWinnerSparkles/);
assert.match(app, /PAYLINES\.slice\(0, preview\.count\)/);
assert.match(app, /getPaylineRailPoint/);
assert.match(app, /tracePayline\(lineNumber\)/);
assert.match(app, /ctx\.moveTo\(left\.x, left\.y\)/);
assert.match(app, /ctx\.lineTo\(right\.x, right\.y\)/);
assert.match(app, /APOSTA MÁXIMA •/);
assert.match(app, /APOSTA MÍNIMA •/);
assert.match(app, /APOSTA \$\{nextLevel\} •/);
assert.match(app, /hasBetLevel/);
assert.match(app, /fillText\(String\(this\.level\), betCenterX \+ 55, 1393\)/);
assert.doesNotMatch(app, /return `GANHOU:/);
assert.doesNotMatch(app, /return `\$\{WIN_TIER_CONFIG\[this\.winTier\]\?\.label/);
assert.doesNotMatch(app, /APOSTA 10 • MÁXIMA/);
assert.doesNotMatch(app, /APOSTA 1 • MÍNIMA/);
assert.match(app, /freezePrizeValues/);
assert.match(app, /prizeAmount/);
assert.match(app, /showPanelNow/);
assert.match(app, /RODADA TURBO ATIVADA/);
assert.match(app, /RODADA TURBO DESATIVADA/);
assert.match(app, /getAutoOverlayLayout/);
assert.match(app, /setAutoStopFromX/);
assert.match(app, /activeSteps\[0\]\.kind !== 'prize'/);
assert.doesNotMatch(app, /ctx\.fillText\('GANHO TOTAL'/);
assert.match(html, /tabindex="0"/);
assert.match(html, /id="loadingProgress"/);
assert.ok(fs.existsSync(path.join(root, 'assets/audio/Bamboo_and_Morning_Light.mp3')));
assert.ok(fs.existsSync(path.join(root, 'assets/layout-v3/logo.png')));
assert.ok(fs.existsSync(path.join(root, 'assets/layout-v3/central_rolos.png')));
assert.ok(fs.existsSync(path.join(root, 'assets/layout-v3/saldo_aposta.png')));
assert.ok(fs.existsSync(path.join(root, 'assets/layout-v3/display.png')));
assert.ok(fs.existsSync(path.join(root, 'assets/layout-v3/display_novo.png')));
assert.ok(fs.existsSync(path.join(root, 'assets/layout-v3/balao_longo.png')));
assert.ok(fs.existsSync(path.join(root, 'assets/symbols-v2/clean/wild.png')));
assert.ok(fs.existsSync(path.join(root, 'assets/symbols-v2/clean/simbolo_premio.png')));
assert.ok(fs.existsSync(path.join(root, 'assets/symbols-v2/clean/12_simbolo_moeda_chinesa_esquerda.png')));
assert.ok(fs.existsSync(path.join(root, 'assets/opening/clean/fundo_abertura.jpg')));
assert.ok(fs.existsSync(path.join(root, 'assets/opening/clean/fundo_botao.png')));
for (const autoAsset of [
  'tela_automatica.png',
  'marcacao_numeros.png',
  'botao_spin.png',
  'menos.png',
  'mais.png',
  'fechar.png',
  'fechar_largo.png',
]) {
  assert.ok(fs.existsSync(path.join(root, 'assets/automatic', autoAsset)));
}
for (let frame = 1; frame <= 5; frame += 1) {
  assert.ok(fs.existsSync(path.join(root, `assets/celebration/clean/animacao_ganhou${frame}.png`)));
  assert.ok(fs.existsSync(path.join(root, `assets/idle/clean/animacao_parado${frame}.png`)));
}
for (const title of ['texto_grande_ganho.png', 'texto_mega_ganho.png']) {
  assert.ok(fs.existsSync(path.join(root, 'assets/celebration/clean', title)));
}
for (const symbol of [
  '10_simbolo_saco_fortuna.png',
  '11_simbolo_lingote.png',
  '12_simbolo_moeda_chinesa_esquerda.png',
  '14_simbolo_coelho_branco.png',
  '15_simbolo_cenoura.png',
  '17_simbolo_coelho_dourado.png',
  '18_simbolo_lanterna_fortuna.png',
  'simbolo_premio.png',
  'wild.png',
]) {
  const file = path.join(root, 'assets/symbols-v2/clean', symbol);
  assert.ok(fs.existsSync(file));
  const dimensions = fs.readFileSync(file).subarray(16, 24);
  assert.equal(dimensions.readUInt32BE(0), 300);
  assert.equal(dimensions.readUInt32BE(4), 300);
}
assert.ok(fs.existsSync(path.join(root, 'server.js')));
assert.ok(fs.existsSync(path.join(root, 'reference/layout-v2/base.png')));

console.log('project: runtime original e módulos obrigatórios confirmados');
