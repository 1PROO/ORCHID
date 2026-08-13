import { runTier1Tests } from './e2e/tier1_feature_coverage.test.js';
import { runTier2Tests } from './e2e/tier2_boundary_corner.test.js';
import { runTier3Tests } from './e2e/tier3_cross_feature.test.js';
import { runTier4Tests } from './e2e/tier4_real_world.test.js';
import { runTier5Tests } from './e2e/tier5_adversarial_1.test.js';
import { runTier5Adversarial2Tests } from './e2e/tier5_adversarial_2.test.js';

async function main() {
  console.log('================================================================');
  console.log('       ORCHID Mobile-First Booking Flow E2E Test Suite');
  console.log('================================================================');

  const startTime = Date.now();

  const results = [];
  let grandTotalAssertions = 0;
  let grandPassedAssertions = 0;
  let grandFailedAssertions = 0;
  let allSuitesPassed = true;

  const testRunners = [
    { tier: 'Tier 1', fn: runTier1Tests },
    { tier: 'Tier 2', fn: runTier2Tests },
    { tier: 'Tier 3', fn: runTier3Tests },
    { tier: 'Tier 4', fn: runTier4Tests },
    { tier: 'Tier 5 (Adv 1)', fn: runTier5Tests },
    { tier: 'Tier 5 (Adv 2)', fn: runTier5Adversarial2Tests }
  ];

  for (const runner of testRunners) {
    try {
      const ctx = runner.fn();
      grandTotalAssertions += ctx.totalAssertions;
      grandPassedAssertions += ctx.passedAssertions;
      grandFailedAssertions += ctx.failedAssertions;

      const passed = ctx.failedAssertions === 0;
      if (!passed) allSuitesPassed = false;

      results.push({
        tier: runner.tier,
        name: ctx.suiteName,
        passed,
        total: ctx.totalAssertions,
        passedCount: ctx.passedAssertions,
        failedCount: ctx.failedAssertions,
        failures: ctx.failures
      });
    } catch (err) {
      allSuitesPassed = false;
      console.error(`💥 Fatal error running ${runner.tier}:`, err);
      results.push({
        tier: runner.tier,
        name: runner.tier,
        passed: false,
        total: 0,
        passedCount: 0,
        failedCount: 1,
        failures: [err.message]
      });
    }
  }

  const durationMs = Date.now() - startTime;

  console.log('\n================================================================');
  console.log('                       E2E TEST SUMMARY');
  console.log('================================================================');

  results.forEach(res => {
    const statusSymbol = res.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${statusSymbol} | ${res.tier.padEnd(8)} | ${res.name.padEnd(42)} | Assertions: ${res.passedCount}/${res.total}`);
    if (res.failures && res.failures.length > 0) {
      res.failures.forEach(f => console.log(`      - Failure: ${f}`));
    }
  });

  console.log('----------------------------------------------------------------');
  console.log(`Total Tiers Evaluated : ${results.length}`);
  console.log(`Total Test Assertions : ${grandTotalAssertions}`);
  console.log(`Assertions Passed     : ${grandPassedAssertions}`);
  console.log(`Assertions Failed     : ${grandFailedAssertions}`);
  console.log(`Execution Time        : ${durationMs} ms`);
  console.log('================================================================');

  if (allSuitesPassed && grandFailedAssertions === 0) {
    console.log('🎉 ALL E2E SUITES PASSED PERFECTLY WITH Exit Code 0!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME E2E SUITES FAILED. Exit Code 1.\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unhandled Exception in Test Runner:', err);
  process.exit(1);
});
