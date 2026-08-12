import fs from 'fs';
import yaml from 'yaml'; // or maybe gray-matter

const content = fs.readFileSync('src/content/setups/led-zeppelin-jangly.md', 'utf-8');
const match = content.match(/^---\n([\s\S]*?)\n---/);
if (match) {
    const data = yaml.parse(match[1]);
    console.log(JSON.stringify(data.equipment, null, 2));
} else {
    console.log("No frontmatter found");
}
