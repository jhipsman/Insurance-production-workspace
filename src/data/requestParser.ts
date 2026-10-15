export function suggestedRequestLines(body: string): string[] {
  return body
    .replace(/\r/g, '')
    .split(/\n|;|(?:,\s+and\s+)|(?:,\s+(?=(?:updated|completed|confirmation|current|five-year|signed)\b))/i)
    .map(line => line.replace(/^(please (?:provide|send)|provide|we need|and)\s+/i, '').replace(/[.]+$/, '').trim())
    .filter(line => line.length >= 8 && !/^(hi|hello|thank|regards|subject:)/i.test(line))
    .slice(0, 12)
}
