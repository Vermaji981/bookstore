import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    nav_home: 'Home',
    nav_catalog: 'Books',
    nav_bestsellers: 'Bestsellers',
    nav_deals: 'Special Deals',
    nav_authors: 'Authors',
    nav_my_account: 'My Account',
    nav_signin: 'Sign In',
    nav_cart: 'Cart',
    nav_wishlist: 'Wishlist',
    nav_search_placeholder: 'Search 10,000+ books by title, author, or ISBN...',
    btn_add_to_cart: 'Add to Cart',
    btn_buy_now: 'Buy Now',
    btn_preview: 'Sample Preview',
    btn_compare: 'Compare',
    btn_added: 'Added',
    section_trending: 'Trending Right Now',
    section_bestsellers: 'Weekly Bestsellers',
    section_recommended: 'Recommended For You',
    section_new_arrivals: 'Fresh Off The Press',
    free_delivery_banner: '✨ Free global delivery on orders over $35! Use code BOOKWORM for 10% off.',
    cart_empty: 'Your reading cart is empty',
    cart_subtotal: 'Order Subtotal',
    checkout_proceed: 'Proceed to Checkout',
    checkout_title: 'Checkout & Secure Payment',
    rewards_points: 'Reward Points',
    loyalty_tier: 'Reader Tier',
  },
  hi: {
    nav_home: 'होम',
    nav_catalog: 'किताबें',
    nav_bestsellers: 'बेस्टसेलर्स',
    nav_deals: 'विशेष छूट',
    nav_authors: 'लेखक',
    nav_my_account: 'मेरा खाता',
    nav_signin: 'साइन इन',
    nav_cart: 'कार्ट',
    nav_wishlist: 'विशलिस्ट',
    nav_search_placeholder: '10,000+ किताबें नाम, लेखक या ISBN से खोजें...',
    btn_add_to_cart: 'कार्ट में जोड़ें',
    btn_buy_now: 'अभी खरीदें',
    btn_preview: 'सैंपल पढ़ें',
    btn_compare: 'तुलना करें',
    btn_added: 'जोड़ दिया गया',
    section_trending: 'इस समय सबसे लोकप्रिय',
    section_bestsellers: 'इस सप्ताह के बेस्टसेलर्स',
    section_recommended: 'आपके लिए खास सुझाव',
    section_new_arrivals: 'नया संग्रह',
    free_delivery_banner: '✨ $35 से अधिक के ऑर्डर पर मुफ्त डिलीवरी! 10% छूट के लिए BOOKWORM कोड का प्रयोग करें।',
    cart_empty: 'आपकी कार्ट खाली है',
    cart_subtotal: 'कुल राशि',
    checkout_proceed: 'चेकआउट के लिए आगे बढ़ें',
    checkout_title: 'सुरक्षित चेकआउट और भुगतान',
    rewards_points: 'रिवॉर्ड पॉइंट्स',
    loyalty_tier: 'रीडर टियर',
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('pagehaven_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('pagehaven_lang', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key, fallback = '') => {
    return translations[lang]?.[key] || translations['en']?.[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

