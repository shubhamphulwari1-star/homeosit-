export type Language = 'en' | 'hi';

export type ActiveRoute =
  | 'home'
  | 'about'
  | 'medicines'
  | 'categories'
  | 'services'
  | 'blog'
  | 'contact'
  | 'admin';

export const MEDICINE_CATEGORIES = [
  'Dilutions',
  'Mother Tinctures',
  'Biochemic Medicines',
  'Tissue Salts',
  'Bio-Combinations',
  'Tablets',
  'Globules',
  'Drops',
  'Syrups',
  'Tonics',
  'Triturations',
  'Ointments',
  'Creams',
  'Gels',
  'Lotions',
  'LM Potencies',
  'External-use Products',
] as const;

export type MedicineCategory = (typeof MEDICINE_CATEGORIES)[number];

export type PublicationStatus = 'Published' | 'Pending Review' | 'Draft';

export interface MedicineRecord {
  medicineId: string;
  medicineName: string;
  scientificName: string;
  commonName: string;
  botanicalSource: string;
  medicineCategory: MedicineCategory;
  productType: string;
  manufacturer: string;
  availablePotencies: string[];
  availablePackSizes: string[];
  productImage: string;
  description: string;
  classicalReference: string;
  safetyInformation: string;
  sourceUrl: string;
  lastUpdatedDate: string;
  publicationStatus: PublicationStatus;
}

export interface HealthCategory {
  id: string;
  name: string;
  nameHi: string;
  letter: string;
  system: string;
  summary: string;
  summaryHi: string;
  commonSymptoms: string[];
  homeopathicApproach: string;
  relatedMedicineNames: string[];
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  titleHi: string;
  subtitle: string;
  duration: string;
  feeInr: number;
  description: string;
  descriptionHi: string;
  includes: string[];
}

export interface BlogArticle {
  id: string;
  title: string;
  titleHi: string;
  category: string;
  publishedDate: string;
  readTime: string;
  author: string;
  summary: string;
  content: string;
  published: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  questionHi: string;
  answer: string;
  answerHi: string;
}

export interface ClinicProfile {
  clinicName: string;
  clinicNameHi: string;
  doctorName: string;
  doctorNameHi: string;
  qualification: string;
  registrationNumber: string;
  experienceYears: number;
  address: string;
  addressHi: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  timings: string;
  timingsHi: string;
  firstConsultFeeInr: number;
  followUpFeeInr: number;
  videoConsultFeeInr: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  aboutText: string;
  aboutTextHi: string;
}

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: string;
  referenceCode: string;
  patientName: string;
  phone: string;
  email: string;
  consultationType: 'In-Clinic' | 'Video Consultation';
  preferredDate: string;
  preferredSlot: string;
  healthCategory: string;
  symptoms: string;
  feeInr: number;
  status: AppointmentStatus;
  createdAt: string;
}

export type InquiryStatus = 'New' | 'Replied' | 'Archived';

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface BootstrapPayload {
  profile: ClinicProfile;
  medicines: MedicineRecord[];
  categories: HealthCategory[];
  services: ServiceItem[];
  articles: BlogArticle[];
  faqs: FaqItem[];
  mapsApiKey: string;
}
