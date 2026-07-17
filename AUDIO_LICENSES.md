# Áudio do CoelhoGame

## Implementação atual

A música ambiente fornecida pelo usuário foi preservada em `assets/audio/Bamboo_and_Morning_Light.mp3` e é reproduzida em loop após a primeira interação.

Os efeitos continuam sintetizados em tempo real pelo `SoundEngine` de `app.js`, usando Web Audio API:

- som contínuo dos cilindros;
- ataque de início do giro;
- três batidas de parada;
- toque de cada botão;
- sino individual de cada linha vencedora;
- acorde curto de vitória;
- acorde longo de grande ganho/feature.

## Licença

O usuário informou que a faixa pode ser utilizada no projeto. Antes de publicação pública, a licença e a autoria do arquivo devem ser arquivadas junto ao projeto.

Os efeitos procedurais são gerados pelo próprio código do CoelhoGame.

## Comportamento mobile

- AudioContext inicia somente após interação do usuário.
- Música de fundo e efeitos podem ser ligados/desligados separadamente no menu.
- Desligar efeitos interrompe imediatamente o som contínuo dos cilindros.
- Desligar música pausa somente a trilha ambiente.
- Retomada reativa contexto suspenso pelo navegador.
