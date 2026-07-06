#!/usr/bin/env node
/**
 * fix-all-encoding.mts
 * 
 * Comprehensively fixes all UTF-8 encoding issues in index.html by reading
 * the file properly and fixing all misinterpreted character sequences.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const indexPath = join(process.cwd(), 'index.html');

// Read file as buffer to handle encoding properly
const buffer = readFileSync(indexPath);
let content = buffer.toString('utf8');

console.log('Fixing all encoding issues in index.html...');

// Map of problematic UTF-8 byte sequences to their correct characters or HTML entities
const fixes: [RegExp, string][] = [
  // Em dash variations
  [/ÃƒÂ¢Ã‚â‚¬Ã‚â€|Ã¢â‚¬â€|â€"/g, '&mdash;'],
  // En dash variations
  [/Ã¢â‚¬â€œ|â€"|Ã¢Â€Â"/g, '&ndash;'],
  // Left arrow variations
  [/Ã¢â†|â†|←/g, '&larr;'],
  // Right arrow variations
  [/Ã¢â†'|â†'|→/g, '&rarr;'],
  // Middle dot / interpunct variations  
  [/Ã‚Â·|Â·|·/g, '&middot;'],
  // Bullet variations
  [/Ã¢Â€Â¢|â€¢|•/g, '&bull;'],
  // Check mark variations
  [/Ã¢âœâ€œ|Ã¢Âœâ€œ|âœ"|✓/g, '&check;'],
  // Any remaining problematic multibyte sequences
  [/Ã[€-ÿ][€-ÿ]/g, ' '],
];

let totalFixes = 0;
for (const [pattern, replacement] of fixes) {
  const matches = content.match(pattern);
  if (matches) {
    const count = matches.length;
    content = content.replace(pattern, replacement);
    console.log(`  Fixed ${count} instances of ${pattern.source}`);
    totalFixes += count;
  }
}

// Write back with proper UTF-8 encoding
writeFileSync(indexPath, content, 'utf8');

console.log(`\n✓ Fixed ${totalFixes} encoding issues total`);
