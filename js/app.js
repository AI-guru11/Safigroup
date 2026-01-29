// ========================================
// EXTRACTED FROM index.html
// Original lines 1654-2220 (inline script)
// ========================================

// ==============================================
// SITE CONFIGURATION (Single Source of Truth)
// ==============================================
const SITE_CONFIG = {
  // Contact Information
  whatsapp: '966555862272',        // International format without +
  email: 'safigroup@gmail.com',
  address: 'Muhayl Asir, Saudi Arabia',
  phone: {
    display: '+966 555 862 272',   // User-facing format
    tel: '+966555862272'           // tel: link format
  },
  location: {
    city: 'Muhayl Asir, Saudi Arabia',
    mapsUrl: 'https://maps.google.com/?q=Muhayl%20Asir%2C%20Saudi%20Arabia'
  },

  // Social Media Links
  social: {
    instagram: '#',  // TODO: Add real Instagram URL
    twitter: '#',    // TODO: Add real X/Twitter URL
    behance: '#'     // TODO: Add real Behance URL
  },

  // Branding
  brand: {
    name: 'مجموعة الصافي',
    tagline: 'SAFI GROUP',
    // Real logo file (keep transparent PNG)
    logoPath: 'assets/logo.webp'
  }
};

// ==============================================
// ANALYTICS HELPER
// ==============================================
// Global analytics event emitter
// Users can listen to these events and send to their analytics platform:
// window.addEventListener('safi_analytics', (e) => {
//   gtag('event', e.detail.event, e.detail);
//   // or plausible(e.detail.event, { props: e.detail });
//   // or fathom.trackGoal(e.detail.event, e.detail);
// });
function trackAnalytics(eventName, data = {}){
  const event = new CustomEvent('safi_analytics', {
    detail: {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...data
    }
  });
  window.dispatchEvent(event);
  console.log('[Analytics]', eventName, data);
}

