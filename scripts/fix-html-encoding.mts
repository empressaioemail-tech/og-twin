#!/usr/bin/env node
/**
 * fix-html-encoding.mts
 * 
 * Fixes UTF-8 encoding issues in index.html where special characters
 * are being misinterpreted as control characters.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const indexPath = join(process.cwd(), 'index.html');
const content = readFileSync(indexPath, 'utf-8');

console.log('Fixing HTML encoding issues...');

// Replace problematic UTF-8 sequences with their proper characters
let fixed = content;

// Common UTF-8 misinterpretations
const replacements: [RegExp, string][] = [
  // Left arrow: â†  or Ã¢Â†Â or similar → ←
  [/Ã¢Â†Â|â†/g, '←'],
  // Right arrow: â†' or Ã¢Â†Â' → →
  [/Ã¢Â†Â'|â†'/g, '→'],
  // Middle dot / interpunct: Â· or Ã‚Â· → ·
  [/Â·|Ã‚Â·/g, '·'],
  // Em dash: â€" or Ã¢Â€Â" → —
  [/Ã¢Â€Â"|â€"/g, '—'],
  // En dash: â€" or Ã¢Â€Â" → –
  [/Ã¢Â€Â"|â€"/g, '–'],
  // Check mark: âœ" or Ã¢ÂœÂ" → ✓
  [/Ã¢ÂœÂ"|âœ"/g, '✓'],
  // Bullet: â€¢ or Ã¢Â€Â¢ → •
  [/Ã¢Â€Â¢|â€¢/g, '•'],
];

let changeCount = 0;
for (const [pattern, replacement] of replacements) {
  const before = fixed;
  fixed = fixed.replace(pattern, replacement);
  const changes = (before.length - fixed.length) / (pattern.source.length - replacement.length);
  if (changes > 0) {
    changeCount += changes;
    console.log(`  Replaced ${changes} occurrences of ${pattern.source} → ${replacement}`);
  }
}

if (changeCount > 0) {
  writeFileSync(indexPath, fixed, 'utf-8');
  console.log(`\n✓ Fixed ${changeCount} encoding issues in index.html`);
} else {
  console.log('\n✓ No encoding issues found (or they\'re already fixed)');
}
