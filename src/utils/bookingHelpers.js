import { categories } from '../servicesData.js';

export const STEPS = {
  CATEGORY: 0,
  SERVICE: 1,
  DETAILS: 2,
  PERSONAL: 3,
  DONE: 4
};

export const STEP_LABELS = ['القسم', 'الخدمة', 'التفاصيل', 'بياناتك'];

export const TELEGRAM_BOT_TOKEN = '8527231978:AAF9kejexwsPrJpjLfzs-aJQtEp6EtPG7MQ';
export const TELEGRAM_CHAT_ID = '-1003743097936';
export const CLOUDFLARE_D1_URL = 'https://orchid-api.ahmedakram19.workers.dev/api/bookings';
export const WHATSAPP_PHONE = '201030558700';

/**
 * Validates phone numbers (min 8 digits, max 15 digits, valid numeric/international characters).
 * - Standard Egyptian mobile: 010, 011, 012, 015 followed by 8 digits = 11 digits
 * - General valid international/numeric phone: 8-15 digits
 * - Rejects non-numeric/invalid symbols, SQL injections, short <8 digits, etc.
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const clean = phone.trim();
  if (!clean) return false;

  // Reject strings containing dangerous or non-phone characters (letters, SQL injection tokens, etc.)
  if (/[^\d+\-\s]/.test(clean)) return false;

  const digitsOnly = clean.replace(/[\s\-+]/g, '');

  // Standard Egyptian mobile check (010, 011, 012, 015 + 8 digits = 11 digits)
  const egRegex = /^01[0125]\d{8}$/;
  if (egRegex.test(digitsOnly)) return true;

  // Reject invalid 11-digit local Egyptian mobile numbers (starting with 01 but not 010/011/012/015)
  if (/^01\d{9}$/.test(digitsOnly)) return false;

  // General international/numeric phone check (8 to 15 digits)
  if (digitsOnly.length >= 8 && digitsOnly.length <= 15 && /^\d+$/.test(digitsOnly)) {
    return true;
  }

  return false;
}

/**
 * Parses search parameters into booking initial state.
 * If service is invalid/not found in category.services, gracefully falls back to STEPS.SERVICE (step 1).
 */
export function parseDeepLink(searchParamsInput, categoriesData = categories) {
  let cat = null;
  let svc = null;

  if (typeof searchParamsInput === 'string') {
    const search = searchParamsInput.startsWith('?') ? searchParamsInput.slice(1) : searchParamsInput;
    const urlParams = new URLSearchParams(search);
    cat = urlParams.get('category');
    svc = urlParams.get('service');
  } else if (searchParamsInput && typeof searchParamsInput === 'object' && typeof searchParamsInput.get === 'function') {
    cat = searchParamsInput.get('category');
    svc = searchParamsInput.get('service');
  } else if (searchParamsInput && typeof searchParamsInput === 'object') {
    cat = searchParamsInput.category || null;
    svc = searchParamsInput.service || null;
  }

  if (!cat) {
    return {
      step: STEPS.CATEGORY,
      formData: { categoryId: '', serviceId: '', subType: '' }
    };
  }

  const catLower = cat?.toLowerCase();
  const validCategory = (categoriesData || categories).find(c => c.id === catLower);
  if (!validCategory) {
    return {
      step: STEPS.CATEGORY,
      formData: { categoryId: '', serviceId: '', subType: '' }
    };
  }

  if (svc) {
    const svcLower = svc?.toLowerCase();
    const validService = validCategory.services?.find(s => s.id === svcLower);
    if (validService) {
      const autoSubType = (!validService.types) ? validService.name : '';
      return {
        step: STEPS.DETAILS,
        formData: { categoryId: validCategory.id, serviceId: validService.id, subType: autoSubType }
      };
    }
    // Invalid service under valid category -> fallback gracefully to Step 1 (SERVICE)
    return {
      step: STEPS.SERVICE,
      formData: { categoryId: validCategory.id, serviceId: '', subType: '' }
    };
  }

  // Only valid category provided -> Step 1 (SERVICE)
  return {
    step: STEPS.SERVICE,
    formData: { categoryId: validCategory.id, serviceId: '', subType: '' }
  };
}

/**
 * Generates formatted Arabic Markdown message text for Telegram and WhatsApp.
 */
