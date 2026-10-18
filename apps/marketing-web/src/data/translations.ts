export type Language = 'en' | 'ta';

export interface Translations {
  nav: {
    platform: string;
    simulators: string;
    features: string;
    calculator: string;
    hardware: string;
    pricing: string;
    integrations: string;
    caseStudies: string;
    support: string;
    millApp: string;
    startPoc: string;
  };
  ticker: {
    badge: string;
    text: string;
    cta: string;
  };
  hero: {
    badge: string;
    h1Line1: string;
    h1Line2: string;
    h1Gradient: string;
    p: string;
    startPocBtn: string;
    exploreBtn: string;
    interactiveTourBtn: string;
  };
  stats: {
    spindles: string;
    fraud: string;
    grace: string;
    reactivation: string;
    uptime: string;
    clouds: string;
  };
  sections: {
    simulatorEyebrow: string;
    simulatorTitle: string;
    simulatorSubtitle: string;
    calculatorEyebrow: string;
    calculatorTitle: string;
    calculatorSubtitle: string;
    hardwareEyebrow: string;
    hardwareTitle: string;
    hardwareSubtitle: string;
    featuresEyebrow: string;
    featuresTitle: string;
    featuresSubtitle: string;
    pricingEyebrow: string;
    pricingTitle: string;
    pricingSubtitle: string;
    caseStudiesEyebrow: string;
    caseStudiesTitle: string;
    caseStudiesSubtitle: string;
    faqEyebrow: string;
    faqTitle: string;
  };
  grace: {
    title: string;
    desc: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    nav: {
      platform: 'Platform',
      simulators: 'Live Simulator',
      features: 'Features',
      calculator: 'ROI Matrix',
      hardware: 'Hardware',
      pricing: 'Pricing',
      integrations: 'Integrations',
      caseStudies: 'Case Studies',
      support: 'Support',
      millApp: 'Mill App →',
      startPoc: 'Start Free POC',
    },
    ticker: {
      badge: '🛡️ ENTERPRISE SAFEGUARD',
      text: '30-Day Active Grace Quota: Your mill never stops on license expiry. Reactivate in under 3 minutes upon payment confirmation.',
      cta: 'See Pricing →',
    },
    hero: {
      badge: 'EverGreen v1.2.4-LTS · Live in Tamil Nadu · 140K+ Spindles Managed',
      h1Line1: 'The Operating System',
      h1Line2: 'for Modern',
      h1Gradient: 'Spinning Mills',
      p: 'From raw cotton bales through weighbridge fraud detection, spindle telemetry, automated Tally Prime XML, and the Book-Ellam (புக் எல்லாம்) all-books audit engine. Deploy in one command — local VM, GCP, AWS, or Azure.',
      startPocBtn: '🚀 Start Free 30-Day POC',
      exploreBtn: 'Explore Features ↓',
      interactiveTourBtn: '🎬 Interactive Tour (2 Min)',
    },
    stats: {
      spindles: 'Active Spindles Managed',
      fraud: 'Moisture Fraud Caught (Live)',
      grace: 'Unrestricted Grace Quota',
      reactivation: 'Instant Reactivation SLA',
      uptime: 'Multi-Cloud Uptime',
      clouds: 'GCP · AWS · Azure · Local VM',
    },
    sections: {
      simulatorEyebrow: 'INTERACTIVE FACTORY DIGITAL TWIN',
      simulatorTitle: 'Experience EverGreen OS in Action Right Now',
      simulatorSubtitle: 'Test live weighbridge RS-232 telemetry, Book-Ellam cross-register search, spindle speed gauges, and 3-minute grace reactivation without installing anything.',
      calculatorEyebrow: 'TEXTILE ECONOMICS & ROI MATRIX',
      calculatorTitle: 'Calculate Your Mill’s Annual Realization & Savings',
      calculatorSubtitle: 'Fine-tune count, comber noil, power tariffs, and tare moisture deductions to compute per-kilogram yarn margins and fraud recovery.',
      hardwareEyebrow: 'HARDWARE & WEIGHBRIDGE COMPATIBILITY',
      hardwareTitle: 'Connects Directly with Your Existing Mill Scales & Indicators',
      hardwareSubtitle: 'Zero replacement needed. RS-232 and RS-485 serial drivers for Avery, Essae, Mettler-Toledo, Contech, and Sartorius with instant hardware tare locking.',
      featuresEyebrow: 'CORE CAPABILITIES',
      featuresTitle: 'Every Feature Your Mill Needs — Nothing It Doesn’t',
      featuresSubtitle: 'Six pillars of textile intelligence, engineered for the reality of South Asian manufacturing.',
      pricingEyebrow: 'TRANSPARENT PRICING',
      pricingTitle: 'License Plans Built for Every Mill Size',
      pricingSubtitle: 'No hidden fees. Regional multipliers for Tier-2 cities. 30-day grace on all plans. Upgrade or downgrade anytime.',
      caseStudiesEyebrow: 'CUSTOMER SUCCESS',
      caseStudiesTitle: 'Real Mills. Real Results. Verified Numbers.',
      caseStudiesSubtitle: 'Actual operational data and audits from spinning mills running EverGreen across Tirupur, Coimbatore, Erode, and Karur.',
      faqEyebrow: 'FREQUENTLY ASKED QUESTIONS',
      faqTitle: 'Questions Mill Owners Ask Before Signing',
    },
    grace: {
      title: '30-Day Active Grace Quota — Our Guarantee to Every Mill',
      desc: 'When your license expires, operations never stop. For 30 full days your weighbridge, invoicing, and Book-Ellam continue uninterrupted. Once payment is confirmed (NEFT/RTGS/UPI), reactivation happens in under 3 minutes.',
    },
  },
  ta: {
    nav: {
      platform: 'இயங்குதளம்',
      simulators: 'நேரடி மாதிரி (Live Demo)',
      features: 'அம்சங்கள்',
      calculator: 'லாப கால்குலேட்டர்',
      hardware: 'எடைமேடை கருவிகள்',
      pricing: 'விலை விபரம்',
      integrations: 'இணைப்புகள்',
      caseStudies: 'ஆலை அனுபவங்கள்',
      support: 'வாடிக்கையாளர் உதவி',
      millApp: 'ஆலை செயலி →',
      startPoc: 'இலவச POC துவங்கு',
    },
    ticker: {
      badge: '🛡️ ஆலை பாதுகாப்பு உத்திரவாதம்',
      text: '30-நாள் தடையற்ற செயல்பாட்டு சலுகை: உரிமம் முடிந்தாலும் ஆலை இயக்கம் நிற்காது. பணம் செலுத்திய 3 நிமிடத்தில் மீண்டும் இயங்கும்.',
      cta: 'விலை விபரம் →',
    },
    hero: {
      badge: 'EverGreen v1.2.4-LTS · தமிழ்நாட்டில் நேரலையில் · 140,000+ கதிர்கள் இயக்கம்',
      h1Line1: 'நவீன பருத்தி',
      h1Line2: 'நூற்பாலைகளுக்கான',
      h1Gradient: 'முழுமையான இயங்குதளம்',
      p: 'பருத்தி பேல் உள்வரவு, எடைமேடை ஈரம் மோசடி தடுப்பு, கதிர் (Spindle) நேரடி கணக்கீடு, தானியங்கி டாலி பிரைம் XML மற்றும் புக் எல்லாம் (Book-Ellam) ஒருங்கிணைந்த தணிக்கை என்ஜின். ஒரே கிளிக்கில் நிறுவுங்கள்.',
      startPocBtn: '🚀 30-நாள் இலவச POC துவங்குங்கள்',
      exploreBtn: 'அம்சங்களை காண்க ↓',
      interactiveTourBtn: '🎬 2-நிமிட நேரடி விளக்கம்',
    },
    stats: {
      spindles: 'இயங்கும் ஸ்பிண்டில்கள் (கதிர்கள்)',
      fraud: 'தடுக்கப்பட்ட ஈரம் மோசடி பணம்',
      grace: 'தடையற்ற சலுகை நாட்கள்',
      reactivation: 'மீண்டும் இயங்கும் நேரம்',
      uptime: 'ஆலை இயக்க உறுதிப்பாடு',
      clouds: 'GCP · AWS · Azure · லோக்கல் VM',
    },
    sections: {
      simulatorEyebrow: 'நேரடி டிஜிட்டல் ஆலை மாதிரி',
      simulatorTitle: 'EverGreen OS-ஐ உங்கள் திரையிலேயே நேரடியாக சோதித்துப் பாருங்கள்',
      simulatorSubtitle: 'எடைமேடை RS-232 இணைப்பு, புக் எல்லாம் தேடல், ஸ்பிண்டில் வேக அளவீடு மற்றும் 3 நிமிட உரிம மீட்பு ஆகியவற்றை இப்போது உடனே சோதிக்கவும்.',
      calculatorEyebrow: 'நூல் ஆலை பொருளாதார கணக்கீடு',
      calculatorTitle: 'உங்கள் ஆலையின் ஆண்டு சேமிப்பு மற்றும் லாபக் கணக்கீடு',
      calculatorSubtitle: 'நூல் கவுண்ட், கோம்பர் வேஸ்ட் %, மின் கட்டணம் மற்றும் எடைமேடை ஈரம் கழிவு ஆகியவற்றை உள்ளிட்டு துல்லியமான லாபத்தை அறியவும்.',
      hardwareEyebrow: 'எடைமேடை கருவிகள் பொருத்தம்',
      hardwareTitle: 'உங்கள் ஆலையில் உள்ள அனைத்து எடைமேடை இண்டிகேட்டர்களுடன் இணையும்',
      hardwareSubtitle: 'பழைய சாதனங்களை மாற்றத் தேவையில்லை. Avery, Essae, Mettler, Contech போன்ற அனைத்து கருவிகளுடனும் RS-232 மூலம் உடனடியாக செயல்படும்.',
      featuresEyebrow: 'முக்கிய திறன்கள்',
      featuresTitle: 'உங்கள் நூற்பாலைக்கு தேவையான அனைத்தும் — தேவையில்லாத எதுவும் இல்லை',
      featuresSubtitle: 'தென்னிந்திய ஜவுளி ஆலைகளின் நிஜமான தேவைகளுக்காக உருவாக்கப்பட்ட 6 முக்கிய தொழில்நுட்ப தூண்கள்.',
      pricingEyebrow: 'வெளிப்படையான விலை திட்டம்',
      pricingTitle: 'அனைத்து அளவு ஆலைகளுக்கும் ஏற்ற நியாயமான உரிமக் கட்டணம்',
      pricingSubtitle: 'எந்தவித மறைமுக கட்டணங்களும் இல்லை. இரண்டாம் நிலை நகரங்களுக்கான தள்ளுபடி சலுகை. 30 நாள் முழுமையான சலுகை காலம்.',
      caseStudiesEyebrow: 'வெற்றி பெற்ற ஆலைகள்',
      caseStudiesTitle: 'உண்மையான ஆலைகள். உண்மையான முடிவுகள். நிரூபிக்கப்பட்ட எண்கள்.',
      caseStudiesSubtitle: 'திருப்பூர், கோவை, ஈரோடு, கரூர் மற்றும் திண்டுக்கல் ஆலைகளில் EverGreen OS ஏற்படுத்திய மாற்றங்கள்.',
      faqEyebrow: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      faqTitle: 'ஆலை உரிமையாளர்கள் கேட்கும் முக்கிய கேள்விகள்',
    },
    grace: {
      title: '30-நாள் தடையற்ற செயல்பாட்டு சலுகை — எங்கள் உத்திரவாதம்',
      desc: 'உரிம காலம் முடிந்தாலும் கூட ஆலை வேலைகள் 30 நாட்களுக்கு எக்காரணம் கொண்டும் நிற்காது. எடைமேடை, பில்லிங், டாலி XML அனைத்தும் தொடர்ந்து இயங்கும். UTR உறுதி செய்யப்பட்டதும் 3 நிமிடங்களில் கணக்கு புதுப்பிக்கப்படும்.',
    },
  },
};
