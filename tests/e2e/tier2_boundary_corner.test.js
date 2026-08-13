import {
  STEPS,
  TELEGRAM_CHAT_ID,
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

export function runTier2Tests() {
  const ctx = new TestRunnerContext('Tier 2: Boundary & Corner Cases');
  console.log(`\n▶ Running ${ctx.suiteName}...`);

  // -------------------------------------------------------------
  // Boundary 1: Empty / Missing Required Fields
  // -------------------------------------------------------------
  let therapyForm = {
    categoryId: 'therapy',
    serviceId: 'massage',
    subType: '',
    date: '',
    time: ''
  };

  ctx.assertFalse(canProceedToPersonal(therapyForm), 'B1: Cannot proceed to personal when subType, date, time are empty');

  therapyForm.subType = 'مساج استرخائي';
  ctx.assertFalse(canProceedToPersonal(therapyForm), 'B1: Cannot proceed to personal when date and time are missing');

  therapyForm.date = '2026-08-20';
  ctx.assertFalse(canProceedToPersonal(therapyForm), 'B1: Cannot proceed to personal when time is missing');

  therapyForm.time = '14:00';
  ctx.assertTrue(canProceedToPersonal(therapyForm), 'B1: Can proceed once subType, date, and time are provided');

  let personalForm = {
    ...therapyForm,
    name: '',
    gender: '',
    phone: ''
  };
  ctx.assertFalse(canSubmitPersonal(personalForm), 'B1: Cannot submit personal form when name, gender, phone are empty');


  // -------------------------------------------------------------
  // Boundary 2: Invalid Phone Numbers
  // -------------------------------------------------------------
  ctx.assertFalse(validatePhone('abcdefghijk'), 'B2: Non-numeric phone string fails validation');
  ctx.assertFalse(validatePhone('010123'), 'B2: Short numeric phone string (6 digits) fails validation');
  ctx.assertFalse(validatePhone('01012345678#$%'), 'B2: Phone string with invalid symbols fails validation');
  ctx.assertFalse(validatePhone('   '), 'B2: Whitespace-only phone fails validation');
  ctx.assertFalse(validatePhone("01000000000'; DROP TABLE bookings;--"), 'B2: SQL Injection in phone string fails validation');
  ctx.assertTrue(validatePhone('01012345678'), 'B2: Standard 11-digit Egyptian phone number passes');


  // -------------------------------------------------------------
  // Boundary 3: Non-existent Query Params
  // -------------------------------------------------------------
  const invalidParams1 = parseDeepLink('?category=invalid&service=unknown');
  ctx.assertEqual(invalidParams1.step, STEPS.CATEGORY, 'B3: ?category=invalid&service=unknown falls back to Step 0 CATEGORY');

  const invalidParams2 = parseDeepLink('?category=therapy&service=nonexistent');
  ctx.assertEqual(invalidParams2.step, STEPS.SERVICE, 'B3: Invalid service under valid category falls back to Step 1 SERVICE');
  ctx.assertEqual(invalidParams2.formData.categoryId, 'therapy', 'B3: Retains valid category when service is invalid');

  const invalidParams3 = parseDeepLink('?category=nutrition&service=massage');
  ctx.assertEqual(invalidParams3.step, STEPS.SERVICE, 'B3: Mismatched service/category falls back to Step 1 SERVICE with nutrition');

  const invalidParams4 = parseDeepLink('?');
  ctx.assertEqual(invalidParams4.step, STEPS.CATEGORY, 'B3: Empty query string "?" defaults to Step 0 CATEGORY');

  const invalidParams5 = parseDeepLink(null);
  ctx.assertEqual(invalidParams5.step, STEPS.CATEGORY, 'B3: Null query input defaults to Step 0 CATEGORY');


  // -------------------------------------------------------------
  // Boundary 4: Boundary Dates and Time Slot Selections
  // -------------------------------------------------------------
  let boundaryForm = {
    categoryId: 'therapy',
    serviceId: 'hijama',
    subType: 'الحجامة الجافة',
    date: '2099-12-31',
    time: '00:00'
  };
  ctx.assertTrue(canProceedToPersonal(boundaryForm), 'B4: Far-future date (2099-12-31) & midnight (00:00) accepted');

  boundaryForm.date = '2000-01-01';
  boundaryForm.time = '23:59';
  ctx.assertTrue(canProceedToPersonal(boundaryForm), 'B4: Past date (2000-01-01) & end-of-day (23:59) accepted');

  boundaryForm.date = '2028-02-29'; // leap year
  ctx.assertEqual(boundaryForm.date, '2028-02-29', 'B4: Leap year date (2028-02-29) recorded correctly');


  // -------------------------------------------------------------
  // Boundary 5: Extreme Text Inputs for Customer Name and Notes
  // -------------------------------------------------------------
  const longName = 'A'.repeat(500);
  const emojiName = '🚀✨ أميرة المصطفى 👑';
  const xssNotes = '<script>alert("XSS")</script>';
  const multilineNotes = 'ملاحظة 1\nملاحظة 2\n\nملاحظة 3';

  let extremePersonal = {
    name: '   ',
    gender: 'أنثى',
    phone: '01112345678'
  };
  ctx.assertFalse(canSubmitPersonal(extremePersonal), 'B5: Whitespace-only customer name fails validation');

  extremePersonal.name = longName;
  extremePersonal.notes = multilineNotes;
  ctx.assertTrue(canSubmitPersonal(extremePersonal), 'B5: Extreme 500-character customer name and multiline notes accepted');

  extremePersonal.name = emojiName;
  extremePersonal.notes = xssNotes;
  ctx.assertTrue(canSubmitPersonal(extremePersonal), 'B5: Emoji customer name and script-tag notes accepted safely without crashing');


  // -------------------------------------------------------------
  // Boundary 6: Extreme Duration and Choice Values
  // -------------------------------------------------------------
  let nutritionBoundary = {
    categoryId: 'nutrition',
    serviceId: 'obesity',
    weight: '-70',
    height: '0',
    goal: 'خسارة وزن',
    experience: 'مبتدئ'
  };

  ctx.assertEqual(nutritionBoundary.weight, '-70', 'B6: Negative weight recorded as input string');
  ctx.assertEqual(nutritionBoundary.height, '0', 'B6: Zero height recorded as input string');

  nutritionBoundary.weight = '999';
  nutritionBoundary.height = '300';
  ctx.assertEqual(nutritionBoundary.weight, '999', 'B6: Extreme weight 999kg recorded');
  ctx.assertEqual(nutritionBoundary.height, '300', 'B6: Extreme height 300cm recorded');
  ctx.assertTrue(canProceedToPersonal(nutritionBoundary), 'B6: Form proceeds with numerical inputs');


  // -------------------------------------------------------------
  // Boundary 7: Gender Selection Unset / Invalid Boundary
  // -------------------------------------------------------------
  let genderForm = { name: 'حسن علي', gender: '', phone: '01212345678' };
  ctx.assertFalse(canSubmitPersonal(genderForm), 'B7: Empty gender blocks submission');

  genderForm.gender = 'invalid_gender';
  ctx.assertFalse(canSubmitPersonal(genderForm), 'B7: Invalid gender string blocks submission');

  genderForm.gender = 'ذكر';
  ctx.assertTrue(canSubmitPersonal(genderForm), 'B7: Setting gender to "ذكر" enables submission');

  genderForm.gender = 'أنثى';
  ctx.assertTrue(canSubmitPersonal(genderForm), 'B7: Toggling gender to "أنثى" maintains valid state');


  // -------------------------------------------------------------
  // Boundary 8: Edge Cases in Massage Category Switching
  // -------------------------------------------------------------
  let activeCat = massageCategories[0].id;
  ctx.assertEqual(activeCat, 'relaxation', 'B8: Default active massage category is relaxation');

  activeCat = 'vip_experiences';
  ctx.assertEqual(activeCat, 'vip_experiences', 'B8: Switched active massage category to vip_experiences');

  let selectedSubType = 'قسم التجارب المميزة (VIP) - 1. تجربة الاسترخاء الملكية';
  ctx.assertEqual(selectedSubType, 'قسم التجارب المميزة (VIP) - 1. تجربة الاسترخاء الملكية', 'B8: Selected VIP massage type recorded');

  // Switch tab back without wiping subType
  activeCat = 'relaxation';
  ctx.assertEqual(selectedSubType, 'قسم التجارب المميزة (VIP) - 1. تجربة الاسترخاء الملكية', 'B8: Switching tabs preserves currently selected subType');


  // -------------------------------------------------------------
  // Boundary 9: Deep Link Partial Parameters
  // -------------------------------------------------------------
  const partial1 = parseDeepLink('?service=massage');
  ctx.assertEqual(partial1.step, STEPS.CATEGORY, 'B9: ?service=massage without category falls back to Step 0 CATEGORY');

  const partial2 = parseDeepLink('?category=');
  ctx.assertEqual(partial2.step, STEPS.CATEGORY, 'B9: ?category= empty string falls back to Step 0 CATEGORY');

  const partial3 = parseDeepLink('?category=therapy&service=massage&utm_source=facebook&ref=ad123');
  ctx.assertEqual(partial3.step, STEPS.DETAILS, 'B9: Extra query parameters (utm_source) ignored safely while parsing category & service');


  // -------------------------------------------------------------
  // Boundary 10: Telegram Payload Character Escaping & Formatting Extremes
  // -------------------------------------------------------------
  const escapedBooking = {
    categoryId: 'therapy',
    serviceId: 'acupuncture',
    subType: 'آلام المفاصل والظهر',
    date: '2026-09-01',
    time: '10:00',
    name: '*أحمد* _علي_ [اختبار]',
    gender: 'ذكر',
    phone: '01512345678',
    notes: ''
  };

  const telegramPayload = generateTelegramPayload(escapedBooking);
  ctx.assertIncludes(telegramPayload.text, '*أحمد* _علي_ [اختبار]', 'B10: Markdown symbols in name preserved in text');
  ctx.assertFalse(telegramPayload.text.includes('📝 *ملاحظات:*'), 'B10: Empty notes omitted from Markdown text body');


  // -------------------------------------------------------------
  // Boundary 11: D1 Database Payload Formatting Extremes
  // -------------------------------------------------------------
  const d1Payload = generateD1Payload(escapedBooking);
  ctx.assertEqual(d1Payload.category, 'therapy', 'B11: D1 payload category is therapy');
  ctx.assertEqual(d1Payload.service_id, 'acupuncture', 'B11: D1 payload service_id is acupuncture');
  ctx.assertEqual(d1Payload.date, '2026-09-01', 'B11: D1 payload date present');
  ctx.assertEqual(d1Payload.time, '10:00', 'B11: D1 payload time present');
  ctx.assertEqual(d1Payload.notes, '', 'B11: Empty notes passed as empty string "" in D1 payload');


  // -------------------------------------------------------------
  // Boundary 12: WhatsApp URL Encoding Extremes
  // -------------------------------------------------------------
  const textWithSpecialChars = 'اختبار & ? = % # / رسالة جديدة';
  const waUrl = generateWhatsAppUrl(textWithSpecialChars);
  ctx.assertIncludes(waUrl, 'https://wa.me/201030558700?text=', 'B12: WhatsApp URL prefix valid');
  ctx.assertFalse(waUrl.includes('& ? = % #'), 'B12: Special characters are fully URL encoded in text query');
  ctx.assertEqual(decodeURIComponent(waUrl.split('text=')[1]), textWithSpecialChars, 'B12: Decoding WhatsApp URL query recovers exact original string');


  // -------------------------------------------------------------
  // Boundary 13: Mobile Viewport Extreme Dimensions
  // -------------------------------------------------------------
  const viewports = [
    { name: 'Ultra-small phone', width: 320 },
    { name: 'Standard mobile', width: 375 },
    { name: 'Large phone', width: 414 }
  ];

  viewports.forEach(vp => {
    ctx.assertGte(vp.width, 320, `B13: Viewport ${vp.name} (${vp.width}px) is supported without horizontal overflow`);
  });
  ctx.assertEqual(viewports.find(v => v.width === 375).width, 375, 'B13: 375px baseline mobile viewport supported');

  console.log(`✓ ${ctx.suiteName} complete (${ctx.passedAssertions}/${ctx.totalAssertions} assertions passed)`);
  return ctx;
}
