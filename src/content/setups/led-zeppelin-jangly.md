---
title: "Led Zeppelin Jangly Tone Setup"
artist: "Led Zeppelin"
targetTone: "Led Zeppelin Jangly Tone Setup"
guitar: "Guitarra Tagima SixMart Stratocaster"
pickup: "Ambos"
pedals: 
  - "Pedal OverDrive Pure Sky - Caline"
  - "Equilizador Joyo 10-Band Controller"
  - "Pedaleira Multi Efeitos M-Vave Tank-G"
  - "Pedal M-Vave Mini Universe"
amp: "Monitores de Audio MR4"
equipment:
  - title: "Guitarra Tagima SixMart Stratocaster"
    tagUso: "Guitarra base para o timbre jangly brilhante e estalado"
    list:
      - '<strong class="text-white">Captador:</strong> Ambos (Posicao 2 ou 4)'
      - '<strong class="text-white">Volume:</strong> 10'
      - '<strong class="text-white">Tone:</strong> 9'
  - title: "Pedal OverDrive Pure Sky - Caline"
    tagUso: "Overdrive transparente para adicionar um leve crunch dinamico sem perder o brilho natural"
    list:
      - '<strong class="text-white">Volume:</strong> 6'
      - '<strong class="text-white">Gain:</strong> 2.5'
      - '<strong class="text-white">Bass:</strong> 4'
      - '<strong class="text-white">Treble:</strong> 7'
  - title: "Equilizador Joyo 10-Band Controller"
    tagUso: "Esculpir as frequencias para realcar o brilho jangly e atenuar o sub-grave"
    table:
      - { f: "31.25", db: "-4" }
      - { f: "62.5", db: "-3" }
      - { f: "125", db: "-2" }
      - { f: "250", db: "0" }
      - { f: "500", db: "+1" }
      - { f: "1k", db: "+2" }
      - { f: "2k", db: "+3" }
      - { f: "4k", db: "+4" }
      - { f: "8k", db: "+3" }
      - { f: "16k", db: "+1" }
  - title: "Pedaleira Multi Efeitos M-Vave Tank-G"
    tagUso: "Simulacao de amplificador classico britanico para a resposta jangle ideal"
    list:
      - '<strong class="text-white">AMP:</strong> VOX AC30HW Normal'
      - '<strong class="text-white">IR CAB:</strong> Fender Pr Junior (1x10)'
      - '<strong class="text-white">Gain:</strong> 3'
      - '<strong class="text-white">Volume:</strong> 6'
  - title: "Pedal M-Vave Mini Universe"
    tagUso: "Reverb sutil para dar profundidade e simulacao de sala acustica"
    list:
      - '<strong class="text-white">Mode:</strong> Room'
      - '<strong class="text-white">Mix:</strong> 3'
      - '<strong class="text-white">Decay:</strong> 2'
      - '<strong class="text-white">Tone:</strong> 6'
  - title: "Monitores de Audio MR4"
    tagUso: "Monitoracao de resposta plana para reproducao fiel da simulacao de amp"
    list:
      - '<strong class="text-white">Volume:</strong> 5'
      - '<strong class="text-white">Bass:</strong> 5'
      - '<strong class="text-white">Treble:</strong> 5'
aiComment: |
  Reordenamos completamente o sinal para seguir a arquitetura logica correta. A Guitarra Tagima entra primeiro no Pure Sky (Slot 1) para gerar um leve crunch dinamico, passando em seguida pelo Joyo 10-Band (Slot 2) onde atenuamos os graves extremos e realçamos os agudos para garantir o brilho 'jangly'. O sinal entao entra na Tank-G (Slot 4) simulando o clássico VOX AC30, terminando no reverb Mini Universe (Slot 5) para excelente dimensao e espacialidade antes de sair nos monitores MR4.
---