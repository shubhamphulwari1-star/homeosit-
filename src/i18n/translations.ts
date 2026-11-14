import type { Language } from '../types/clinic';

export interface TranslationCopy {
  nav: {
    home: string;
    about: string;
    medicines: string;
    categories: string;
    services: string;
    blog: string;
    contact: string;
    bookAppointment: string;
    searchPlaceholder: string;
    adminPortal: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    ctaBook: string;
    ctaMedicines: string;
    ctaCategories: string;
    ctaContact: string;
    metrics: {
      yearsLabel: string;
      patientsLabel: string;
      remediesLabel: string;
      consultLabel: string;
    };
  };
  about: {
    sectionLabel: string;
    title: string;
    doctorTitle: string;
    regLabel: string;
    timingsLabel: string;
    feeTitle: string;
    firstVisit: string;
    followUp: string;
    videoConsult: string;
  };
  services: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    bookThis: string;
  };
  medicines: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    exploreAll: string;
    searchLabel: string;
    allCategories: string;
    allManufacturers: string;
    allProductTypes: string;
    allPotencies: string;
    resetFilters: string;
    showingCount: string;
    noResults: string;
    viewDetails: string;
    safetyNotice: string;
  };
  categories: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    exploreAll: string;
    searchLabel: string;
    consultCondition: string;
  };
  appointment: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    inClinic: string;
    videoConsult: string;
    patientName: string;
    phone: string;
    email: string;
    preferredDate: string;
    preferredSlot: string;
    healthCategory: string;
    symptoms: string;
    submit: string;
    submitting: string;
    confirmedTitle: string;
    confirmedNote: string;
    bookAnother: string;
  };
  faq: {
    sectionLabel: string;
    title: string;
    subtitle: string;
  };
  contact: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    addressLabel: string;
    phoneLabel: string;
    whatsappLabel: string;
    emailLabel: string;
    timingsLabel: string;
    chatWhatsapp: string;
    getDirections: string;
    formTitle: string;
    sendInquiry: string;
    inquirySent: string;
  };
  blog: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    readArticle: string;
  };
  footer: {
    clinicHours: string;
    quickLinks: string;
    patientResources: string;
    disclaimer: string;
    mapsTerms: string;
  };
}

