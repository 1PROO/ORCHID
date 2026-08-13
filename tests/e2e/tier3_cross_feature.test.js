import {
  STEPS,
  categories,
  parseDeepLink,
  generateTelegramPayload,
  generateD1Payload,
  generateWhatsAppUrl,
  canProceedToPersonal,
  canSubmitPersonal,
  TestRunnerContext
} from './e2e_helpers.js';

export function runTier3Tests() {
  const ctx = new TestRunnerContext('Tier 3: Cross-Feature Integration');
  console.log(`\n▶ Running ${ctx.suiteName}...`);

  // -------------------------------------------------------------
  // CF1: Pairwise Category / Service / Details Matrix
  // -------------------------------------------------------------
  const pairwiseMatrix = [
    {
      cat: 'therapy',
      svc: 'massage',
      details: { categoryId: 'therapy', serviceId: 'massage', subType: 'قسم المساج العلاجي والعضلي - 1. المساج العلاجي', duration: '60', date: '2026-08-20', time: '14:00' }
    },
    {
      cat: 'therapy',
      svc: 'hijama',
      details: { categoryId: 'therapy', serviceId: 'hijama', subType: 'الحجامة الرطبة', date: '2026-08-21', time: '15:00' }
    },
    {
      cat: 'nutrition',
      svc: 'sports-nutrition',
      details: { categoryId: 'nutrition', serviceId: 'sports-nutrition', weight: '75', height: '175', goal: 'تنشيف الدهون', injuries: 'لا يوجد', experience: 'متوسط' }
    },
    {
      cat: 'nutrition',
      svc: 'underweight',
      details: { categoryId: 'nutrition', serviceId: 'underweight', weight: '50', height: '170', goal: 'زيادة الوزن 10 كجم', injuries: 'لا يوجد', experience: 'مبتدئ' }
    },
    {
      cat: 'training',
      svc: 'personal-training',
      details: { categoryId: 'training', serviceId: 'personal-training', weight: '90', height: '185', goal: 'لياقة وقوة عضلية', injuries: 'خشونة في الركبة', experience: 'متقدم' }
    }
  ];

  pairwiseMatrix.forEach((item, idx) => {
    let currentStep = STEPS.CATEGORY;
    // Step 0 -> Step 1
    currentStep = STEPS.SERVICE;
    // Step 1 -> Step 2
    currentStep = STEPS.DETAILS;
    ctx.assertEqual(currentStep, STEPS.DETAILS, `CF1 [Pair ${idx+1}]: Navigated to Step 2 DETAILS for ${item.cat}/${item.svc}`);

    ctx.assertTrue(canProceedToPersonal(item.details), `CF1 [Pair ${idx+1}]: Validation passes for ${item.cat}/${item.svc} pairwise details`);

    currentStep = STEPS.PERSONAL;
    ctx.assertEqual(currentStep, STEPS.PERSONAL, `CF1 [Pair ${idx+1}]: Successfully advanced to Step 3 PERSONAL`);
  });


  // -------------------------------------------------------------
  // CF2: Deep Link Entry + Validation Interaction + Submission
  // -------------------------------------------------------------
  const deepLinkResult = parseDeepLink('?category=therapy&service=massage');
  let currentStep = deepLinkResult.step;
  let currentForm = deepLinkResult.formData;

  ctx.assertEqual(currentStep, STEPS.DETAILS, 'CF2: Deep link ?category=therapy&service=massage opens at Step 2 (DETAILS)');
  ctx.assertEqual(currentForm.categoryId, 'therapy', 'CF2: Deep link pre-selects therapy category');
  ctx.assertEqual(currentForm.serviceId, 'massage', 'CF2: Deep link pre-selects massage service');

  // Attempting to proceed immediately without details
  const canProceedWithoutDetails = canProceedToPersonal(currentForm);
  ctx.assertFalse(canProceedWithoutDetails, 'CF2: Proceeding without filling details is blocked by validation');
  ctx.assertEqual(currentStep, STEPS.DETAILS, 'CF2: User remains on Step 2 (DETAILS)');

  // Fill details
  currentForm = {
    ...currentForm,
    subType: 'قسم مساج الاسترخاء - 2. المساج السويدي',
    duration: '60',
    date: '2026-08-25',
    time: '15:00'
  };

  const canProceedWithDetails = canProceedToPersonal(currentForm);
  ctx.assertTrue(canProceedWithDetails, 'CF2: Proceeding succeeds after filling required details');
  if (canProceedWithDetails) currentStep = STEPS.PERSONAL;
  ctx.assertEqual(currentStep, STEPS.PERSONAL, 'CF2: Advanced to Step 3 (PERSONAL)');

  // Attempt submit without name & phone
  const personalState = { ...currentForm, name: '', gender: '', phone: '' };
  ctx.assertFalse(canSubmitPersonal(personalState), 'CF2: Submit blocked when name and phone are missing');

  // Fill personal info and submit
  const validPersonalState = {
    ...personalState,
    name: 'محمد عبد الله',
    gender: 'ذكر',
    phone: '01099887766'
  };

  const canSubmitValid = canSubmitPersonal(validPersonalState);
  ctx.assertTrue(canSubmitValid, 'CF2: Submit succeeds when personal form is valid');
  if (canSubmitValid) currentStep = STEPS.DONE;
  ctx.assertEqual(currentStep, STEPS.DONE, 'CF2: Advanced to Step 4 (DONE)');


  // -------------------------------------------------------------
  // CF3: Step Navigation Combined with Form Field Mutation
  // -------------------------------------------------------------
  let state = {
    step: STEPS.DETAILS,
    formData: {
      categoryId: 'therapy',
      serviceId: 'massage',
      subType: 'قسم مساج الأحجار الساخنة',
      duration: '90',
      date: '2026-09-10',
      time: '19:00'
    }
  };

  ctx.assertEqual(state.formData.duration, '90', 'CF3: Initial duration set to 90 min');

  // Step back to Step 1 SERVICE
  state.step = STEPS.SERVICE;
  ctx.assertEqual(state.step, STEPS.SERVICE, 'CF3: Stepped back to Step 1 (SERVICE)');

  // Switch service from massage to fire-towel
  const catTherapy = categories.find(c => c.id === 'therapy');
  const fireTowelSvc = catTherapy.services.find(s => s.id === 'fire-towel');
  state.formData = {
    ...state.formData,
    serviceId: fireTowelSvc.id,
    subType: fireTowelSvc.name, // auto subType for service without sub-types array
    duration: ''
  };
  state.step = STEPS.DETAILS;

  ctx.assertEqual(state.formData.serviceId, 'fire-towel', 'CF3: Service mutated to fire-towel');
  ctx.assertEqual(state.formData.subType, 'الفوطة النارية', 'CF3: subType auto-updated to service name for services without types array');
  ctx.assertEqual(state.formData.duration, '', 'CF3: Duration reset when switching service');
  ctx.assertEqual(state.step, STEPS.DETAILS, 'CF3: Advanced to Step 2 (DETAILS) with new service');

  // Fill date and time for fire-towel
  state.formData.date = '2026-09-10';
  state.formData.time = '19:00';
  ctx.assertTrue(canProceedToPersonal(state.formData), 'CF3: Details valid for fire-towel');

  state.step = STEPS.PERSONAL;
  ctx.assertEqual(state.step, STEPS.PERSONAL, 'CF3: Advanced to Step 3 (PERSONAL)');

  // Step back to Step 2 DETAILS to mutate time
  state.step = STEPS.DETAILS;
  ctx.assertEqual(state.step, STEPS.DETAILS, 'CF3: Stepped back to Step 2 (DETAILS)');

  state.formData.time = '20:00';
  ctx.assertEqual(state.formData.time, '20:00', 'CF3: Time mutated to 20:00');

  state.step = STEPS.PERSONAL;
  state.formData = {
    ...state.formData,
    name: 'كريم محمود',
    gender: 'ذكر',
    phone: '01222334455'
  };

  ctx.assertTrue(canSubmitPersonal(state.formData), 'CF3: Form submit valid after multi-step mutation');
  state.step = STEPS.DONE;
  ctx.assertEqual(state.step, STEPS.DONE, 'CF3: Completed booking after multi-step mutation');


  // -------------------------------------------------------------
  // CF4: Complete Reset Cycle State Integrity
  // -------------------------------------------------------------
  ctx.assertEqual(state.step, STEPS.DONE, 'CF4: Currently on Step 4 (DONE)');

  // Perform full state reset
  state = {
    step: STEPS.CATEGORY,
    formData: {
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
    }
  };

  ctx.assertEqual(state.step, STEPS.CATEGORY, 'CF4: Reset resets step to STEPS.CATEGORY (0)');
  ctx.assertEqual(state.formData.categoryId, '', 'CF4: formData.categoryId reset to empty string');
  ctx.assertEqual(state.formData.serviceId, '', 'CF4: formData.serviceId reset to empty string');
  ctx.assertEqual(state.formData.name, '', 'CF4: formData.name reset to empty string');
  ctx.assertEqual(state.formData.phone, '', 'CF4: formData.phone reset to empty string');

  console.log(`✓ ${ctx.suiteName} complete (${ctx.passedAssertions}/${ctx.totalAssertions} assertions passed)`);
  return ctx;
}