// ==============================================
// MAIN APP
// ==============================================
function fikraApp(){
  return {
    theme: 'dark',   // 'dark' | 'idea'
    mobileOpen: false,
    headerShrink: 0,
    isOffline: false,

    init(){
      // Restore theme
      const saved = localStorage.getItem('fikra_theme');
      if(saved === 'idea') this.setTheme('idea');
      else this.setTheme('dark');

      // Reveal on scroll
      const nodes = document.querySelectorAll('[data-reveal]');
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
          if(e.isIntersecting){
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.14 });
      nodes.forEach(n=>io.observe(n));

      // Register service worker (real file, not blob)
      this.registerServiceWorker();

      // Listen for online/offline events
      window.addEventListener('online', () => {
        this.isOffline = false;
      });
      window.addEventListener('offline', () => {
        this.isOffline = true;
      });

      // Set initial offline status
      this.isOffline = !navigator.onLine;

      // Header shrink on scroll
      const onScroll = () => {
        // Compact after small threshold
        const y = window.scrollY || 0;
        const t = Math.max(0, Math.min(1, y / 120));
        this.headerShrink = Number(t.toFixed(3));
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    },

    registerServiceWorker(){
      if(!('serviceWorker' in navigator)) return;
      navigator.serviceWorker.register('service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    },

    setTheme(mode){
      this.theme = mode;
      const html = document.documentElement;
      if(mode === 'idea'){
        html.classList.add('idea');
        html.classList.remove('dark');
      }else{
        html.classList.remove('idea');
        html.classList.add('dark');
      }
      localStorage.setItem('fikra_theme', mode);

      // Analytics: Theme toggled
      trackAnalytics('theme_toggled', { theme: mode });
    },

    toggleTheme(){
      this.setTheme(this.theme === 'idea' ? 'dark' : 'idea');
    }
  }
}

function briefWizard(){
  const STORAGE_KEY = 'safi_brief_wizard';

  return {
    step: 1,
    error: '',
    showResumeBanner: false,
    isSubmitting: false, // Loading state for Next button
    isRedirecting: false, // Loading state for WhatsApp redirect
    projectTypes: [
      { value: 'Design', label: 'Design', desc: 'هوية / UI / حملات' },
      { value: 'Events', label: 'Events', desc: 'مؤتمرات / فعاليات' },
      { value: 'Ads', label: 'Ads', desc: 'إعلانات / محتوى' },
    ],
    budgets: ['< 5k SAR', '5k – 15k SAR', '15k – 50k SAR', '50k+ SAR'],
    timelines: [
      { value: 'Urgent (1–2 weeks)', label: 'عاجل', desc: '1–2 أسبوع' },
      { value: '1 month', label: 'متوسط', desc: 'شهر' },
      { value: '2–3 months', label: 'موسع', desc: '2–3 أشهر' },
    ],
    form: {
      type: '',
      budget: '',
      timeline: '',
      name: '',
      company: '',
      whatsapp: '',
    },
    // Real-time validation state
    touched: {
      name: false,
      company: false,
      whatsapp: false,
    },
    fieldErrors: {
      name: '',
      company: '',
      whatsapp: '',
    },

    // Real-time validation methods
    validateName(){
      this.touched.name = true;
      if(!this.form.name || this.form.name.trim().length < 2){
        this.fieldErrors.name = 'الاسم يجب أن يكون حرفين على الأقل';
        return false;
      }
      this.fieldErrors.name = '';
      return true;
    },

    validateCompany(){
      this.touched.company = true;
      if(!this.form.company || this.form.company.trim().length < 2){
        this.fieldErrors.company = 'اسم الشركة يجب أن يكون حرفين على الأقل';
        return false;
      }
      this.fieldErrors.company = '';
      return true;
    },

    validateWhatsapp(){
      this.touched.whatsapp = true;
      const phone = this.form.whatsapp.trim();

      if(!phone){
        this.fieldErrors.whatsapp = 'رقم واتساب مطلوب';
        return false;
      }

      // International format: +[country code][number] or just digits
      // Should be between 10-15 digits
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
      const phoneRegex = /^\+?\d{10,15}$/;

      if(!phoneRegex.test(cleanPhone)){
        this.fieldErrors.whatsapp = 'صيغة غير صحيحة. مثال: +966501234567';
        return false;
      }

      this.fieldErrors.whatsapp = '';
      return true;
    },

    isFieldValid(field){
      return this.touched[field] && !this.fieldErrors[field] && this.form[field];
    },

    // LocalStorage persistence
    saveToStorage(){
      try{
        const data = {
          step: this.step,
          form: this.form,
          timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }catch(e){
        // Silently fail if localStorage is blocked (privacy mode)
        console.warn('Could not save to localStorage:', e);
      }
    },

    loadFromStorage(){
      try{
        const saved = localStorage.getItem(STORAGE_KEY);
        if(saved){
          const data = JSON.parse(saved);
          // Only restore if saved within last 7 days
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          if(data.timestamp && data.timestamp > sevenDaysAgo){
            this.form = {...data.form};
            this.step = data.step || 1;
            this.showResumeBanner = true;
            return true;
          }else{
            // Old data, clear it
            this.clearStorage();
          }
        }
      }catch(e){
        console.warn('Could not load from localStorage:', e);
      }
      return false;
    },

    clearStorage(){
      try{
        localStorage.removeItem(STORAGE_KEY);
        this.showResumeBanner = false;
      }catch(e){
        console.warn('Could not clear localStorage:', e);
      }
    },

    dismissResumeBanner(){
      this.showResumeBanner = false;
    },

    startFresh(){
      this.clearStorage();
      this.reset();
    },

    get message(){
      const lines = [
        `${SITE_CONFIG.brand.name} — New Brief`,
        '-----------------------',
        `Type: ${this.form.type || '—'}`,
        `Budget: ${this.form.budget || '—'}`,
        `Timeline: ${this.form.timeline || '—'}`,
        '',
        `Name: ${this.form.name || '—'}`,
        `Company: ${this.form.company || '—'}`,
        `Client WhatsApp: ${this.form.whatsapp || '—'}`,
        '',
        'Notes:',
        '- Please share any references/links if available.',
      ];
      return lines.join('\n');
    },

    get whatsappUrl(){
      const text = encodeURIComponent(this.message);
      return `https://wa.me/${SITE_CONFIG.whatsapp}?text=${text}`;
    },

    validateStep(){
      this.error = '';
      if(this.step === 1 && !this.form.type) return 'اختر نوع المشروع.';
      if(this.step === 2 && !this.form.budget) return 'اختر الميزانية.';
      if(this.step === 3 && !this.form.timeline) return 'اختر الجدول الزمني.';
      if(this.step === 4){
        // Trigger all validations
        const nameValid = this.validateName();
        const companyValid = this.validateCompany();
        const whatsappValid = this.validateWhatsapp();

        if(!nameValid || !companyValid || !whatsappValid){
          return 'يرجى تصحيح الأخطاء في الحقول';
        }
      }
      return '';
    },

    async next(){
      this.isSubmitting = true;
      // Small delay to show loading state (improves perceived responsiveness)
      await new Promise(resolve => setTimeout(resolve, 300));

      const err = this.validateStep();
      if(err){
        this.error = err;
        this.isSubmitting = false;
        return;
      }
      this.error = ''; // Clear error on success

      // Analytics: Track step completion
      const currentStep = this.step;
      trackAnalytics('wizard_step_completed', {
        step: currentStep,
        stepName: ['type', 'budget', 'timeline', 'contact', 'confirmation'][currentStep - 1]
      });

      this.step = Math.min(5, this.step + 1);
      this.saveToStorage(); // Auto-save progress
      this.isSubmitting = false;
    },

    prev(){
      this.error = '';
      this.step = Math.max(1, this.step - 1);
      this.saveToStorage(); // Auto-save progress
    },

    reset(){
      this.step = 1;
      this.error = '';
      this.form = { type:'', budget:'', timeline:'', name:'', company:'', whatsapp:'' };
      this.touched = { name: false, company: false, whatsapp: false };
      this.fieldErrors = { name: '', company: '', whatsapp: '' };
      this.clearStorage(); // Clear saved data on reset
    },

    // Initialize: load saved data if available
    init(){
      const hadSavedData = this.loadFromStorage();

      // Analytics: Track wizard start
      trackAnalytics('wizard_started', {
        resumed: hadSavedData,
        step: this.step
      });
    },

    // Handle WhatsApp redirect with loading state
    async sendViaWhatsApp(){
      this.isRedirecting = true;

      // Analytics: Track brief submission
      trackAnalytics('brief_submitted', {
        type: this.form.type,
        budget: this.form.budget,
        timeline: this.form.timeline,
        hasCompany: !!this.form.company
      });

      // Show overlay for 1 second before redirect
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Clear saved data since wizard is being submitted
      this.clearStorage();
      // Redirect to WhatsApp
      window.open(this.whatsappUrl, '_blank');
      this.isRedirecting = false;
    }
  }
}

function workGallery(){
  return {
    isLoading: true,
    modalOpen: false,
    active: null,

    init(){
      // Simulate gallery content loading
      setTimeout(() => {
        this.isLoading = false;
      }, 800);
    },

    featured: {
      id: 'featured',
      title: 'Brand Refresh — Before/After',
      subtitle: 'تحسين بصري + وضوح رسالة + إحساس premium.',
      tags: ['Brand', 'UI', 'Motion'],
      desc: 'هذا مثال توضيحي: نفس المحتوى، لكن إعادة توزيع العناصر + ألوان صحيحة + حركة خفيفة = نتيجة "تبيع" أسرع.'
    },

    projects: [
      {
        id: 1,
        title: 'Conference Landing',
        subtitle: 'Hero typography + CTA system',
        tags: ['Events', 'Landing', 'Bento'],
        h: 240,
        bg: 'linear-gradient(135deg, rgba(229,57,53,.22), rgba(255,255,255,.06), rgba(129,216,208,.18))',
        desc: 'صفحة هبوط فعالية مع تسلسل معلومات واضح وتحويل سريع.'
      },
      {
        id: 2,
        title: 'Packaging System',
        subtitle: 'Print-ready identity',
        tags: ['Printing', 'Packaging', 'Craft'],
        h: 310,
        bg: 'radial-gradient(circle at 30% 30%, rgba(129,216,208,.22), transparent 55%), radial-gradient(circle at 70% 70%, rgba(229,57,53,.22), transparent 55%)',
        desc: 'نظام تغليف متكامل: ألوان، خامات، تشطيب.'
      },
      {
        id: 3,
        title: 'Ad Campaign Set',
        subtitle: 'Hook + message consistency',
        tags: ['Ads', 'Content', 'Performance'],
        h: 260,
        bg: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(129,216,208,.18)), radial-gradient(circle at 60% 40%, rgba(229,57,53,.20), transparent 60%)',
        desc: 'حملة إعلانية مرئية: وحدات متعددة بنفس الDNA.'
      },
      {
        id: 4,
        title: 'Bento Service Hub',
        subtitle: 'Apple/Stripe-inspired grid',
        tags: ['UI', 'Bento', 'Glass'],
        h: 340,
        bg: 'linear-gradient(135deg, rgba(129,216,208,.20), rgba(229,57,53,.18), rgba(255,255,255,.06))',
        desc: 'واجهة خدمات بتصميم bento مع glassmorphism.'
      },
      {
        id: 5,
        title: 'Brand Kit v1',
        subtitle: 'Typography + tone + rules',
        tags: ['Brand', 'Guidelines', 'Type'],
        h: 230,
        bg: 'radial-gradient(circle at 35% 35%, rgba(229,57,53,.24), transparent 55%), linear-gradient(180deg, rgba(255,255,255,.08), transparent)',
        desc: 'باكدج براند: خطوط، ألوان، أسلوب كلام.'
      },
    ],

    openModal(project){
      this.active = project;
      this.modalOpen = true;

      // Analytics: Track project view
      trackAnalytics('project_viewed', {
        projectId: project.id,
        projectTitle: project.title,
        projectTags: project.tags
      });
    },
    closeModal(){
      this.modalOpen = false;
      this.active = null;
    }
  }
}

function beforeAfter(){
  return {
    pos: 50,
    dragging: false,
    start(e){
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      this.dragging = true;
      this.updateFromEvent(e);
    },
    move(e){
      if(!this.dragging) return;
      this.updateFromEvent(e);
    },
    end(){ this.dragging = false; },
    updateFromEvent(e){
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const p = (x / rect.width) * 100;
      this.pos = Math.max(0, Math.min(100, p));
    }
  }
}

// ==============================================
// INITIALIZATION
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Ensure functions are globally available for Alpine
    window.SITE_CONFIG = SITE_CONFIG;
    window.trackAnalytics = trackAnalytics;
    window.fikraApp = fikraApp;
    window.briefWizard = briefWizard;
    window.workGallery = workGallery;
    window.beforeAfter = beforeAfter;
  } catch (e) {
    console.error('[BOOT ERROR]', e);
  }
});
