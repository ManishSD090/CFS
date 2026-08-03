import prisma, { disconnectDatabase } from './src/config/database.js';


async function main() {
  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: 'harsh',
        mode: 'insensitive',
      }
    },
    include: {
      company: true
    }
  });
  console.log("Found users:", users.map(u => ({ id: u.id, name: u.name, companyId: u.companyId })));
  
  if (users.length > 0) {
    const user = users[0];
    if (user.companyId) {
      console.log(`Creating project for companyId: ${user.companyId}`);
      const project = await prisma.project.create({
        data: {
          projectId: 'PRJ-' + Math.floor(Math.random() * 10000),
          companyId: user.companyId,
          name: 'Construction Project Alpha',
          description: 'A newly created construction project.',
          location: 'Mumbai, India',
          latitude: 19.0760,
          longitude: 72.8777,
          estimatedBudget: 5000000,
          startDate: new Date(),
          estimatedEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          createdById: user.id
        }
      });
      console.log("Project created successfully:", project);
    } else {
        console.log("User does not belong to a company, trying to find any company.");
        const company = await prisma.company.findFirst();
        if (company) {
            console.log(`Creating project for companyId: ${company.id}`);
            const project = await prisma.project.create({
                data: {
                projectId: 'PRJ-' + Math.floor(Math.random() * 10000),
                companyId: company.id,
                name: 'Construction Project Alpha',
                description: 'A newly created construction project.',
                location: 'Mumbai, India',
                latitude: 19.0760,
                longitude: 72.8777,
                estimatedBudget: 5000000,
                startDate: new Date(),
                estimatedEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                createdById: user.id
                }
            });
            console.log("Project created successfully:", project);
        } else {
            console.log("No company found.");
        }
    }
  } else {
    console.log("No user found containing 'harsh'");
    // Just find any company and create a project
    const company = await prisma.company.findFirst();
    const user = await prisma.user.findFirst();
    if (company) {
        console.log(`Creating project for companyId: ${company.id}`);
        const project = await prisma.project.create({
            data: {
            projectId: 'PRJ-' + Math.floor(Math.random() * 10000),
            companyId: company.id,
            name: 'Construction Project Alpha',
            description: 'A newly created construction project.',
            location: 'Mumbai, India',
            latitude: 19.0760,
            longitude: 72.8777,
            estimatedBudget: 5000000,
            startDate: new Date(),
            estimatedEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            createdById: user ? user.id : null
            }
        });
        console.log("Project created successfully:", project);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDatabase();
  });
