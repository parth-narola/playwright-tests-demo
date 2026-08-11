// @ts-check
import { test, expect } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Deterministic fixture for exercising TestDino scoped reruns: a fixed set of
// passes, hard failures, and retry-recovering flakes. No network, so the
// failed/flaky sets are identical on every run.

test.describe('rerun fixture', () => {
  test('pass - arithmetic', () => {
    expect(1 + 1).toBe(2);
  });

  test('pass - string contains', () => {
    expect('hello world').toContain('world');
  });

  test('fail - always red A', () => {
    expect(true).toBe(false);
  });

  test('fail - always red B', () => {
    expect([1, 2, 3]).toHaveLength(99);
  });

  // Flaky: fails attempt 1, passes on retry. State lives on disk because each
  // Playwright retry runs in a fresh worker process.
  for (const name of ['C', 'D']) {
    test(`flaky - recovers on retry ${name}`, () => {
      const dir = join(process.cwd(), 'test-results');
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      const marker = join(dir, `.flaky-${name}`);

      if (!existsSync(marker)) {
        writeFileSync(marker, '1', 'utf8');
        throw new Error(`intentional first-attempt failure (${name})`);
      }
      expect(readFileSync(marker, 'utf8')).toBe('1');
    });
  }
});
