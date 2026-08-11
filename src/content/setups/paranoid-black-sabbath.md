---
aiComment: |
  #### Análise do Setup e Escolhas:
  * **Guitarra Cort Classi Rock Les Paul:** Embora Tony Iommi seja mundialmente famoso por sua Gibson SG, a Les Paul da Cort com captadores humbucker é a escolha perfeita no nosso inventário. Ela entrega a mesma massa sonora, sustain e resposta de frequências médias-graves que definiram o nascimento do Heavy Metal.
  * **M-Vave Tank-G (AMP & CAB):** Para simular a parede de amplificadores valvulados britânicos empurrados ao limite, selecionamos a emulação do **Marshal JCM800** combinado com o clássico gabinete **Marshall 1960V30 (4x12)**. O JCM800 entrega aquela distorção orgânica e "crocante", enquanto o gabinete de 4x12 com falantes Vintage 30 garante a projeção de médios rasgados fundamentais para o riff.
  * **Pedal OverDrive Boss OD-3:** Usamos o OD-3 aqui não como distorção principal, mas sim como um "impulso" (booster) analógico na frente da modelagem digital. Com o ganho baixo (Drive em 4) e volume ligeiramente acima do unitário (Level em 6), ele adiciona uma compressão natural quente e aquele "punch" característico que aproxima a emulação digital de um amplificador real reagindo dinamicamente.
  
  #### Escultura de Frequências (O segredo do timbre de Iommi):
  O uso do **Equilizador Joyo 10-Band Controller** é a nossa arma secreta. O timbre de "Paranoid" é notoriamente focado nos médios e agudos médios, mas tem agudos extremos "arredondados" (em parte devido ao uso das próteses de plástico que Iommi usa nos dedos da mão da escala e à escolha de amplificadores escuros).
  * **Corte de agudos extremos (8kHz e 16kHz):** Remove o "chiado" ou o aspecto muito moderno e digital da distorção, deixando o som cru e vintage.
  * **Forte boost em médios (500Hz e 1kHz):** Garante que o som da guitarra seja "gordo", presente e agressivo na medida certa.
  
  #### Visão Holística e Dica de Ouro:
  Se você tiver a opção de escolher onde plugar a Tank-G, experimente conectar a saída da pedaleira diretamente nos **Monitores de Audio MR4** em vez do amplificador Fender 20G. O Fender 20G é um ótimo amplificador de estudo, mas ele possui seu próprio alto-falante de 8 polegadas que irá sobrepor uma equalização física por cima da simulação de gabinete da Tank-G (gerando o efeito "double-cabbing"). 
  
  * **Se usar os Monitores de Audio MR4:** Mantenha o IR CAB ligado na Tank-G. Você terá a experiência de ouvir a guitarra exatamente como ela soaria gravada no disco.
  * **Se usar o Amplificador Fender 20G:** Se sentir que o som está muito "fechado" ou abafado, experimente desativar o **IR CAB** na Tank-G, deixando apenas a emulação de amplificador ativa, já que o falante físico do Fender 20G fará o papel de projetar o som.
title: "Paranoid"
artist: "Black Sabbath"
targetTone: "Distorção clássica do Proto-Metal britânico, com foco em médios cortantes, graves controlados e um sustain rústico e agressivo."
guitar: "Guitarra Cort Classi Rock Les Paul"
pickup: "Ponte"
pedals:
  - "Pedal OverDrive Boss OD-3"
  - "Equilizador Joyo 10-Band Controller"
  - "Pedaleira Multi Efeitos M-Vave Tank-G"
amp: "Amplificador Fender 20G"
equipment:
  - title: "Pedal OverDrive Boss OD-3"
    list:
      - '<strong class="text-white">Level:</strong> 6 | <strong class="text-white">Tone:</strong> 5 | <strong class="text-white">Drive:</strong> 4'
  - title: "Equilizador Joyo 10-Band Controller"
    list:
      - '<strong class="text-white">31.25Hz:</strong> 0 | <strong class="text-white">62.5Hz:</strong> -2 | <strong class="text-white">125Hz:</strong> -1 | <strong class="text-white">250Hz:</strong> +1 | <strong class="text-white">500Hz:</strong> +4 | <strong class="text-white">1kHz:</strong> +5 | <strong class="text-white">2kHz:</strong> +2 | <strong class="text-white">4kHz:</strong> +1 | <strong class="text-white">8kHz:</strong> -2 | <strong class="text-white">16kHz:</strong> -4'
  - title: "Pedaleira Multi Efeitos M-Vave Tank-G"
    list:
      - '<strong class="text-white">AMP:</strong> Marshal JCM800'
      - '<strong class="text-white">CAB:</strong> Marshall 1960V30 (4x12)'
      - '<strong class="text-white">Gain:</strong> 6 | <strong class="text-white">Treble:</strong> 5 | <strong class="text-white">Middle:</strong> 8 | <strong class="text-white">Bass:</strong> 5'
  - title: "Amplificador Fender 20G"
    list:
      - '<strong class="text-white">Channel:</strong> Clean | <strong class="text-white">Volume:</strong> Ajuste a gosto | <strong class="text-white">Treble:</strong> 5 | <strong class="text-white">Bass:</strong> 5'
---

**Sinal:**
1. A **Guitarra Cort Classi Rock Les Paul** conecta-se diretamente à entrada do **Pedal OverDrive Boss OD-3**.
2. Do OD-3, o sinal segue para o **Equilizador Joyo 10-Band Controller**.
3. O equalizador entrega o sinal esculpido na entrada da **Pedaleira Multi Efeitos M-Vave Tank-G**.
4. A saída da Tank-G é enviada para a entrada limpa (Clean Channel) do **Amplificador Fender 20G** (com equalização do amplificador em flat).

**Captadores:**
O captador da **Ponte** foi selecionado porque o riff de "Paranoid" exige um ataque de palhetada muito definido, firmeza nos power chords e um som "focado" que corte através da mix. Os captadores humbucker da Cort Les Paul entregam a saída de sinal forte necessária para empurrar os pedais de ganho, fornecendo o calor e a agressividade típicos do timbre clássico de Tony Iommi, sem a sobra de graves ou o som "esponjoso" que o captador do braço traria nessa situação.