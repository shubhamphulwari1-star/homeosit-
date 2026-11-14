import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import * as XLSX from 'xlsx';
import {
  Calendar,
  Check,
  Download,
  FileSpreadsheet,
  Inbox,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Pill,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  MEDICINE_CATEGORIES,
  type Appointment,
  type AppointmentStatus,
  type BlogArticle,
  type ClinicProfile,
  type ContactInquiry,
  type InquiryStatus,
  type MedicineCategory,
  type MedicineRecord,
  type PublicationStatus,
} from '../types/clinic';

type AdminTab = 'overview' | 'medicines' | 'import' | 'appointments' | 'inquiries' | 'blog' | 'settings';

interface AdminDashboardProps {
  onPublicDataChanged: () => Promise<void>;
  onExitAdmin: () => void;
}

const EMPTY_MEDICINE: MedicineRecord = {
  medicineId: '',
  medicineName: '',
  scientificName: '',
  commonName: '',
  botanicalSource: '',
  medicineCategory: 'Dilutions',
  productType: 'Single Remedy',
  manufacturer: 'Schwabe India',
  availablePotencies: ['30C', '200C'],
  availablePackSizes: ['30ml'],
  productImage: 'dilutions',
  description: '',
  classicalReference: '',
  safetyInformation: 'Consult a qualified homeopathic physician before selecting potency or dosage.',
  sourceUrl: 'https://www.homoeopathicpharmacopoeia.in',
  lastUpdatedDate: new Date().toISOString().slice(0, 10),
  publicationStatus: 'Pending Review',
};

