import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debug() {
  const gyms = await prisma.gym.findMany({
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  });

  console.log("Total Gyms:", gyms.length);
  gyms.forEach(gym => {
    console.log(`\nGym: ${gym.name} (Slug: ${gym.slug})`);
    console.log("Members:");
    gym.members.forEach(member => {
      console.log(`- ${member.user.name} (${member.userId}) | Role: ${member.role} | Status: ${member.status}`);
    });
  });
}

debug()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
