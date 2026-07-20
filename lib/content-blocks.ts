import { z } from "zod";

export type ContentFieldType = "text" | "textarea";

export type ContentField = {
  name: string;
  label: string;
  type: ContentFieldType;
  placeholder?: string;
};

export type ContentBlockConfig = {
  key: string;
  label: string;
  description: string;
  fields: ContentField[];
  defaultValue: Record<string, string>;
};

export const CONTENT_BLOCKS: ContentBlockConfig[] = [
  {
    key: "homepage.hero",
    label: "Homepage Hero",
    description: "The large banner at the top of the homepage.",
    fields: [
      { name: "eyebrow", label: "Eyebrow text", type: "text", placeholder: "Kigali, Rwanda" },
      { name: "headline", label: "Headline", type: "text", placeholder: "Rwandan Hospitality Refined." },
      { name: "subheadline", label: "Subheadline", type: "textarea" },
      { name: "ctaLabel", label: "Button label", type: "text", placeholder: "Book Your Stay" },
      { name: "ctaHref", label: "Button link", type: "text", placeholder: "/rooms" },
    ],
    defaultValue: {
      eyebrow: "Kigali, Rwanda",
      headline: "Rwandan Hospitality Refined.",
      subheadline: "Experience warmth, comfort, and quiet luxury in the heart of Rwanda.",
      ctaLabel: "Book Your Stay",
      ctaHref: "/rooms",
    },
  },
  {
    key: "homepage.about",
    label: "Homepage — About Teaser",
    description: "The short introduction section on the homepage.",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
    ],
    defaultValue: {
      heading: "A Sanctuary in the Heart of Kigali",
      body: "Baobab Hotel blends modern comfort with the warmth of Rwandan hospitality.",
    },
  },
  {
    key: "about.page",
    label: "About Page",
    description: "The full story shown on the standalone About page.",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
    ],
    defaultValue: {
      heading: "Our Story",
      body: "Baobab Hotel was founded to bring warm, modern hospitality to Kigali.",
    },
  },
  {
    key: "homepage.dining",
    label: "Homepage — Dining Teaser",
    description: "The restaurant preview section on the homepage.",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
    ],
    defaultValue: {
      heading: "Dining at Baobab",
      body: "Savor Rwandan and international flavors, crafted with local ingredients.",
    },
  },
  {
    key: "contact.info",
    label: "Contact Information",
    description: "Shown on the Contact page and in the site footer.",
    fields: [
      { name: "address", label: "Address", type: "textarea" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text" },
    ],
    defaultValue: {
      address: "KG 7 Ave, Kigali, Rwanda",
      phone: "+250 700 000 000",
      email: "info@baobabhotel.rw",
    },
  },
];

export function getContentBlock(key: string): ContentBlockConfig | undefined {
  return CONTENT_BLOCKS.find((b) => b.key === key);
}

export function schemaForBlock(block: ContentBlockConfig) {
  const shape: Record<string, z.ZodString> = {};
  for (const field of block.fields) {
    shape[field.name] = z.string().min(1, `${field.label} is required`);
  }
  return z.object(shape);
}