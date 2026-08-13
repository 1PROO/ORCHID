# ORCHID — Hands of Care 🌺

موقع **أوركيد (ORCHID)** لحجز واستعراض الخدمات العلاجية، برامج التغذية، والتدريب الشخصي.

---

## 🚀 المميزات الرئيسية

- **نظام حجز ذكي ومخصص للموبايل (Mobile-First):**
  - تجربة حجز متكاملة مقسمة على 4 خطوات مع دعم كامل للغة العربية والإتجاه من اليمين لليسار (RTL).
  - اختيار التخصص (جلسات علاجية، تغذية، تدريب).
  - اختيار الخدمة وقسم المساج (أكثر من 34 نوع مساج موزع على 6 أقسام بتصميم أكورديون تفاعلي).
  - أزرار سريعة لااختيار الموعد، المدة (30 / 60 / 90 دقيقة)، والبيانات الشخصية.
  - زر إرسال ثابت في أسفل الشاشة (Sticky Action Bar) لسهولة الاستخدام على الموبايل.

- **التكامل التلقائي مع الباك إند:**
  - **تليجرام (Telegram Bot):** إرسال تنبيهات فورية بأي حجز جديد لقناة التليجرام.
  - **قاعدة البيانات (Cloudflare D1 Worker):** حفظ بيانات الحجز في قاعدة بيانات سحابية.
  - **واتساب (WhatsApp Direct):** توجيه العميل مباشرة إلى الواتساب مع رسالة ملخصة مجهزة بالحجز.

- **لوحة تحكم الأدمن (Admin Dashboard):**
  - متابعة كافة الحجوزات وإدارتها وتغيير حالتها (جديد، مؤكد، مكتمل، ملغي).
  - تصدير بيانات الحجوزات إلى ملف CSV.
  - تنبيهات فورية عند وصول حجز جديد باستخدام Pusher Realtime.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Front-end:** React 19, Vite, Framer Motion, Lucide React, React Router v7.
- **Styling:** CSS3 Vanilla (Custom Properties / Design Tokens), Glassmorphism UI, Responsive Mobile-First Architecture.
- **Back-end & Database:** Cloudflare Workers, Cloudflare D1 (SQLite), Telegram Bot API.
- **Real-time Notifications:** Pusher.

---

## 📁 هيكل المشروع (Project Structure)

```text
OmarMazlom/
├── public/                 # الصور والوسائط العامة
├── orchid-api/             # كود Cloudflare Worker وقاعدة البيانات D1
├── src/
│   ├── assets/             # اللوجو والشعارات
│   ├── components/         # المكونات الهيكلية للموقع
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── ServiceShowcase.jsx
│   │   └── booking/        # مكونات نظام الحجز الذكي
│   │       ├── BookingProgressBar.jsx
│   │       ├── StepCategory.jsx
│   │       ├── StepService.jsx
│   │       ├── StepDetails.jsx
│   │       ├── StepPersonal.jsx
│   │       └── StepDone.jsx
│   ├── data/               # بيانات المساج والخدمات
│   │   └── massageData.js
│   ├── pages/              # الصفحات الرئيسية
│   │   ├── HomePage.jsx
│   │   ├── BookingPage.jsx
│   │   ├── AdminLoginPage.jsx
│   │   └── AdminDashboard.jsx
│   ├── styles/             # الملفات الأسلوبية
│   │   └── booking.css
│   ├── utils/              # الدوال المساعدة للربط والإرسال
│   │   └── bookingHelpers.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
└── README.md
```

---

## 💻 التشغيل المحلي (Development Setup)

1. **تثبيت الملحقات:**
   ```bash
   npm install
   ```

2. **تشغيل السيرفر المحلي:**
   ```bash
   npm run dev
   ```

3. **بناء النسخة الإنتاجية (Production Build):**
   ```bash
   npm run build
   ```

---

## 📝 الحقوق
جميع الحقوق محفوظة © ORCHID - Hands of Care
