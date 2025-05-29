import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import csv from '../lib/expense-report.js';

/**
 * Compare files line-by-line
 */
function compareCsv(actual, expected) {
  const a = actual.split('\n');
  const e = expected.split('\n');
  assert.equal(a.length, e.length);
  a.forEach((line, index) => assert.equal(line, e[index]));
}

function readFileSync(name) {
  return fs.readFileSync(path.join(import.meta.dirname, name), 'utf8');
}

function readJSON(name) {
  return JSON.parse(readFileSync(name));
}

function generateCSV(t) {
  return Array.from(csv(t)).join('');
}

test('test trip', () => {
  const data = readJSON('./fixtures/test.json');
  const expected = readFileSync('fixtures/test.csv');

  const generated = generateCSV(data);
  compareCsv(generated, expected);
});
