#!/usr/bin/env node
/**
 * build.mts
 * 
 * Simple build script for the mockup - just copies index.html and public/ to dist/
 * No bundling needed since the mockup is self-contained with inline scripts.
 */

import { mkdirSync, copyFileSync, cpSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const distDir = join(projectRoot, 'dist');

console.log('Building og-twin mockup...');

// Clean dist directory
if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
  console.log('✓ Cleaned dist directory');
}

// Create dist directory
mkdirSync(distDir, { recursive: true });

// Copy index.html
copyFileSync(
  join(projectRoot, 'index.html'),
  join(distDir, 'index.html')
);
console.log('✓ Copied index.html');

// Copy public directory (contains twin-data.js and any other assets)
const publicDir = join(projectRoot, 'public');
if (existsSync(publicDir)) {
  cpSync(publicDir, distDir, { recursive: true });
  console.log('✓ Copied public assets');
}

// Copy fixtures directory (needed for runtime data loading if using fetch)
const fixturesDir = join(projectRoot, 'fixtures');
const distFixturesDir = join(distDir, 'fixtures');
if (existsSync(fixturesDir)) {
  cpSync(fixturesDir, distFixturesDir, { recursive: true });
  console.log('✓ Copied fixtures');
}

console.log('\n✓ Build complete! Output in dist/');
console.log('  The mockup is self-contained and ready to serve.');
