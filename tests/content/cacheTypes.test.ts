import { describe, it, expect, beforeEach } from 'vitest';
import { getCacheTypeId } from '../../src/utils/cacheTypes';
import { extractGCInfo } from '../../src/content/geocaching';

describe('Feature 5: cacheType mapping unit tests', () => {
  it('should map exact cache type names to correct IDs', () => {
    expect(getCacheTypeId('Traditional Cache')).toBe(1);
    expect(getCacheTypeId('Multi-Cache')).toBe(2);
    expect(getCacheTypeId('Mystery Cache')).toBe(3);
    expect(getCacheTypeId('EarthCache')).toBe(4);
    expect(getCacheTypeId('Letterbox Hybrid')).toBe(5);
    expect(getCacheTypeId('Event Cache')).toBe(6);
    expect(getCacheTypeId('Cache In Trash Out Event')).toBe(7);
    expect(getCacheTypeId('Mega-Event Cache')).toBe(8);
    expect(getCacheTypeId('Giga-Event Cache')).toBe(9);
    expect(getCacheTypeId('Wherigo Cache')).toBe(10);
    expect(getCacheTypeId('Geocaching HQ Cache')).toBe(11);
    expect(getCacheTypeId('GPS Adventures Maze Exhibit')).toBe(12);
    expect(getCacheTypeId('Adventure Lab®')).toBe(13);
    expect(getCacheTypeId('Geocaching HQ Celebration')).toBe(14);
    expect(getCacheTypeId('Geocaching HQ Block Party')).toBe(15);
    expect(getCacheTypeId('Community Celebration Event')).toBe(16);
    expect(getCacheTypeId('Virtual Cache')).toBe(17);
    expect(getCacheTypeId('Webcam Cache')).toBe(18);
    expect(getCacheTypeId('Project A.P.E. Cache')).toBe(19);
    expect(getCacheTypeId('Locationless Cache')).toBe(20);
  });

  it('should map case-insensitively', () => {
    expect(getCacheTypeId('traditional cache')).toBe(1);
    expect(getCacheTypeId('MYSTERY CACHE')).toBe(3);
    expect(getCacheTypeId('earthcache')).toBe(4);
    expect(getCacheTypeId('adventure lab®')).toBe(13);
  });

  it('should handle whitespace in cache type names', () => {
    expect(getCacheTypeId('  Traditional Cache  ')).toBe(1);
    expect(getCacheTypeId('\n\tMystery Cache\r ')).toBe(3);
  });

  it('should return 0 for unknown or missing cache types', () => {
    expect(getCacheTypeId(null)).toBe(0);
    expect(getCacheTypeId(undefined)).toBe(0);
    expect(getCacheTypeId('')).toBe(0);
    expect(getCacheTypeId('Some Weird Unknown Cache Type')).toBe(0);
  });
});

describe('Feature 5: cacheType mapping DOM extraction integration tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should extract and map cacheType from title attribute', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <a href="/about/cache_types.aspx" title="Traditional Cache">Traditional</a>
    `;
    const info = extractGCInfo();
    expect(info?.cacheType).toBe(1);
  });

  it('should default to 0 if cacheType element is missing', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
    `;
    const info = extractGCInfo();
    expect(info?.cacheType).toBe(0);
  });

  it('should default to 0 if cacheType element has no title attribute', () => {
    document.body.innerHTML = `
      <span id="ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode">GC12345</span>
      <a href="/about/cache_types.aspx">Traditional</a>
    `;
    const info = extractGCInfo();
    expect(info?.cacheType).toBe(0);
  });
});
