/**
 * Analytics privacy/validation tests.
 * Run: npm run test:analytics  (node --experimental-strip-types --test)
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  isClientEvent,
  isValidEventId,
  isValidSessionId,
  sanitizePath,
  sanitizeProperties,
  sanitizeReferrer,
} from '../src/lib/analytics-shared.ts'

test('sanitizeProperties drops PII and unknown keys', () => {
  const out = sanitizeProperties({
    email: 'user@example.com',
    full_name: 'Someone',
    password: 'secret',
    answer: 'my exam answer',
    token: 'abc',
    role: 'student',
    simulation_id: 'sim-1',
  })
  assert.deepEqual(out, { role: 'student', simulation_id: 'sim-1' })
})

test('sanitizeProperties keeps only primitive values and truncates strings', () => {
  const out = sanitizeProperties({
    label: 'x'.repeat(500),
    score: 87,
    status: true,
    href: { nested: 'object' },
    variant: ['array'],
    plan: Number.NaN,
  })
  assert.equal((out.label as string).length, 200)
  assert.equal(out.score, 87)
  assert.equal(out.status, true)
  assert.ok(!('href' in out))
  assert.ok(!('variant' in out))
  assert.ok(!('plan' in out))
})

test('sanitizeProperties tolerates junk input', () => {
  assert.deepEqual(sanitizeProperties(null), {})
  assert.deepEqual(sanitizeProperties('string'), {})
  assert.deepEqual(sanitizeProperties([1, 2, 3]), {})
})

test('sanitizePath strips query string and hash (token safety)', () => {
  assert.equal(sanitizePath('/student/premium?session_id=cs_secret#frag'), '/student/premium')
  assert.equal(sanitizePath('/admin/dashboard'), '/admin/dashboard')
  assert.equal(sanitizePath('https://evil.com/x'), null)
  assert.equal(sanitizePath(''), null)
  assert.equal(sanitizePath(42), null)
})

test('sanitizeReferrer keeps origin+path only', () => {
  assert.equal(
    sanitizeReferrer('https://google.com/search?q=jobsim+secret'),
    'https://google.com/search'
  )
  assert.equal(sanitizeReferrer('not a url'), null)
  assert.equal(sanitizeReferrer(null), null)
})

test('isClientEvent accepts only whitelisted client events', () => {
  assert.equal(isClientEvent('page_view'), true)
  assert.equal(isClientEvent('nav_click'), true)
  // Server-authoritative events cannot be spoofed through the track API:
  assert.equal(isClientEvent('user_registered'), false)
  assert.equal(isClientEvent('premium_activated'), false)
  assert.equal(isClientEvent('simulation_completed'), false)
  assert.equal(isClientEvent('made_up_event'), false)
  assert.equal(isClientEvent(123), false)
})

test('session and event id validation', () => {
  assert.equal(isValidSessionId('550e8400-e29b-41d4-a716-446655440000'), true)
  assert.equal(isValidSessionId('short'), false)
  assert.equal(isValidSessionId('has spaces here'), false)
  assert.equal(isValidEventId('simulation_completed:550e8400'), true)
  assert.equal(isValidEventId('<script>'), false)
})
