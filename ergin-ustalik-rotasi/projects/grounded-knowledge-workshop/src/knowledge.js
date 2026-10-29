const STOP_WORDS = new Set(["ve", "bir", "ile", "icin", "nasil", "nedir", "bu", "da", "de", "the", "of", "to", "a", "is"]);

export function tokenize(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^\p{L}\p{N}_]+/u)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

export function findSources(query, sources, limit = 3) {
  const terms = [...new Set(tokenize(query))];
  if (!terms.length || !Array.isArray(sources) || !Number.isInteger(limit) || limit < 1) return [];
  return sources.map((source) => {
    const haystack = tokenize([source.title, source.text, source.id].join(" "));
    const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
    return { ...source, score, matchedTerms: terms.filter((term) => haystack.includes(term)) };
  }).filter((source) => source.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function groundedAnswer(query, sources, limit = 3) {
  const hits = findSources(query, sources, limit);
  if (!hits.length) return {
    schemaVersion: "1.0", status: "insufficient_evidence",
    answer: "Bu örnek kaynak kümesinde soruyu destekleyen yeterli kanıt bulunamadı.",
    citations: [], retrievedCount: 0
  };
  const evidence = hits.map((source) => ({ id: source.id, title: source.title, url: source.url, excerpt: source.text }));
  return {
    schemaVersion: "1.0", status: "grounded",
    answer: evidence.map((item) => item.excerpt).join("\n\n"),
    citations: evidence.map(({ id, title, url }) => ({ id, title, url })),
    retrievedCount: hits.length
  };
}

export function validateAnswerShape(answer) {
  if (!answer || typeof answer !== "object" || answer.schemaVersion !== "1.0") return false;
  if (!["grounded", "insufficient_evidence"].includes(answer.status)) return false;
  if (typeof answer.answer !== "string" || !Array.isArray(answer.citations)) return false;
  if (!Number.isInteger(answer.retrievedCount) || answer.retrievedCount < 0) return false;
  if (answer.status === "insufficient_evidence" && answer.citations.length !== 0) return false;
  return answer.citations.every((citation) =>
    typeof citation.id === "string" && typeof citation.title === "string" &&
    typeof citation.url === "string" && /^https:\/\//.test(citation.url)
  );
}

export function evaluateQuery(query, sources, expectedSourceIds) {
  const answer = groundedAnswer(query, sources);
  const actual = new Set(answer.citations.map((citation) => citation.id));
  const expected = new Set(expectedSourceIds);
  const hits = [...expected].filter((id) => actual.has(id)).length;
  return {
    query, validShape: validateAnswerShape(answer), expectedSourceCount: expected.size,
    matchedExpectedSourceCount: hits, sourceRecall: expected.size ? hits / expected.size : 1,
    grounded: answer.status === "grounded"
  };
}
