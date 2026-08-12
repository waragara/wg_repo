# Base de Conhecimento Oficial dos Equipamentos (Manuais)

Esta base de conhecimento contém o resumo técnico de funcionamento e os controles exatos dos pedais. Você DEVE usar EXATAMENTE os nomes dos controles abaixo na chave 'list' (ou 'table' para o EQ) do seu JSON. NUNCA invente controles que não existem nesta lista.

## 1. Boss OD-3 (OverDrive)
**Chaves OBRIGATÓRIAS na 'list':**
- **DRIVE:** Ajusta a quantidade de overdrive (0 a 10).
- **TONE:** Ajusta as frequências altas. Direita para som mais cortante, esquerda para mais suave (0 a 10).
- **LEVEL:** Controla o volume geral (0 a 10).

## 2. Caline CP-12 Pure Sky (Overdrive)
**Chaves OBRIGATÓRIAS na 'list':**
- **VOL:** Ajusta o volume de saída (0 a 10).
- **GAIN:** Controla a saturação. Clean boost em valores baixos (0 a 10).
- **TREBLE:** Ajusta agudos (0 a 10).
- **BASS:** Ajusta graves (0 a 10).

## 3. Joyo R-12 Band Controller (Equalizador de 10 Bandas)
**REGRA ABSOLUTA:** Você DEVE preencher a chave 'table' fornecendo um array de objetos, e deixar a chave 'list' vazia ou inexistente para este pedal.
- **Formato OBRIGATÓRIO da table:** Forneça as 10 bandas EXATAS (31.25, 62.5, 125, 250, 500, 1k, 2k, 4k, 8k, 16k).
- **Exemplo de item da table:** `{ f: "31.25", db: "-4" }` (os valores db devem incluir o sinal de + ou -).

## 4. M-Vave Tank-G (Pedaleira Multi-Efeitos / Amp Sim)
**Chaves OBRIGATÓRIAS na 'list':**
- **NOISE GATE:** Threshold do gate.
- **AMP TYPE:** Escolha entre (1-Clean 335, 2-Clean Archetype, 3-OD Mars, 4-OD Friedman, 5-OD Plex, 6-Dist Mars, 7-Dist Pea, 8-Dist Diesel, 9-Dist EVH).
- **AMP GAIN / TREBLE / MIDDLE / BASS / VOLUME:** Ajuste de 0 a 10.
- **MOD FX:** Escolha entre (Chorus, Phaser, Tremolo) e o nível de mistura.
- **DLY MIX / DLY TIME:** Escolha o tipo (Analog, Tape, Dual) e o tempo/mistura.
- **RVB MIX / RVB DECAY:** Escolha o tipo (Room, Spring, Cloud) e o nível/tempo.
- **IR CAB:** Escolha entre (1 a 8) ou informe o nome do Cabinet.

## 5. M-Vave Mini Universe (Reverb Digital)
**Chaves OBRIGATÓRIAS na 'list':**
- **TYPE:** Escolha EXATAMENTE um destes 9 algoritmos: Room, Hall, Plate, Spring, Shimmer, Cloud, Bloom, Swell, LoFi.
- **DECAY:** Tempo de decaimento (0 a 10).
- **MIX:** Proporção Wet/Dry (0 a 10).
- **PARAM 1:** Regula High Pass (cortar graves) de 0 a 10.
- **PARAM 2:** Regula Low Pass (cortar agudos) de 0 a 10. No Shimmer = Pitch. No LoFi = White Noise.
- **PARAM 3:** Varia (Drift, Dwell, Amount, Diffusion).

## 6. M-Vave Lost Tempo v2 (Drum & Looper)
## 6. M-Vave Lost Tempo v2 (Drum & Looper)
**ATENÇÃO:** Este é EXCLUSIVAMENTE um pedal de Bateria e Looper. Os controles são apenas os listados abaixo.
**Chaves OBRIGATÓRIAS na 'list':**
- **DRUM TYPE:** Escolha um preset de bateria (ex: d01 a d30).
- **BPM:** Ritmo do Tap Tempo (40 a 240).
- **DRUM VOL / LOOP VOL:** Volume (0 a 10).
