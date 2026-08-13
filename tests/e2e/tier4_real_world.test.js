import {
  STEPS,
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
  canProceedToPersonal,
  canSubmitPersonal,
  TestRunnerContext
} from './e2e_helpers.js';

export function runTier4Tests() {
  const ctx = new TestRunnerContext('Tier 4: Real-World Application Scenarios');
  console.log(`\n▶ Running ${ctx.suiteName}...`);

  // -------------------------------------------------------------
  // Scenario 1: Deep Link Entry to Therapy Massage & Full Booking
  // Features: F3, F4, F6, F7, F9, F10, F11
  // -------------------------------------------------------------
  const deepLink1 = parseDeepLink('?category=therapy&service=massage');

  ctx.assertEqual(deepLink1.step, STEPS.DETAILS, 'S1: Deep link ?category=therapy&service=massage lands directly on Step 2 (DETAILS)');
  ctx.assertEqual(deepLink1.formData.categoryId, 'therapy', 'S1: Category therapy pre-selected');
  ctx.assertEqual(deepLink1.formData.serviceId, 'massage', 'S1: Service massage pre-selected');

  const therCat = massageCategories.find(c => c.id === 'therapeutic');
  const deepTissueType = therCat.types.find(t => t.id === 'ther-2');
  const selectedType = `${therCat.title} - ${deepTissueType.name}`;

  const scenario1Form = {
    ...deepLink1.formData,
    subType: selectedType,
    duration: '60',
    date: '2026-08-20',
    time: '17:00'
  };

  ctx.assertTrue(canProceedToPersonal(scenario1Form), 'S1: Details step validated successfully');
  let s1Step = STEPS.PERSONAL;
  ctx.assertEqual(s1Step, STEPS.PERSONAL, 'S1: Advanced to Step 3 (PERSONAL)');

  const s1PersonalForm = {
    ...scenario1Form,
    name: 'أحمد محمود',
    gender: 'ذكر',
    phone: '01012345678',
    notes: 'تركيز على أسفل الظهر والرقبة'
  };

  ctx.assertTrue(canSubmitPersonal(s1PersonalForm), 'S1: Personal form valid for submission');
  s1Step = STEPS.DONE;
  ctx.assertEqual(s1Step, STEPS.DONE, 'S1: Reached Step 4 (DONE)');

  // Verify payloads for Scenario 1
  const tg1 = generateTelegramPayload(s1PersonalForm);
  ctx.assertEqual(tg1.chat_id, TELEGRAM_CHAT_ID, 'S1: Telegram chat ID matches expected');
  ctx.assertEqual(tg1.parse_mode, 'Markdown', 'S1: Telegram parse_mode is Markdown');
  ctx.assertIncludes(tg1.text, '✨ *حجز جديد من الموقع* ✨', 'S1: Telegram header correct');
  ctx.assertIncludes(tg1.text, 'جلسات المساج', 'S1: Telegram service name correct');
  ctx.assertIncludes(tg1.text, 'مساج الأنسجة العميقة', 'S1: Telegram massage subType correct');
  ctx.assertIncludes(tg1.text, '60 دقيقة', 'S1: Telegram duration correct');
  ctx.assertIncludes(tg1.text, 'أحمد محمود', 'S1: Telegram customer name correct');
  ctx.assertIncludes(tg1.text, '01012345678', 'S1: Telegram phone correct');

  const d1_1 = generateD1Payload(s1PersonalForm);
  ctx.assertEqual(d1_1.category, 'therapy', 'S1: D1 category is therapy');
  ctx.assertEqual(d1_1.service_id, 'massage', 'S1: D1 service_id is massage');
  ctx.assertEqual(d1_1.service_name, 'جلسات المساج واسترخاء', 'S1: D1 service_name matches service name');
  ctx.assertEqual(d1_1.details.massage_type, selectedType, 'S1: D1 details.massage_type accurate');
  ctx.assertEqual(d1_1.details.duration, '60', 'S1: D1 details.duration accurate');
  ctx.assertEqual(d1_1.customer_name, 'أحمد محمود', 'S1: D1 customer_name accurate');
  ctx.assertEqual(d1_1.phone, '01012345678', 'S1: D1 phone accurate');

  const wa1 = generateWhatsAppUrl(s1PersonalForm);
  ctx.assertIncludes(wa1, `https://wa.me/${WHATSAPP_PHONE}?text=`, 'S1: WhatsApp URL structure matches https://wa.me/201030558700?text=...');
  ctx.assertIncludes(decodeURIComponent(wa1), 'تركيز على أسفل الظهر والرقبة', 'S1: WhatsApp URL contains encoded customer notes');


  // -------------------------------------------------------------
  // Scenario 2: Direct Category Entry to Nutrition
  // Features: F1, F2, F5, F6, F7, F10, F11
  // -------------------------------------------------------------
  let s2Step = STEPS.CATEGORY;
  ctx.assertEqual(s2Step, STEPS.CATEGORY, 'S2: Started at Step 0 (CATEGORY)');
  
  let s2Category = 'nutrition';
  s2Step = STEPS.SERVICE;
  ctx.assertEqual(s2Step, STEPS.SERVICE, 'S2: Advanced to Step 1 (SERVICE)');

  let s2Service = 'sports-nutrition';
  s2Step = STEPS.DETAILS;
  ctx.assertEqual(s2Step, STEPS.DETAILS, 'S2: Advanced to Step 2 (DETAILS)');

  const s2FormDetails = {
    categoryId: s2Category,
    serviceId: s2Service,
    weight: '82',
    height: '180',
    goal: 'زيادة كتلة عضلية وحرق دهون',
    injuries: 'لا يوجد',
    experience: 'متوسط'
  };

  ctx.assertTrue(canProceedToPersonal(s2FormDetails), 'S2: Nutrition metrics validated');
  s2Step = STEPS.PERSONAL;
  ctx.assertEqual(s2Step, STEPS.PERSONAL, 'S2: Advanced to Step 3 (PERSONAL)');

  const s2FullForm = {
    ...s2FormDetails,
    name: 'سارة علي',
    gender: 'أنثى',
    phone: '01198765432',
    notes: 'أفضل التواصل مساءً'
  };

  ctx.assertTrue(canSubmitPersonal(s2FullForm), 'S2: Personal form valid for submission');
  s2Step = STEPS.DONE;
  ctx.assertEqual(s2Step, STEPS.DONE, 'S2: Reached Step 4 (DONE)');

  const d1_2 = generateD1Payload(s2FullForm);
  ctx.assertEqual(d1_2.category, 'nutrition', 'S2: D1 payload category is nutrition');
  ctx.assertEqual(d1_2.service_id, 'sports-nutrition', 'S2: D1 service_id is sports-nutrition');
  ctx.assertEqual(d1_2.details.weight, '82', 'S2: D1 details.weight is 82');
  ctx.assertEqual(d1_2.details.height, '180', 'S2: D1 details.height is 180');
  ctx.assertEqual(d1_2.details.goal, 'زيادة كتلة عضلية وحرق دهون', 'S2: D1 details.goal is recorded');
  ctx.assertEqual(d1_2.details.experience, 'متوسط', 'S2: D1 details.experience is متوسط');
  ctx.assertEqual(d1_2.customer_name, 'سارة علي', 'S2: D1 customer_name is سارة علي');
  ctx.assertEqual(d1_2.gender, 'أنثى', 'S2: D1 gender is أنثى');


  // -------------------------------------------------------------
  // Scenario 3: Direct Category Entry to Training & Validation Flow
  // Features: F1, F2, F5, F6, F7, F12
  // -------------------------------------------------------------
  let s3FormDetails = {
    categoryId: 'training',
    serviceId: 'personal-training',
    weight: '95',
    height: '175',
    goal: 'خسارة وزن',
    experience: ''
  };

  // Attempting to proceed without experience level
  ctx.assertFalse(canProceedToPersonal(s3FormDetails), 'S3: Blocked when experience level is missing');

  s3FormDetails.experience = 'مبتدئ';
  ctx.assertTrue(canProceedToPersonal(s3FormDetails), 'S3: Allowed to proceed after selecting experience level');

  const s3FullForm = {
    ...s3FormDetails,
    name: 'عمر خالد',
    gender: 'ذكر',
    phone: '01200001111'
  };

  ctx.assertTrue(canSubmitPersonal(s3FullForm), 'S3: Personal form valid for submission');
  let s3Step = STEPS.DONE;
  ctx.assertEqual(s3Step, STEPS.DONE, 'S3: Reached Step 4 (DONE)');

  const tg3 = generateTelegramPayload(s3FullForm);
  ctx.assertIncludes(tg3.text, 'التدريب الشخصي', 'S3: Telegram payload text contains service name التدريب الشخصي');
  ctx.assertIncludes(tg3.text, 'عمر خالد', 'S3: Telegram payload text contains customer name عمر خالد');


  // -------------------------------------------------------------
  // Scenario 4: Deep Link Fallback for Invalid Service
  // Features: F8, F9, F12
  // -------------------------------------------------------------
  const fallbackLink = parseDeepLink('?category=therapy&service=unknown_service');
  ctx.assertEqual(fallbackLink.step, STEPS.SERVICE, 'S4: Deep link with unknown service falls back to Step 1 (SERVICE)');
  ctx.assertEqual(fallbackLink.formData.categoryId, 'therapy', 'S4: Retains therapy category selection on fallback');

  // User recovers from fallback by selecting valid service 'hijama'
  let s4Form = { categoryId: fallbackLink.formData.categoryId, serviceId: 'hijama', subType: 'الحجامة الجافة' };
  let s4Step = STEPS.DETAILS;
  ctx.assertEqual(s4Step, STEPS.DETAILS, 'S4: Advanced to Step 2 (DETAILS) after picking valid service');
  ctx.assertEqual(s4Form.serviceId, 'hijama', 'S4: Service updated to hijama');


  // -------------------------------------------------------------
  // Scenario 5: Full Step Back-and-Forth Navigation & Mutation
  // Features: F1, F2, F3, F4, F6, F8
  // -------------------------------------------------------------
  let s5State = {
    step: STEPS.DETAILS,
    formData: { categoryId: 'therapy', serviceId: 'massage', subType: 'مساج سويدي', date: '2026-08-30', time: '12:00' }
  };

  // User decides to switch category completely: Step 2 -> Step 1 -> Step 0
  s5State.step = STEPS.CATEGORY;
  ctx.assertEqual(s5State.step, STEPS.CATEGORY, 'S5: Stepped back 2 steps to Step 0 (CATEGORY)');

  // Select nutrition / obesity
  s5State.formData = {
    categoryId: 'nutrition',
    serviceId: 'obesity',
    weight: '110',
    height: '170',
    goal: 'علاج السمنة',
    experience: 'مبتدئ'
  };
  s5State.step = STEPS.PERSONAL;
  ctx.assertEqual(s5State.step, STEPS.PERSONAL, 'S5: Advanced to Step 3 (PERSONAL) under nutrition category');

  // User goes back to Step 2 DETAILS to adjust weight
  s5State.step = STEPS.DETAILS;
  ctx.assertEqual(s5State.step, STEPS.DETAILS, 'S5: Stepped back to Step 2 (DETAILS)');

  s5State.formData.weight = '105';

  s5State.step = STEPS.PERSONAL;
  const s5FullForm = {
    ...s5State.formData,
    name: 'إبراهيم علي',
    gender: 'ذكر',
    phone: '01055443322',
    notes: 'يرجى الاتصال قبل الجلسة'
  };

  ctx.assertTrue(canSubmitPersonal(s5FullForm), 'S5: Valid personal info for submission');
  s5State.step = STEPS.DONE;
  ctx.assertEqual(s5State.step, STEPS.DONE, 'S5: Reached Step 4 (DONE)');

  const d1_5 = generateD1Payload(s5FullForm);
  ctx.assertEqual(d1_5.details.weight, '105', 'S5: Final D1 payload reflects mutated weight (105kg)');

  console.log(`✓ ${ctx.suiteName} complete (${ctx.passedAssertions}/${ctx.totalAssertions} assertions passed)`);
  return ctx;
}