export function generateMessageText(formData, selectedCategory = null, selectedService = null, timestamp = null) {
  const cat = selectedCategory || categories.find(c => c.id === formData?.categoryId);
  const svc = selectedService || cat?.services?.find(s => s.id === formData?.serviceId);
  const ts = timestamp || '15 أغسطس 2026، 04:00 م';

  let t = `✨ *حجز جديد من الموقع* ✨\n⏰ *وقت الطلب:* ${ts}\n────────────────\n`;
  t += `📂 *القسم:* ${cat?.name || ''}\n🔧 *الخدمة:* ${svc?.name || ''}\n`;

  if (formData?.categoryId === 'therapy') {
    if (formData.subType) t += `🎯 *النوع:* ${formData.subType}\n`;
    if (formData.duration) t += `⏳ *المدة:* ${formData.duration} دقيقة\n`;
    if (formData.date) t += `📅 *التاريخ:* ${formData.date}\n`;
    if (formData.time) t += `🕒 *الوقت:* ${formData.time}\n`;
  } else {
    if (formData?.weight) t += `⚖️ *الوزن:* ${formData.weight} كجم\n`;
    if (formData?.height) t += `📏 *الطول:* ${formData.height} سم\n`;
    if (formData?.goal) t += `🎯 *الهدف:* ${formData.goal}\n`;
    if (formData?.injuries) t += `🤕 *الإصابات:* ${formData.injuries}\n`;
    if (formData?.experience) t += `💪 *الخبرة:* ${formData.experience}\n`;
  }

  t += `────────────────\n`;
  if (formData?.name) t += `👤 *الاسم:* ${formData.name}\n`;
  if (formData?.gender) t += `🚻 *الجنس:* ${formData.gender}\n`;
  if (formData?.phone) t += `📞 *الموبايل:* ${formData.phone}\n`;
  if (formData?.notes) t += `📝 *ملاحظات:* ${formData.notes}\n`;

  return t;
}

/**
 * Generates Telegram Bot API Markdown payload.
 */
export function generateTelegramPayload(formDataOrText, selectedCategory = null, selectedService = null) {
  let text = '';
  if (typeof formDataOrText === 'string') {
    text = formDataOrText;
  } else if (formDataOrText && typeof formDataOrText === 'object') {
    text = generateMessageText(formDataOrText, selectedCategory, selectedService);
  }

  return {
    chat_id: TELEGRAM_CHAT_ID,
    text,
    parse_mode: 'Markdown'
  };
}

/**
 * Generates Cloudflare Worker D1 schema-compliant payload.
 */
export function generateD1Payload(formData, selectedCategory = null, selectedService = null) {
  const cat = selectedCategory || categories.find(c => c.id === formData?.categoryId);
  const svc = selectedService || cat?.services?.find(s => s.id === formData?.serviceId);

  const detailsObj = (formData?.categoryId === 'therapy')
    ? { massage_type: formData?.subType || '', duration: formData?.duration || '' }
    : {
        weight: formData?.weight || '',
        height: formData?.height || '',
        goal: formData?.goal || '',
        injuries: formData?.injuries || '',
        experience: formData?.experience || ''
      };

  return {
    category: formData?.categoryId || '',
    service_id: formData?.serviceId || '',
    service_name: svc?.name || '',
    details: detailsObj,
    date: formData?.date || null,
    time: formData?.time || null,
    customer_name: formData?.name || '',
    gender: formData?.gender || '',
    phone: formData?.phone || '',
    notes: formData?.notes || ''
  };
}

/**
 * Generates WhatsApp pre-filled URL.
 */
export function generateWhatsAppUrl(formDataOrText, selectedCategoryOrPhone = WHATSAPP_PHONE, selectedService = null) {
  let text = '';
  let phone = WHATSAPP_PHONE;

  if (typeof formDataOrText === 'string') {
    text = formDataOrText;
    if (typeof selectedCategoryOrPhone === 'string' && /^\d+$/.test(selectedCategoryOrPhone)) {
      phone = selectedCategoryOrPhone;
    }
  } else if (formDataOrText && typeof formDataOrText === 'object') {
    text = generateMessageText(
      formDataOrText,
      selectedCategoryOrPhone && typeof selectedCategoryOrPhone === 'object' ? selectedCategoryOrPhone : null,
      selectedService
    );
    if (typeof selectedCategoryOrPhone === 'string' && /^\d+$/.test(selectedCategoryOrPhone)) {
      phone = selectedCategoryOrPhone;
    }
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Validates step 2 details completion.
 */
export function canProceedToPersonal(formData) {
  if (!formData || !formData.categoryId || !formData.serviceId) return false;
  if (formData.categoryId === 'therapy') {
    return Boolean(formData.subType && formData.date && formData.time);
  }
  return Boolean(
    formData.weight &&
    formData.height &&
    formData.goal?.trim() &&
    formData.experience?.trim()
  );
}

/**
 * Validates step 3 personal info completion.
 */
export function canSubmitPersonal(formData) {
  if (!formData) return false;
  if (!formData.name || !formData.name.trim()) return false;
  if (!formData.gender || !['ذكر', 'أنثى', 'male', 'female'].includes(formData.gender)) return false;
  if (!formData.phone || !validatePhone(formData.phone)) return false;
  return true;
}
