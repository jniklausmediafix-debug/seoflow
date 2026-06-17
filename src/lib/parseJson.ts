/**
 * Parses JSON from Claude output robustly.
 *
 * Use with prefill: pass `{ role: 'assistant', content: '{' }` as the last
 * message to Claude, then call parseClaudeJson('{' + raw).
 *
 * Handles:
 *  - Markdown code fences
 *  - Literal control characters inside strings (newlines, tabs, etc.)
 *  - Invalid backslash escape sequences (e.g. C:\Users)
 *  - Truncated JSON: removes last incomplete array/object item and closes open structures
 */
export function parseClaudeJson<T>(raw: string): T {
  let text = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  text = fixJsonStrings(text);

  try {
    return JSON.parse(text) as T;
  } catch {
    const recovered = recoverTruncated(text);
    return JSON.parse(recovered) as T;
  }
}

// ── Safe string-level fixes ───────────────────────────────────────────────────
// Only fixes things that are unambiguously wrong:
//   • literal control characters inside strings
//   • backslashes not followed by a valid JSON escape character

const VALID_ESCAPE = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u']);

function fixJsonStrings(input: string): string {
  let inString = false;
  let escaped = false;
  let result = '';
  const len = input.length;

  for (let i = 0; i < len; i++) {
    const ch = input[i];

    if (escaped) {
      if (inString && ch === 'u') {
        const hex = input.slice(i + 1, i + 5);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          result += ch + hex;
          i += 4;
        } else {
          // Malformed \uXXXX — escape the backslash
          result = result.slice(0, -1) + '\\\\u';
        }
      } else {
        result += ch;
      }
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      const next = input[i + 1];
      if (inString && (!next || !VALID_ESCAPE.has(next))) {
        // Invalid escape sequence → double the backslash
        result += '\\\\';
      } else {
        escaped = true;
        result += ch;
      }
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString) {
      const code = ch.charCodeAt(0);
      if (code < 0x20) {
        if      (code === 0x0A) result += '\\n';
        else if (code === 0x0D) result += '\\r';
        else if (code === 0x09) result += '\\t';
        else if (code === 0x08) result += '\\b';
        else if (code === 0x0C) result += '\\f';
        else result += `\\u${code.toString(16).padStart(4, '0')}`;
        continue;
      }
    }

    result += ch;
  }

  return result;
}

// ── Truncation recovery ───────────────────────────────────────────────────────

function recoverTruncated(text: string): string {
  let inString = false;
  let escaped = false;
  let lastSafeComma = -1;
  const stack: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && inString) { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === '{' || ch === '[') { stack.push(ch); }
    else if (ch === '}' || ch === ']') { stack.pop(); }
    else if (ch === ',' && stack.length >= 2) { lastSafeComma = i; }
  }

  if (stack.length === 0) return text;

  let truncated = lastSafeComma > 0 ? text.slice(0, lastSafeComma) : text;
  truncated = truncated.trimEnd().replace(/,$/, '');
  for (let i = stack.length - 1; i >= 0; i--) {
    truncated += stack[i] === '[' ? ']' : '}';
  }
  return truncated;
}
