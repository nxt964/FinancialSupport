// prisma/seed.ts
import axios from "axios";
import "dotenv/config";

async function main() {
  const baseUrl = process.env.SEED_CRAWL_URL ?? "http://localhost:3000/crawl";

  // e.g. crawl first 20 pages
  for (let page = 31; page <= 100; page++) {
    console.log(`🔎 Requesting crawl for page ${page}...`);
    try {
      const res = await axios.post(`${baseUrl}?page=${page}`);
      console.log(res.data);
    } catch (err: any) {
      console.error(`❌ Failed to crawl page ${page}:`, err.message);
    }
  }

  console.log("✅ Seeding complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