export function AdminDashboard({ onPublicDataChanged, onExitAdmin }: AdminDashboardProps) {
  const [token, setToken] = useState<string>(() => localStorage.getItem('sukha_admin_token') || '');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [profile, setProfile] = useState<ClinicProfile | null>(null);
  const [medicines, setMedicines] = useState<MedicineRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [articles, setArticles] = useState<BlogArticle[]>([]);

  // Medicine filters & modal
  const [medStatusFilter, setMedStatusFilter] = useState<'ALL' | PublicationStatus>('ALL');
  const [medSearch, setMedSearch] = useState('');
  const [editingMed, setEditingMed] = useState<MedicineRecord | null>(null);
  const [isNewMed, setIsNewMed] = useState(false);

  // Import state
  const [importPreview, setImportPreview] = useState<Record<string, unknown>[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importing, setImporting] = useState(false);

  // Blog form
  const [blogTitle, setBlogTitle] = useState('');
  const [blogTitleHi, setBlogTitleHi] = useState('');
  const [blogCategory, setBlogCategory] = useState('Patient Guide');
  const [blogContent, setBlogContent] = useState('');

  const fetchDashboard = useCallback(async (authToken: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('sukha_admin_token');
        setToken('');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setMedicines(data.medicines);
        setAppointments(data.appointments);
        setInquiries(data.inquiries);
        setArticles(data.articles);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      void fetchDashboard(token);
    }
  }, [token, fetchDashboard]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Authentication failed.');
      } else {
        localStorage.setItem('sukha_admin_token', data.token);
        setToken(data.token);
      }
    } catch {
      setLoginError('Network error while signing in.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => undefined);
    }
    localStorage.removeItem('sukha_admin_token');
    setToken('');
    onExitAdmin();
  };

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const filteredMedicines = useMemo(() => {
    const q = medSearch.trim().toLowerCase();
    return medicines.filter((m) => {
      if (medStatusFilter !== 'ALL' && m.publicationStatus !== medStatusFilter) return false;
      if (q) {
        return (
          m.medicineName.toLowerCase().includes(q) ||
          m.medicineId.toLowerCase().includes(q) ||
          m.scientificName.toLowerCase().includes(q) ||
          m.manufacturer.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [medicines, medStatusFilter, medSearch]);

  const pendingReviewCount = useMemo(
    () => medicines.filter((m) => m.publicationStatus === 'Pending Review').length,
    [medicines]
  );

  const publishedCount = useMemo(
    () => medicines.filter((m) => m.publicationStatus === 'Published').length,
    [medicines]
  );

  const handleUpdatePublicationStatus = async (med: MedicineRecord, newStatus: PublicationStatus) => {
    const res = await fetch(`/api/admin/medicines/${encodeURIComponent(med.medicineId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ publicationStatus: newStatus }),
    });
    if (res.ok) {
      await fetchDashboard(token);
      await onPublicDataChanged();
      showToast(`${med.medicineName} marked as ${newStatus}.`);
    }
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    const res = await fetch(`/api/admin/medicines/${encodeURIComponent(medicineId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchDashboard(token);
      await onPublicDataChanged();
      showToast(`Deleted record ${medicineId}.`);
    }
  };

  const handleSaveMedicine = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingMed) return;
    const url = isNewMed
      ? '/api/admin/medicines'
      : `/api/admin/medicines/${encodeURIComponent(editingMed.medicineId)}`;
    const method = isNewMed ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editingMed),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Could not save medicine record.');
      return;
    }

    setEditingMed(null);
    await fetchDashboard(token);
    await onPublicDataChanged();
    showToast(`Saved ${data.medicine.medicineName} (${data.medicine.publicationStatus}).`);
  };

  const handleSpreadsheetUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const buf = await file.arrayBuffer();
    const workbook = XLSX.read(buf, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
    setImportPreview(rows);
  };

  const handleCommitImport = async () => {
    if (importPreview.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch('/api/admin/medicines/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ records: importPreview }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportPreview([]);
        setImportFileName('');
        await fetchDashboard(token);
        showToast(
          `Imported ${data.importedCount} records into Pending Review (${data.skippedCount} skipped).`
        );
        setActiveTab('medicines');
        setMedStatusFilter('Pending Review');
      } else {
        showToast(data.error || 'Import failed.');
      }
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const headers = [
      'Medicine ID',
      'Medicine Name',
      'Scientific Name',
      'Common Name',
      'Botanical Source',
      'Medicine Category',
      'Product Type',
      'Manufacturer',
      'Available Potencies',
      'Available Pack Sizes',
      'Product Image',
      'Description',
      'Classical Reference',
      'Safety Information',
      'Source URL',
    ];
    const sampleRow = [
      'MED-B99',
      'Bryonia alba',
      'Bryonia alba L.',
      'White Bryony',
      'Cucurbitaceae (Fresh root before flowering)',
      'Dilutions',
      'Single Remedy',
      'Schwabe India',
      '6C; 30C; 200C',
      '30ml; 100ml',
      'dilutions',
      'Classical remedy studied for dryness of mucous membranes and stitching pains relieved by complete rest and pressure.',
      'Boericke Materia Medica · Bryonia Alba',
      'Consult a qualified homeopathic physician for persistent cough or joint swelling.',
      'https://www.homoeopathicpharmacopoeia.in',
    ];
    const csvContent = `${headers.join(',')}\n${sampleRow.map((v) => `"${v}"`).join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sukha_homeopathy_medicine_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateAppointment = async (id: string, status: AppointmentStatus) => {
    const res = await fetch(`/api/admin/appointments/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await fetchDashboard(token);
      showToast(`Appointment updated to ${status}.`);
    }
  };

  const handleUpdateInquiry = async (id: string, status: InquiryStatus) => {
    const res = await fetch(`/api/admin/inquiries/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await fetchDashboard(token);
      showToast(`Inquiry marked as ${status}.`);
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const res = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });
    if (res.ok) {
      await onPublicDataChanged();
      showToast('Clinic identity & consultation settings saved.');
    }
  };

  const handleCreateArticle = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: blogTitle,
        titleHi: blogTitleHi || blogTitle,
        category: blogCategory,
        content: blogContent,
        published: true,
      }),
    });
    if (res.ok) {
      setBlogTitle('');
      setBlogTitleHi('');
      setBlogContent('');
      await fetchDashboard(token);
      await onPublicDataChanged();
      showToast('Patient education article published.');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    const res = await fetch(`/api/admin/blog/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchDashboard(token);
      await onPublicDataChanged();
      showToast('Article removed.');
    }
  };

  // Unauthenticated Admin Login Screen
  if (!token) {
    return (
      <section className="min-h-[80vh] bg-[#F8FAF9] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white border border-[#E2E8E5] p-8">
          <p className="text-xs font-medium text-[#14532D]">Authorized Clinic Management</p>
          <h1 className="mt-1 font-display font-bold text-2xl text-[#111C16]">
            Clinic Admin Portal
          </h1>
          <p className="mt-2 text-sm text-[#47554D]">
            Sign in to review pending A–Z medicine imports, manage patient appointments, and update clinic profile settings.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#47554D] mb-1.5">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@sukhahomeopathy.in"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#47554D] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
              />
            </div>

            {loginError && (
              <p className="text-xs text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 text-sm font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-xl transition-colors"
            >
              {loggingIn ? 'Signing In...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#E2E8E5] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setLoginEmail('admin@sukhahomeopathy.in');
                setLoginPassword('SukhaAdmin2026');
              }}
              className="text-xs font-medium text-[#0369A1] hover:underline"
            >
              Fill Demo Clinic Admin Credentials
            </button>
            <button
              type="button"
              onClick={onExitAdmin}
              className="text-xs font-medium text-[#47554D] hover:text-[#111C16]"
            >
              Return to Clinic Site
            </button>
          </div>
        </div>
      </section>
    );
  }

  const sidebarItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'medicines', label: 'Medicines & Review', icon: Pill, count: pendingReviewCount },
    { id: 'import', label: 'CSV / Excel Import', icon: FileSpreadsheet },
    { id: 'appointments', label: 'Appointments', icon: Calendar, count: appointments.length },
    { id: 'inquiries', label: 'Inquiries', icon: Inbox, count: inquiries.length },
    { id: 'blog', label: 'Blog Articles', icon: Newspaper },
    { id: 'settings', label: 'Clinic Identity', icon: Settings },
  ];

  return (
    <section className="min-h-[82vh] bg-[#F8FAF9]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Top Admin Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E2E8E5]">
          <div>
            <p className="text-xs text-[#64746B]">Clinic Operations / Admin Console</p>
            <h1 className="font-display font-bold text-2xl text-[#111C16]">
              {profile?.clinicName || 'Sukha Homeopathy Clinic'} — Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {statusMessage && (
              <span className="text-xs font-medium text-[#14532D] bg-[#ECFDF5] border border-[#BBF7D0] px-3 py-1.5 rounded-lg">
                {statusMessage}
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#47554D] hover:text-[#111C16] bg-white border border-[#E2E8E5] rounded-lg"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-3 rounded-2xl bg-white border border-[#E2E8E5] p-3 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#14532D] text-white'
                      : 'text-[#47554D] hover:bg-[#F3F7F4] hover:text-[#111C16]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span
                      className={`font-mono text-xs tabular-nums ${
                        isActive ? 'text-[#BBF7D0]' : 'text-[#64746B]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* Main Admin Viewport */}
          <div className="lg:col-span-9 space-y-6">
            {loading && !profile ? (
              <div className="rounded-2xl bg-white border border-[#E2E8E5] p-12 text-center text-sm text-[#47554D]">
                Loading clinic management console...
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="rounded-2xl bg-white border border-[#E2E8E5] p-5">
                        <p className="text-xs text-[#64746B]">Published Remedies</p>
                        <p className="mt-2 font-mono text-3xl font-semibold text-[#14532D] tabular-nums">
                          {publishedCount}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white border border-[#E2E8E5] p-5">
                        <p className="text-xs text-[#64746B]">Pending Admin Review</p>
                        <p className="mt-2 font-mono text-3xl font-semibold text-[#D97706] tabular-nums">
                          {pendingReviewCount}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white border border-[#E2E8E5] p-5">
                        <p className="text-xs text-[#64746B]">Total Appointments</p>
                        <p className="mt-2 font-mono text-3xl font-semibold text-[#0369A1] tabular-nums">
                          {appointments.length}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white border border-[#E2E8E5] p-5">
                        <p className="text-xs text-[#64746B]">Patient Inquiries</p>
                        <p className="mt-2 font-mono text-3xl font-semibold text-[#111C16] tabular-nums">
                          {inquiries.length}
                        </p>
                      </div>
                    </div>

                    {pendingReviewCount > 0 && (
                      <div className="rounded-2xl bg-white border border-[#E2E8E5] p-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h2 className="font-display font-semibold text-base text-[#111C16]">
                            Unverified Medicine Records Awaiting Review
                          </h2>
                          <p className="mt-1 text-sm text-[#47554D]">
                            {pendingReviewCount} imported or draft medicine records remain hidden from the public A–Z directory until reviewed and published.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('medicines');
                            setMedStatusFilter('Pending Review');
                          }}
                          className="px-4 py-2 text-sm font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-xl"
                        >
                          Review Pending Queue
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'medicines' && (
                  <div className="rounded-2xl bg-white border border-[#E2E8E5] p-6 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="font-display font-bold text-lg text-[#111C16]">
                          A–Z Medicine Database &amp; Publication Verification
                        </h2>
                        <p className="text-xs text-[#47554D] mt-0.5">
                          Only records marked Published appear in the public patient directory.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewMed(true);
                          setEditingMed({ ...EMPTY_MEDICINE });
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-xl"
                      >
                        <Plus className="w-4 h-4" />
                        Add Medicine Record
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E2E8E5]">
                      <div className="flex items-center gap-1 p-1 bg-[#F3F7F4] rounded-lg border border-[#E2E8E5]">
                        {(['ALL', 'Published', 'Pending Review', 'Draft'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setMedStatusFilter(st)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                              medStatusFilter === st
                                ? 'bg-white text-[#14532D] shadow-xs'
                                : 'text-[#47554D] hover:text-[#111C16]'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-[#64746B] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="search"
                          value={medSearch}
                          onChange={(e) => setMedSearch(e.target.value)}
                          placeholder="Search ID or name..."
                          className="w-full pl-9 pr-3 py-1.5 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-[#E2E8E5] rounded-xl">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-[#F8FAF9] border-b border-[#E2E8E5] text-xs text-[#47554D]">
                          <tr>
                            <th className="py-2.5 px-3 font-medium">ID</th>
                            <th className="py-2.5 px-3 font-medium">Medicine Name</th>
                            <th className="py-2.5 px-3 font-medium">Category</th>
                            <th className="py-2.5 px-3 font-medium">Manufacturer</th>
                            <th className="py-2.5 px-3 font-medium">Status</th>
                            <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8E5]">
                          {filteredMedicines.map((med) => (
                            <tr key={med.medicineId} className="hover:bg-[#F8FAF9]">
                              <td className="py-2.5 px-3 font-mono text-xs text-[#64746B] tabular-nums">
                                {med.medicineId}
                              </td>
                              <td className="py-2.5 px-3">
                                <p className="font-medium text-[#111C16]">{med.medicineName}</p>
                                <p className="text-xs italic text-[#64746B]">{med.scientificName}</p>
                              </td>
                              <td className="py-2.5 px-3 text-xs text-[#47554D]">{med.medicineCategory}</td>
                              <td className="py-2.5 px-3 text-xs text-[#47554D]">{med.manufacturer}</td>
                              <td className="py-2.5 px-3 text-xs font-medium">
                                <span
                                  className={
                                    med.publicationStatus === 'Published'
                                      ? 'text-[#14532D]'
                                      : med.publicationStatus === 'Pending Review'
                                        ? 'text-[#B45309]'
                                        : 'text-[#64746B]'
                                  }
                                >
                                  {med.publicationStatus}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-2">
                                {med.publicationStatus !== 'Published' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePublicationStatus(med, 'Published')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-md"
                                  >
                                    <Check className="w-3 h-3" />
                                    Approve &amp; Publish
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePublicationStatus(med, 'Pending Review')}
                                    className="px-2.5 py-1 text-xs font-medium text-[#47554D] bg-[#F3F7F4] hover:bg-[#E2E8E5] rounded-md"
                                  >
                                    Unpublish
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsNewMed(false);
                                    setEditingMed({ ...med });
                                  }}
                                  className="px-2.5 py-1 text-xs font-medium text-[#0369A1] hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMedicine(med.medicineId)}
                                  aria-label={`Delete ${med.medicineName}`}
                                  className="p-1 text-[#B91C1C] hover:bg-[#FEF2F2] rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5 inline" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'import' && (
                  <div className="rounded-2xl bg-white border border-[#E2E8E5] p-6 space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display font-bold text-lg text-[#111C16]">
                          Import Verified Medicine Records (CSV / Excel)
                        </h2>
                        <p className="mt-1 text-sm text-[#47554D] max-w-2xl">
                          Upload `.csv`, `.xlsx`, or `.xls` sheets. All imported records enter strictly as{' '}
                          <span className="font-semibold text-[#B45309]">Pending Review</span> (unpublished) until reviewed and approved by an authorized administrator.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadSampleCsv}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#14532D] bg-[#ECFDF5] hover:bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Sample CSV Template
                      </button>
                    </div>

                    <label className="block rounded-2xl border-2 border-dashed border-[#CBD5CF] hover:border-[#14532D] bg-[#F8FAF9] p-8 text-center cursor-pointer transition-colors">
                      <Upload className="w-8 h-8 text-[#14532D] mx-auto mb-2" />
                      <span className="block text-sm font-semibold text-[#111C16]">
                        {importFileName || 'Choose a CSV or Excel (.xlsx / .xls) file'}
                      </span>
                      <span className="block mt-1 text-xs text-[#64746B]">
                        Required columns: Medicine Name, Scientific Name. Optional: Medicine ID, Category, Potencies, Classical Reference.
                      </span>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleSpreadsheetUpload}
                        className="hidden"
                      />
                    </label>

                    {importPreview.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#111C16]">
                            Parsed {importPreview.length} rows ready for Pending Review import
                          </p>
                          <button
                            type="button"
                            disabled={importing}
                            onClick={handleCommitImport}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-xl"
                          >
                            {importing ? 'Importing...' : 'Import to Pending Review Queue'}
                          </button>
                        </div>
                        <div className="overflow-x-auto border border-[#E2E8E5] rounded-xl max-h-72">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#F8FAF9] border-b border-[#E2E8E5]">
                              <tr>
                                <th className="py-2 px-3">Medicine Name</th>
                                <th className="py-2 px-3">Scientific Name</th>
                                <th className="py-2 px-3">Category</th>
                                <th className="py-2 px-3">Manufacturer</th>
                                <th className="py-2 px-3">Import Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8E5]">
                              {importPreview.slice(0, 20).map((row, idx) => (
                                <tr key={idx}>
                                  <td className="py-2 px-3 font-medium">
                                    {String(row['Medicine Name'] || row.medicineName || '—')}
                                  </td>
                                  <td className="py-2 px-3 italic">
                                    {String(row['Scientific Name'] || row.scientificName || '—')}
                                  </td>
                                  <td className="py-2 px-3">
                                    {String(row['Medicine Category'] || row.medicineCategory || 'Dilutions')}
                                  </td>
                                  <td className="py-2 px-3">
                                    {String(row['Manufacturer'] || row.manufacturer || 'Schwabe India')}
                                  </td>
                                  <td className="py-2 px-3 text-[#B45309] font-medium">Pending Review</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'appointments' && (
                  <div className="rounded-2xl bg-white border border-[#E2E8E5] p-6 space-y-4">
                    <h2 className="font-display font-bold text-lg text-[#111C16]">
                      Patient Appointments
                    </h2>
                    <div className="overflow-x-auto border border-[#E2E8E5] rounded-xl">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-[#F8FAF9] border-b border-[#E2E8E5] text-xs text-[#47554D]">
                          <tr>
                            <th className="py-2.5 px-3">Ref</th>
                            <th className="py-2.5 px-3">Patient</th>
                            <th className="py-2.5 px-3">Schedule</th>
                            <th className="py-2.5 px-3">Category &amp; Mode</th>
                            <th className="py-2.5 px-3">Fee</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8E5]">
                          {appointments.map((apt) => (
                            <tr key={apt.id}>
                              <td className="py-3 px-3 font-mono text-xs text-[#14532D] tabular-nums">
                                {apt.referenceCode}
                              </td>
                              <td className="py-3 px-3">
                                <p className="font-medium text-[#111C16]">{apt.patientName}</p>
                                <p className="font-mono text-xs text-[#64746B] tabular-nums">{apt.phone}</p>
                              </td>
                              <td className="py-3 px-3 font-mono text-xs text-[#111C16] tabular-nums">
                                {apt.preferredDate} · {apt.preferredSlot}
                              </td>
                              <td className="py-3 px-3 text-xs text-[#47554D]">
                                <p className="font-medium text-[#111C16]">{apt.healthCategory}</p>
                                <p>{apt.consultationType}</p>
                              </td>
                              <td className="py-3 px-3 font-mono text-xs text-[#111C16] tabular-nums">
                                ₹{apt.feeInr}
                              </td>
                              <td className="py-3 px-3">
                                <select
                                  aria-label={`Status for ${apt.patientName}`}
                                  value={apt.status}
                                  onChange={(e) =>
                                    handleUpdateAppointment(apt.id, e.target.value as AppointmentStatus)
                                  }
                                  className="px-2.5 py-1 text-xs bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'inquiries' && (
                  <div className="rounded-2xl bg-white border border-[#E2E8E5] p-6 space-y-4">
                    <h2 className="font-display font-bold text-lg text-[#111C16]">
                      Contact Form Inquiries
                    </h2>
                    <div className="divide-y divide-[#E2E8E5] border border-[#E2E8E5] rounded-xl">
                      {inquiries.map((inq) => (
                        <div key={inq.id} className="p-4 flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-1 max-w-2xl">
                            <p className="text-sm font-semibold text-[#111C16]">
                              {inq.subject || 'Clinic Inquiry'} · {inq.name}
                            </p>
                            <p className="font-mono text-xs text-[#64746B] tabular-nums">
                              {inq.phone} {inq.email ? `· ${inq.email}` : ''}
                            </p>
                            <p className="text-sm text-[#47554D] pt-1">{inq.message}</p>
                          </div>
                          <select
                            aria-label={`Inquiry status for ${inq.name}`}
                            value={inq.status}
                            onChange={(e) => handleUpdateInquiry(inq.id, e.target.value as InquiryStatus)}
                            className="px-2.5 py-1.5 text-xs bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                          >
                            <option value="New">New</option>
                            <option value="Replied">Replied</option>
                            <option value="Archived">Archived</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'blog' && (
                  <div className="space-y-6">
                    <form
                      onSubmit={handleCreateArticle}
                      className="rounded-2xl bg-white border border-[#E2E8E5] p-6 space-y-4"
                    >
                      <h2 className="font-display font-bold text-lg text-[#111C16]">
                        Publish Patient Education Article
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          required
                          value={blogTitle}
                          onChange={(e) => setBlogTitle(e.target.value)}
                          placeholder="Article Title (English) *"
                          className="px-3.5 py-2 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                        />
                        <input
                          type="text"
                          value={blogTitleHi}
                          onChange={(e) => setBlogTitleHi(e.target.value)}
                          placeholder="Article Title (Hindi)"
                          className="px-3.5 py-2 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                        />
                      </div>
                      <input
                        type="text"
                        value={blogCategory}
                        onChange={(e) => setBlogCategory(e.target.value)}
                        placeholder="Category (e.g., Homeopathy Basics)"
                        className="w-full sm:w-64 px-3.5 py-2 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                      />
                      <textarea
                        rows={4}
                        required
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        placeholder="Write educational article prose..."
                        className="w-full px-3.5 py-2 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2 text-sm font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-xl"
                      >
                        Publish Article
                      </button>
                    </form>

                    <div className="rounded-2xl bg-white border border-[#E2E8E5] divide-y divide-[#E2E8E5]">
                      {articles.map((art) => (
                        <div key={art.id} className="p-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-sm text-[#111C16]">{art.title}</p>
                            <p className="text-xs text-[#64746B]">
                              {art.category} · {art.publishedDate}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteArticle(art.id)}
                            className="text-xs font-medium text-[#B91C1C] hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && profile && (
                  <form
                    onSubmit={handleSaveProfile}
                    className="rounded-2xl bg-white border border-[#E2E8E5] p-6 space-y-5"
                  >
                    <div>
                      <h2 className="font-display font-bold text-lg text-[#111C16]">
                        Clinic Identity &amp; INR Fee Settings
                      </h2>
                      <p className="text-xs text-[#47554D] mt-0.5">
                        Customize clinic name, doctor credentials, contact numbers, address, and consultation fees.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-xs text-[#64746B] mb-1">Clinic Name (English)</label>
                        <input
                          type="text"
                          value={profile.clinicName}
                          onChange={(e) => setProfile({ ...profile, clinicName: e.target.value })}
                          className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#64746B] mb-1">Clinic Name (Hindi)</label>
                        <input
                          type="text"
                          value={profile.clinicNameHi}
                          onChange={(e) => setProfile({ ...profile, clinicNameHi: e.target.value })}
                          className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#64746B] mb-1">Doctor Name</label>
                        <input
                          type="text"
                          value={profile.doctorName}
                          onChange={(e) => setProfile({ ...profile, doctorName: e.target.value })}
                          className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#64746B] mb-1">Doctor Qualification</label>
                        <input
                          type="text"
                          value={profile.qualification}
                          onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                          className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#64746B] mb-1">Contact Phone</label>
                        <input
                          type="text"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#64746B] mb-1">WhatsApp Number</label>
                        <input
                          type="text"
                          value={profile.whatsapp}
                          onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                          className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#64746B] mb-1">Clinic Email</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#64746B] mb-1">Clinic Address</label>
                        <input
                          type="text"
                          value={profile.address}
                          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                          className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#E2E8E5] text-sm">
                      <div>
                        <label className="block text-xs text-[#64746B] mb-1">First Visit Fee (₹)</label>
                        <input
                          type="number"
                          value={profile.firstConsultFeeInr}
                          onChange={(e) =>
                            setProfile({ ...profile, firstConsultFeeInr: Number(e.target.value) || 0 })
                          }
                          className="w-full px-3 py-2 font-mono bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#64746B] mb-1">Follow-Up Fee (₹)</label>
                        <input
                          type="number"
                          value={profile.followUpFeeInr}
                          onChange={(e) =>
                            setProfile({ ...profile, followUpFeeInr: Number(e.target.value) || 0 })
                          }
                          className="w-full px-3 py-2 font-mono bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#64746B] mb-1">Video Consult Fee (₹)</label>
                        <input
                          type="number"
                          value={profile.videoConsultFeeInr}
                          onChange={(e) =>
                            setProfile({ ...profile, videoConsultFeeInr: Number(e.target.value) || 0 })
                          }
                          className="w-full px-3 py-2 font-mono bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-xl"
                    >
                      Save Clinic Identity Settings
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit 18-Field Medicine Modal */}
      {editingMed && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#111C16]/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingMed(null)}
        >
          <form
            onSubmit={handleSaveMedicine}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-white rounded-2xl border border-[#E2E8E5] shadow-2xl p-6 space-y-4 text-sm"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E5]">
              <h3 className="font-display font-bold text-lg text-[#111C16]">
                {isNewMed ? 'Create Medicine Record' : `Edit ${editingMed.medicineName}`}
              </h3>
              <button type="button" onClick={() => setEditingMed(null)} className="p-1.5 rounded-lg hover:bg-[#F3F7F4]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[#64746B] mb-1">Medicine ID</label>
                <input
                  type="text"
                  disabled={!isNewMed}
                  value={editingMed.medicineId}
                  onChange={(e) => setEditingMed({ ...editingMed, medicineId: e.target.value })}
                  placeholder="Auto if blank (e.g. MED-A09)"
                  className="w-full px-3 py-2 font-mono bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-[#64746B] mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={editingMed.medicineName}
                  onChange={(e) => setEditingMed({ ...editingMed, medicineName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-[#64746B] mb-1">Scientific Name *</label>
                <input
                  type="text"
                  required
                  value={editingMed.scientificName}
                  onChange={(e) => setEditingMed({ ...editingMed, scientificName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-[#64746B] mb-1">Common Name</label>
                <input
                  type="text"
                  value={editingMed.commonName}
                  onChange={(e) => setEditingMed({ ...editingMed, commonName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-[#64746B] mb-1">Medicine Category</label>
                <select
                  value={editingMed.medicineCategory}
                  onChange={(e) =>
                    setEditingMed({ ...editingMed, medicineCategory: e.target.value as MedicineCategory })
                  }
                  className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                >
                  {MEDICINE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#64746B] mb-1">Product Type</label>
                <input
                  type="text"
                  value={editingMed.productType}
                  onChange={(e) => setEditingMed({ ...editingMed, productType: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-[#64746B] mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={editingMed.manufacturer}
                  onChange={(e) => setEditingMed({ ...editingMed, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-[#64746B] mb-1">Potencies (comma separated)</label>
                <input
                  type="text"
                  value={editingMed.availablePotencies.join(', ')}
                  onChange={(e) =>
                    setEditingMed({
                      ...editingMed,
                      availablePotencies: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 font-mono bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-[#64746B] mb-1">Pack Sizes (comma separated)</label>
                <input
                  type="text"
                  value={editingMed.availablePackSizes.join(', ')}
                  onChange={(e) =>
                    setEditingMed({
                      ...editingMed,
                      availablePackSizes: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 font-mono bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#64746B] mb-1">Botanical / Mineral Source</label>
                <input
                  type="text"
                  value={editingMed.botanicalSource}
                  onChange={(e) => setEditingMed({ ...editingMed, botanicalSource: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-[#64746B] mb-1">Classical Reference</label>
                <input
                  type="text"
                  value={editingMed.classicalReference}
                  onChange={(e) => setEditingMed({ ...editingMed, classicalReference: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#64746B] mb-1">Description</label>
              <textarea
                rows={2}
                value={editingMed.description}
                onChange={(e) => setEditingMed({ ...editingMed, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-[#64746B] mb-1">Safety Information</label>
              <textarea
                rows={2}
                value={editingMed.safetyInformation}
                onChange={(e) => setEditingMed({ ...editingMed, safetyInformation: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#64746B] mb-1">Source URL</label>
                <input
                  type="url"
                  value={editingMed.sourceUrl}
                  onChange={(e) => setEditingMed({ ...editingMed, sourceUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-[#64746B] mb-1">Publication Status</label>
                <select
                  value={editingMed.publicationStatus}
                  onChange={(e) =>
                    setEditingMed({
                      ...editingMed,
                      publicationStatus: e.target.value as PublicationStatus,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                >
                  <option value="Pending Review">Pending Review (Unpublished)</option>
                  <option value="Draft">Draft (Unpublished)</option>
                  <option value="Published">Published (Public)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8E5]">
              <button
                type="button"
                onClick={() => setEditingMed(null)}
                className="px-4 py-2 text-sm text-[#47554D] hover:bg-[#F3F7F4] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-xl"
              >
                Save Medicine Record
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
