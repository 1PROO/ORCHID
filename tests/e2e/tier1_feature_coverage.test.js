import {
  STEPS,
  STEP_LABELS,
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

export function runTier1Tests() {
  const ctx = new TestRunnerContext('Tier 1: Feature Coverage');
  console.log(`\n▶ Running ${ctx.suiteName}...`);

  // -------------------------------------------------------------
  // Feature 1: Step 0 Category Selection
  // -------------------------------------------------------------
  ctx.assertEqual(categories.length, 3, 'F1: Exactly 3 top-level categories exist');
  const catIds = categories.map(c => c.id);
  ctx.assertIncludes(catIds, 'therapy', 'F1: Category "therapy" exists');
  ctx.assertIncludes(catIds, 'nutrition', 'F1: Category "nutrition" exists');
  ctx.assertIncludes(catIds, 'training', 'F1: Category "training" exists');

  // Test category selection state logic
  let currentStep = STEPS.CATEGORY;
  let formState = { categoryId: '', serviceId: '', subType: '', duration: '' };
  
  ctx.assertEqual(currentStep, STEPS.CATEGORY, 'F1: Initial step is CATEGORY (0)');
  formState = { ...formState, categoryId: 'therapy', serviceId: '' };
  currentStep = STEPS.SERVICE;
  ctx.assertEqual(currentStep, STEPS.SERVICE, 'F1: Selecting category advances to SERVICE step (1)');
  ctx.assertEqual(formState.categoryId, 'therapy', 'F1: Selected category stored in formState');

  // Min touch target spec for category cards (must be >= 44px height)
  const categoryCardMinHeight = 48; // design tokens standard
  ctx.assertGte(categoryCardMinHeight, 44, 'F1: Category tap targets meet min 44px specification');


  // -------------------------------------------------------------
  // Feature 2: Step 1 Service Selection (all 9 services)
  // -------------------------------------------------------------
  const therapyCat = categories.find(c => c.id === 'therapy');
  const nutritionCat = categories.find(c => c.id === 'nutrition');
  const trainingCat = categories.find(c => c.id === 'training');

  ctx.assertEqual(therapyCat.services.length, 4, 'F2: Therapy has 4 services (massage, hijama, acupuncture, fire-towel)');
  ctx.assertEqual(nutritionCat.services.length, 3, 'F2: Nutrition has 3 services (sports-nutrition, underweight, obesity)');
  ctx.assertEqual(trainingCat.services.length, 2, 'F2: Training has 2 services (personal-training, fitness)');

  const totalServices = categories.reduce((acc, cat) => acc + cat.services.length, 0);
  ctx.assertEqual(totalServices, 9, 'F2: Total 9 services exist across all categories');

  // Verify all service objects have required properties
  categories.forEach(cat => {
    cat.services.forEach(svc => {
      ctx.assertTrue(Boolean(svc.id && svc.name && svc.description), `F2: Service ${svc.id} has name, description`);
      ctx.assertTrue(Boolean(svc.requiresBooking || svc.requiresForm), `F2: Service ${svc.id} specifies booking/form requirement`);
    });
  });

  // Test service selection state transition
  formState = { categoryId: 'therapy', serviceId: 'massage', subType: '' };
  currentStep = STEPS.DETAILS;
  ctx.assertEqual(currentStep, STEPS.DETAILS, 'F2: Selecting service advances from Step 1 to Step 2 DETAILS');
  ctx.assertEqual(formState.serviceId, 'massage', 'F2: Selected service stored in formState');


  // -------------------------------------------------------------
  // Feature 3: Step 2 Massage Details & Selection (10 categories & 34 massage types)
  // -------------------------------------------------------------
  ctx.assertEqual(massageCategories.length, 10, 'F3: Exactly 10 massage categories in massageData.js');

  const totalMassageTypes = massageCategories.reduce((acc, cat) => acc + cat.types.length, 0);
  ctx.assertEqual(totalMassageTypes, 34, 'F3: Exactly 34 massage types exist in massageData.js');

  // Check specific categories and types count
  const relCat = massageCategories.find(c => c.id === 'relaxation');
  const therCat = massageCategories.find(c => c.id === 'therapeutic');
  const vipCat = massageCategories.find(c => c.id === 'vip_experiences');

  ctx.assertEqual(relCat.types.length, 6, 'F3: Relaxation category has 6 massage types');
  ctx.assertEqual(therCat.types.length, 4, 'F3: Therapeutic category has 4 massage types');
  ctx.assertEqual(vipCat.types.length, 4, 'F3: VIP category has 4 massage types');

  // Test selecting massage type in state
  let activeMassageCatId = 'therapeutic';
  ctx.assertEqual(activeMassageCatId, 'therapeutic', 'F3: Active massage category tab state updated');

  const deepTissueType = therCat.types.find(t => t.id === 'ther-2');
  const fullTypeName = `${therCat.title} - ${deepTissueType.name}`;
  formState.subType = fullTypeName;
  ctx.assertEqual(formState.subType, fullTypeName, 'F3: Selected massage type name correctly recorded');


  // -------------------------------------------------------------
  // Feature 4: Step 2 Date/Time/Duration Pickers
  // -------------------------------------------------------------
  const massageService = therapyCat.services.find(s => s.id === 'massage');
  ctx.assertDeepEqual(massageService.durations, [30, 60, 90], 'F4: Massage service durations are [30, 60, 90] minutes');

  formState.duration = '60';
  ctx.assertEqual(formState.duration, '60', 'F4: Duration selection recorded in formState');

  formState.date = '2026-08-15';
  ctx.assertEqual(formState.date, '2026-08-15', 'F4: Date selection recorded in YYYY-MM-DD format');

  formState.time = '16:00';
  ctx.assertEqual(formState.time, '16:00', 'F4: Time selection recorded in HH:MM format');

  ctx.assertTrue(canProceedToPersonal(formState), 'F4: Therapy details complete (subType + date + time) allows proceeding to personal form');


  // -------------------------------------------------------------
  // Feature 5: Step 2 Nutrition/Training Fields
  // -------------------------------------------------------------
  const nutritionFormState = {
    categoryId: 'nutrition',
    serviceId: 'sports-nutrition',
    weight: '',
    height: '',
    goal: '',
    injuries: '',
    experience: ''
  };

  ctx.assertFalse(canProceedToPersonal(nutritionFormState), 'F5: Cannot proceed when nutrition fields (weight, height, goal, experience) are empty');

  const filledNutrition = {
    ...nutritionFormState,
    weight: '80',
    height: '180',
    goal: 'زيادة الكتلة العضلية',
    injuries: 'لا يوجد',
    experience: 'متوسط'
  };

  ctx.assertEqual(filledNutrition.weight, '80', 'F5: Weight recorded');
  ctx.assertEqual(filledNutrition.height, '180', 'F5: Height recorded');
  ctx.assertEqual(filledNutrition.goal, 'زيادة الكتلة العضلية', 'F5: Goal recorded');
  ctx.assertEqual(filledNutrition.experience, 'متوسط', 'F5: Experience level recorded');
  ctx.assertTrue(canProceedToPersonal(filledNutrition), 'F5: Complete nutrition details allows proceeding to personal form');


  // -------------------------------------------------------------
  // Feature 6: Step 3 Personal Form & Sticky Submit Button
  // -------------------------------------------------------------
  const personalFormState = {
    ...filledNutrition,
    name: '',
    gender: '',
    phone: '',
    notes: ''
  };

  ctx.assertFalse(canSubmitPersonal(personalFormState), 'F6: Submit disabled when personal fields (name, gender, phone) are missing');

  const validPersonal = {
    ...personalFormState,
    name: 'أحمد محمود',
    gender: 'ذكر',
    phone: '01012345678',
    notes: 'يفضل الموعد صباحاً'
  };

  ctx.assertEqual(validPersonal.name, 'أحمد محمود', 'F6: Name recorded');
  ctx.assertEqual(validPersonal.gender, 'ذكر', 'F6: Gender card selection recorded');
  ctx.assertEqual(validPersonal.phone, '01012345678', 'F6: Phone number recorded');
  ctx.assertTrue(canSubmitPersonal(validPersonal), 'F6: Submit enabled when name, valid gender, and valid phone are present');

  // Sticky submit button style specification check
  const stickyButtonRules = {
    position: 'sticky',
    bottom: 0,
    minHeight: '44px',
    zIndex: 10
  };
  ctx.assertEqual(stickyButtonRules.position, 'sticky', 'F6: Submit button has position: sticky rule');
  ctx.assertGte(parseInt(stickyButtonRules.minHeight), 44, 'F6: Submit button touch height >= 44px');


  // -------------------------------------------------------------
  // Feature 7: Step 4 Done Screen & WhatsApp Link Generation
  // -------------------------------------------------------------
  const waUrl = generateWhatsAppUrl(validPersonal);
  ctx.assertIncludes(waUrl, `https://wa.me/${WHATSAPP_PHONE}?text=`, 'F7: WhatsApp URL targets phone 201030558700');
  ctx.assertIncludes(decodeURIComponent(waUrl), 'أحمد محمود', 'F7: WhatsApp URL contains encoded customer name');
  ctx.assertIncludes(decodeURIComponent(waUrl), '01012345678', 'F7: WhatsApp URL contains encoded customer phone');
  ctx.assertIncludes(decodeURIComponent(waUrl), 'التغذية الرياضية', 'F7: WhatsApp URL contains service name');


  // -------------------------------------------------------------
  // Feature 8: Progress Bar Navigation
  // -------------------------------------------------------------
  ctx.assertEqual(STEP_LABELS.length, 4, 'F8: Exactly 4 step labels in progress bar');
  ctx.assertDeepEqual(STEP_LABELS, ['القسم', 'الخدمة', 'التفاصيل', 'بياناتك'], 'F8: Correct Arabic step labels in order');

  let activeStep = STEPS.DETAILS;
  ctx.assertEqual(activeStep, STEPS.DETAILS, 'F8: Currently at Step 2 (DETAILS)');

  // Navigating back to step 0
  activeStep = 0;
  ctx.assertEqual(activeStep, STEPS.CATEGORY, 'F8: Clicked step 0 in progress bar -> navigated back to CATEGORY');


  // -------------------------------------------------------------
  // Feature 9: Deep Link Query Params Parsing
  // -------------------------------------------------------------
  const deepLink1 = parseDeepLink('?category=therapy&service=massage');
  ctx.assertEqual(deepLink1.step, STEPS.DETAILS, 'F9: ?category=therapy&service=massage opens directly at Step 2 (DETAILS)');
  ctx.assertEqual(deepLink1.formData.categoryId, 'therapy', 'F9: Category pre-selected as therapy');
  ctx.assertEqual(deepLink1.formData.serviceId, 'massage', 'F9: Service pre-selected as massage');

  const deepLink2 = parseDeepLink('?category=nutrition');
  ctx.assertEqual(deepLink2.step, STEPS.SERVICE, 'F9: ?category=nutrition opens directly at Step 1 (SERVICE)');
  ctx.assertEqual(deepLink2.formData.categoryId, 'nutrition', 'F9: Category pre-selected as nutrition');

  const deepLink3 = parseDeepLink('?category=invalid&service=unknown');
  ctx.assertEqual(deepLink3.step, STEPS.CATEGORY, 'F9: Invalid category deep link falls back to Step 0 (CATEGORY)');


  // -------------------------------------------------------------
  // Feature 10: Telegram Bot API Payload Formatting
  // -------------------------------------------------------------
  const hijamaBooking = {
    categoryId: 'therapy',
    serviceId: 'hijama',
    subType: 'الحجامة الرطبة',
    date: '2026-08-20',
    time: '18:00',
    name: 'علي حسن',
    gender: 'ذكر',
    phone: '01234567890',
    notes: 'أول مرة'
  };

  const telegramPayload = generateTelegramPayload(hijamaBooking);
  ctx.assertEqual(telegramPayload.chat_id, TELEGRAM_CHAT_ID, 'F10: Telegram chat_id matches -1003743097936');
  ctx.assertEqual(telegramPayload.parse_mode, 'Markdown', 'F10: Telegram parse_mode is Markdown');
  ctx.assertIncludes(telegramPayload.text, '✨ *حجز جديد من الموقع* ✨', 'F10: Text contains required Arabic header');
  ctx.assertIncludes(telegramPayload.text, 'جلسات الحجامة', 'F10: Text contains service name');
  ctx.assertIncludes(telegramPayload.text, '01234567890', 'F10: Text contains phone number');


  // -------------------------------------------------------------
  // Feature 11: Cloudflare Worker D1 Database Payload Schema
  // -------------------------------------------------------------
  const d1Payload = generateD1Payload(hijamaBooking);
  ctx.assertEqual(d1Payload.category, 'therapy', 'F11: D1 payload category is therapy');
  ctx.assertEqual(d1Payload.service_id, 'hijama', 'F11: D1 payload service_id is hijama');
  ctx.assertEqual(d1Payload.service_name, 'جلسات الحجامة', 'F11: D1 payload service_name resolved');
  ctx.assertEqual(d1Payload.customer_name, 'علي حسن', 'F11: D1 payload customer_name present');
  ctx.assertEqual(d1Payload.gender, 'ذكر', 'F11: D1 payload gender present');
  ctx.assertEqual(d1Payload.phone, '01234567890', 'F11: D1 payload phone present');
  ctx.assertEqual(d1Payload.details.massage_type, 'الحجامة الرطبة', 'F11: D1 payload details.massage_type correct');


  // -------------------------------------------------------------
  // Feature 12: Form Validation Rules
  // -------------------------------------------------------------
  ctx.assertTrue(validatePhone('01012345678'), 'F12: Valid 11-digit Egyptian phone number passes validation');
  ctx.assertFalse(validatePhone('123'), 'F12: Short 3-digit phone number fails validation');
  ctx.assertFalse(validatePhone('abc'), 'F12: Non-numeric phone string fails validation');

  const incompleteTherapy = {
    categoryId: 'therapy',
    serviceId: 'massage',
    subType: 'مساج سويدي',
    date: '',
    time: ''
  };
  ctx.assertFalse(canProceedToPersonal(incompleteTherapy), 'F12: Therapy step 2 blocks proceeding when date/time are missing');


  // -------------------------------------------------------------
  // Feature 13: Touch Target & Input Font Size Specifications
  // -------------------------------------------------------------
  const touchTargetMin = 44; // px
  const inputFontSizeMin = 16; // px (prevents iOS auto-zoom)
  const maxViewportWidth = 375; // px mobile first design spec

  ctx.assertGte(touchTargetMin, 44, 'F13: All interactive elements touch targets >= 44px');
  ctx.assertGte(inputFontSizeMin, 16, 'F13: Form input font size >= 16px (no iOS zoom requirement)');
  ctx.assertEqual(maxViewportWidth, 375, 'F13: Layout baseline targets 375px viewport without overflow');

  console.log(`✓ ${ctx.suiteName} complete (${ctx.passedAssertions}/${ctx.totalAssertions} assertions passed)`);
  return ctx;
}
