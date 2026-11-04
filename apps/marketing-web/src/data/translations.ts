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
      caseStudies: 'Example Workflows',
      support: 'Support',
      millApp: 'Mill App →',
      startPoc: 'Start Free POC',
    },
    ticker: {
      badge: '🛡️ ENTERPRISE SAFEGUARD',
      text: 'Activation and offline validity follow signed owner terms. Plan renewal before the activation deadline.',
      cta: 'See Pricing →',
    },
    hero: {
      badge: 'EverGreen · Textile operations · Pilot acceptance required',
      h1Line1: 'The Operating System',
      h1Line2: 'for Modern',
      h1Gradient: 'Spinning Mills',
      p: 'Connect receipt, production, stock, invoicing and payments, with Tally XML export and Book-Ellam (புக் எல்லாம்) register search. Choose a customer-specific local or hosted installation and validate it in a pilot.',
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
      simulatorSubtitle: 'Explore sample receipt, production and accounting scenarios. The simulator uses illustrative values and has no physical device connection.',
      calculatorEyebrow: 'TEXTILE ECONOMICS & ROI MATRIX',
      calculatorTitle: 'Calculate Your Mill’s Annual Realization & Savings',
      calculatorSubtitle: 'Fine-tune count, comber noil, power tariffs, and tare moisture deductions to compute per-kilogram yarn margins and fraud recovery.',
      hardwareEyebrow: 'HARDWARE & WEIGHBRIDGE COMPATIBILITY',
      hardwareTitle: 'Plan a Supported-Indicator Pilot',
      hardwareSubtitle: 'Parser examples are a starting point. Confirm the exact indicator protocol, connection, calibration and device identity before accepting physical capture.',
      featuresEyebrow: 'CORE CAPABILITIES',
      featuresTitle: 'Every Feature Your Mill Needs — Nothing It Doesn’t',
      featuresSubtitle: 'Six pillars of textile intelligence, engineered for the reality of South Asian manufacturing.',
      pricingEyebrow: 'TRANSPARENT PRICING',
      pricingTitle: 'License Plans Built for Every Mill Size',
      pricingSubtitle: 'Discuss pricing, activation periods, support and acceptance requirements with the owner before purchase.',
      caseStudiesEyebrow: 'ILLUSTRATIVE WORKFLOWS',
      caseStudiesTitle: 'Explore Workflows for Your Mill',
      caseStudiesSubtitle: 'Fictional operating profiles illustrate how to evaluate the workflow. They are not customer testimonials or measured results.',
      faqEyebrow: 'FREQUENTLY ASKED QUESTIONS',
      faqTitle: 'Questions Mill Owners Ask Before Signing',
    },
    grace: {
      title: 'Plan Activation and Renewal with the Owner',
      desc: 'Signed licence terms define activation and offline validity. Expired activation blocks access until a valid licence is installed; arrange renewal before the deadline.',
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
      caseStudies: 'செய்முறை உதாரணங்கள்',
      support: 'வாடிக்கையாளர் உதவி',
      millApp: 'ஆலை செயலி →',
      startPoc: 'இலவச POC துவங்கு',
    },
    ticker: {
      badge: '🛡️ உரிமத் திட்டமிடல்',
      text: 'கையொப்பமிட்ட உரிமத்தின் விதிகளே செயல்பாட்டுக் காலத்தை நிர்ணயிக்கும். காலாவதிக்கு முன் புதுப்பிக்கத் திட்டமிடுங்கள்.',
      cta: 'விலை விபரம் →',
    },
    hero: {
      badge: 'EverGreen · ஜவுளிச் செயல்பாடுகள் · முன்னோட்டச் சோதனை தேவை',
      h1Line1: 'நவீன பருத்தி',
      h1Line2: 'நூற்பாலைகளுக்கான',
      h1Gradient: 'முழுமையான இயங்குதளம்',
      p: 'உள்வரவு, உற்பத்தி, இருப்பு, விற்பனை, பில் மற்றும் பணப்பதிவை இணைக்கவும். டாலி XML ஏற்றுமதியும் புக் எல்லாம் தேடலும் உள்ளன. உங்கள் நிறுவனத்திற்கான நிறுவலை முன்னோட்டச் சோதனையில் உறுதிப்படுத்தவும்.',
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
      simulatorSubtitle: 'உள்வரவு, உற்பத்தி மற்றும் கணக்குப் பதிவின் விளக்க உதாரணங்களைப் பார்க்கவும். இங்கு உண்மையான இயந்திர இணைப்பு இல்லை.',
      calculatorEyebrow: 'நூல் ஆலை பொருளாதார கணக்கீடு',
      calculatorTitle: 'உங்கள் ஆலையின் ஆண்டு சேமிப்பு மற்றும் லாபக் கணக்கீடு',
      calculatorSubtitle: 'நூல் கவுண்ட், கோம்பர் வேஸ்ட் %, மின் கட்டணம் மற்றும் எடைமேடை ஈரம் கழிவு ஆகியவற்றை உள்ளிட்டு துல்லியமான லாபத்தை அறியவும்.',
      hardwareEyebrow: 'எடைமேடை கருவிகள் பொருத்தம்',
      hardwareTitle: 'ஆதரிக்கப்படும் கருவிக்கான சோதனையைத் திட்டமிடுங்கள்',
      hardwareSubtitle: 'கருவியின் நெறிமுறை, இணைப்பு, அளவுத்திருத்தம் மற்றும் அடையாளத்தை முன்னோட்டச் சோதனையில் உறுதிப்படுத்த வேண்டும்.',
      featuresEyebrow: 'முக்கிய திறன்கள்',
      featuresTitle: 'உங்கள் நூற்பாலைக்கு தேவையான அனைத்தும் — தேவையில்லாத எதுவும் இல்லை',
      featuresSubtitle: 'தென்னிந்திய ஜவுளி ஆலைகளின் நிஜமான தேவைகளுக்காக உருவாக்கப்பட்ட 6 முக்கிய தொழில்நுட்ப தூண்கள்.',
      pricingEyebrow: 'வெளிப்படையான விலை திட்டம்',
      pricingTitle: 'அனைத்து அளவு ஆலைகளுக்கும் ஏற்ற நியாயமான உரிமக் கட்டணம்',
      pricingSubtitle: 'விலை, உரிமக் காலம், ஆதரவு மற்றும் ஏற்புச் சோதனைகளை உரிமையாளருடன் உறுதிப்படுத்தவும்.',
      caseStudiesEyebrow: 'விளக்கச் செய்முறைகள்',
      caseStudiesTitle: 'உங்கள் ஆலைக்கான செய்முறைகளை ஆராயுங்கள்',
      caseStudiesSubtitle: 'இவை கற்பனைச் செயல்முறை உதாரணங்கள். வாடிக்கையாளர் சான்றுகள் அல்லது அளவிடப்பட்ட முடிவுகள் அல்ல.',
      faqEyebrow: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      faqTitle: 'ஆலை உரிமையாளர்கள் கேட்கும் முக்கிய கேள்விகள்',
    },
    grace: {
      title: 'உரிமப் புதுப்பிப்பை முன்கூட்டியே திட்டமிடுங்கள்',
      desc: 'கையொப்பமிட்ட உரிமம் செயல்பாட்டுக் காலத்தை நிர்ணயிக்கும். காலாவதியானால் செல்லுபடியான உரிமம் நிறுவும் வரை அணுகல் தடைப்படும். முன்கூட்டியே புதுப்பிக்கவும்.',
    },
  },
};
