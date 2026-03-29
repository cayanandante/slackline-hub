// seed.js — Run once to load all resources into Supabase
// Usage: node seed.js
//
// Prerequisites:
//   npm install @supabase/supabase-js
//   Place knowledge_base_full.json in the same folder as this script

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://qgcemdwsruveqdiddhjz.supabase.co";

// Use your SERVICE ROLE key here (not anon key) — needed for inserts
// Get it from: Supabase dashboard → Settings → API → service_role key
// NEVER commit this key to GitHub — run this script locally only
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing SUPABASE_SERVICE_KEY environment variable.");
  console.error("   Run: SUPABASE_SERVICE_KEY=your_key node seed.js");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Load data ─────────────────────────────────────────────────────────────────

const raw = readFileSync("./knowledge_base_full.json", "utf-8");
const kb = JSON.parse(raw);
const resources = kb.resources;

console.log(`\n📚 Slackline Hub — Database Seed`);
console.log(`   Found ${resources.length} resources to insert\n`);

// ── Map JSON fields to Supabase table columns ─────────────────────────────────
// resources table columns:
//   id (uuid, auto)
//   url (text, unique)
//   title_pt (text)
//   title_en (text) — we'll use title_pt for now since most titles are in PT
//   author (text)
//   year (int)
//   type (text) — video, article, document, instagram, community, shop, tool, book, podcast, database, app, link
//   source (text) — YouTube, Google Drive, Slacktivity, etc.
//   section (text) — guide section name
//   subsection (text)
//   language (text) — 'pt' or 'en'
//   tags (text[]) — derived from type + section
//   created_at (timestamptz, auto)

function mapResource(r) {
  // Derive tags from type and section
  const tags = [r.type, r.language];

  if (r.section) {
    if (r.section.toLowerCase().includes("como montar")) tags.push("rigging");
    if (r.section.toLowerCase().includes("força")) tags.push("forces", "physics");
    if (r.section.toLowerCase().includes("nó")) tags.push("knots");
    if (r.section.toLowerCase().includes("incident")) tags.push("incidents", "safety");
    if (r.section.toLowerCase().includes("equipament")) tags.push("equipment");
    if (r.section.toLowerCase().includes("dyneema")) tags.push("dyneema", "equipment");
    if (r.section.toLowerCase().includes("backup")) tags.push("backup-fall", "safety");
    if (r.section.toLowerCase().includes("midline")) tags.push("midline");
    if (r.section.toLowerCase().includes("freestyle")) tags.push("freestyle");
    if (r.section.toLowerCase().includes("iniciante")) tags.push("beginner");
    if (r.section.toLowerCase().includes("equipes")) tags.push("teams", "community");
    if (r.section.toLowerCase().includes("comprar")) tags.push("shop");
    if (r.section.toLowerCase().includes("testes")) tags.push("break-load", "testing");
    if (r.section.toLowerCase().includes("documentário")) tags.push("film", "documentary");
    if (r.section.toLowerCase().includes("weblock")) tags.push("weblock", "equipment");
    if (r.section.toLowerCase().includes("spacenet")) tags.push("spacenet");
    if (r.section.toLowerCase().includes("arremate")) tags.push("knots");
  }

  return {
    url: r.url,
    title_pt: r.title_pt || null,
    title_en: null, // to be filled in later via translation or manual entry
    author: r.author || null,
    year: r.year || null,
    type: r.type,
    source: r.source,
    section: r.section || null,
    subsection: r.subsection || null,
    language: r.language,
    tags: [...new Set(tags)], // deduplicate
  };
}

// ── Insert in batches ─────────────────────────────────────────────────────────

const BATCH_SIZE = 50;
let inserted = 0;
let skipped = 0;
let errors = 0;

async function seedResources() {
  console.log("📥 Inserting resources...");

  const rows = resources.map(mapResource);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

    const { data, error } = await supabase
      .from("resources")
      .upsert(batch, {
        onConflict: "url",      // skip duplicates by URL
        ignoreDuplicates: true,
      });

    if (error) {
      console.error(`   ❌ Batch ${batchNum}/${totalBatches} failed:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`   ✓ Batch ${batchNum}/${totalBatches} — ${inserted}/${rows.length} rows`);
    }
  }
}

// ── Stats after insert ────────────────────────────────────────────────────────

async function verifyInsert() {
  const { count, error } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("❌ Could not verify insert:", error.message);
    return;
  }

  console.log(`\n✅ Verification: ${count} rows now in resources table`);

  // Count by type
  const { data: byType } = await supabase
    .from("resources")
    .select("type")
    .order("type");

  if (byType) {
    const typeCounts = byType.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    console.log("\n   By type:");
    Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`   ${type.padEnd(15)} ${count}`);
      });
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────

async function main() {
  await seedResources();

  console.log("\n── Summary ──────────────────────────────");
  console.log(`   Processed: ${resources.length} resources`);
  console.log(`   Inserted:  ${inserted}`);
  console.log(`   Errors:    ${errors}`);

  await verifyInsert();
  console.log("\n🎉 Seed complete!\n");
}

main().catch(console.error);
