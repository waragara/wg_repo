import re
import yaml
import os

def clean_html(text):
    return re.sub(r'<[^>]+>', '', text).strip()

def extract_setups():
    with open('_backup/index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Split into setup blocks based on the main card container
    blocks = html.split('<div class="bg-cardBg border border-borderColor rounded-xl p-6 mb-10 shadow-xl transition-all duration-300 hover:shadow-2xl">')[1:]
    
    for idx, block in enumerate(blocks):
        # Extract title
        title_match = re.search(r'<h2[^>]*>(.*?)</h2>', block)
        if not title_match: continue
        title = clean_html(title_match.group(1))
        
        # Skip Oasis because we already did it
        if title == "Oasis": continue
        
        # Extract targetTone
        tone_match = re.search(r'<p[^>]*class="[^"]*text-white[^"]*"[^>]*>(.*?)</p>', block)
        targetTone = clean_html(tone_match.group(1)) if tone_match else ""
        
        # Extract signalChain
        chain_match = re.search(r'<div[^>]*class="[^"]*font-mono[^"]*"[^>]*>(.*?)</div>', block)
        signalChain = clean_html(chain_match.group(1)) if chain_match else ""
        
        # Extract tabs
        tabs = []
        tab_matches = re.finditer(r'<a href="([^"]+)"[^>]*>(.*?)</a>', block, re.DOTALL)
        for t in tab_matches:
            url = t.group(1)
            label = clean_html(t.group(2))
            tabs.append({"label": label, "url": url})
            
        # Extract equipment
        equipment = []
        # Split block into equip boxes
        equip_blocks = block.split('<div class="bg-boxBg py-4 px-5 rounded-lg border-l-4 border-accentBlue shadow-md hover:-translate-y-1 transition-transform duration-200">')[1:]
        
        for e_block in equip_blocks:
            e_title_match = re.search(r'<h3[^>]*>(.*?)</h3>', e_block)
            if not e_title_match: continue
            e_title = clean_html(e_title_match.group(1))
            
            e_data = {"title": e_title}
            
            # tagUso
            tag_match = re.search(r'<span[^>]*class="[^"]*uppercase[^"]*"[^>]*>(.*?)</span>', e_block)
            if tag_match:
                e_data["tagUso"] = clean_html(tag_match.group(1))
                
            # list items
            list_items = []
            li_matches = re.finditer(r'<li[^>]*>(.*?)</li>', e_block, re.DOTALL)
            for li in li_matches:
                list_items.append(li.group(1).strip())
            
            if list_items:
                e_data["list"] = list_items
                
            # table (specifically Joyo EQ)
            table_match = re.search(r'<table[^>]*>.*?</table>', e_block, re.DOTALL)
            if table_match:
                table_html = table_match.group(0)
                # rows
                rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table_html, re.DOTALL)
                if len(rows) >= 2:
                    # freq row
                    freqs = re.findall(r'<td[^>]*>(.*?)</td>', rows[0], re.DOTALL)
                    # db row
                    dbs = re.findall(r'<td[^>]*>(.*?)</td>', rows[1], re.DOTALL)
                    
                    table_data = []
                    for f, d in zip(freqs, dbs):
                        table_data.append({"f": clean_html(f), "db": clean_html(d)})
                        
                    # If there's a second chunk of 5 (rows 2 and 3)
                    if len(rows) >= 4:
                        freqs2 = re.findall(r'<td[^>]*>(.*?)</td>', rows[2], re.DOTALL)
                        dbs2 = re.findall(r'<td[^>]*>(.*?)</td>', rows[3], re.DOTALL)
                        for f, d in zip(freqs2, dbs2):
                            table_data.append({"f": clean_html(f), "db": clean_html(d)})
                            
                    e_data["table"] = table_data
                    
            equipment.append(e_data)
            
        # Write to file
        filename = title.lower().replace(' ', '-').replace('(', '').replace(')', '').replace('/', '')
        # Handle duplicate filenames (e.g. Led Zeppelin has multiple)
        if filename == 'led-zeppelin':
            if "No Quarter" in targetTone: filename = "led-zeppelin-no-quarter"
            else: filename = "led-zeppelin-iv"
            
        filepath = os.path.join('src/content/setups', f'{filename}.md')
        
        frontmatter = {
            "title": title,
            "targetTone": targetTone,
            "signalChain": signalChain,
        }
        if tabs: frontmatter["tabs"] = tabs
        if equipment: frontmatter["equipment"] = equipment
        
        # Sort keys to put equipment at the end
        yaml_str = yaml.dump(frontmatter, allow_unicode=True, sort_keys=False, default_flow_style=False)
        
        with open(filepath, 'w', encoding='utf-8') as out:
            out.write("---\n")
            out.write(yaml_str)
            out.write("---\n")
            
        print(f"Generated {filepath}")

if __name__ == '__main__':
    extract_setups()
