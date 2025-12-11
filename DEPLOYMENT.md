# 🚀 Forsale AI - دليل النشر الكامل

هذا الدليل الشامل لنشر تطبيق Forsale AI على مختلف المنصات.

---

## 📋 جدول المحتويات

1. [التحضير قبل النشر](#التحضير-قبل-النشر)
2. [التسجيل على Pi Network](#التسجيل-على-pi-network)
3. [النشر على Vercel (موصى به)](#النشر-على-vercel)
4. [النشر على Heroku](#النشر-على-heroku)
5. [النشر على GitHub Pages](#النشر-على-github-pages)
6. [النشر على VPS](#النشر-على-vps)
7. [إعداد قاعدة البيانات](#إعداد-قاعدة-البيانات)
8. [الاختبار بعد النشر](#الاختبار-بعد-النشر)
9. [التقديم لمراجعة Pi Network](#التقديم-لمراجعة-pi-network)
10. [المراقبة والصيانة](#المراقبة-والصيانة)

---

## 📦 التحضير قبل النشر

### 1. التحقق من الملفات

تأكد من وجود جميع الملفات:

```
✅ index.html
✅ style.css
✅ script.js
✅ server.js
✅ package.json
✅ .env.example
✅ .gitignore
✅ Procfile
✅ vercel.json
✅ README.md
✅ privacy-policy.html
✅ terms-of-service.html
```

### 2. تحديث الإعدادات

في `script.js`:

```javascript
const CONFIG = {
    API_URL: 'https://YOUR-BACKEND-URL.com', // ⚠️ حدّث هذا
    PI_NETWORK_MODE: 'sandbox', // أو 'mainnet' بعد الموافقة
    AI_ENABLED: true
};
```

### 3. إنشاء ملف .env

```bash
cp .env.example .env
# ثم عدّل .env وأضف مفاتيحك
```

### 4. اختبار محلي

```bash
npm install
npm start
# افتح: http://localhost:3000
```

---

## 🔐 التسجيل على Pi Network

### الخطوة 1: إنشاء حساب مطور

1. اذهب إلى: https://develop.pi
2. سجّل الدخول بحساب Pi الخاص بك
3. أكمل KYC إذا لم يكن مكتملاً

### الخطوة 2: إنشاء تطبيق جديد

```
1. اضغط "Create New App"
2. املأ المعلومات:
   - App Name: Forsale AI
   - App URL: https://your-deployed-url.com
   - Description: AI-Powered Global Marketplace
   - Category: Shopping / Marketplace
3. احفظ الـ API Key
```

### الخطوة 3: إعداد Sandbox

```
Mode: Sandbox (للاختبار)
Testnet Pi Balance: Request test Pi
```

---

## ☁️ النشر على Vercel (موصى به)

### لماذا Vercel؟

- ✅ سهل وسريع
- ✅ HTTPS تلقائي
- ✅ CDN عالمي
- ✅ خطة مجانية كافية
- ✅ دعم Node.js

### الخطوات:

#### 1. تثبيت Vercel CLI

```bash
npm install -g vercel
```

#### 2. تسجيل الدخول

```bash
vercel login
```

#### 3. نشر التطبيق

```bash
# في مجلد المشروع
vercel

# للإنتاج
vercel --prod
```

#### 4. إضافة Environment Variables

في لوحة تحكم Vercel:

```
Settings → Environment Variables

أضف:
- PI_API_KEY: your_actual_key
- NODE_ENV: production
- ALLOWED_ORIGINS: https://your-app.vercel.app
```

#### 5. ربط Domain مخصص (اختياري)

```
Settings → Domains
أضف domain الخاص بك
```

### الرابط النهائي:

```
https://forsale-ai.vercel.app
```

---

## 🟣 النشر على Heroku

### الخطوات:

#### 1. إنشاء حساب Heroku

https://signup.heroku.com

#### 2. تثبيت Heroku CLI

```bash
# macOS
brew install heroku/brew/heroku

# Windows
# تحميل من: https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

#### 3. تسجيل الدخول

```bash
heroku login
```

#### 4. إنشاء تطبيق

```bash
heroku create forsale-ai-backend
```

#### 5. إضافة Environment Variables

```bash
heroku config:set PI_API_KEY=your_key_here
heroku config:set NODE_ENV=production
```

#### 6. نشر الكود

```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### 7. فتح التطبيق

```bash
heroku open
```

### الرابط النهائي:

```
https://forsale-ai-backend.herokuapp.com
```

---

## 📄 النشر على GitHub Pages (Frontend فقط)

مناسب للواجهة الأمامية فقط. Backend يحتاج Vercel أو Heroku.

### الخطوات:

#### 1. إنشاء repository

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/forsale-ai.git
git push -u origin main
```

#### 2. تفعيل GitHub Pages

```
Repository Settings → Pages
Source: main branch / root
```

#### 3. الوصول للتطبيق

```
https://username.github.io/forsale-ai/
```

⚠️ **ملاحظة**: GitHub Pages لا تدعم Node.js backend. استخدمها للـ frontend فقط.

---

## 💻 النشر على VPS (Linux Server)

للتحكم الكامل، استخدم VPS مثل DigitalOcean أو AWS.

### الخطوات:

#### 1. شراء VPS

- **DigitalOcean**: $5/شهر
- **AWS EC2**: Free tier متاح
- **Linode**: $5/شهر

#### 2. الاتصال بالـ Server

```bash
ssh root@your_server_ip
```

#### 3. تثبيت Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 4. تثبيت Git

```bash
sudo apt-get install git
```

#### 5. استنساخ المشروع

```bash
cd /var/www
git clone https://github.com/username/forsale-ai.git
cd forsale-ai
```

#### 6. تثبيت Dependencies

```bash
npm install --production
```

#### 7. إعداد .env

```bash
nano .env
# أضف المفاتيح وحفظ (Ctrl+X)
```

#### 8. تثبيت PM2

```bash
npm install -g pm2
```

#### 9. تشغيل التطبيق

```bash
pm2 start server.js --name forsale-ai
pm2 startup
pm2 save
```

#### 10. إعداد Nginx (Reverse Proxy)

```bash
sudo apt-get install nginx

sudo nano /etc/nginx/sites-available/forsale-ai

# أضف:
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# حفظ وتفعيل
sudo ln -s /etc/nginx/sites-available/forsale-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 11. إعداد SSL (HTTPS)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

---

## 🗄️ إعداد قاعدة البيانات

### خيار 1: MongoDB Atlas (مجاني)

```bash
1. اذهب إلى: https://www.mongodb.com/cloud/atlas
2. أنشئ حساب مجاني
3. Create Cluster
4. احصل على Connection String
5. أضفها في .env:
   DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/forsale
```

### خيار 2: PostgreSQL على Heroku

```bash
heroku addons:create heroku-postgresql:hobby-dev
# سيضاف DATABASE_URL تلقائياً
```

### خيار 3: Local PostgreSQL

```bash
# تثبيت
sudo apt-get install postgresql

# إنشاء قاعدة بيانات
sudo -u postgres createdb forsale_ai

# Connection string:
DATABASE_URL=postgresql://postgres:password@localhost:5432/forsale_ai
```

---

## 🧪 الاختبار بعد النشر

### 1. اختبار الواجهة

```
✅ الصفحة تحمّل بدون أخطاء
✅ التصميم يظهر بشكل صحيح
✅ الصور تحمّل
✅ التنقل يعمل
```

### 2. اختبار Pi SDK

```
✅ زر Pi Login يعمل
✅ يفتح Pi Browser authentication
✅ يرجع معلومات المستخدم
```

### 3. اختبار Backend

```bash
# Health check
curl https://your-backend-url.com/health

# يجب أن يرجع:
{"status":"OK","piIntegration":true}
```

### 4. اختبار الدفع (Sandbox)

```
1. افتح التطبيق في Pi Browser
2. اختر منتج
3. اضغط "شراء"
4. أكمل الدفع بـ Test Pi
5. تحقق من تنفيذ الـ callbacks
```

---

## 📝 التقديم لمراجعة Pi Network

### قبل التقديم:

```
✅ التطبيق يعمل 100% على Testnet
✅ جميع الميزات تعمل
✅ لا توجد أخطاء في Console
✅ Privacy Policy جاهزة
✅ Terms of Service جاهزة
✅ Screenshots جاهزة (3-5 صور على الأقل)
```

### خطوات التقديم:

#### 1. اذهب إلى Pi Developer Portal

https://develop.pi

#### 2. افتح تطبيقك

#### 3. املأ معلومات التقديم

```
App URL: https://your-deployed-url.com
Privacy Policy: https://your-url.com/privacy-policy.html
Terms of Service: https://your-url.com/terms-of-service.html
Support Email: support@forsale-ai.com
```

#### 4. ارفع Screenshots

```
- صورة الصفحة الرئيسية
- صورة تفاصيل المنتج
- صورة صفحة الدفع
- صورة لوحة التحكم
- صورة Logy AI Chat
```

#### 5. اكتب الوصف

```
Forsale AI is the world's first fully AI-automated marketplace on Pi Network.

Key Features:
✓ Complete AI automation - no human intervention
✓ Global marketplace with multi-language support
✓ Automatic dispute resolution by Logy AI
✓ Smart shipping logistics
✓ Escrow payment protection
✓ 24/7 AI customer support

Perfect for buying and selling anything, anywhere, with Pi.
```

#### 6. اضغط "Submit for Review"

### مدة المراجعة:

```
⏱️ عادةً: 2-7 أيام
📧 ستصلك رسالة عند الموافقة أو الرفض
```

---

## 🔄 بعد الموافقة: الانتقال إلى Mainnet

### 1. في Pi Developer Portal

```
Settings → Mode → Mainnet
```

### 2. في الكود

```javascript
// في script.js
const CONFIG = {
    API_URL: 'https://your-backend-url.com',
    PI_NETWORK_MODE: 'mainnet', // غيّر من sandbox
    AI_ENABLED: true
};
```

### 3. أعد النشر

```bash
git add .
git commit -m "Switch to mainnet"
git push

# Vercel ستنشر تلقائياً
# أو
vercel --prod
```

### 4. اختبر بحذر

```
⚠️ استخدم مبالغ صغيرة أولاً
⚠️ راقب جميع المعاملات
⚠️ تأكد من عمل Escrow
```

---

## 📊 المراقبة والصيانة

### 1. إعداد Monitoring

#### Vercel Analytics

```
مجاني ومدمج تلقائياً
Dashboard → Analytics
```

#### Sentry (Error Tracking)

```bash
npm install @sentry/node

# في server.js
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

#### Google Analytics

```html
<!-- في index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### 2. مراقبة الـ Logs

```bash
# Vercel
vercel logs

# Heroku
heroku logs --tail

# VPS (PM2)
pm2 logs forsale-ai
```

### 3. Backups

#### قاعدة البيانات

```bash
# MongoDB
mongodump --uri="mongodb+srv://..." --out=backup/

# PostgreSQL
pg_dump database_name > backup.sql
```

#### الكود

```bash
# Git tag للإصدارات
git tag -a v1.0.0 -m "First production release"
git push origin v1.0.0
```

### 4. التحديثات

```bash
# احصل على آخر التغييرات
git pull origin main

# ثبّت dependencies جديدة
npm install

# أعد تشغيل
pm2 restart forsale-ai

# أو للـ Vercel
vercel --prod
```

---

## 🚨 استكشاف الأخطاء

### مشكلة: Pi SDK لا يعمل

```
الحل:
1. تأكد من إضافة السكريبت في <head>
2. افتح فقط في Pi Browser
3. تحقق من HTTPS (مطلوب)
4. راجع Console للأخطاء
```

### مشكلة: Payment Callback لا يستدعى

```
الحل:
1. تأكد من صحة PI_API_KEY
2. تحقق من أن Backend يعمل
3. راجع server logs
4. تأكد من CORS settings
```

### مشكلة: CORS Error

```
الحل:
// في server.js
app.use(cors({
    origin: 'https://your-frontend-url.com',
    credentials: true
}));
```

### مشكلة: Database Connection Failed

```
الحل:
1. تحقق من DATABASE_URL
2. تأكد من IP Whitelist (MongoDB Atlas)
3. تحقق من firewall rules
```

---

## 📞 الدعم

إذا واجهت مشاكل:

- **Documentation**: https://docs.forsale-ai.com
- **Discord**: https://discord.gg/forsale-ai
- **Email**: support@forsale-ai.com
- **GitHub Issues**: https://github.com/username/forsale-ai/issues

---

## ✅ Checklist النشر النهائي

```
قبل الإطلاق:
□ جميع الميزات تعمل
□ اختبار شامل على Testnet
□ Privacy Policy منشورة
□ Terms of Service منشورة
□ Screenshots جاهزة
□ Backend deployed ويعمل
□ Frontend deployed ويعمل
□ PI_API_KEY محدّث
□ Database configured
□ Monitoring مُعد
□ Backup strategy جاهزة
□ تم التقديم لـ Pi Network

بعد الموافقة:
□ تحويل إلى Mainnet
□ اختبار معاملة حقيقية
□ مراقبة الأداء
□ جمع feedback
□ إصلاح الأخطاء فوراً
```

---

🎉 **مبروك! تطبيقك الآن جاهز للإطلاق!**
