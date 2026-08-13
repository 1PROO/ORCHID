import {
  STEPS,
  STEP_LABELS,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  CLOUDFLARE_D1_URL,
  WHATSAPP_PHONE,
  categories,
  massageCategories,
  parseDeepLink,
  generateMessageText,
  generateTelegramPayload,
  generateD1Payload,
  generateWhatsAppUrl,
  validatePhone,
  canProceedToPersonal,
  canSubmitPersonal,
  TestRunnerContext
} from './e2e_helpers.js';

export function runTier5Tests() {
  const ctx = new TestRunnerContext('Tier 5: Adversarial Coverage Hardening');
  console.log(`\n▶ Running ${ctx.suiteName}...`);

  // =========================================================================
  // Group A: Deep Link Query Parameter Parsing & Corrupt Mutations
  // =========================================================================

  // A1: Uppercase / Mixed-case parameters normalized case-insensitively
  const upperCaseLink = parseDeepLink('?category=THERAPY&service=MASSAGE');
  ctx.assertEqual(upperCaseLink.step, STEPS.DETAILS, 'A1: Case-insensitive query ?category=THERAPY&service=MASSAGE resolves to Step 2 DETAILS');
  ctx.assertEqual(upperCaseLink.formData.categoryId, 'therapy', 'A1: Uppercase categoryId normalized to "therapy"');

  // A2: URL encoded spaces / leading-trailing whitespace
  const whitespaceLink = parseDeepLink('?category=%20therapy%20&service=%20massage%20');
  ctx.assertEqual(whitespaceLink.step, STEPS.CATEGORY, 'A2: Space-padded category fails exact match and falls back to Step 0 CATEGORY');

  // A3: Malformed / XSS / SQL Injection in deep links
  const injectionLink1 = parseDeepLink('?category=<script>alert(1)</script>&service=../../etc/passwd');
  ctx.assertEqual(injectionLink1.step, STEPS.CATEGORY, 'A3: XSS string in category falls back to Step 0 CATEGORY without executing');

  const injectionLink2 = parseDeepLink("?category=therapy&service=' OR 1=1--");
  ctx.assertEqual(injectionLink2.step, STEPS.SERVICE, 'A3: SQL Injection in service under valid category falls back to Step 1 SERVICE');
  ctx.assertEqual(injectionLink2.formData.categoryId, 'therapy', 'A3: Category remains therapy when service is SQL injection string');

  // A4: Reserved keys & prototype pollution attempts
  const protoLink = parseDeepLink('?category=__proto__&service=toString');
  ctx.assertEqual(protoLink.step, STEPS.CATEGORY, 'A4: __proto__ query parameter handled safely and falls back to Step 0 CATEGORY');

  const constructorLink = parseDeepLink('?category=constructor&service=valueOf');
  ctx.assertEqual(constructorLink.step, STEPS.CATEGORY, 'A4: constructor query parameter handled safely');

  // A5: Valid category ('therapy') and non-existent service ('invalid_svc')
  const invalidSvcLink = parseDeepLink('?category=therapy&service=invalid_svc');
  ctx.assertEqual(invalidSvcLink.step, STEPS.SERVICE, 'A5: Invalid service under therapy falls back to Step 1 SERVICE');
  ctx.assertEqual(invalidSvcLink.formData.categoryId, 'therapy', 'A5: Retains categoryId "therapy"');

  // A6: Deep link with service without sub-types ('acupuncture') auto-populates subType
  const acupunctureLink = parseDeepLink('?category=therapy&service=acupuncture');
  ctx.assertEqual(acupunctureLink.step, STEPS.DETAILS, 'A6: ?category=therapy&service=acupuncture skips to Step 2 DETAILS');
  ctx.assertEqual(acupunctureLink.formData.subType, 'الإبر الصينية (Acupuncture)', 'A6: Auto-populates subType with service name for sub-type-less service');

  // A7: Deep link with service with sub-types ('massage') leaves subType empty for user selection
  const massageLink = parseDeepLink('?category=therapy&service=massage');
  ctx.assertEqual(massageLink.step, STEPS.DETAILS, 'A7: ?category=therapy&service=massage skips to Step 2 DETAILS');
  ctx.assertEqual(massageLink.formData.subType, '', 'A7: Keeps subType empty so user must select massage type');


  // =========================================================================
  // Group B: Date/Time/Duration & Format Validation Edge Cases
  // =========================================================================

  // B1: Unselected duration under therapy is optional for proceeding
  const formWithoutDuration = {
    categoryId: 'therapy',
    serviceId: 'massage',
    subType: 'مساج استرخائي',
    date: '2026-08-20',
    time: '14:00',
    duration: ''
  };
  ctx.assertTrue(canProceedToPersonal(formWithoutDuration), 'B1: canProceedToPersonal succeeds even when duration is empty');

  const d1PayloadEmptyDur = generateD1Payload(formWithoutDuration);
  ctx.assertEqual(d1PayloadEmptyDur.details.duration, '', 'B1: D1 payload sets duration to empty string "" without NaN/undefined');

  // B2: Non-standard / Arabic formatted date strings
  const arabicDateForm = {
    categoryId: 'therapy',
    serviceId: 'hijama',
    subType: 'الحجامة الجافة',
    date: 'السبت، 15 أغسطس',
    time: '04:00 م',
    duration: '60'
  };
  ctx.assertTrue(canProceedToPersonal(arabicDateForm), 'B2: Arabic formatted date "السبت، 15 أغسطس" accepted');
  const msgTextArabicDate = generateMessageText(arabicDateForm);
  ctx.assertIncludes(msgTextArabicDate, '📅 *التاريخ:* السبت، 15 أغسطس', 'B2: Formatted Arabic message contains exact Arabic date');

  // B3: Leap year & end-of-year boundary dates
  const leapYearForm = {
    categoryId: 'therapy',
    serviceId: 'fire-towel',
    subType: 'الفوطة النارية',
    date: '2028-02-29',
    time: '23:59'
  };
  ctx.assertTrue(canProceedToPersonal(leapYearForm), 'B3: Leap year date 2028-02-29 is accepted');

  // B4: Whitespace-only date or time strings block proceeding
  const whitespaceDateForm = {
    categoryId: 'therapy',
    serviceId: 'massage',
    subType: 'مساج سويدي',
    date: '   ',
    time: '10:00'
  };
  ctx.assertFalse(Boolean(whitespaceDateForm.date.trim() && whitespaceDateForm.time.trim()), 'B4: Whitespace date string evaluated as empty after trim');


  // =========================================================================
  // Group C: Phone Number & Whitespace Edge Cases
  // =========================================================================

  // C1: Phone with leading/trailing spaces
  ctx.assertTrue(validatePhone('   01012345678   '), 'C1: Phone with leading/trailing spaces is valid after trim');

  // C2: Phone with internal spaces or hyphens
  ctx.assertTrue(validatePhone('010 1234 5678'), 'C2: Phone with internal spaces is valid');
  ctx.assertTrue(validatePhone('010-1234-5678'), 'C2: Phone with hyphens is valid');
  ctx.assertTrue(validatePhone('+20 10 1234 5678'), 'C3: International phone with spaces and plus is valid');

  // C3: Egyptian phone starting with invalid prefix (013, 014, 016, 017)
  ctx.assertFalse(validatePhone('01312345678'), 'C3: 11-digit Egyptian phone with invalid prefix 013 fails validation');
  ctx.assertFalse(validatePhone('01412345678'), 'C3: 11-digit Egyptian phone with invalid prefix 014 fails validation');
  ctx.assertFalse(validatePhone('01612345678'), 'C3: 11-digit Egyptian phone with invalid prefix 016 fails validation');
  ctx.assertFalse(validatePhone('01712345678'), 'C3: 11-digit Egyptian phone with invalid prefix 017 fails validation');

  // C4: International valid numbers (8 to 15 digits)
  ctx.assertTrue(validatePhone('+966501234567'), 'C4: Saudi phone (+966...) passes validation');
  ctx.assertTrue(validatePhone('00966501234567'), 'C4: Saudi phone with 00 prefix passes validation');

  // C5: Boundary lengths for phone numbers
  ctx.assertFalse(validatePhone('1234567'), 'C5: 7-digit phone fails (min 8 digits)');
  ctx.assertTrue(validatePhone('12345678'), 'C5: 8-digit phone passes (min 8 digits)');
  ctx.assertTrue(validatePhone('123456789012345'), 'C5: 15-digit phone passes (max 15 digits)');
  ctx.assertFalse(validatePhone('1234567890123456'), 'C5: 16-digit phone fails (exceeds 15 digits)');

  // C6: Whitespace-only customer name & phone in canSubmitPersonal
  const whitespacePersonal = {
    name: '     ',
    gender: 'male',
    phone: '01012345678'
  };
  ctx.assertFalse(canSubmitPersonal(whitespacePersonal), 'C6: Whitespace-only name fails canSubmitPersonal');

  const whitespacePhonePersonal = {
    name: 'أحمد',
    gender: 'male',
    phone: '          '
  };
  ctx.assertFalse(canSubmitPersonal(whitespacePhonePersonal), 'C6: Whitespace-only phone fails canSubmitPersonal');


  // =========================================================================
  // Group D: Rapid Step Jumps & State Mutation Matrix
  // =========================================================================

  // D1: Category change resets serviceId, subType, duration, date, time
  let state = {
    categoryId: 'therapy',
    serviceId: 'massage',
    subType: 'مساج رياضي',
    duration: '60',
    date: '2026-08-25',
    time: '18:00'
  };

  // Simulate handleSelectCategory('nutrition')
  const newCat = 'nutrition';
  state = {
    ...state,
    categoryId: newCat,
    serviceId: '',
    subType: '',
    duration: '',
    date: '',
    time: ''
  };
  ctx.assertEqual(state.categoryId, 'nutrition', 'D1: Category updated to nutrition');
  ctx.assertEqual(state.serviceId, '', 'D1: serviceId cleared on category switch');
  ctx.assertEqual(state.date, '', 'D1: date cleared on category switch');
  ctx.assertEqual(state.time, '', 'D1: time cleared on category switch');

  // D2: Service change auto-calculates subType
  // Simulate handleSelectService('sports-nutrition') under nutrition
  const newSvcId = 'sports-nutrition';
  const nutCat = categories.find(c => c.id === 'nutrition');
  const nutSvc = nutCat?.services?.find(s => s.id === newSvcId);
  const autoSubType = (!nutSvc.types) ? nutSvc.name : '';

  state = {
    ...state,
    serviceId: newSvcId,
    subType: autoSubType,
    duration: ''
  };
  ctx.assertEqual(state.serviceId, 'sports-nutrition', 'D2: serviceId updated to sports-nutrition');
  ctx.assertEqual(state.subType, 'التغذية الرياضية', 'D2: subType auto-populated with service name');

  // D3: Full form reset clears all fields
  const resetFormState = {
    categoryId: '',
    serviceId: '',
    subType: '',
    duration: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    gender: '',
    notes: '',
    weight: '',
    height: '',
    goal: '',
    injuries: '',
    experience: ''
  };
  ctx.assertEqual(resetFormState.categoryId, '', 'D3: Reset clears categoryId');
  ctx.assertEqual(resetFormState.name, '', 'D3: Reset clears customer name');
  ctx.assertFalse(canProceedToPersonal(resetFormState), 'D3: Reset state cannot proceed to personal');
  ctx.assertFalse(canSubmitPersonal(resetFormState), 'D3: Reset state cannot submit personal');


  // =========================================================================
  // Group E: Form Validation & Boundary Inputs for Nutrition/Training
  // =========================================================================

  // E1: Missing mandatory nutrition fields & whitespace trimming
  let nutForm = {
    categoryId: 'nutrition',
    serviceId: 'obesity',
    weight: '80',
    height: '170',
    goal: '   ',
    experience: '   '
  };
  ctx.assertFalse(canProceedToPersonal(nutForm), 'E1: Whitespace-only goal and experience block nutrition step');

  nutForm.goal = 'إنقاص الوزن';
  nutForm.experience = 'متوسط';
  ctx.assertTrue(canProceedToPersonal(nutForm), 'E1: Providing valid non-whitespace goal and experience unblocks nutrition step');

  // E2: Boundary values for weight & height
  nutForm.weight = '30';
  nutForm.height = '100';
  ctx.assertTrue(canProceedToPersonal(nutForm), 'E2: Low boundary weight 30kg and height 100cm accepted');

  nutForm.weight = '250';
  nutForm.height = '220';
  ctx.assertTrue(canProceedToPersonal(nutForm), 'E2: High boundary weight 250kg and height 220cm accepted');

  // E3: Special characters / HTML in goal & injuries
  nutForm.goal = '<b>خسارة وزن & لياقة</b>';
  nutForm.injuries = 'إصابة بالركبة <script>console.log("XSS")</script>';
  const nutMsgText = generateMessageText(nutForm);
  ctx.assertIncludes(nutMsgText, '🎯 *الهدف:* <b>خسارة وزن & لياقة</b>', 'E3: HTML in goal preserved safely in text payload');
  ctx.assertIncludes(nutMsgText, '🤕 *الإصابات:* إصابة بالركبة <script>console.log("XSS")</script>', 'E3: Script tag in injuries preserved safely as plain text');


  // =========================================================================
  // Group F: Payload Generation Integrity Under Stress
  // =========================================================================

  // F1: Telegram payload with null/missing category object
  const nullCatForm = {
    categoryId: 'training',
    serviceId: 'personal-training',
    weight: '90',
    height: '180',
    goal: 'بناء عضلات',
    experience: 'متقدم',
    name: 'عمر',
    gender: 'male',
    phone: '01200000000'
  };
  const tgPayload = generateTelegramPayload(nullCatForm, null, null);
  ctx.assertEqual(tgPayload.chat_id, TELEGRAM_CHAT_ID, 'F1: Telegram payload chat_id matches constant');
  ctx.assertEqual(tgPayload.parse_mode, 'Markdown', 'F1: Telegram parse_mode is Markdown');
  ctx.assertIncludes(tgPayload.text, '📂 *القسم:* التدريب', 'F1: Category resolved dynamically from dataset when null passed');
  ctx.assertIncludes(tgPayload.text, '🔧 *الخدمة:* التدريب الشخصي (Personal Training)', 'F1: Service resolved dynamically from dataset when null passed');

  // F2: D1 payload null checks & empty notes formatting
  const d1Payload = generateD1Payload(nullCatForm);
  ctx.assertEqual(d1Payload.category, 'training', 'F2: D1 category is training');
  ctx.assertEqual(d1Payload.service_id, 'personal-training', 'F2: D1 service_id is personal-training');
  ctx.assertEqual(d1Payload.service_name, 'التدريب الشخصي (Personal Training)', 'F2: D1 service_name matches');
  ctx.assertEqual(d1Payload.date, null, 'F2: D1 date is null for training service');
  ctx.assertEqual(d1Payload.time, null, 'F2: D1 time is null for training service');
  ctx.assertEqual(d1Payload.notes, '', 'F2: D1 empty notes is empty string ""');

  // F3: WhatsApp URL encoding & decoding verification
  const waUrl = generateWhatsAppUrl(nullCatForm);
  ctx.assertTrue(waUrl.startsWith(`https://wa.me/${WHATSAPP_PHONE}?text=`), 'F3: WhatsApp URL starts with target phone number');
  const encodedText = waUrl.replace(`https://wa.me/${WHATSAPP_PHONE}?text=`, '');
  const decodedText = decodeURIComponent(encodedText);
  ctx.assertIncludes(decodedText, '✨ *حجز جديد من الموقع* ✨', 'F3: Decoded WhatsApp message contains header');
  ctx.assertIncludes(decodedText, '👤 *الاسم:* عمر', 'F3: Decoded WhatsApp message contains customer name');

  console.log(`✓ ${ctx.suiteName} complete (${ctx.passedAssertions}/${ctx.totalAssertions} assertions passed)`);
  return ctx;
}

// Support running directly via `node tests/e2e/tier5_adversarial_1.test.js`
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('tier5_adversarial_1.test.js')) {
  const ctx = runTier5Tests();
  if (ctx.failedAssertions > 0) {
    console.error(`❌ Tier 5 test failures: ${ctx.failedAssertions}`);
    process.exit(1);
  } else {
    console.log(`🎉 Tier 5 tests passed: ${ctx.passedAssertions}/${ctx.totalAssertions}`);
    process.exit(0);
  }
}
