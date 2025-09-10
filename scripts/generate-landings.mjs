import fs from "fs";
import path from "path";

const root = process.cwd();
const keywordsPath = path.join(root, "content", "keywords.json");
const outPath = path.join(root, "shared", "landings.generated.ts");
const sitemapPath = path.join(root, "public", "sitemap.xml");

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function makeLanding(kw) {
  const slug = slugify(kw);
  const title = `${kw.replace(/\b\w/g, (c) => c.toUpperCase())} — Updated Guide`;
  const h1 = kw.replace(/\b\w/g, (c) => c.toUpperCase());
  const description = `Fresh guide for ${kw} with tips, compliant steps, and quick actions for users.`;
  const keywords = kw.split(/\s+/).filter(Boolean);
  const sections = [
    {
      heading: "Overview",
      content: `Everything you need to know about ${kw}.`,
    },
    {
      heading: "Quick Tips",
      content: `Keep pages fast, clear CTAs, and follow partner rules for ${kw}.`,
    },
  ];
  const faqs = [
    {
      q: `Is ${kw} legit?`,
      a: "Always follow terms and avoid misleading actions.",
    },
    {
      q: "How to get started?",
      a: "Pick a task, follow instructions, and return to claim.",
    },
  ];
  return { slug, title, h1, description, keywords, sections, faqs };
}

function main() {
  let keywords = [];
  try {
    const raw = fs.readFileSync(keywordsPath, "utf8");
    keywords = JSON.parse(raw);
  } catch {
    keywords = [];
  }
  const items = Array.from(new Set(keywords)).map(makeLanding);
  const content = `// Auto-generated file. Do not edit manually.\n\nimport type { Landing } from "./landings";\n\nexport const GENERATED_LANDINGS: Landing[] = ${JSON.stringify(items, null, 2)};\n`;
  fs.writeFileSync(outPath, content, "utf8");
  console.log(`Generated ${items.length} landings to ${outPath}`);
}

main();
