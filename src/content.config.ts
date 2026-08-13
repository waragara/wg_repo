import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const setupsCollection = defineCollection({
  loader: glob({ pattern: "[^_]*.md", base: "./src/content/setups" }),
  schema: z.object({
    title: z.string(),
    artist: z.string(),
    targetTone: z.string(),
    guitar: z.string(),
    pickup: z.string().optional(),
    pedals: z.array(z.string()),
    amp: z.string(),
    tabs: z.array(z.object({
      label: z.string(),
      url: z.string()
    })).optional(),
    equipment: z.array(z.object({
      title: z.string(),
      tagUso: z.string().optional(),
      list: z.array(z.string()).optional(),
      table: z.array(z.object({
        f: z.union([z.string(), z.number()]),
        db: z.union([z.string(), z.number()])
      })).optional()
    })).optional(),
    aiComment: z.string().optional(),
    tank_g_settings: z.object({
      amp_cab: z.object({ amp_type: z.string(), ir_cab: z.string() }),
      eq: z.object({ bass: z.number(), middle: z.number(), treble: z.number(), gain: z.number() }),
      effects: z.object({ rvb_decay_type: z.string(), rvb_mix: z.number(), dly_mix_type: z.string(), dly_time: z.number(), mod_fx_type: z.string(), mod_speed: z.number() }),
      noise_gate: z.number()
    }).optional()
  })
});

export const collections = {
  'setups': setupsCollection,
};
