import fs from 'node:fs';
import path from 'node:path';
import type {
  Appointment,
  BlogArticle,
  ClinicProfile,
  ContactInquiry,
  FaqItem,
  HealthCategory,
  MedicineRecord,
  ServiceItem,
} from '../src/types/clinic.ts';
import {
  DEFAULT_CLINIC_PROFILE,
  SEED_APPOINTMENTS,
  SEED_BLOG_ARTICLES,
  SEED_FAQS,
  SEED_HEALTH_CATEGORIES,
  SEED_INQUIRIES,
  SEED_MEDICINES,
  SEED_SERVICES,
} from './seedData.ts';

export interface ClinicDatabase {
  profile: ClinicProfile;
  medicines: MedicineRecord[];
  categories: HealthCategory[];
  services: ServiceItem[];
  articles: BlogArticle[];
  faqs: FaqItem[];
  appointments: Appointment[];
  inquiries: ContactInquiry[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'clinic-db.json');

function createInitialDatabase(): ClinicDatabase {
  return {
    profile: DEFAULT_CLINIC_PROFILE,
    medicines: SEED_MEDICINES,
    categories: SEED_HEALTH_CATEGORIES,
    services: SEED_SERVICES,
    articles: SEED_BLOG_ARTICLES,
    faqs: SEED_FAQS,
    appointments: SEED_APPOINTMENTS,
    inquiries: SEED_INQUIRIES,
  };
}

export function loadDatabase(): ClinicDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      const initial = createInitialDatabase();
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ClinicDatabase>;
    const fallback = createInitialDatabase();
    return {
      profile: parsed.profile ?? fallback.profile,
      medicines: Array.isArray(parsed.medicines) ? parsed.medicines : fallback.medicines,
      categories: Array.isArray(parsed.categories) ? parsed.categories : fallback.categories,
      services: Array.isArray(parsed.services) ? parsed.services : fallback.services,
      articles: Array.isArray(parsed.articles) ? parsed.articles : fallback.articles,
      faqs: Array.isArray(parsed.faqs) ? parsed.faqs : fallback.faqs,
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : fallback.appointments,
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : fallback.inquiries,
    };
  } catch (err) {
    console.error('Failed to read clinic database, falling back to defaults:', err);
    return createInitialDatabase();
  }
}

export function saveDatabase(db: ClinicDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_PATH);
}
