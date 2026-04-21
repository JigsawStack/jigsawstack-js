export class Stitcher {
  private prevTranscript = "";

  preview(current: string): string {
    return stitch(this.prevTranscript, current);
  }

  commit(current: string): string {
    const stitched = stitch(this.prevTranscript, current);
    this.prevTranscript = current;
    return stitched;
  }

  reset(): void {
    this.prevTranscript = "";
  }
}

function stitch(prev: string, current: string): string {
  if (!prev || !current) return current;
  const prevTokens = tokenize(prev);
  const curTokens = tokenize(current);
  const overlap = findTokenOverlap(prevTokens, curTokens);
  if (overlap > 0) {
    const cutPos = findCutPosition(current, curTokens, overlap);
    if (cutPos === -1) return "";
    return current.slice(cutPos).trimStart();
  }
  return current;
}

/**
 * Find the position in `current` immediately after the alphanumeric core of the
 * last overlap token. This preserves trailing punctuation that belongs to the
 * non-overlapping remainder (e.g. "world," → cut after "world", keeping ",").
 */
function findCutPosition(current: string, curTokens: string[], overlap: number): number {
  // Walk through the string, skipping whitespace between tokens, to find where
  // the overlap-th token's alphanumeric core ends.
  let pos = 0;
  for (let i = 0; i < overlap; i++) {
    // Skip leading whitespace
    while (pos < current.length && /\s/.test(current[pos])) pos++;
    const token = curTokens[i];
    // Find the alphanumeric core of this token (strip leading/trailing non-alnum)
    const coreMatch = token.match(/^[^a-zA-Z0-9]*([a-zA-Z0-9].*?[a-zA-Z0-9]|[a-zA-Z0-9])[^a-zA-Z0-9]*$/);
    const core = coreMatch ? coreMatch[1] : token;
    // Find core in current string starting from pos
    const coreIdx = current.indexOf(core, pos);
    if (coreIdx === -1) {
      // Fall back: skip the whole token length
      pos += token.length;
    } else {
      // Advance pos to end of core
      pos = coreIdx + core.length;
    }
  }
  if (pos >= current.length) return -1;
  return pos;
}

function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function fuzzyTokenMatch(a: string, b: string): boolean {
  const na = normalizeToken(a);
  const nb = normalizeToken(b);
  if (na === nb) return true;
  if (na.length < 4 || nb.length < 4) return false;
  if (Math.abs(na.length - nb.length) > 1) return false;
  if (na.length === nb.length) {
    let diffs = 0;
    for (let i = 0; i < na.length; i++) if (na[i] !== nb[i]) diffs++;
    return diffs <= 1;
  }
  const [short, long] = na.length < nb.length ? [na, nb] : [nb, na];
  let diffs = 0;
  let si = 0;
  let li = 0;
  while (si < short.length && li < long.length) {
    if (short[si] !== long[li]) {
      diffs++;
      li++;
    } else {
      si++;
      li++;
    }
  }
  return diffs + (long.length - li) <= 1;
}

function findTokenOverlap(prevTokens: string[], curTokens: string[]): number {
  const max = Math.min(prevTokens.length, curTokens.length);
  for (let overlap = max; overlap > 0; overlap--) {
    const prevSlice = prevTokens.slice(-overlap);
    const curSlice = curTokens.slice(0, overlap);
    if (prevSlice.every((t, i) => fuzzyTokenMatch(t, curSlice[i]))) return overlap;
  }
  return 0;
}
