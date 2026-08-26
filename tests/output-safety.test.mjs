import assert from 'node:assert/strict';
import test from 'node:test';
import {
  escapeHtml,
  escapeSpreadsheetFormula,
} from '../src/lib/output-safety.ts';

test('escapeHtml encodes characters that can create HTML markup', () => {
  assert.equal(
    escapeHtml(`<a href="https://phishing.example/?a=1&b='x'">팀</a>`),
    '&lt;a href=&quot;https://phishing.example/?a=1&amp;b=&#39;x&#39;&quot;&gt;팀&lt;/a&gt;',
  );
});

test('escapeSpreadsheetFormula neutralizes dangerous formula prefixes', () => {
  for (const value of [
    '=HYPERLINK("https://phishing.example")',
    "+cmd|' /C calc'!A0",
    '-1+2',
    '@SUM(A1:A2)',
    '\t=1+1',
    '\r=1+1',
  ]) {
    assert.equal(escapeSpreadsheetFormula(value), `'${value}`);
  }
});

test('escapeSpreadsheetFormula preserves safe strings and non-string values', () => {
  assert.equal(escapeSpreadsheetFormula('일반 텍스트'), '일반 텍스트');
  assert.equal(escapeSpreadsheetFormula(' =SUM(A1:A2)'), ' =SUM(A1:A2)');
  assert.equal(escapeSpreadsheetFormula(42), 42);
  assert.equal(escapeSpreadsheetFormula(false), false);
});
