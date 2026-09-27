/**
 * Tests for certificate IDs, post-login redirects and premium plan helpers.
 * Run: npm test  (node --experimental-strip-types --test)
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  certificateIdToUuidRange,
  getCertificateId,
  normalizeCertificateId,
} from '../src/lib/certificate-id.ts'
import { resolveNextPath } from '../src/lib/next-path.ts'
import { parsePremiumPlan, premiumExpiryFor } from '../src/lib/premium-feature.ts'

const ATTEMPT = '1a2b3c4d-5e6f-4a1b-8c2d-9e0f1a2b3c4d'

test('certificate ID is derived from the attempt UUID', () => {
  assert.equal(getCertificateId(ATTEMPT), 'JSIM-1A2B3C4D5E6F')
})

test('normalizeCertificateId accepts messy input and rejects junk', () => {
  assert.equal(normalizeCertificateId('  jsim-1a2b3c4d5e6f '), 'JSIM-1A2B3C4D5E6F')
  assert.equal(normalizeCertificateId('JSIM-1A2B3C4D5E6'), null)
  assert.equal(normalizeCertificateId('JSIM-1A2B3C4D5E6G'), null)
  assert.equal(normalizeCertificateId("JSIM-1A2B3C4D5E6F' or 1=1"), null)
  assert.equal(normalizeCertificateId(''), null)
})

test('certificate UUID range brackets the originating attempt', () => {
  const range = certificateIdToUuidRange(getCertificateId(ATTEMPT))
  assert.ok(range)
  assert.equal(range.min, '1a2b3c4d-5e6f-0000-0000-000000000000')
  assert.equal(range.max, '1a2b3c4d-5e6f-ffff-ffff-ffffffffffff')
  assert.ok(range.min <= ATTEMPT && ATTEMPT <= range.max)
  assert.equal(certificateIdToUuidRange('nope'), null)
})

test('resolveNextPath only allows paths inside the user portal', () => {
  assert.equal(resolveNextPath('/student/simulations/abc', 'student'), '/student/simulations/abc')
  assert.equal(resolveNextPath('/hr/dashboard', 'student'), null)
  assert.equal(resolveNextPath('https://evil.example/student/x', 'student'), null)
  assert.equal(resolveNextPath('//evil.example/student/', 'student'), null)
  assert.equal(resolveNextPath('/student/\\evil', 'student'), null)
  assert.equal(resolveNextPath('/student', 'student'), null)
  assert.equal(resolveNextPath(null, 'student'), null)
})

test('premium plan parsing defaults to monthly', () => {
  assert.equal(parsePremiumPlan('yearly'), 'yearly')
  assert.equal(parsePremiumPlan('b2c-yearly'), 'yearly')
  assert.equal(parsePremiumPlan('monthly'), 'monthly')
  assert.equal(parsePremiumPlan(undefined), 'monthly')
  assert.equal(parsePremiumPlan({ plan: 'yearly' }), 'monthly')
})

test('premium expiry adds the paid period', () => {
  const from = new Date('2026-01-15T10:00:00.000Z')
  assert.equal(premiumExpiryFor('monthly', from), '2026-02-15T10:00:00.000Z')
  assert.equal(premiumExpiryFor('yearly', from), '2027-01-15T10:00:00.000Z')
})

test('demo invite codes stop working once a secret is configured', async () => {
  const { isValidHrInvite, isValidCoursesInvite } = await import('../src/lib/invite-codes.ts')
  delete process.env.HR_INVITE_CODE
  delete process.env.COURSES_INVITE_CODE
  assert.equal(isValidHrInvite('JOBSIM-HR-2026'), true)
  assert.equal(isValidCoursesInvite('JOBSIM-UNI-2026'), true)
  assert.equal(isValidHrInvite(''), false)

  process.env.HR_INVITE_CODE = 'secret-hr'
  process.env.COURSES_INVITE_CODE = 'secret-uni'
  assert.equal(isValidHrInvite('JOBSIM-HR-2026'), false)
  assert.equal(isValidHrInvite(' secret-hr '), true)
  assert.equal(isValidCoursesInvite('JOBSIM-UNI-2026'), false)
  assert.equal(isValidCoursesInvite('secret-uni'), true)
  delete process.env.HR_INVITE_CODE
  delete process.env.COURSES_INVITE_CODE
})
