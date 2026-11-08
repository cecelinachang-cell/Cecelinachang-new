import { describe, expect, it } from 'vitest';
import { newMilestones } from './scrollDepth';

describe('newMilestones', () => {
  it('reports nothing above the first quarter', () => {
    expect(newMilestones(800, 10000, 0)).toEqual([]);
  });

  it('reports every milestone passed in one jump, once', () => {
    expect(newMilestones(5200, 10000, 0)).toEqual([25, 50]);
    expect(newMilestones(5300, 10000, 50)).toEqual([]);
  });

  it('counts the last 2% as the bottom', () => {
    expect(newMilestones(9850, 10000, 75)).toEqual([100]);
  });

  it('ignores an empty page', () => {
    expect(newMilestones(0, 0, 0)).toEqual([]);
  });
});
