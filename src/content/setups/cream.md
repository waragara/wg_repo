---
title: "Cream - Woman Tone Setup"
artist: "Cream"
targetTone: "Woman Tone (Quente, encorpado, sustain longo e agudos cortados)"
guitar: "Guitarra Cort Classi Rock Les Paul"
pickup: "Braço"
pedals: 
  - "Pedal OverDrive Boss OD-3"
  - "Equilizador Joyo 10-Band Controller"
  - "Pedaleira Multi Efeitos M-Vave Tank-G"
  - "Pedal M-Vave Mini Universe"
amp: "Monitores de Audio MR4"
equipment:
  - title: "Guitarra Cort Classi Rock Les Paul"
    tagUso: "Guitarra base para o timbre clássico de humbucker inglês dos anos 60"
    list:
      - '<strong class="text-white">CAPTADORES:</strong> ClassicRocker-II'
      - '<strong class="text-white">CONTROLES:</strong> Tone do captador do braço totalmente zerado (0) na guitarra'
  - title: "Pedal OverDrive Boss OD-3"
    tagUso: "Saturação inicial para garantir compressão e sustentação às notas"
    list:
      - '<strong class="text-white">DRIVE:</strong> 6'
      - '<strong class="text-white">TONE:</strong> 3'
      - '<strong class="text-white">LEVEL:</strong> 5'
  - title: "Equilizador Joyo 10-Band Controller"
    tagUso: "Corte cirúrgico de agudos e reforço de médios para esculpir o 'Woman Tone'"
    table:
      - f: "31.25"
        db: "0"
      - f: "62.5"
        db: "+2"
      - f: "125"
        db: "+4"
      - f: "250"
        db: "+3"
      - f: "500"
        db: "+2"
      - f: "1k"
        db: "+1"
      - f: "2k"
        db: "-3"
      - f: "4k"
        db: "-5"
      - f: "8k"
        db: "-6"
      - f: "16k"
        db: "-7"
  - title: "Pedaleira Multi Efeitos M-Vave Tank-G"
    tagUso: "Simulação do amplificador britânico Plexi e gabinete Marshall 4x12"
    list:
      - '<strong class="text-white">NOISE GATE:</strong> 3'
      - '<strong class="text-white">AMP TYPE:</strong> 5'
      - '<strong class="text-white">AMP:</strong> Plexi 100'
      - '<strong class="text-white">AMP GAIN:</strong> 7'
      - '<strong class="text-white">TREBLE:</strong> 3'
      - '<strong class="text-white">MIDDLE:</strong> 8'
      - '<strong class="text-white">BASS:</strong> 6'
      - '<strong class="text-white">VOLUME:</strong> 6'
      - '<strong class="text-white">MOD FX:</strong> 1-Chorus, 0'
      - '<strong class="text-white">DLY MIX:</strong> 1-Analog, 0'
      - '<strong class="text-white">DLY TIME:</strong> 0'
      - '<strong class="text-white">RVB MIX:</strong> 1-Room, 2'
      - '<strong class="text-white">RVB DECAY:</strong> 3'
      - '<strong class="text-white">IR CAB:</strong> 7'
      - '<strong class="text-white">CAB:</strong> Marshall 1960V30 (4x12)'
  - title: "Pedal M-Vave Mini Universe"
    tagUso: "Ambiência de sala sutil para simular o vazamento de estúdio clássico"
    list:
      - '<strong class="text-white">TYPE:</strong> Room'
      - '<strong class="text-white">DECAY:</strong> 3'
      - '<strong class="text-white">MIX:</strong> 3'
      - '<strong class="text-white">PARAM 1:</strong> 5'
      - '<strong class="text-white">PARAM 2:</strong> 4'
      - '<strong class="text-white">PARAM 3:</strong> 5'
  - title: "Monitores de Audio MR4"
    tagUso: "Saída de som linear para reproduzir fielmente as simulações do Tank-G"
    list:
      - '<strong class="text-white">VOLUME:</strong> 5'
      - '<strong class="text-white">BASS:</strong> 0'
      - '<strong class="text-white">TREBLE:</strong> 0'
tank_g_settings:
  amp_cab:
    amp_type: "5"
    ir_cab: "7"
  eq:
    bass: 6
    middle: 8
    treble: 3
    gain: 7
  effects:
    rvb_decay_type: "1-Room"
    rvb_mix: 2
    dly_mix_type: "1-Analog"
    dly_time: 0
    mod_fx_type: "1-Chorus"
    mod_speed: 0
  noise_gate: 3
study_links:
  songsterr: "https://www.songsterr.com/?pattern=Cream+Cream"
  cifraclub: "https://www.cifraclub.com.br/?q=Cream+Cream"
aiComment: |
  Para obter o clássico 'Woman Tone' de Eric Clapton no Cream, a arquitetura do sinal foi totalmente otimizada. Usamos a Cort Les Paul no captador do braço com o tone da própria guitarra fechado. O sinal entra primeiro no Boss OD-3 (Slot 1) para dar sustain e compressão analógica. Em seguida, passa pelo Joyo 10-Band (Slot 2), onde atenuamos drasticamente as frequências agudas (2k a 16k) e reforçamos os médios-graves para moldar o timbre aveludado característico. A pedaleira Tank-G (Slot 4) simula o lendário Plexi 100 empurrado por uma caixa Marshall 1960V30, e o Mini Universe (Slot 5) finaliza com um reverb de sala curto para dar profundidade natural ao som, saindo de forma linear nos monitores MR4.
---