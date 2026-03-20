const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkGyms() {
  try {
    const gyms = await prisma.gym.findMany({
      select: { id: true, name: true, slug: true }
    });
    console.log("---- GENERIC GYM AUDIT ----");
    gyms.forEach(g => {
      console.log(`Name: "${g.name}" | Slug: "${g.slug}"`);
    });
    
    console.log("\n---- SEARCHING FOR 'fifa' ----");
    const fifaGyms = gyms.filter(g => g.slug.includes("fifa") || g.name.toLowerCase().includes("fifa"));
    if (fifaGyms.length === 0) {
      console.log("No gyms found matching 'fifa'.");
    } else {
      fifaGyms.forEach(g => {
        console.log(`MATCH FOUND: Name: "${g.name}" | Slug: "${g.slug}"`);
      });
    }
  } catch (err) {
    console.error("Database query failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkGyms();
