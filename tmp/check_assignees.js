
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const taskAssignees = await prisma.taskAssignee.findMany({
    include: {
      task: true,
      user: true
    }
  });
  console.log(JSON.stringify(taskAssignees, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
