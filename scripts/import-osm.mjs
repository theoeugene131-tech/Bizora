/**
 * Bulk-import real businesses from OpenStreetMap into Supabase.
 *
 * OpenStreetMap's data license (ODbL) explicitly permits bulk export and
 * reuse — unlike Google's Places data, which its Terms of Service forbid
 * you from scraping or bulk-storing. This is the legal way to seed your
 * directory with real, popular businesses without typing them one by one.
 *
 * USAGE
 *   node scripts/import-osm.mjs
 *   node scripts/import-osm.mjs --status=pending      (import as pending instead of approved)
 *   node scripts/import-osm.mjs --cities="Lagos,Kano"  (override the default city list)
 *
 * REQUIRES
 *   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment
 *   (the service role key bypasses RLS so the import can write directly —
 *   never expose that key in the browser, only run this script locally)
 *
 * WHAT IT DOES
 *   1. Queries the free Overpass API (OpenStreetMap) for shops/restaurants/
 *      services in each city
 *   2. Maps OSM's tags onto your existing category list
 *   3. Slugifies each business name (adding city for uniqueness)
 *   4. Inserts into your `businesses` table, skipping anything whose slug
 *      already exists (safe to re-run)
 */

import { createClient } from "@supabase/supabase-js";

// ---- CONFIG -----------------------------------------------------------

// Bounding boxes (south, west, north, east) instead of administrative area
// name lookups. Name-based lookups (e.g. area["name"="Lagos"]) are unreliable
// in OpenStreetMap — "Lagos" without "State" often fails to match a clean
// boundary polygon, and some city names collide with places in other
// countries. Fixed bounding boxes are slower to get "just right" but always
// return results, and are what we verified working in overpass-turbo.eu.
const DEFAULT_CITIES = [
  { name: "Lagos", state: "Lagos", bbox: [6.39, 3.05, 6.70, 3.63] },
  { name: "Abuja", state: "Abuja (FCT)", bbox: [8.80, 6.90, 9.28, 7.55] },
  { name: "Port Harcourt", state: "Rivers", bbox: [4.70, 6.90, 4.95, 7.15] },
  { name: "Kano", state: "Kano", bbox: [11.85, 8.40, 12.10, 8.65] },
  { name: "Ibadan", state: "Oyo", bbox: [7.28, 3.80, 7.55, 4.10] },
];

// Maps OSM tag values -> your data/categories.js list, grouped by the OSM
// key they actually appear under (shop=, amenity=, or office=). Grouping
// this way keeps the Overpass query small (3 filters instead of dozens),
// which matters — oversized queries are more likely to be rejected by the
// free public servers.
const SHOP_CATEGORY_MAP = {
  clothes: "Fashion",
  boutique: "Fashion",
  shoes: "Fashion",
  fashion: "Fashion",
  jewelry: "Fashion",
  bag: "Fashion",
  bakery: "Food & Restaurant",
  electronics: "Tech & Electronics",
  computer: "Tech & Electronics",
  mobile_phone: "Tech & Electronics",
  hairdresser: "Beauty & Cosmetics",
  beauty: "Beauty & Cosmetics",
  cosmetics: "Beauty & Cosmetics",
  car: "Automobiles",
  car_repair: "Automobiles",
  car_parts: "Automobiles",
  motorcycle: "Automobiles",
};

const AMENITY_CATEGORY_MAP = {
  restaurant: "Food & Restaurant",
  fast_food: "Food & Restaurant",
  cafe: "Food & Restaurant",
  bar: "Food & Restaurant",
  pharmacy: "Health & Wellness",
  clinic: "Health & Wellness",
  hospital: "Health & Wellness",
  dentist: "Health & Wellness",
  doctors: "Health & Wellness",
  school: "Education",
  college: "Education",
  language_school: "Education",
};

const OFFICE_CATEGORY_MAP = {
  estate_agent: "Real Estate",
  real_estate_agent: "Real Estate",
};

// Combined, for looking up a category once we know an element's tag value
// regardless of which OSM key it came from.
const CATEGORY_MAP = { ...SHOP_CATEGORY_MAP, ...AMENITY_CATEGORY_MAP, ...OFFICE_CATEGORY_MAP };

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

// ---- HELPERS ------------------------------------------------------------

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? true];
    })
  );
  // --cities only filters the DEFAULT_CITIES list by name (bbox comes from
  // the list above) since a raw city name alone can't be turned into a
  // reliable bounding box automatically.
  const cities = args.cities
    ? DEFAULT_CITIES.filter((c) =>
        args.cities.split(",").map((s) => s.trim().toLowerCase()).includes(c.name.toLowerCase())
      )
    : DEFAULT_CITIES;
  const status = args.status === "pending" ? "pending" : "approved";
  return { cities, status };
}

