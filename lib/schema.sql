-- Mirrors prisma/schema.prisma exactly. Used ONLY for local sandbox testing
-- where Prisma's engine binary can't be downloaded (see lib/db.ts). The
-- delivered app uses Prisma normally wherever it has internet access.

CREATE TABLE Employee (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  managerName TEXT,
  availabilityPct INTEGER NOT NULL DEFAULT 100,
  createdAt TEXT NOT NULL
);

CREATE TABLE Certification (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  partner TEXT NOT NULL,
  category TEXT NOT NULL,
  cost REAL NOT NULL,
  validityMonths INTEGER NOT NULL DEFAULT 24
);

CREATE TABLE EmployeeCertification (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL REFERENCES Employee(id),
  certificationId TEXT NOT NULL REFERENCES Certification(id),
  stage TEXT NOT NULL DEFAULT 'PLANNED',
  targetDate TEXT,
  certifiedDate TEXT,
  expiresOn TEXT,
  updatedAt TEXT NOT NULL,
  UNIQUE(employeeId, certificationId)
);

CREATE TABLE PartnerProgram (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  renewalDate TEXT
);

CREATE TABLE PartnerRequirement (
  id TEXT PRIMARY KEY,
  partnerProgramId TEXT NOT NULL REFERENCES PartnerProgram(id),
  certificationId TEXT NOT NULL REFERENCES Certification(id),
  minimumHeadcount INTEGER NOT NULL DEFAULT 1,
  lastReviewedAt TEXT
);

CREATE TABLE Opportunity (
  id TEXT PRIMARY KEY,
  clientName TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  revenueValue REAL NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE OpportunityRequirement (
  id TEXT PRIMARY KEY,
  opportunityId TEXT NOT NULL REFERENCES Opportunity(id),
  certificationName TEXT NOT NULL,
  countNeeded INTEGER NOT NULL
);

CREATE TABLE CertificationSpend (
  id TEXT PRIMARY KEY,
  certificationId TEXT NOT NULL REFERENCES Certification(id),
  quarter TEXT NOT NULL,
  totalSpend REAL NOT NULL
);

CREATE TABLE RevenueAttribution (
  id TEXT PRIMARY KEY,
  certificationId TEXT NOT NULL REFERENCES Certification(id),
  opportunityId TEXT REFERENCES Opportunity(id),
  revenueAmount REAL NOT NULL,
  method TEXT NOT NULL,
  quarter TEXT NOT NULL
);
