import z from "zod";

const ItemSchema = z.object({
  name: z.string(),
  url: z.string(),
});

const SearchSchema = z.object({
  type: z.literal("search"),
  placeholder: z.string(),
  url: z.string(),
  name: z.string().optional(),
});

const HtmlSchema = z.object({
  type: z.literal("html"),
  html: z.string(),
});

const CategorySchema: z.ZodType<any> = z.object({
  type: z.literal("category"),
  name: z.string(),
  emoji: z.string().optional(),
  open: z.boolean().default(false),
  items: z.array(z.lazy(() => ConfigItemSchema)),
});

const ConfigItemSchema: z.ZodType<any> = z.lazy(() =>
  z.union([SearchSchema, CategorySchema, HtmlSchema, ItemSchema])
);

export const Config = z.object({
  name: z.string(),
  tagline: z.string().optional(),
  description: z.string().optional(),

  message: z.string().optional(),

  variables: z.record(z.string(), z.string()).optional(),

  items: z.array(ConfigItemSchema).optional(),
});