function buildQuery(bbox) {
  const [south, west, north, east] = bbox;
  const bboxStr = `${south},${west},${north},${east}`;

  // One filter per OSM key (shop/amenity/office), using a regex alternation
  // to match any of our known values in a single filter — much smaller and
  // faster than a separate filter per value.
  const shopValues = Object.keys(SHOP_CATEGORY_MAP).join("|");
  const amenityValues = Object.keys(AMENITY_CATEGORY_MAP).join("|");
  const officeValues = Object.keys(OFFICE_CATEGORY_MAP).join("|");

  return `[out:json][timeout:25];(node["shop"~"^(${shopValues})$"](${bboxStr});node["amenity"~"^(${amenityValues})$"](${bboxStr});node["office"~"^(${officeValues})$"](${bboxStr}););out center;`;
}

async function fetchCityBusinesses(bbox) {
  const query = buildQuery(bbox);

  // Try each mirror in turn; within each mirror, retry once after a short
  // wait if the server reports it's too busy (a very common, transient
  // condition on the free public Overpass servers — not a bug in the query).
  for (const url of OVERPASS_URLS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            // Overpass servers require a descriptive User-Agent identifying
            // the tool making the request — requests without one are often
            // rejected outright (this is what caused earlier 406 errors).
            "User-Agent": "BizoraDirectoryImport/1.0 (contact: hello@bizora.co)",
            Accept: "application/json",
          },
          body: query,
        });

        if (res.ok) {
          const json = await res.json();
          return json.elements ?? [];
        }

        const text = await res.text().catch(() => "");
        const busy = /too busy|timeout/i.test(text);
        console.error(
          `  ✗ ${url} returned ${res.status}${busy ? " (server busy)" : ""} — ${
            attempt === 1 ? "retrying in 10s..." : "trying next mirror..."
          }`
        );
      } catch (err) {
        console.error(`  ✗ ${url} failed: ${err.message} — ${attempt === 1 ? "retrying in 10s..." : "trying next mirror..."}`);
      }
      if (attempt === 1) await new Promise((r) => setTimeout(r, 10000));
    }
  }

  console.error("  ✗ All Overpass mirrors failed for this city. Skipping — you can rerun the script later, it's safe to repeat.");
  return [];
}

function mapElement(el, city, state) {
  const tags = el.tags ?? {};
  const name = tags.name;
  if (!name) return null;

  const rawTag = tags.shop ?? tags.amenity ?? tags.office;
  const category = CATEGORY_MAP[rawTag];
  if (!category) return null;

  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) return null;

  const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");

  return {
    slug: `${slugify(name)}-${slugify(city)}-${el.id}`,
    name,
    category,
    description: "",
    street: street || "",
    city,
    state,
    country: "ng",
    phone: tags.phone ?? tags["contact:phone"] ?? "",
    email: tags.email ?? tags["contact:email"] ?? "",
    website: tags.website ?? tags["contact:website"] ?? "",
    lat,
    lng,
  };
}

// ---- MAIN -----------------------------------------------------------------

async function main() {
  const { cities, status } = parseArgs();

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY in your environment."
    );
    process.exit(1);
  }
  const supabase = createClient(url, key);

  console.log(`Importing businesses as "${status}" for: ${cities.map((c) => c.name).join(", ")}\n`);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const { name: cityName, state, bbox } of cities) {
    console.log(`→ Fetching ${cityName}...`);
    const elements = await fetchCityBusinesses(bbox);
    console.log(`  Found ${elements.length} raw OSM points`);

    const rows = elements
      .map((el) => mapElement(el, cityName, state))
      .filter(Boolean)
      .map((row) => ({ ...row, status, terms_accepted_at: null, submitter_email: "" }));

    console.log(`  ${rows.length} match a known category`);

    if (rows.length === 0) continue;

    // Insert in batches, ignoring duplicates on slug (safe to re-run)
    const BATCH = 200;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const { data, error } = await supabase
        .from("businesses")
        .upsert(batch, { onConflict: "slug", ignoreDuplicates: true })
        .select("id");

      if (error) {
        console.error(`  ✗ Insert error: ${error.message}`);
        continue;
      }
      totalInserted += data?.length ?? 0;
      totalSkipped += batch.length - (data?.length ?? 0);
    }

    console.log(`  ✓ Done with ${cityName}\n`);
    // Be polite to the free Overpass API between cities
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\nImport complete. Inserted ${totalInserted} new businesses (${totalSkipped} already existed).`);
  if (status === "approved") {
    console.log("They are live on your site now. Spot-check a few before heavy promotion.");
  } else {
    console.log("They are pending — review and approve them from /admin.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
