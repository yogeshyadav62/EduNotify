import test from 'node:test';
import assert from 'node:assert';

// Mock utility to test (e.g. text formatting or validation helper)
function formatNoticeTitle(title) {
  if (!title) return '';
  return title.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function validateStudentId(studentId) {
  const stuIdRegex = /^STU-\d+$/i;
  return stuIdRegex.test(studentId);
}

test('EduNotify Unit Tests - Text Capitalization Formatter', (t) => {
  const input = 'academic announcement for year 2';
  const expected = 'Academic Announcement For Year 2';
  const result = formatNoticeTitle(input);
  
  assert.strictEqual(result, expected, 'Should capitalize first letter of each word');
});

test('EduNotify Unit Tests - Student ID Regex Validation', (t) => {
  assert.strictEqual(validateStudentId('STU-101'), true, 'Valid STU-101 format should pass');
  assert.strictEqual(validateStudentId('stu-202'), true, 'Case insensitive format should pass');
  assert.strictEqual(validateStudentId('STUDENT-101'), false, 'Invalid format should fail');
  assert.strictEqual(validateStudentId('STU-ABC'), false, 'Letters instead of digits should fail');
});
