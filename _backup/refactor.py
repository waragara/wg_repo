import re
import sys

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Tailwind CDN to <head>
    if '<script src="https://cdn.tailwindcss.com"></script>' not in content:
        content = content.replace('</head>', '    <script src="https://cdn.tailwindcss.com"></script>\n    <script>\n        tailwind.config = {\n            theme: {\n                extend: {\n                    colors: {\n                        bgMain: "#121212",\n                        cardBg: "#1e1e1e",\n                        boxBg: "#2a2a2a",\n                        textMain: "#e0e0e0",\n                        textMuted: "#aaaaaa",\n                        accentBlue: "#4da6ff",\n                        accentOrange: "#ff9800",\n                        borderColor: "#333333"\n                    }\n                }\n            }\n        }\n    </script>\n</head>')

    # 2. Remove all <style> blocks
    content = re.sub(r'<style>.*?</style>', '', content, flags=re.DOTALL)

    # 3. Replace body style
    content = re.sub(r'<body>', '<body class="bg-bgMain text-textMain font-sans leading-relaxed m-0 p-5">', content)
    
    # 4. Replace class attributes
    replacements = {
        'class="container"': 'class="max-w-5xl mx-auto"',
        '<h1>': '<h1 class="text-center text-white mb-8 text-4xl tracking-wide font-bold">',
        'class="photo-gallery"': 'class="flex justify-center items-center gap-5 mb-10 flex-wrap"',
        'class="setup-card"': 'class="bg-cardBg border border-borderColor rounded-xl p-6 mb-10 shadow-xl transition-all duration-300 hover:shadow-2xl"',
        'class="setup-header"': 'class="border-b-2 border-borderColor pb-4 mb-5"',
        '<h2>': '<h2 class="m-0 mb-1 text-accentBlue text-3xl font-bold">',
        'class="target-tone"': 'class="text-lg text-white m-0 mb-2.5 font-medium"',
        'class="signal-chain"': 'class="bg-[#111] py-2.5 px-4 rounded-md font-mono text-accentOrange text-sm overflow-x-auto whitespace-nowrap shadow-inner mb-4"',
        'class="equip-grid"': 'class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"',
        'class="equip-box"': 'class="bg-boxBg py-4 px-5 rounded-lg border-l-4 border-accentBlue shadow-md hover:-translate-y-1 transition-transform duration-200"',
        'class="equip-title"': 'class="text-xl font-bold text-white mt-0 mb-3 pb-2 border-b border-borderColor"',
        'class="tag-uso"': 'class="inline-block bg-[#3a2a00] text-[#ffc107] py-1 px-2.5 rounded text-xs mb-2.5 font-bold uppercase tracking-wider"',
        'class="tab-link"': 'class="inline-block bg-accentOrange text-bgMain py-1.5 px-3 rounded text-sm font-bold mt-2.5 no-underline transition-colors duration-200 hover:bg-[#e68a00]"',
    }

    for old, new in replacements.items():
        content = content.replace(old, new)
        
    # Table styling
    content = content.replace('<table>', '<table class="w-full border-collapse mt-2.5 text-sm">')
    content = content.replace('<th>', '<th class="border border-borderColor p-1.5 text-center bg-[#1a1a1a] text-accentBlue">')
    content = content.replace('<td>', '<td class="border border-borderColor p-1.5 text-center bg-[#222]">')

    # Images in photo-gallery
    content = re.sub(r'<img (.*?)>', r'<img \1 class="w-full max-w-[310px] h-auto rounded-xl border-2 border-accentBlue shadow-[0_6px_12px_rgba(0,0,0,0.5)] object-cover transition-transform duration-300 hover:scale-105 hover:shadow-accentBlue/20 hover:shadow-xl">', content)
    # clean up if it already had classes
    content = content.replace('class="w-full max-w-[310px] h-auto rounded-xl border-2 border-accentBlue shadow-[0_6px_12px_rgba(0,0,0,0.5)] object-cover transition-transform duration-300 hover:scale-105 hover:shadow-accentBlue/20 hover:shadow-xl" class="', 'class="w-full max-w-[310px] h-auto rounded-xl border-2 border-accentBlue shadow-[0_6px_12px_rgba(0,0,0,0.5)] object-cover transition-transform duration-300 hover:scale-105 hover:shadow-accentBlue/20 hover:shadow-xl ')

    # List items
    content = content.replace('<ul>', '<ul class="list-none p-0 m-0">')
    content = content.replace('<li>', '<li class="mb-1.5 text-[0.95em]">')
    content = content.replace('<strong>', '<strong class="text-white">')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for file in ["/home/waragara/Documents/GitHub/wg_repo/index.html", "/home/waragara/Documents/GitHub/wg_repo/tank-g-presets.html", "/home/waragara/Documents/GitHub/wg_repo/wg_setups.html"]:
    try:
        process_file(file)
        print(f"Processed {file}")
    except Exception as e:
        print(f"Error processing {file}: {e}")