export const translations: Record<Language, TranslationCopy> = {
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      medicines: 'Medicines',
      categories: 'Health Categories',
      services: 'Services',
      blog: 'Blog',
      contact: 'Contact',
      bookAppointment: 'Book Appointment',
      searchPlaceholder: 'Search remedies or health conditions...',
      adminPortal: 'Admin Portal',
    },
    hero: {
      eyebrow: 'Classical Constitutional Homeopathy · New Delhi & Online Across India',
      headline: 'Gentle, root-cause homeopathic care tailored to your constitution.',
      subheadline:
        'Individualized case-taking, classical single-remedy prescriptions, and a verified A–Z homeopathic medicine reference guided by experienced clinical practice.',
      ctaBook: 'Book Appointment',
      ctaMedicines: 'Explore Medicines',
      ctaCategories: 'View Health Categories',
      ctaContact: 'Contact Clinic',
      metrics: {
        yearsLabel: 'Years Clinical Practice',
        patientsLabel: 'Patients Consulted',
        remediesLabel: 'Verified A–Z Remedies',
        consultLabel: 'In-Clinic & Video Consults',
      },
    },
    about: {
      sectionLabel: 'Clinic & Physician Profile',
      title: 'Classical care grounded in clinical observation and Materia Medica.',
      doctorTitle: 'Chief Consultant Homeopath',
      regLabel: 'Council Registration',
      timingsLabel: 'OPD Timings',
      feeTitle: 'Transparent Consultation Schedule (INR)',
      firstVisit: 'First Constitutional Visit',
      followUp: 'Follow-Up Consultation',
      videoConsult: 'Online Video Consultation',
    },
    services: {
      sectionLabel: 'Clinical Services',
      title: 'Specialized homeopathic programs for acute and chronic conditions.',
      subtitle:
        'Every treatment plan begins with a structured constitutional case-taking covering physical symptoms, medical history, and lifestyle factors.',
      bookThis: 'Book Consultation',
    },
    medicines: {
      sectionLabel: 'A–Z Homeopathy Medicine Directory',
      title: 'Verified Materia Medica & Remedy Reference',
      subtitle:
        'Browse classical dilutions, mother tinctures, biochemic salts, bio-combinations, LM potencies, and external formulations by alphabet, manufacturer, or potency.',
      exploreAll: 'Explore Full A–Z Directory',
      searchLabel: 'Search medicine name, botanical source, or common name...',
      allCategories: 'All 17 Categories',
      allManufacturers: 'All Manufacturers',
      allProductTypes: 'All Product Types',
      allPotencies: 'All Potencies',
      resetFilters: 'Reset Filters',
      showingCount: 'Verified Published Remedies',
      noResults: 'No verified remedies matched your current filters.',
      viewDetails: 'View Full Monograph',
      safetyNotice:
        'Educational pharmacopoeia reference only. Potency selection and dosage must be prescribed by a qualified homeopathic physician.',
    },
    categories: {
      sectionLabel: 'A–Z Health Categories',
      title: 'Explore conditions managed through constitutional homeopathy.',
      subtitle:
        'Select any health category from A to Z to review symptom patterns, holistic management approach, and classical remedies often studied in Materia Medica.',
      exploreAll: 'View All A–Z Health Categories',
      searchLabel: 'Search health condition or organ system...',
      consultCondition: 'Book Consultation for This Category',
    },
    appointment: {
      sectionLabel: 'Appointment Scheduling',
      title: 'Schedule your In-Clinic or Online Video Consultation.',
      subtitle:
        'Choose your consultation mode, preferred time slot, and primary concern. Our clinic coordinator confirms all bookings on phone and WhatsApp.',
      inClinic: 'In-Clinic Visit',
      videoConsult: 'Online Video Consult',
      patientName: 'Patient Full Name',
      phone: 'Mobile / WhatsApp Number (+91)',
      email: 'Email Address (Optional)',
      preferredDate: 'Preferred Date',
      preferredSlot: 'Preferred Time Slot',
      healthCategory: 'Primary Health Category',
      symptoms: 'Brief Description of Symptoms & Duration',
      submit: 'Confirm Appointment Request',
      submitting: 'Submitting Request...',
      confirmedTitle: 'Appointment Request Recorded',
      confirmedNote:
        'Our clinic desk will verify your slot and share clinic directions or video consultation link via WhatsApp.',
      bookAnother: 'Schedule Another Appointment',
    },
    faq: {
      sectionLabel: 'Patient Guidance & FAQ',
      title: 'Common questions about homeopathic treatment and medicines.',
      subtitle: 'Clear answers regarding safety, timelines, dietary precautions, and online medicine dispatch.',
    },
    contact: {
      sectionLabel: 'Clinic Location & Contact',
      title: 'Visit the clinic in Green Park or reach our consultation desk.',
      subtitle: 'Call, message on WhatsApp, or send a message below for clinic directions and appointment inquiries.',
      addressLabel: 'Clinic Address',
      phoneLabel: 'Phone Number',
      whatsappLabel: 'WhatsApp Desk',
      emailLabel: 'Email Address',
      timingsLabel: 'OPD Hours',
      chatWhatsapp: 'Message on WhatsApp',
      getDirections: 'Open in Google Maps',
      formTitle: 'Send a Direct Clinic Inquiry',
      sendInquiry: 'Send Message',
      inquirySent: 'Thank you. Your inquiry has been received by our clinic desk.',
    },
    blog: {
      sectionLabel: 'Patient Education & Articles',
      title: 'Evidence-informed guides on classical homeopathy.',
      subtitle: 'Practical articles written for Indian families on potencies, seasonal immunity, and safe remedy care.',
      readArticle: 'Read Article',
    },
    footer: {
      clinicHours: 'Clinic Hours & Location',
      quickLinks: 'Clinic Navigation',
      patientResources: 'Patient Resources',
      disclaimer:
        'Medical Disclaimer: Information in the A–Z Medicine Directory is provided for educational reference based on classical homeopathic pharmacopoeia and does not replace an in-person clinical diagnosis.',
      mapsTerms: 'Clinic location map powered by Google Maps Platform (subject to Google Maps End User Terms).',
    },
  },
  hi: {
    nav: {
      home: 'होम',
      about: 'परिचय',
      medicines: 'दवाइयां',
      categories: 'स्वास्थ्य श्रेणियां',
      services: 'सेवाएं',
      blog: 'ब्लॉग',
      contact: 'संपर्क',
      bookAppointment: 'अपॉइंटमेंट बुक करें',
      searchPlaceholder: 'दवा या स्वास्थ्य समस्या खोजें...',
      adminPortal: 'एडमिन पोर्टल',
    },
    hero: {
      eyebrow: 'शास्त्रीय होम्योपैथी चिकित्सा · नई दिल्ली एवं ऑनलाइन परामर्श',
      headline: 'आपकी प्रकृति के अनुरूप सौम्य और जड़ से होम्योपैथिक उपचार।',
      subheadline:
        'व्यक्तिगत केस-टेकिंग, प्रामाणिक एकल औषधि नुस्खे, और अनुभवी चिकित्सक द्वारा सत्यापित A–Z होम्योपैथिक औषधि निर्देशिका।',
      ctaBook: 'अपॉइंटमेंट बुक करें',
      ctaMedicines: 'दवाइयां देखें',
      ctaCategories: 'स्वास्थ्य श्रेणियां देखें',
      ctaContact: 'क्लिनिक से संपर्क करें',
      metrics: {
        yearsLabel: 'वर्षों का नैदानिक अनुभव',
        patientsLabel: 'संतुष्ट रोगी परामर्श',
        remediesLabel: 'सत्यापित A–Z औषधियां',
        consultLabel: 'क्लिनिक एवं वीडियो परामर्श',
      },
    },
    about: {
      sectionLabel: 'क्लिनिक एवं चिकित्सक परिचय',
      title: 'मटेरिया मेडिका और गहन नैदानिक अनुभव पर आधारित उपचार।',
      doctorTitle: 'मुख्य होम्योपैथिक परामर्शदाता',
      regLabel: 'परिषद पंजीकरण संख्या',
      timingsLabel: 'ओपीडी समय',
      feeTitle: 'पारदर्शी परामर्श शुल्क (INR ₹)',
      firstVisit: 'प्रथम पूर्ण परामर्श',
      followUp: 'फॉलो-अप परामर्श',
      videoConsult: 'ऑनलाइन वीडियो परामर्श',
    },
    services: {
      sectionLabel: 'चिकित्सा सेवाएं',
      title: 'तीव्र और दीर्घकालिक रोगों के लिए विशेष होम्योपैथिक कार्यक्रम।',
      subtitle:
        'प्रत्येक उपचार योजना शारीरिक लक्षणों, चिकित्सा इतिहास और जीवनशैली के विस्तृत मूल्यांकन से शुरू होती है।',
      bookThis: 'परामर्श बुक करें',
    },
    medicines: {
      sectionLabel: 'A–Z होम्योपैथिक औषधि निर्देशिका',
      title: 'सत्यापित मटेरिया मेडिका एवं औषधि संदर्भ',
      subtitle:
        'डायल्यूशन, मदर टिंचर, बायोकेमिक, बायो-कॉम्बिनेशन, LM पोटेंसी और बाहरी उत्पादों को वर्णमाला, निर्माता या पोटेंसी के अनुसार खोजें।',
      exploreAll: 'पूर्ण A–Z निर्देशिका देखें',
      searchLabel: 'दवा का नाम, वानस्पतिक स्रोत या सामान्य नाम खोजें...',
      allCategories: 'सभी 17 श्रेणियां',
      allManufacturers: 'सभी निर्माता',
      allProductTypes: 'सभी उत्पाद प्रकार',
      allPotencies: 'सभी पोटेंसी',
      resetFilters: 'फ़िल्टर रीसेट करें',
      showingCount: 'सत्यापित प्रकाशित औषधियां',
      noResults: 'आपके फ़िल्टर से कोई सत्यापित औषधि नहीं मिली।',
      viewDetails: 'पूरा विवरण देखें',
      safetyNotice:
        'यह केवल शैक्षिक संदर्भ के लिए है। उचित पोटेंसी और खुराक के लिए योग्य होम्योपैथिक चिकित्सक से परामर्श लें।',
    },
    categories: {
      sectionLabel: 'A–Z स्वास्थ्य श्रेणियां',
      title: 'होम्योपैथी द्वारा प्रबंधित प्रमुख स्वास्थ्य समस्याओं को जानें।',
      subtitle:
        'लक्षण, समग्र उपचार दृष्टिकोण और संबंधित औषधियों की जानकारी देखने के लिए A से Z तक कोई भी श्रेणी चुनें।',
      exploreAll: 'सभी A–Z स्वास्थ्य श्रेणियां देखें',
      searchLabel: 'स्वास्थ्य समस्या या अंग प्रणाली खोजें...',
      consultCondition: 'इस समस्या के लिए परामर्श बुक करें',
    },
    appointment: {
      sectionLabel: 'अपॉइंटमेंट बुकिंग',
      title: 'क्लिनिक विज़िट या ऑनलाइन वीडियो परामर्श बुक करें।',
      subtitle:
        'परामर्श का माध्यम, पसंदीदा समय और अपनी मुख्य समस्या चुनें। क्लिनिक डेस्क फ़ोन और व्हाट्सएप पर पुष्टि करेगा।',
      inClinic: 'क्लिनिक विज़िट',
      videoConsult: 'ऑनलाइन वीडियो परामर्श',
      patientName: 'रोगी का पूरा नाम',
      phone: 'मोबाइल / व्हाट्सएप नंबर (+91)',
      email: 'ईमेल पता (वैकल्पिक)',
      preferredDate: 'पसंदीदा तिथि',
      preferredSlot: 'पसंदीदा समय स्लॉट',
      healthCategory: 'मुख्य स्वास्थ्य श्रेणी',
      symptoms: 'लक्षणों और अवधि का संक्षिप्त विवरण',
      submit: 'अपॉइंटमेंट अनुरोध भेजें',
      submitting: 'अनुरोध भेजा जा रहा है...',
      confirmedTitle: 'अपॉइंटमेंट अनुरोध दर्ज हो गया',
      confirmedNote: 'हमारा क्लिनिक डेस्क समय की पुष्टि करके व्हाट्सएप पर विवरण साझा करेगा।',
      bookAnother: 'नया अपॉइंटमेंट बुक करें',
    },
    faq: {
      sectionLabel: 'रोगी मार्गदर्शन एवं प्रश्न',
      title: 'होम्योपैथिक उपचार और दवाइयों से जुड़े सामान्य प्रश्न।',
      subtitle: 'सुरक्षा, समय अवधि, परहेज और ऑनलाइन दवा वितरण से संबंधित स्पष्ट उत्तर।',
    },
    contact: {
      sectionLabel: 'क्लिनिक स्थान एवं संपर्क',
      title: 'ग्रीन पार्क क्लिनिक आएं या हमारे डेस्क से संपर्क करें।',
      subtitle: 'दिशा-निर्देश और परामर्श पूछताछ के लिए कॉल करें, व्हाट्सएप करें या संदेश भेजें।',
      addressLabel: 'क्लिनिक का पता',
      phoneLabel: 'फ़ोन नंबर',
      whatsappLabel: 'व्हाट्सएप डेस्क',
      emailLabel: 'ईमेल पता',
      timingsLabel: 'ओपीडी समय',
      chatWhatsapp: 'व्हाट्सएप पर संदेश भेजें',
      getDirections: 'Google Maps में खोलें',
      formTitle: 'सीधा क्लिनिक संदेश भेजें',
      sendInquiry: 'संदेश भेजें',
      inquirySent: 'धन्यवाद। आपका संदेश हमारे क्लिनिक डेस्क को प्राप्त हो गया है।',
    },
    blog: {
      sectionLabel: 'रोगी शिक्षा एवं लेख',
      title: 'शास्त्रीय होम्योपैथी पर प्रामाणिक जानकारीपूर्ण लेख।',
      subtitle: 'पोटेंसी, मौसमी एलर्जी और सुरक्षित दवा रखरखाव पर भारतीय परिवारों के लिए मार्गदर्शिका।',
      readArticle: 'लेख पढ़ें',
    },
    footer: {
      clinicHours: 'क्लिनिक समय एवं पता',
      quickLinks: 'त्वरित लिंक',
      patientResources: 'रोगी संसाधन',
      disclaimer:
        'चिकित्सा अस्वीकरण: A–Z औषधि निर्देशिका की जानकारी केवल शैक्षिक संदर्भ के लिए है और यह चिकित्सकीय निदान का विकल्प नहीं है।',
      mapsTerms: 'क्लिनिक मानचित्र Google Maps Platform द्वारा संचालित है।',
    },
  },
};
