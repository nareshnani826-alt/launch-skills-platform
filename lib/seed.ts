// Sandbox-test seed script — mirrors prisma/seed.ts exactly, written against
// lib/db.ts (better-sqlite3) instead of Prisma. See lib/db.ts for why.
import { db, cuid } from "./db";

const now = new Date().toISOString();

function run() {
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

  const insertCert = db.prepare(
    "INSERT INTO Certification (id, name, partner, category, cost, validityMonths) VALUES (?, ?, ?, ?, ?, 24)"
  );
  const certByName: Record<string, string> = {};
  for (const c of certData) {
    const id = cuid();
    insertCert.run(id, c.name, c.partner, c.category, c.cost);
    certByName[c.name] = id;
  }

  const insertProgram = db.prepare("INSERT INTO PartnerProgram (id, name, tier, renewalDate) VALUES (?, ?, ?, ?)");
  const msId = cuid();
  insertProgram.run(msId, "Microsoft", "Solutions Partner - Data & AI", "2027-01-15");
  const anthropicId = cuid();
  insertProgram.run(anthropicId, "Anthropic", "Build Partner", "2027-03-01");
  const databricksId = cuid();
  insertProgram.run(databricksId, "Databricks", "Select Partner", "2026-12-01");

  const insertReq = db.prepare(
    "INSERT INTO PartnerRequirement (id, partnerProgramId, certificationId, minimumHeadcount) VALUES (?, ?, ?, ?)"
  );
  insertReq.run(cuid(), msId, certByName["AZ-204"], 4);
  insertReq.run(cuid(), msId, certByName["AZ-400"], 2);
  insertReq.run(cuid(), msId, certByName["AI-102"], 3);
  insertReq.run(cuid(), anthropicId, certByName["Claude Certified Developer"], 5);
  insertReq.run(cuid(), anthropicId, certByName["Agentic Development Certification"], 3);
  insertReq.run(cuid(), databricksId, certByName["Databricks Data Engineer Associate"], 3);
  insertReq.run(cuid(), databricksId, certByName["Databricks Machine Learning Associate"], 2);

  const names: [string, string, string, number][] = [
    ["Ananya Rao", "AI Engineer", "Hyderabad", 80],
    ["Vikram Shah", "Data Engineer", "Bengaluru", 60],
    ["Priya Menon", "Cloud Architect", "Hyderabad", 100],
    ["Rahul Verma", "AI Engineer", "Pune", 40],
    ["Sneha Iyer", "Data Engineer", "Hyderabad", 90],
    ["Arjun Nair", "DevOps Engineer", "Bengaluru", 100],
    ["Kavya Reddy", "AI Engineer", "Hyderabad", 20],
    ["Rohan Kapoor", "Solution Architect", "Mumbai", 70],
  ];
  const insertEmp = db.prepare(
    "INSERT INTO Employee (id, name, role, location, availabilityPct, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const employeeIds: { id: string; name: string }[] = [];
  for (const [name, role, location, availabilityPct] of names) {
    const id = cuid();
    insertEmp.run(id, name, role, location, availabilityPct, now);
    employeeIds.push({ id, name });
  }

  const stageCycle = ["PLANNED", "REGISTERED", "IN_LEARNING", "EXAM_SCHEDULED", "CERTIFIED", "RENEWAL_DUE"];
  const insertEc = db.prepare(
    `INSERT INTO EmployeeCertification (id, employeeId, certificationId, stage, targetDate, certifiedDate, expiresOn, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  let i = 0;
  for (const emp of employeeIds) {
    for (const certName of ["AZ-204", "Claude Certified Developer", "Databricks Data Engineer Associate"]) {
      const stage = stageCycle[i % stageCycle.length];
      i++;
      const certifiedDate = stage === "CERTIFIED" || stage === "RENEWAL_DUE" ? "2026-03-01" : null;
      const targetDate = stage !== "CERTIFIED" ? "2026-11-30" : null;
      const expiresOn = certifiedDate ? "2028-03-01" : null;
      insertEc.run(cuid(), emp.id, certByName[certName], stage, targetDate, certifiedDate, expiresOn, now);
    }
  }

  const insertOpp = db.prepare("INSERT INTO Opportunity (id, clientName, status, revenueValue, createdAt) VALUES (?, ?, ?, ?, ?)");
  const insertOppReq = db.prepare(
    "INSERT INTO OpportunityRequirement (id, opportunityId, certificationName, countNeeded) VALUES (?, ?, ?, ?)"
  );
  const opp1 = cuid();
  insertOpp.run(opp1, "Meridian Retail Group", "OPEN", 420000, now);
  insertOppReq.run(cuid(), opp1, "Claude Certified Developer", 2);
  insertOppReq.run(cuid(), opp1, "Databricks Data Engineer Associate", 1);
  insertOppReq.run(cuid(), opp1, "AZ-204", 1);

  const opp2 = cuid();
  insertOpp.run(opp2, "Northbridge Logistics", "WON", 250000, now);
  insertOppReq.run(cuid(), opp2, "Databricks Data Engineer Associate", 1);

  const insertSpend = db.prepare("INSERT INTO CertificationSpend (id, certificationId, quarter, totalSpend) VALUES (?, ?, ?, ?)");
  insertSpend.run(cuid(), certByName["Databricks Data Engineer Associate"], "2026-Q3", 4000);
  insertSpend.run(cuid(), certByName["Claude Certified Developer"], "2026-Q3", 2000);
  insertSpend.run(cuid(), certByName["AZ-204"], "2026-Q3", 6000);

  const insertRev = db.prepare(
    "INSERT INTO RevenueAttribution (id, certificationId, opportunityId, revenueAmount, method, quarter) VALUES (?, ?, ?, ?, ?, ?)"
  );
  insertRev.run(cuid(), certByName["Databricks Data Engineer Associate"], opp2, 250000, "required-skill-on-won-deal", "2026-Q3");
  insertRev.run(cuid(), certByName["Claude Certified Developer"], opp1, 180000, "required-skill-on-open-deal-pro-rated", "2026-Q3");
  insertRev.run(cuid(), certByName["AZ-204"], null, 400000, "practice-capability-unlock", "2026-Q3");

  console.log("Sandbox-test seed complete.");
}

run();
