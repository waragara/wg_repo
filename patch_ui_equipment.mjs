import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'astro.config.mjs');
let content = fs.readFileSync(file, 'utf-8');

// 1. Atualizar o Schema
const oldSchema = `equipment: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                            list: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING }
                            }
                          }
                        }
                      }`;

const newSchema = `equipment: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                            tagUso: { type: Type.STRING },
                            list: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING }
                            },
                            table: {
                              type: Type.ARRAY,
                              items: {
                                type: Type.OBJECT,
                                properties: {
                                  f: { type: Type.STRING },
                                  db: { type: Type.STRING }
                                }
                              }
                            }
                          }
                        }
                      }`;

content = content.replace(new RegExp(oldSchema.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&').replace(/\\s+/g, '\\\\s+'), 'g'), newSchema);


// 2. Atualizar a geração do YAML
const oldYamlGen = `let equipmentYaml = '';
              if (fm.equipment && fm.equipment.length > 0) {
                equipmentYaml = 'equipment:\\n';
                fm.equipment.forEach(eq => {
                  const eqTitle = (eq.title || '').replace(/"/g, '\\\\"');
                  equipmentYaml += \`  - title: "\${eqTitle}"\\n\`;
                  if (eq.list && eq.list.length > 0) {
                    equipmentYaml += \`    list:\\n\`;
                    eq.list.forEach(item => {
                      equipmentYaml += \`      - '\${item.replace(/'/g, "''")}'\\n\`;
                    });
                  }
                });
              }`;

const newYamlGen = `let equipmentYaml = '';
              if (fm.equipment && fm.equipment.length > 0) {
                equipmentYaml = 'equipment:\\n';
                fm.equipment.forEach(eq => {
                  const eqTitle = (eq.title || '').replace(/"/g, '\\\\"');
                  equipmentYaml += \`  - title: "\${eqTitle}"\\n\`;
                  
                  if (eq.tagUso) {
                    equipmentYaml += \`    tagUso: "\${eq.tagUso.replace(/"/g, '\\\\"')}"\\n\`;
                  }
                  
                  if (eq.list && eq.list.length > 0) {
                    equipmentYaml += \`    list:\\n\`;
                    eq.list.forEach(item => {
                      equipmentYaml += \`      - '\${item.replace(/'/g, "''")}'\\n\`;
                    });
                  }
                  
                  if (eq.table && eq.table.length > 0) {
                    equipmentYaml += \`    table:\\n\`;
                    eq.table.forEach(row => {
                      equipmentYaml += \`      - { f: "\${(row.f || '').toString().replace(/"/g, '\\\\"')}", db: "\${(row.db || '').toString().replace(/"/g, '\\\\"')}" }\\n\`;
                    });
                  }
                });
              }`;

content = content.replace(new RegExp(oldYamlGen.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&').replace(/\\s+/g, '\\\\s+'), 'g'), newYamlGen);

fs.writeFileSync(file, content, 'utf-8');
console.log("Correções aplicadas!");
