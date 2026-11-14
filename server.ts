import crypto from 'node:crypto';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { loadDatabase, saveDatabase } from './server/db.ts';
import {
  MEDICINE_CATEGORIES,
  type Appointment,
  type BlogArticle,
  type ClinicProfile,
  type ContactInquiry,
  type MedicineCategory,
  type MedicineRecord,
  type PublicationStatus,
} from './src/types/clinic.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_EMAIL = process.env.CLINIC_ADMIN_EMAIL || 'admin@sukhahomeopathy.in';
const ADMIN_PASSWORD = process.env.CLINIC_ADMIN_PASSWORD || 'SukhaAdmin2026';

// In-memory session store for authorized admin requests
const activeTokens = new Set<string>();

function isValidMedicineCategory(value: string): value is MedicineCategory {
  return (MEDICINE_CATEGORIES as readonly string[]).includes(value);
}

function normalizeStringArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof val === 'string') {
    return val
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token || !activeTokens.has(token)) {
    res.status(401).json({ error: 'Unauthorized. Authorized clinic administrator login required.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Public bootstrap endpoint: strictly serves Published medicines and Published blog articles
  app.get('/api/bootstrap', (_req, res) => {
    const db = loadDatabase();
    const publishedMedicines = db.medicines.filter((m) => m.publicationStatus === 'Published');
    const publishedArticles = db.articles.filter((a) => a.published);
    const mapsApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';

    res.json({
      profile: db.profile,
      medicines: publishedMedicines,
      categories: db.categories,
      services: db.services,
      articles: publishedArticles,
      faqs: db.faqs,
      mapsApiKey,
    });
  });

  // Public medicine query endpoint (only returns Published remedies)
  app.get('/api/medicines', (req, res) => {
    const db = loadDatabase();
    const letter = String(req.query.letter || '').trim().toUpperCase();
    const search = String(req.query.search || '').trim().toLowerCase();
    const category = String(req.query.category || '').trim();
    const manufacturer = String(req.query.manufacturer || '').trim();
    const productType = String(req.query.productType || '').trim();
    const potency = String(req.query.potency || '').trim();

    let items = db.medicines.filter((m) => m.publicationStatus === 'Published');

    if (letter && letter !== 'ALL') {
      items = items.filter((m) => m.medicineName.toUpperCase().startsWith(letter));
    }
    if (search) {
      items = items.filter(
        (m) =>
          m.medicineName.toLowerCase().includes(search) ||
          m.scientificName.toLowerCase().includes(search) ||
          m.commonName.toLowerCase().includes(search) ||
          m.botanicalSource.toLowerCase().includes(search) ||
          m.medicineId.toLowerCase().includes(search)
      );
    }
    if (category && category !== 'ALL') {
      items = items.filter((m) => m.medicineCategory === category);
    }
    if (manufacturer && manufacturer !== 'ALL') {
      items = items.filter((m) => m.manufacturer === manufacturer);
    }
    if (productType && productType !== 'ALL') {
      items = items.filter((m) => m.productType === productType);
    }
    if (potency && potency !== 'ALL') {
      items = items.filter((m) => m.availablePotencies.includes(potency));
    }

    res.json({ medicines: items });
  });

  // Public appointment booking
  app.post('/api/appointments', (req, res) => {
    const body = req.body ?? {};
    const patientName = String(body.patientName || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const consultationType =
      body.consultationType === 'Video Consultation' ? 'Video Consultation' : 'In-Clinic';
    const preferredDate = String(body.preferredDate || '').trim();
    const preferredSlot = String(body.preferredSlot || '').trim();
    const healthCategory = String(body.healthCategory || 'General Constitutional Care').trim();
    const symptoms = String(body.symptoms || '').trim();

    if (!patientName || patientName.length < 2) {
      res.status(400).json({ error: 'Please enter the patient full name.' });
      return;
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile or WhatsApp number.' });
      return;
    }
    if (!preferredDate || !preferredSlot) {
      res.status(400).json({ error: 'Please select a preferred date and time slot.' });
      return;
    }

    const db = loadDatabase();
    const feeInr =
      consultationType === 'Video Consultation'
        ? db.profile.videoConsultFeeInr
        : db.profile.firstConsultFeeInr;

    const refNumber = 1043 + db.appointments.length;
    const appointment: Appointment = {
      id: `apt-${Date.now()}`,
      referenceCode: `SHC-2026-${refNumber}`,
      patientName,
      phone,
      email,
      consultationType,
      preferredDate,
      preferredSlot,
      healthCategory,
      symptoms,
      feeInr,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    db.appointments.unshift(appointment);
    saveDatabase(db);
    res.status(201).json({ appointment });
  });

  // Public contact inquiry submission
  app.post('/api/inquiries', (req, res) => {
    const body = req.body ?? {};
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const subject = String(body.subject || 'General Clinic Inquiry').trim();
    const message = String(body.message || '').trim();

    if (!name || !phone || !message) {
      res.status(400).json({ error: 'Name, phone number, and message are required.' });
      return;
    }

    const db = loadDatabase();
    const inquiry: ContactInquiry = {
      id: `inq-${Date.now()}`,
      name,
      phone,
      email,
      subject,
      message,
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    db.inquiries.unshift(inquiry);
    saveDatabase(db);
    res.status(201).json({ inquiry });
  });

  // Admin login
  app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body ?? {};
    if (String(email || '').trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const token = crypto.randomBytes(24).toString('hex');
      activeTokens.add(token);
      res.json({ token, adminEmail: ADMIN_EMAIL });
      return;
    }
    res.status(401).json({ error: 'Invalid administrator email or password.' });
  });

  app.post('/api/admin/logout', requireAdmin, (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.slice(7).trim();
    activeTokens.delete(token);
    res.json({ ok: true });
  });

  // Admin dashboard payload (includes unpublished/Pending Review medicines, appointments, inquiries, blog)
  app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
    const db = loadDatabase();
    res.json({
      profile: db.profile,
      medicines: db.medicines,
      appointments: db.appointments,
      inquiries: db.inquiries,
      articles: db.articles,
      categories: db.categories,
    });
  });

  // Admin: Create a single medicine record
  app.post('/api/admin/medicines', requireAdmin, (req, res) => {
    const body = req.body ?? {};
    const medicineName = String(body.medicineName || '').trim();
    const scientificName = String(body.scientificName || '').trim();
    const categoryRaw = String(body.medicineCategory || 'Dilutions').trim();

    if (!medicineName || !scientificName) {
      res.status(400).json({ error: 'Medicine Name and Scientific Name are required.' });
      return;
    }

    const db = loadDatabase();
    const medicineId =
      String(body.medicineId || '').trim() ||
      `MED-${medicineName.charAt(0).toUpperCase()}${String(db.medicines.length + 1).padStart(2, '0')}`;

    if (db.medicines.some((m) => m.medicineId.toLowerCase() === medicineId.toLowerCase())) {
      res.status(409).json({ error: `Medicine ID "${medicineId}" already exists.` });
      return;
    }

    const requestedStatus: PublicationStatus =
      body.publicationStatus === 'Published'
        ? 'Published'
        : body.publicationStatus === 'Draft'
          ? 'Draft'
          : 'Pending Review';

    const newMedicine: MedicineRecord = {
      medicineId,
      medicineName,
      scientificName,
      commonName: String(body.commonName || '').trim(),
      botanicalSource: String(body.botanicalSource || '').trim(),
      medicineCategory: isValidMedicineCategory(categoryRaw) ? categoryRaw : 'Dilutions',
      productType: String(body.productType || 'Single Remedy').trim(),
      manufacturer: String(body.manufacturer || 'Schwabe India').trim(),
      availablePotencies: normalizeStringArray(body.availablePotencies),
      availablePackSizes: normalizeStringArray(body.availablePackSizes),
      productImage: String(body.productImage || 'dilutions').trim(),
      description: String(body.description || '').trim(),
      classicalReference: String(body.classicalReference || '').trim(),
      safetyInformation:
        String(body.safetyInformation || '').trim() ||
        'Consult a qualified homeopathic physician before selecting potency or dosage.',
      sourceUrl: String(body.sourceUrl || 'https://www.homoeopathicpharmacopoeia.in').trim(),
      lastUpdatedDate: new Date().toISOString().slice(0, 10),
      publicationStatus: requestedStatus,
    };

    db.medicines.unshift(newMedicine);
    saveDatabase(db);
    res.status(201).json({ medicine: newMedicine });
  });

  // Admin: Update or review/publish a medicine record
  app.put('/api/admin/medicines/:medicineId', requireAdmin, (req, res) => {
    const targetId = req.params.medicineId;
    const db = loadDatabase();
    const index = db.medicines.findIndex((m) => m.medicineId === targetId);
    if (index === -1) {
      res.status(404).json({ error: 'Medicine record not found.' });
      return;
    }

    const current = db.medicines[index];
    const body = req.body ?? {};
    const categoryRaw = String(body.medicineCategory ?? current.medicineCategory).trim();
    const statusRaw = body.publicationStatus ?? current.publicationStatus;
    const publicationStatus: PublicationStatus =
      statusRaw === 'Published' || statusRaw === 'Pending Review' || statusRaw === 'Draft'
        ? statusRaw
        : current.publicationStatus;

    const updated: MedicineRecord = {
      ...current,
      medicineName: body.medicineName !== undefined ? String(body.medicineName).trim() : current.medicineName,
      scientificName:
        body.scientificName !== undefined ? String(body.scientificName).trim() : current.scientificName,
      commonName: body.commonName !== undefined ? String(body.commonName).trim() : current.commonName,
      botanicalSource:
        body.botanicalSource !== undefined ? String(body.botanicalSource).trim() : current.botanicalSource,
      medicineCategory: isValidMedicineCategory(categoryRaw) ? categoryRaw : current.medicineCategory,
      productType: body.productType !== undefined ? String(body.productType).trim() : current.productType,
      manufacturer: body.manufacturer !== undefined ? String(body.manufacturer).trim() : current.manufacturer,
      availablePotencies:
        body.availablePotencies !== undefined
          ? normalizeStringArray(body.availablePotencies)
          : current.availablePotencies,
      availablePackSizes:
        body.availablePackSizes !== undefined
          ? normalizeStringArray(body.availablePackSizes)
          : current.availablePackSizes,
      productImage: body.productImage !== undefined ? String(body.productImage).trim() : current.productImage,
      description: body.description !== undefined ? String(body.description).trim() : current.description,
      classicalReference:
        body.classicalReference !== undefined
          ? String(body.classicalReference).trim()
          : current.classicalReference,
      safetyInformation:
        body.safetyInformation !== undefined ? String(body.safetyInformation).trim() : current.safetyInformation,
      sourceUrl: body.sourceUrl !== undefined ? String(body.sourceUrl).trim() : current.sourceUrl,
      lastUpdatedDate: new Date().toISOString().slice(0, 10),
      publicationStatus,
    };

    db.medicines[index] = updated;
    saveDatabase(db);
    res.json({ medicine: updated });
  });

  // Admin: Delete a medicine record
  app.delete('/api/admin/medicines/:medicineId', requireAdmin, (req, res) => {
    const targetId = req.params.medicineId;
    const db = loadDatabase();
    const before = db.medicines.length;
    db.medicines = db.medicines.filter((m) => m.medicineId !== targetId);
    if (db.medicines.length === before) {
      res.status(404).json({ error: 'Medicine record not found.' });
      return;
    }
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Admin: Bulk import medicines from CSV/Excel — strictly marks all imported rows as Pending Review!
  app.post('/api/admin/medicines/import', requireAdmin, (req, res) => {
    const rows = Array.isArray(req.body?.records) ? req.body.records : [];
    if (rows.length === 0) {
      res.status(400).json({ error: 'No medicine records supplied for import.' });
      return;
    }

    const db = loadDatabase();
    const existingIds = new Set(db.medicines.map((m) => m.medicineId.toLowerCase()));
    const imported: MedicineRecord[] = [];
    const skipped: { row: number; reason: string }[] = [];

    rows.forEach((raw: Record<string, unknown>, idx: number) => {
      const medicineName = String(raw.medicineName || raw['Medicine Name'] || '').trim();
      const scientificName = String(raw.scientificName || raw['Scientific Name'] || '').trim();
      if (!medicineName || !scientificName) {
        skipped.push({ row: idx + 1, reason: 'Missing Medicine Name or Scientific Name' });
        return;
      }

      let medicineId = String(raw.medicineId || raw['Medicine ID'] || '').trim();
      if (!medicineId) {
        medicineId = `IMP-${medicineName.charAt(0).toUpperCase()}${Date.now().toString().slice(-4)}-${idx + 1}`;
      }
      if (existingIds.has(medicineId.toLowerCase())) {
        skipped.push({ row: idx + 1, reason: `Duplicate Medicine ID (${medicineId})` });
        return;
      }

      const categoryRaw = String(raw.medicineCategory || raw['Medicine Category'] || 'Dilutions').trim();
      const record: MedicineRecord = {
        medicineId,
        medicineName,
        scientificName,
        commonName: String(raw.commonName || raw['Common Name'] || '').trim(),
        botanicalSource: String(raw.botanicalSource || raw['Botanical Source'] || '').trim(),
        medicineCategory: isValidMedicineCategory(categoryRaw) ? categoryRaw : 'Dilutions',
        productType: String(raw.productType || raw['Product Type'] || 'Single Remedy').trim(),
        manufacturer: String(raw.manufacturer || raw['Manufacturer'] || 'Schwabe India').trim(),
        availablePotencies: normalizeStringArray(raw.availablePotencies ?? raw['Available Potencies']),
        availablePackSizes: normalizeStringArray(raw.availablePackSizes ?? raw['Available Pack Sizes']),
        productImage: String(raw.productImage || raw['Product Image'] || 'dilutions').trim(),
        description: String(raw.description || raw['Description'] || '').trim(),
        classicalReference: String(raw.classicalReference || raw['Classical Reference'] || '').trim(),
        safetyInformation:
          String(raw.safetyInformation || raw['Safety Information'] || '').trim() ||
          'Requires verification by an authorized clinic administrator before publication.',
        sourceUrl: String(raw.sourceUrl || raw['Source URL'] || '').trim(),
        lastUpdatedDate: new Date().toISOString().slice(0, 10),
        // Enforce mandatory unpublished gate until reviewed by an authorized administrator
        publicationStatus: 'Pending Review',
      };

      existingIds.add(medicineId.toLowerCase());
      imported.push(record);
    });

    db.medicines = [...imported, ...db.medicines];
    saveDatabase(db);
    res.status(201).json({
      importedCount: imported.length,
      skippedCount: skipped.length,
      skipped,
      imported,
    });
  });

  // Admin: Update appointment status
  app.patch('/api/admin/appointments/:id', requireAdmin, (req, res) => {
    const db = loadDatabase();
    const apt = db.appointments.find((a) => a.id === req.params.id);
    if (!apt) {
      res.status(404).json({ error: 'Appointment not found.' });
      return;
    }
    const status = req.body?.status;
    if (status === 'Pending' || status === 'Confirmed' || status === 'Completed' || status === 'Cancelled') {
      apt.status = status;
      saveDatabase(db);
    }
    res.json({ appointment: apt });
  });

  // Admin: Update inquiry status
  app.patch('/api/admin/inquiries/:id', requireAdmin, (req, res) => {
    const db = loadDatabase();
    const inq = db.inquiries.find((i) => i.id === req.params.id);
    if (!inq) {
      res.status(404).json({ error: 'Inquiry not found.' });
      return;
    }
    const status = req.body?.status;
    if (status === 'New' || status === 'Replied' || status === 'Archived') {
      inq.status = status;
      saveDatabase(db);
    }
    res.json({ inquiry: inq });
  });

  // Admin: Update Clinic Identity Profile
  app.put('/api/admin/profile', requireAdmin, (req, res) => {
    const db = loadDatabase();
    const body = req.body as Partial<ClinicProfile>;
    db.profile = {
      ...db.profile,
      ...body,
      coordinates: body.coordinates
        ? {
            lat: Number(body.coordinates.lat) || db.profile.coordinates.lat,
            lng: Number(body.coordinates.lng) || db.profile.coordinates.lng,
          }
        : db.profile.coordinates,
    };
    saveDatabase(db);
    res.json({ profile: db.profile });
  });

  // Admin: Create or toggle Blog Article
  app.post('/api/admin/blog', requireAdmin, (req, res) => {
    const body = req.body ?? {};
    const title = String(body.title || '').trim();
    const content = String(body.content || '').trim();
    if (!title || !content) {
      res.status(400).json({ error: 'Title and article content are required.' });
      return;
    }
    const db = loadDatabase();
    const article: BlogArticle = {
      id: `blog-${Date.now()}`,
      title,
      titleHi: String(body.titleHi || title).trim(),
      category: String(body.category || 'Patient Guide').trim(),
      publishedDate: new Date().toISOString().slice(0, 10),
      readTime: String(body.readTime || '4 min read').trim(),
      author: db.profile.doctorName,
      summary: String(body.summary || content.slice(0, 140)).trim(),
      content,
      published: Boolean(body.published ?? true),
    };
    db.articles.unshift(article);
    saveDatabase(db);
    res.status(201).json({ article });
  });

  app.delete('/api/admin/blog/:id', requireAdmin, (req, res) => {
    const db = loadDatabase();
    db.articles = db.articles.filter((a) => a.id !== req.params.id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Vite dev middleware or static production files
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sukha Homeopathy Clinic server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
