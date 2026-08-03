import prisma, { disconnectDatabase } from './src/config/database.js';

async function main() {
  const users = await prisma.user.findMany({
    where: { name: { contains: 'harsh', mode: 'insensitive' } },
    include: { company: true }
  });

  if (users.length === 0) {
    console.log("No user found containing 'harsh'");
    return;
  }
  const user = users[0];
  if (!user.companyId) {
    console.log("User does not belong to a company");
    return;
  }

  const project = await prisma.project.findFirst({
    where: { 
      name: { contains: 'Construction Project Alpha' },
      companyId: user.companyId 
    }
  });

  if (!project) {
    console.log("Project not found!");
    return;
  }

  console.log(`Found Project: ${project.name} (${project.id}) for User: ${user.name}`);

  // 1. Create a Subcontractor
  const contractor = await prisma.contractor.create({
    data: {
      company: { connect: { id: user.companyId } },
      contractorId: 'SUB-' + Math.floor(Math.random() * 10000),
      name: 'Alpha Builders Subcontractor',
      type: 'LABOR',
      phone: '98765' + Math.floor(Math.random() * 100000), // Random phone to avoid unique constraint
      email: 'alpha.sub@example.com',
      contactPerson: 'Mr. Alpha',
      createdBy: { connect: { id: user.id } }
    }
  }).catch(e => { console.log('Contractor error:', e.message); return prisma.contractor.findFirst({ where: { companyId: user.companyId }}) });
  console.log("Created/Found Subcontractor:", contractor?.id);

  // 2. Create Timeline
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 28); // 4 weeks

  const currentVersion = Math.floor(Math.random() * 10000); // Random version to avoid unique constraint
  const timeline = await prisma.timeline.create({
    data: {
      project: { connect: { id: project.id } },
      name: '4-Week Initial Phase Timeline',
      startDate: startDate,
      endDate: endDate,
      currentVersion: currentVersion,
      createdBy: { connect: { id: user.id } }
    }
  }).catch(e => { console.log('Timeline error:', e.message); return prisma.timeline.findFirst({ where: { projectId: project.id }}) });
  console.log("Created/Found Timeline:", timeline?.id);

  // 3. Create Task
  const task = await prisma.task.create({
    data: {
      project: { connect: { id: project.id } },
      title: 'Site Preparation',
      description: 'Clear the site and set up initial boundaries.',
      status: 'TODO',
      priority: 'HIGH',
      startDate: startDate,
      dueDate: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      creator: { connect: { id: user.id } }
    }
  }).catch(e => { console.log('Task error:', e.message); return prisma.task.findFirst({ where: { projectId: project.id }}) });
  console.log("Created/Found Task:", task?.id);

  // 4. Create DPR
  const dpr = await prisma.dailyProgressReport.create({
    data: {
      project: { connect: { id: project.id } },
      date: new Date(),
      reportNo: 'DPR-' + Math.floor(Math.random() * 10000),
      weather: 'Sunny',
      temperature: '30',
      workDescription: 'Site clearing started.',
      preparedBy: { connect: { id: user.id } }
    }
  }).catch(e => { console.log('DPR error:', e.message); return prisma.dailyProgressReport.findFirst({ where: { projectId: project.id }}) });
  console.log("Created/Found DPR:", dpr?.id);

  // 5. Create Transaction
  const transaction = await prisma.transaction.create({
    data: {
      company: { connect: { id: user.companyId } },
      project: { connect: { id: project.id } },
      transactionNo: 'TXN-' + Math.floor(Math.random() * 10000),
      amount: 50000,
      totalAmount: 50000,
      type: 'EXPENSE',
      transactionDate: new Date(),
      description: 'Initial site setup cost',
      status: 'APPROVED',
      requestedBy: { connect: { id: user.id } }
    }
  }).catch(e => { console.log('Transaction error:', e.message); return prisma.transaction.findFirst({ where: { projectId: project.id }}) });
  console.log("Created/Found Transaction:", transaction?.id);

  // 6. Create Material & Inventory
  let material = await prisma.material.findFirst({ where: { companyId: user.companyId, name: 'Cement Bags' } });
  if (!material) {
    material = await prisma.material.create({
      data: {
        company: { connect: { id: user.companyId } },
        name: 'Cement Bags',
        unit: 'Bags',
        minimumStock: 50,
        unitPrice: 450
      }
    });
  }

  const inventory = await prisma.inventory.create({
    data: {
      company: { connect: { id: user.companyId } },
      project: { connect: { id: project.id } },
      material: { connect: { id: material.id } },
      quantityTotal: 500,
      quantityAvailable: 500,
      averageRate: 450,
      totalValue: 500 * 450
    }
  }).catch(e => { console.log('Inventory error:', e.message); return prisma.inventory.findFirst({ where: { projectId: project.id }}) });
  console.log("Created/Found Inventory:", inventory?.id);

  console.log("Successfully seeded project data!");
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await disconnectDatabase();
  });
