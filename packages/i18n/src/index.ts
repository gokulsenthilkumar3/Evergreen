export type Locale = 'en' | 'ta';

export const messages = {
  en: {
    dashboard: 'Dashboard', inventory: 'Inventory', production: 'Production',
    costing: 'Costing', invoices: 'Invoices', customers: 'Customers',
    settings: 'Settings', save: 'Save', cancel: 'Cancel', logout: 'Log out',
  },
  ta: {
    dashboard: 'முகப்புப் பலகை', inventory: 'சரக்கு', production: 'உற்பத்தி',
    costing: 'செலவுக் கணக்கு', invoices: 'விலைப்பட்டியல்', customers: 'வாடிக்கையாளர்கள்',
    settings: 'அமைப்புகள்', save: 'சேமி', cancel: 'ரத்து செய்', logout: 'வெளியேறு',
  },
} as const;

export type MessageKey = keyof typeof messages.en;
export const translate = (locale: Locale, key: MessageKey): string => messages[locale][key];
