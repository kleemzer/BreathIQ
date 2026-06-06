import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { evaluateClinicalOrientation } = require('../js/clinical-orientation.js');
const { normalizeCareFacility, rankCareFacilities } = require('../js/care-facilities.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const cases = [
  {
    name: 'Dyspnee repos + douleur thoracique',
    input: { symptoms: ['dyspnea_rest', 'chest_pain'], ageGroup: 'adult', riskFactors: [], context: { localOutbreakRisk: 'low' } },
    expected: ['emergency', 'medical_regulation'],
  },
  {
    name: 'Toux legere adulte 2 jours',
    input: { symptoms: ['dry_cough'], durationDays: 2, ageGroup: 'adult', riskFactors: [], context: { localOutbreakRisk: 'low' } },
    expected: ['pharmacy', 'self_monitoring'],
  },
  {
    name: 'Toux 3 semaines + sueurs nocturnes',
    input: { symptoms: ['dry_cough', 'night_sweats'], durationDays: 22, ageGroup: 'adult', riskFactors: [], context: { localOutbreakRisk: 'low' } },
    expected: ['same_day_doctor'],
  },
  {
    name: 'Fievre + confusion',
    input: { symptoms: ['fever', 'confusion'], ageGroup: 'adult', riskFactors: [], context: { localOutbreakRisk: 'low' } },
    expected: ['emergency'],
  },
  {
    name: 'Fievre + retour zone Ebola',
    input: { symptoms: ['fever'], ageGroup: 'adult', riskFactors: ['travel_africa_high_risk'], context: { localOutbreakRisk: 'high' } },
    expected: ['medical_regulation'],
  },
  {
    name: 'Senior + dyspnee moderee',
    input: { symptoms: ['dyspnea'], ageGroup: 'senior', riskFactors: [], context: { localOutbreakRisk: 'low' } },
    expected: ['same_day_doctor', 'emergency'],
  },
];

for (const item of cases) {
  const result = evaluateClinicalOrientation(item.input);
  assert(item.expected.includes(result.level), `${item.name}: expected ${item.expected.join('/')} got ${result.level}`);
  assert(typeof result.patientMessageFR === 'string' && result.patientMessageFR.length > 20, `${item.name}: missing patientMessageFR`);
}

const query = { lat: 46.16, lon: -1.15, need: 'emergency_department', radiusKm: 10 };
const hospital = normalizeCareFacility({
  id: 1,
  lat: 46.17,
  lon: -1.14,
  tags: { name: 'Centre Hospitalier Test', amenity: 'hospital', emergency: 'yes', phone: '15' },
}, 'OSM', query);
const pharmacy = normalizeCareFacility({
  id: 2,
  lat: 46.1605,
  lon: -1.1505,
  tags: { name: 'Pharmacie Test', amenity: 'pharmacy' },
}, 'OSM', query);

assert(hospital.type === 'hospital' || hospital.type === 'emergency', 'OSM hospital normalization failed');
assert(pharmacy.type === 'pharmacy', 'OSM pharmacy normalization failed');

const rankedEmergency = rankCareFacilities([pharmacy, hospital], query);
assert(['hospital', 'emergency'].includes(rankedEmergency[0].type), 'Emergency ranking should prioritize hospital/emergency');

const rankedPharmacy = rankCareFacilities([pharmacy, hospital], { ...query, need: 'pharmacy' });
assert(rankedPharmacy[0].type === 'pharmacy', 'Pharmacy ranking should prioritize pharmacies');

console.log('Clinical orientation and care ranking tests passed.');
