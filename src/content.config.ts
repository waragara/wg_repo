import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const setupsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/setups" }),
  schema: z.object({
    title: z.string(),
    artist: z.string(),
    targetTone: z.string(),
    guitar: z.string(),
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
    })).optional()
  })
});

export const collections = {
  'setups': setupsCollection,
};
