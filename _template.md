---
# ==========================================
# 🎸 TEMPLATE DE SETUP (Astro Content Collection)
# ==========================================
# DICA: Ao criar um novo arquivo, remova os comentários e renomeie o arquivo!
# Arquivos que começam com underline "_" (como este) são ignorados pelo sistema.

# [OBRIGATÓRIO] O nome do setup ou música principal
title: "Nome do Setup ou Música"

# [OBRIGATÓRIO] O nome da banda ou artista (Usado para o filtro global)
artist: "Nome da Banda"

# [OBRIGATÓRIO] Uma breve descrição do timbre esperado
targetTone: "Descrição Curta (Ex: Crunch Sujo e Clássico)"

# ==========================================
# ⚡ SIGNAL CHAIN (Cadeia de Sinal)
# ==========================================

# [OBRIGATÓRIO] A guitarra utilizada
guitar: "Sua Guitarra (Ex: Cort, Tagima Sixmart)"

# [OBRIGATÓRIO] A lista de pedais na ordem do sinal (do primeiro ao último)
pedals:
  - "Pedal 1 (Ex: Pure Sky)"
  - "Pedal 2 (Ex: OD-3)"
  - "Pedal 3 (Ex: Tank-G)"

# [OBRIGATÓRIO] O amplificador ou saída de som final
amp: "Seu Amp (Ex: MR4)"


# ==========================================
# 📖 TABS (Opcional)
# ==========================================
# Lista de links de tablaturas úteis para este timbre
tabs:
  - label: "📖 Tablatura: Nome da Música (Songsterr)"
    url: "https://www.songsterr.com/..."
  - label: "📖 Tablatura: Nome da Música (CifraClub)"
    url: "https://www.cifraclub.com.br/..."


# ==========================================
# 🎛️ EQUIPMENT / REGULAGENS (Opcional)
# ==========================================
# Detalhamento de cada equipamento e suas regulagens exatas
equipment:

  # Exemplo 1: Regulagem simples de Guitarra ou Pedal
  - title: "Nome do Equipamento (Ex: Boss OD-3)"
    tagUso: "Sempre Ligado (Opcional: um badge que aparece abaixo do título)"
    list:
      - '<strong class="text-white">Drive:</strong> 5.5'
      - '<strong class="text-white">Tone:</strong> 6 | <strong class="text-white">Level:</strong> 6'

  # Exemplo 2: Pedal Multiefeitos (M-Vave Tank-G)
  - title: "M-Vave Tank-G"
    list:
      - '<strong class="text-white">AMP:</strong> Slot X (Nome do Amp)'
      - '<strong class="text-white">Gain:</strong> 5 | <strong class="text-white">Treble:</strong> 5 | <strong class="text-white">Middle:</strong> 5 | <strong class="text-white">Bass:</strong> 5'
      - '<strong class="text-white">CAB:</strong> Slot Y (Nome do Cab)'
      - '<strong class="text-white">Modulação/Delay/Reverb:</strong> Desligados'

  # Exemplo 3: Regulagem avançada usando Tabela (Ex: Equalizador Joyo 10-Band)
  - title: "Joyo R12 EQ (10-Band)"
    tagUso: "Opcional: Foco no ataque da palheta"
    table:
      - { f: "31.2", db: "0" }
      - { f: "62.5", db: "0" }
      - { f: "125", db: "0" }
      - { f: "250", db: "0" }
      - { f: "500", db: "0" }
      - { f: "1K", db: "0" }
      - { f: "2K", db: "0" }
      - { f: "4K", db: "0" }
      - { f: "8K", db: "0" }
      - { f: "16K", db: "0" }

---
