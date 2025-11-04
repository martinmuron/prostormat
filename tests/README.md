# Registration Flow Testing System

Comprehensive testing suite for the Prostormat user registration and email verification flow.

## Overview

This testing system validates the complete registration flow:
1. User registers with email/password
2. Verification email sent
3. User clicks verification link
4. User automatically logged in via session cookie
5. User redirected to welcome page
6. Welcome email sent

## Components

### 1. Test Utilities (`helpers/registration-test-utils.ts`)

Shared helper functions used by all test scripts:

- `createTestUser()` - Generate unique test user data
- `extractVerificationToken()` - Get verification token from database
- `waitForEmailSent()` - Poll database for email log
- `getUserByEmail()` - Fetch user from database
- `isEmailVerified()` - Check if user's email is verified
- `cleanupTestUser()` - Remove test data after tests
- `validateSessionCookie()` - Validate cookie format and security attributes
- `createExpiredVerificationToken()` - Create expired token for testing
- `isEmailTriggerEnabled()` - Check if email trigger is enabled
- `isEmailTemplateActive()` - Check if email template is active
- `getEmailLogs()` - Fetch all email logs for recipient

### 2. Playwright E2E Test (`registration-flow.spec.ts`)

Full end-to-end browser testing with Playwright.

**Tests:**
- ✅ Complete registration flow (happy path)
- ✅ Duplicate email registration shows error
- ✅ Invalid verification token shows error
- ✅ Missing token shows error
- ✅ Session persists after page reload

**Usage:**
```bash
# Run all registration flow tests
npx playwright test registration-flow

# Run specific test
npx playwright test registration-flow -g "happy path"

# Run with UI
npx playwright test registration-flow --ui

# Run in debug mode
npx playwright test registration-flow --debug
```

### 3. API-Level Testing Script (`../scripts/test-registration-flow.ts`)

Programmatic API testing without browser overhead.

**Tests:**
- ✅ User registration API
- ✅ Verification email sent and logged
- ✅ Email verification & auto-login
- ✅ Welcome email sent and logged
- ✅ Expired token handling
- ✅ Invalid token handling
- ✅ Duplicate registration prevention
- ✅ Email configuration (triggers & templates)

**Usage:**
```bash
# Test local development
npx tsx scripts/test-registration-flow.ts

# Test production
BASE_URL=https://prostormat.cz npx tsx scripts/test-registration-flow.ts

# Test staging
BASE_URL=https://staging.prostormat.cz npx tsx scripts/test-registration-flow.ts
```

### 4. Bug Detection Audit (`../scripts/check-registration-bugs.ts`)

Automated audit of potential issues in the registration flow code.

**Checks:**
- ✅ Cookie name consistency (dev vs prod)
- ✅ Router refresh timing (race condition detection)
- ✅ Welcome page session handling
- ✅ Email triggers enabled
- ✅ Email templates active
- ✅ Token expiration configuration
- ✅ NextAuth secret configured
- ✅ Session cookie security attributes
- ✅ Verification API error handling

**Usage:**
```bash
# Run bug detection audit
npx tsx scripts/check-registration-bugs.ts
```

