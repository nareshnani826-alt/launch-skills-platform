// Rule-based reading of a free-text client need into certifications from the catalog.
// No AI/API involved: each rule maps keywords to a certification by (part of) its name, so
// only certifications that actually exist in the catalog can ever be suggested.
// To swap in an LLM later, replace the body of interpretClientNeed and keep its signature.

type Rule = { cert: RegExp; keywords: string[] };

const RULES: Rule[] = [
  { cert: /^AZ-204$/i, keywords: ["azure", "cloud app", "app service", "serverless", "azure functions", "api", "microservice"] },
  { cert: /^AZ-400$/i, keywords: ["devops", "ci/cd", "cicd", "pipeline", "deployment", "release", "infrastructure"] },
  { cert: /^AI-102$/i, keywords: ["azure ai", "cognitive", "computer vision", "vision", "document intelligence", "ocr", "speech", "nlp", "azure openai"] },
  { cert: /fabric/i, keywords: ["fabric", "analytics", "lakehouse", "power bi", "reporting", "dashboard", "bi"] },
  { cert: /power platform/i, keywords: ["power platform", "power apps", "power automate", "low-code", "low code", "workflow", "citizen developer"] },
  { cert: /databricks data engineer/i, keywords: ["databricks", "spark", "data engineering", "data pipeline", "etl", "elt", "delta", "data platform", "data lake"] },
  { cert: /databricks machine learning/i, keywords: ["machine learning", "ml", "model training", "predictive", "forecast", "mlops", "recommendation"] },
  { cert: /databricks generative ai/i, keywords: ["generative ai", "genai", "gen ai", "llm", "rag", "retrieval", "chatbot", "copilot", "vector"] },
  { cert: /claude/i, keywords: ["claude", "anthropic", "llm", "generative ai", "genai", "chatbot", "assistant", "summariz"] },
  { cert: /agentic/i, keywords: ["agent", "agentic", "autonomous", "multi-agent", "automation", "orchestrat", "workflow automation"] },
  { cert: /mcp/i, keywords: ["mcp", "model context protocol", "tool integration", "connector", "tool use"] },
];

function keywordRegex(keyword: string): RegExp {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  // short tokens (ml, bi, api, rag...) must match as whole words; longer ones match as prefixes (agent -> agents)
  return new RegExp(keyword.length <= 3 ? `\\b${escaped}\\b` : `\\b${escaped}`, "i");
}

export type CertSuggestion = { name: string; matched: string[] };

export function interpretClientNeed(clientNeed: string, catalogNames: string[]): CertSuggestion[] {
  const text = clientNeed.trim();
  if (!text) return [];

  const suggestions: CertSuggestion[] = [];
  for (const name of catalogNames) {
    const rule = RULES.find((r) => r.cert.test(name));
    if (!rule) continue;
    const matched = rule.keywords.filter((k) => keywordRegex(k).test(text));
    if (matched.length) suggestions.push({ name, matched });
  }
  return suggestions.sort((a, b) => b.matched.length - a.matched.length || a.name.localeCompare(b.name));
}
