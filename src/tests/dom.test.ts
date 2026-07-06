import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('DOM Integration Tests', () => {
  let html: string;

  it('should load index.html successfully', () => {
    html = fs.readFileSync(
      path.resolve(__dirname, '../../index.html'),
      'utf-8'
    );
    expect(html).toBeTruthy();
    expect(html.length).toBeGreaterThan(0);
  });

  it('should have the rail element', () => {
    html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');
    expect(html).toContain('id="rail"');
    expect(html).toContain('Permian Field Health');
  });

  it('should have the legend ramp element', () => {
    html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');
    expect(html).toContain('id="legend"');
    expect(html).toContain('class="ramp"');
  });

  it('should have the timeline scrubber', () => {
    html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');
    expect(html).toContain('id="scrubber"');
    expect(html).toContain('id="timeline"');
    expect(html).toContain('id="playhead"');
  });

  it('should have map element', () => {
    html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');
    expect(html).toContain('id="map"');
  });

  it('should load MapLibre GL CSS', () => {
    html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');
    expect(html).toContain('maplibre-gl');
    expect(html).toContain('.css');
  });

  it('should have importmap for three.js', () => {
    html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');
    expect(html).toContain('type="importmap"');
    expect(html).toContain('three');
  });
  
  it('should have twin-data.js script', () => {
    html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');
    expect(html).toContain('twin-data.js');
  });
});