**Output:**
- ❌ **CRITICAL** - Must be fixed immediately (registration won't work)
- ⚠️ **WARNING** - Should be reviewed (potential issues)
- ℹ️ **INFO** - Informational (best practices)

## Quick Start

### First Time Setup

1. Make sure dependencies are installed:
```bash
npm install
```

2. Make sure database is set up:
```bash
npm run db:push
```

3. Make sure environment variables are set:
```bash
# Required for registration flow
NEXTAUTH_SECRET=your-secret-here
RESEND_API_KEY=your-resend-api-key
DATABASE_URL=your-database-url
```

### Running Tests

**Recommended workflow:**

1. **Check for bugs first:**
```bash
npx tsx scripts/check-registration-bugs.ts
```

2. **Run API-level tests** (faster, no browser needed):
```bash
npx tsx scripts/test-registration-flow.ts
```

3. **Run Playwright E2E tests** (full browser simulation):
```bash
npx playwright test registration-flow
```

### Continuous Integration

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Check Registration Bugs
  run: npx tsx scripts/check-registration-bugs.ts

- name: Test Registration API
  run: npx tsx scripts/test-registration-flow.ts

- name: Test Registration E2E
  run: npx playwright test registration-flow
```

## Known Issues & Solutions

### Issue 1: Timing/Race Condition

**Problem:** Session cookie may not propagate before redirect to welcome page.

**Location:** `src/components/pages/auth/verify-email-page.tsx:56-60`

**Current mitigation:**
```typescript
router.refresh()
router.prefetch("/vitejte")
setTimeout(() => {
  router.replace("/vitejte")
}, 1000) // 1 second delay
```

**Detection:** Run `npx tsx scripts/check-registration-bugs.ts`

**Solution:** Increase delay if race condition occurs, or implement proper session check before redirect.

### Issue 2: Cookie Name Mismatch

**Problem:** Cookie name differs between dev/prod environments.

**Location:** `src/app/api/auth/verify-email/route.ts:68-71`

**Current implementation:**
```typescript
const cookieName = process.env.NODE_ENV === "production"
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token"
```

**Detection:** Run `npx tsx scripts/check-registration-bugs.ts`

**Solution:** Always use environment-specific cookie names (already implemented).

### Issue 3: Welcome Page Without Session

**Problem:** Welcome page may not display correctly if session is missing.

**Location:** `src/app/vitejte/page.tsx:14`

**Current mitigation:**
```typescript
const displayName = session?.user?.name || session?.user?.email || "Prostorťáku"
```

**Detection:** Run `npx playwright test registration-flow -g "session persists"`

**Solution:** Has fallback implemented. Consider adding redirect to login if session is null.

## Test Data Cleanup

All test scripts automatically clean up test data:

- Test users are prefixed with `test-`, `e2e-`, `flow-`, or `expired-`
- Email format: `{prefix}-{timestamp}-{random}@test-prostormat.cz`
- Cleanup happens in `afterEach`/`finally` blocks
- Manual cleanup: `await cleanupTestUser(email)`

## Debugging Failed Tests

### Playwright Tests

1. **Run with UI:**
```bash
npx playwright test registration-flow --ui
```

2. **Run in debug mode:**
```bash
npx playwright test registration-flow --debug
```

3. **View test report:**
```bash
npx playwright show-report
```

### API Tests

The script outputs detailed logs:
- ✅ Success messages (green checkmarks)
- ❌ Error messages (red X marks)
- ℹ️ Info messages (blue info icons)

Check console output for timing and error details.

### Bug Audit

The audit provides:
- Specific file paths and line numbers
- Severity levels (critical, warning, info)
- Detailed descriptions of issues

## Extending the Tests

### Adding New Test Cases

**Playwright:**
```typescript
test('Your new test', async ({ page }) => {
  const testUser = createTestUser('mytest')

  // Your test logic here

  // Cleanup
  await cleanupTestUser(testUser.email)
})
```

**API Script:**
```typescript
async function testNewFeature() {
  logTest('New Feature Test')

  // Your test logic here

  logSuccess('Test passed')
}

// Add to runTests()
await addResult('New Feature Test', () => testNewFeature())
```

### Adding New Bug Checks

```typescript
async function checkNewBug() {
  const check = logCheck('New Bug Check', 'warning')

  try {
    // Check logic here

    if (issueFound) {
      fail(check, 'Description of issue', file, line)
    } else {
      pass(check, 'Check passed', file, line)
    }
  } catch (error) {
    fail(check, `Error: ${error}`)
  }
}

// Add to runAudit()
await checkNewBug()
```

## Best Practices

1. **Always run bug audit first** - Catch configuration issues before testing
2. **Run API tests frequently** - They're fast and catch most issues
3. **Run E2E tests before deployment** - Full integration validation
4. **Clean up test data** - Don't pollute database with test users
5. **Use unique prefixes** - Makes test data easy to identify
6. **Check email logs** - Verify all emails are sent and tracked
7. **Test both environments** - Dev and production may behave differently

## Troubleshooting

### "User not found in database"
- Check DATABASE_URL is correctly set
- Verify database schema is up to date (`npm run db:push`)

### "Verification email not sent"
- Check RESEND_API_KEY is set
- Verify email trigger is enabled (`user_email_verification`)
- Check email template is active (`verify_email`)

### "Session cookie not set"
- Check NEXTAUTH_SECRET is set
- Verify cookie name matches environment (dev vs prod)
- Check browser allows cookies

### "Welcome page shows error"
- Verify session was created successfully
- Check welcome page handles missing session gracefully
- Verify welcome email template is active

### Tests fail in CI but pass locally
- Check environment variables are set in CI
- Verify database is accessible from CI
- Check for timing issues (increase timeouts)
- Ensure cleanup happens even on failure

## Contributing

When modifying the registration flow:

1. Run bug audit to check for new issues
2. Update tests to cover new behavior
3. Run all tests to ensure nothing broke
4. Update this README if adding new features

## Support

For issues or questions:
- Check console output for detailed error messages
- Review the code at specified file paths and line numbers
- Run tests with `--debug` flag for more details
- Check database state manually if needed
