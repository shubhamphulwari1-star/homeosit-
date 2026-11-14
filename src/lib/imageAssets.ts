import heroDoctorImg from '../assets/images/hero_doctor_portrait_1794646261218.jpg';
import clinicInteriorImg from '../assets/images/clinic_interior_banner_1794646261517.jpg';
import remedyBottlesImg from '../assets/images/homeopathy_remedy_bottles_1794646261399.jpg';
import botanicalApothecaryImg from '../assets/images/botanical_apothecary_1794646262083.jpg';

export const CLINIC_IMAGES = {
  heroDoctor: heroDoctorImg,
  clinicInterior: clinicInteriorImg,
  remedyBottles: remedyBottlesImg,
  botanicalApothecary: botanicalApothecaryImg,
};

export function resolveMedicineImage(keyOrUrl: string): string {
  if (!keyOrUrl) return remedyBottlesImg;
  if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://') || keyOrUrl.startsWith('/')) {
    return keyOrUrl;
  }
  switch (keyOrUrl) {
    case 'apothecary':
      return botanicalApothecaryImg;
    case 'globules':
    case 'tablets':
    case 'dilutions':
      return remedyBottlesImg;
    case 'topical':
      return clinicInteriorImg;
    default:
      return remedyBottlesImg;
  }
}
