import { PrismaClient, PipelineStage } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding sample data...");

  // --- Initial admin login (from env, so it's set per-environment) ---
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminUsername && adminPassword) {
    await prisma.user.upsert({
      where: { username: adminUsername },
      update: {},
      create: { username: adminUsername, passwordHash: hashPassword(adminPassword), role: "ADMIN" },
    });
    console.log(`Admin login ready: ${adminUsername}`);
  } else {
    console.warn("ADMIN_USERNAME/ADMIN_PASSWORD not set — skipping admin account creation.");
  }

  // --- Certifications (catalog from the client brief) ---
  const certData = [
    { name: "AZ-204", partner: "Microsoft", category: "Associate Developer", cost: 165 },
    { name: "AZ-400", partner: "Microsoft", category: "Associate DevOps", cost: 165 },
    { name: "AI-102", partner: "Microsoft", category: "Associate AI Engineer", cost: 165 },
    { name: "Fabric Analytics Engineer", partner: "Microsoft", category: "Fabric", cost: 165 },
    { name: "Power Platform Solution Architect", partner: "Microsoft", category: "Power Platform", cost: 165 },
    { name: "Databricks Data Engineer Associate", partner: "Databricks", category: "Data Engineer", cost: 200 },
    { name: "Databricks Machine Learning Associate", partner: "Databricks", category: "Machine Learning", cost: 200 },
    { name: "Databricks Generative AI Associate", partner: "Databricks", category: "Generative AI", cost: 200 },
    { name: "Claude Certified Developer", partner: "Anthropic", category: "Claude Certifications", cost: 150 },
    { name: "Agentic Development Certification", partner: "Anthropic", category: "Agentic Development", cost: 150 },
    { name: "MCP Practitioner", partner: "Anthropic", category: "MCP", cost: 150 },
    { name: "FDE/FDP Readiness", partner: "Anthropic", category: "FDE/FDP Readiness", cost: 0 },
  ];
  const certs = await Promise.all(
    certData.map((c) => prisma.certification.create({ data: c }))
  );
  const certByName = Object.fromEntries(certs.map((c) => [c.name, c]));

  // --- Partner programs + requirements ---
  const ms = await prisma.partnerProgram.create({
    data: { name: "Microsoft", tier: "Solutions Partner - Data & AI", renewalDate: new Date("2027-01-15") },
  });
  const anthropic = await prisma.partnerProgram.create({
    data: { name: "Anthropic", tier: "Build Partner", renewalDate: new Date("2027-03-01") },
  });
  const databricks = await prisma.partnerProgram.create({
    data: { name: "Databricks", tier: "Select Partner", renewalDate: new Date("2026-12-01") },
  });

  await prisma.partnerRequirement.createMany({
    data: [
      { partnerProgramId: ms.id, certificationId: certByName["AZ-204"].id, minimumHeadcount: 4 },
      { partnerProgramId: ms.id, certificationId: certByName["AZ-400"].id, minimumHeadcount: 2 },
      { partnerProgramId: ms.id, certificationId: certByName["AI-102"].id, minimumHeadcount: 3 },
      { partnerProgramId: anthropic.id, certificationId: certByName["Claude Certified Developer"].id, minimumHeadcount: 5 },
      { partnerProgramId: anthropic.id, certificationId: certByName["Agentic Development Certification"].id, minimumHeadcount: 3 },
      { partnerProgramId: databricks.id, certificationId: certByName["Databricks Data Engineer Associate"].id, minimumHeadcount: 3 },
      { partnerProgramId: databricks.id, certificationId: certByName["Databricks Machine Learning Associate"].id, minimumHeadcount: 2 },
    ],
  });

  // --- Employees ---
  const names = [
    ["Ananya Rao", "AI Engineer", "Hyderabad", 80],
    ["Vikram Shah", "Data Engineer", "Bengaluru", 60],
    ["Priya Menon", "Cloud Architect", "Hyderabad", 100],
    ["Rahul Verma", "AI Engineer", "Pune", 40],
    ["Sneha Iyer", "Data Engineer", "Hyderabad", 90],
    ["Arjun Nair", "DevOps Engineer", "Bengaluru", 100],
    ["Kavya Reddy", "AI Engineer", "Hyderabad", 20],
    ["Rohan Kapoor", "Solution Architect", "Mumbai", 70],
  ] as const;
  const employees = await Promise.all(
    names.map(([name, role, location, availabilityPct]) =>
      prisma.employee.create({ data: { name, role, location, availabilityPct } })
    )
  );

  // --- Pipeline entries: a spread across every stage ---
  const stageCycle: PipelineStage[] = [
    "PLANNED",
    "REGISTERED",
    "IN_LEARNING",
    "EXAM_SCHEDULED",
    "CERTIFIED",
    "RENEWAL_DUE",
  ];
  let i = 0;
  for (const emp of employees) {
    for (const certName of ["AZ-204", "Claude Certified Developer", "Databricks Data Engineer Associate"]) {
      const stage = stageCycle[i % stageCycle.length];
      i++;
      const certifiedDate = stage === "CERTIFIED" || stage === "RENEWAL_DUE" ? new Date("2026-03-01") : null;
      await prisma.employeeCertification.create({
        data: {
          employeeId: emp.id,
          certificationId: certByName[certName].id,
          stage,
          targetDate: stage !== "CERTIFIED" ? new Date("2026-11-30") : null,
          certifiedDate,
          expiresOn: certifiedDate ? new Date("2028-03-01") : null,
        },
      });
    }
  }

  // --- Opportunities ---
  const opp1 = await prisma.opportunity.create({
    data: { clientName: "Meridian Retail Group", status: "OPEN", revenueValue: 420000 },
  });
  await prisma.opportunityRequirement.createMany({
    data: [
      { opportunityId: opp1.id, certificationName: "Claude Certified Developer", countNeeded: 2 },
      { opportunityId: opp1.id, certificationName: "Databricks Data Engineer Associate", countNeeded: 1 },
      { opportunityId: opp1.id, certificationName: "AZ-204", countNeeded: 1 },
    ],
  });

  const opp2 = await prisma.opportunity.create({
    data: { clientName: "Northbridge Logistics", status: "WON", revenueValue: 250000 },
  });
  await prisma.opportunityRequirement.createMany({
    data: [{ opportunityId: opp2.id, certificationName: "Databricks Data Engineer Associate", countNeeded: 1 }],
  });

  // --- Spend + revenue attribution (illustrates the ROI methodology) ---
  await prisma.certificationSpend.createMany({
    data: [
      { certificationId: certByName["Databricks Data Engineer Associate"].id, quarter: "2026-Q3", totalSpend: 4000 },
      { certificationId: certByName["Claude Certified Developer"].id, quarter: "2026-Q3", totalSpend: 2000 },
      { certificationId: certByName["AZ-204"].id, quarter: "2026-Q3", totalSpend: 6000 },
    ],
  });
  await prisma.revenueAttribution.createMany({
    data: [
      {
        certificationId: certByName["Databricks Data Engineer Associate"].id,
        opportunityId: opp2.id,
        revenueAmount: 250000,
        method: "required-skill-on-won-deal",
        quarter: "2026-Q3",
      },
      {
        certificationId: certByName["Claude Certified Developer"].id,
        opportunityId: opp1.id,
        revenueAmount: 180000,
        method: "required-skill-on-open-deal-pro-rated",
        quarter: "2026-Q3",
      },
      {
        certificationId: certByName["AZ-204"].id,
        opportunityId: null,
        revenueAmount: 400000,
        method: "practice-capability-unlock",
        quarter: "2026-Q3",
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
