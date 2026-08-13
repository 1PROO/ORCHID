export {
  STEPS,
  STEP_LABELS,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  CLOUDFLARE_D1_URL,
  WHATSAPP_PHONE,
  validatePhone,
  parseDeepLink,
  generateMessageText,
  generateTelegramPayload,
  generateD1Payload,
  generateWhatsAppUrl,
  canProceedToPersonal,
  canSubmitPersonal
} from '../../src/utils/bookingHelpers.js';

export { categories } from '../../src/servicesData.js';
export { massageCategories } from '../../src/data/massageData.js';

/**
 * Simple Assertion Test Collector
 */
export class TestRunnerContext {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.totalAssertions = 0;
    this.passedAssertions = 0;
    this.failedAssertions = 0;
    this.failures = [];
  }

  assert(condition, description) {
    this.totalAssertions++;
    if (condition) {
      this.passedAssertions++;
    } else {
      this.failedAssertions++;
      this.failures.push(description);
      console.error(`  ❌ Assertion Failed: ${description}`);
    }
  }

  assertEqual(actual, expected, description) {
    const isMatch = actual === expected;
    this.assert(isMatch, `${description} | Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
  }

  assertDeepEqual(actual, expected, description) {
    const actStr = JSON.stringify(actual);
    const expStr = JSON.stringify(expected);
    this.assert(actStr === expStr, `${description} | Expected: ${expStr}, Got: ${actStr}`);
  }

  assertIncludes(strOrArray, target, description) {
    const isOk = Boolean(strOrArray && strOrArray.includes(target));
    this.assert(isOk, `${description} | Expected ${JSON.stringify(strOrArray)} to include ${JSON.stringify(target)}`);
  }

  assertGte(actual, minLimit, description) {
    this.assert(actual >= minLimit, `${description} | Expected ${actual} >= ${minLimit}`);
  }

  assertTrue(val, description) {
    this.assert(Boolean(val), description);
  }

  assertFalse(val, description) {
    this.assert(!val, description);
  }
}
