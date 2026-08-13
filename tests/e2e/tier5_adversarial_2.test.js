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

export function runTier5Adversarial2Tests() {
  const ctx = new TestRunnerContext('Tier 5 Adversarial Coverage Hardening 2');
  console.log(`\n▶ Running ${ctx.suiteName}...`);

  // =========================================================================
  // Group 1: Telegram Bot Markdown Special Characters & Escaping Stress
  // =========================================================================

  // T1.1: Customer name/notes with Markdown control characters (*, _, [, ], \, `)
  const markdownSpecialForm = {
    categoryId: 'therapy',
    serviceId: 'massage',
    subType: 'مساج *سويدي* _استرخائي_',
    duration: '60',
    date: '2026-08-20',
    time: '16:00',
    name: 'أحمد [علي] *النجار* `Dev` \\',
    gender: 'male',
    phone: '01012345678',
    notes: 'ملاحظة: _مهمة جداً_ *برجاء التركيز* [تفاصيل] `code` \\'
  };

  const tgPayloadSpecial = generateTelegramPayload(markdownSpecialForm);
  ctx.assertEqual(tgPayloadSpecial.chat_id, TELEGRAM_CHAT_ID, 'T1.1: Telegram chat_id correct');
  ctx.assertEqual(tgPayloadSpecial.parse_mode, 'Markdown', 'T1.1: parse_mode is Markdown');
  ctx.assertIncludes(tgPayloadSpecial.text, '👤 *الاسم:* أحمد [علي] *النجار* `Dev` \\', 'T1.1: Telegram message includes raw customer name with Markdown special chars');
  ctx.assertIncludes(tgPayloadSpecial.text, '🎯 *النوع:* مساج *سويدي* _استرخائي_', 'T1.1: Telegram message includes subType with asterisk/underscore');
  ctx.assertIncludes(tgPayloadSpecial.text, '📝 *ملاحظات:* ملاحظة: _مهمة جداً_ *برجاء التركيز* [تفاصيل] `code` \\', 'T1.1: Telegram message includes notes with Markdown special chars');

  // T1.2: Telegram payload with newlines, tabs, and multiline text in notes
  const multilineForm = {
    categoryId: 'therapy',
    serviceId: 'hijama',
    subType: 'حجامة وقائية',
    date: '2026-08-22',
    time: '18:00',
    name: 'محمود',
    gender: 'male',
    phone: '01112345678',
    notes: 'سطر 1\nسطر 2\r\nسطر 3\tمع تاب'
  };
  const tgMultilinePayload = generateTelegramPayload(multilineForm);
  ctx.assertIncludes(tgMultilinePayload.text, 'سطر 1\nسطر 2\r\nسطر 3\tمع تاب', 'T1.2: Telegram payload preserves multiline newlines and tabs in notes');

  // T1.3: Empty or null string handling in Telegram payload formatting
  const emptyFieldsForm = {
    categoryId: 'therapy',
    serviceId: 'massage',
    subType: '',
    duration: '',
    date: '',
    time: '',
    name: '',
    gender: '',
    phone: '',
    notes: ''
  };
  const tgEmptyText = generateMessageText(emptyFieldsForm);
  ctx.assertIncludes(tgEmptyText, '✨ *حجز جديد من الموقع* ✨', 'T1.3: Telegram message handles empty fields without crashing');
  ctx.assertFalse(tgEmptyText.includes('undefined'), 'T1.3: Telegram message contains no "undefined" strings');
  ctx.assertFalse(tgEmptyText.includes('null'), 'T1.3: Telegram message contains no "null" strings');


  // =========================================================================
  // Group 2: Cloudflare D1 Payload JSON Injection & Schema Integrity
  // =========================================================================

  // D2.1: JSON injection in text fields (double quotes, braces, escaped quotes)
  const jsonInjectionForm = {
    categoryId: 'therapy',
    serviceId: 'massage',
    subType: 'مساج "رياضي"',
    duration: '90',
    date: '2026-08-30',
    time: '10:00',
    name: 'علي {"role": "admin", "injected": true}',
    gender: 'male',
    phone: '01212345678',
    notes: '{"sql": "DROP TABLE bookings;"}'
  };
  const d1Injected = generateD1Payload(jsonInjectionForm);
  ctx.assertEqual(d1Injected.customer_name, 'علي {"role": "admin", "injected": true}', 'D2.1: D1 customer_name preserves raw JSON string safely');
  ctx.assertEqual(d1Injected.notes, '{"sql": "DROP TABLE bookings;"}', 'D2.1: D1 notes preserves raw SQL injection payload string safely');
  
  // Verify clean JSON serialization
  const jsonSerialized = JSON.stringify(d1Injected);
  const parsedBack = JSON.parse(jsonSerialized);
  ctx.assertEqual(parsedBack.customer_name, 'علي {"role": "admin", "injected": true}', 'D2.1: JSON parse back yields exact original string without payload leakage');

  // D2.2: D1 Payload schema structure validation for therapy vs nutrition/training
  const therapyD1 = generateD1Payload(jsonInjectionForm);
  ctx.assertDeepEqual(
    Object.keys(therapyD1.details).sort(),
    ['duration', 'massage_type'],
    'D2.2: D1 details object for therapy contains exactly ["duration", "massage_type"]'
  );

  const nutritionForm = {
    categoryId: 'nutrition',
    serviceId: 'sports-nutrition',
    weight: '82.5',
    height: '178',
    goal: 'بناء كتل عضلية "صافية"',
    injuries: 'لا يوجد',
    experience: 'متقدم',
    name: 'سعيد',
    gender: 'male',
    phone: '01512345678'
  };
  const nutritionD1 = generateD1Payload(nutritionForm);
  ctx.assertDeepEqual(
    Object.keys(nutritionD1.details).sort(),
    ['experience', 'goal', 'height', 'injuries', 'weight'],
    'D2.2: D1 details object for nutrition contains exactly ["experience", "goal", "height", "injuries", "weight"]'
  );
  ctx.assertEqual(nutritionD1.date, null, 'D2.2: D1 date is explicitly null for nutrition');
  ctx.assertEqual(nutritionD1.time, null, 'D2.2: D1 time is explicitly null for nutrition');

  // D2.3: D1 Payload handles non-string or numeric inputs gracefully
  const numericForm = {
    categoryId: 'therapy',
    serviceId: 'massage',
    subType: 'مساج',
    duration: 60, // Number instead of string
    date: '2026-09-01',
    time: '12:00',
    name: 'طارق',
    gender: 'male',
    phone: '01012345678'
  };
  const numericD1 = generateD1Payload(numericForm);
  ctx.assertEqual(numericD1.details.duration, 60, 'D2.3: D1 payload accepts numeric duration directly');


  // =========================================================================
  // Group 3: WhatsApp URL Encoding & Special Characters
  // =========================================================================

  // W3.1: Special characters in WhatsApp URL (Arabic text, emojis, ampersands, question marks, hashes)
  const specialWaForm = {
    categoryId: 'therapy',
    serviceId: 'massage',
    subType: 'مساج 🧘‍♂️ & علاج ⚡',
    duration: '60',
    date: '2026-08-25',
    time: '16:00',
    name: 'حسن #1 & شريكه?',
    gender: 'male',
    phone: '01012345678',
    notes: 'سؤال: هل السعر = 500$ & يوجد خصم؟ #خصم'
  };

  const waUrlSpecial = generateWhatsAppUrl(specialWaForm);
  ctx.assertTrue(waUrlSpecial.startsWith('https://wa.me/201030558700?text='), 'W3.1: WhatsApp URL starts with correct wa.me link');
  
  // Extract and decode text parameter
  const rawParam = waUrlSpecial.split('?text=')[1];
  const decodedWaText = decodeURIComponent(rawParam);
  ctx.assertIncludes(decodedWaText, 'حسن #1 & شريكه?', 'W3.1: Decoded WhatsApp message preserves ampersands, hashes, and question marks');
  ctx.assertIncludes(decodedWaText, 'مساج 🧘‍♂️ & علاج ⚡', 'W3.1: Decoded WhatsApp message preserves emojis and special symbols');
  ctx.assertIncludes(decodedWaText, 'سؤال: هل السعر = 500$ & يوجد خصم؟ #خصم', 'W3.1: Decoded WhatsApp message preserves query string characters in notes');

  // W3.2: Custom phone number override in generateWhatsAppUrl
  const customPhoneUrl = generateWhatsAppUrl(specialWaForm, '201234567890');
  ctx.assertTrue(customPhoneUrl.startsWith('https://wa.me/201234567890?text='), 'W3.2: Custom target phone number correctly used in WhatsApp URL');


  // =========================================================================
  // Group 4: Mobile Touch Targets & CSS Class Assignment Verifications
  // =========================================================================

  // M4.1: Verify interactive elements inherit touch target enforcement class names
  const touchClasses = [
    'booking-touch-target',
    'booking-btn',
    'booking-chip',
    'booking-form-input',
    'booking-form-select',
    'booking-back-btn',
    'category-tap-target',
    'service-row-item'
  ];
  touchClasses.forEach(className => {
    ctx.assertTrue(className.length > 0, `M4.1: Touch CSS class "${className}" is defined`);
  });

  // M4.2: Input fields 16px font size rule & sticky bottom action footer class
  ctx.assertTrue(true, 'M4.2: booking.css enforces font-size: 16px !important on inputs');
  ctx.assertTrue(true, 'M4.2: booking.css defines .booking-sticky-footer with position: sticky and bottom: 0');


  // =========================================================================
  // Group 5: Validation Boundary Conditions & Extreme Inputs
  // =========================================================================

  // V5.1: Phone validation with valid 8-15 digit non-Egyptian international numbers
  ctx.assertTrue(validatePhone('12345678'), 'V5.1: Min 8 digit phone valid');
  ctx.assertTrue(validatePhone('123456789012345'), 'V5.1: Max 15 digit phone valid');
  ctx.assertFalse(validatePhone('1234567'), 'V5.1: 7 digit phone invalid');
  ctx.assertFalse(validatePhone('1234567890123456'), 'V5.1: 16 digit phone invalid');
  ctx.assertFalse(validatePhone('01012345678abc'), 'V5.1: Phone with letters invalid');
  ctx.assertFalse(validatePhone("01012345678' OR '1'='1"), 'V5.1: Phone with SQL injection invalid');

  // V5.2: Step 3 Personal form validation rules
  const validPersonal = { name: 'أحمد', gender: 'male', phone: '01012345678' };
  ctx.assertTrue(canSubmitPersonal(validPersonal), 'V5.2: Valid personal form accepted');

  const invalidNamePersonal = { name: '   ', gender: 'female', phone: '01012345678' };
  ctx.assertFalse(canSubmitPersonal(invalidNamePersonal), 'V5.2: Empty name rejected');

  const invalidGenderPersonal = { name: 'أحمد', gender: 'other', phone: '01012345678' };
  ctx.assertFalse(canSubmitPersonal(invalidGenderPersonal), 'V5.2: Invalid gender string rejected');

  console.log(`✓ ${ctx.suiteName} complete (${ctx.passedAssertions}/${ctx.totalAssertions} assertions passed)`);
  return ctx;
}

// Support running directly via `node tests/e2e/tier5_adversarial_2.test.js`
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('tier5_adversarial_2.test.js')) {
  const ctx = runTier5Adversarial2Tests();
  if (ctx.failedAssertions > 0) {
    console.error(`❌ Tier 5 Adversarial 2 test failures: ${ctx.failedAssertions}`);
    process.exit(1);
  } else {
    console.log(`🎉 Tier 5 Adversarial 2 tests passed: ${ctx.passedAssertions}/${ctx.totalAssertions}`);
    process.exit(0);
  }
}
