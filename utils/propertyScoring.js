export function parseIndianPrice(price) {
  if (!price) return Number.MAX_SAFE_INTEGER;

  const text = String(price)
    .replace(/,/g, "")
    .replace(/₹/g, "")
    .trim()
    .toLowerCase();

  const number = parseFloat(text);

  if (isNaN(number)) return Number.MAX_SAFE_INTEGER;

  if (text.includes("crore") || text.includes("cr"))
    return number * 10000000;

  if (
    text.includes("lakh") ||
    text.includes("lakhs") ||
    text.includes("lac")
  )
    return number * 100000;

  return number;
}
const GOOD_BUILDERS = [
  "Lodha",
  "Godrej",
  "Prestige",
  "DLF",
  "Shapoorji",
  "Runwal",
  "Sobha",
  "Tata",
  "Mahindra",
  "Kolte Patil"
];
function scorePricePerSqft(property, filters) {

  const city = filters.city;

  const locality = Object.keys(LOCALITY_CATEGORY)
      .find(area =>
          property.location_address
              ?.toLowerCase()
              .includes(area.toLowerCase())
      );

  if(!locality)
      return 0;

  const category = LOCALITY_CATEGORY[locality];

  const benchmark =
      MARKET_BENCHMARKS[city]?.[category];

  if(!benchmark)
      return 0;

  const actual =
      Number(
          String(property.price_per_sqft)
              .replace(/[₹,\s]/g,"")
      );

  if(isNaN(actual))
      return 0;

  if(actual < benchmark.min)
      return WEIGHTS.pricePerSqft;

  if(actual <= benchmark.max)
      return Math.floor(WEIGHTS.pricePerSqft*0.8);

  if(actual <= benchmark.max*1.2)
      return Math.floor(WEIGHTS.pricePerSqft*0.4);

  return 0;

}
const WEIGHTS = {
  budget: 30,
  bhk: 20,
  propertyType: 10,
  possession: 15,
  rera: 10,
  builder: 5,
  amenities: 5,
  parking: 2,
  locality: 3,
  pricePerSqft: 15
};
export function calculateScore(property, filters) {

  let score = 0;

  const propertyPrice = parseIndianPrice(
    property.price || property.total_price
  );

  const budget = filters.maxPrice
    ? parseIndianPrice(filters.maxPrice)
    : Number.MAX_SAFE_INTEGER;

  //------------------------
  // Budget
  //------------------------

  if (propertyPrice <= budget)
    score += WEIGHTS.budget;
  else if (propertyPrice <= budget * 1.1)
    score += 20;
  else if (propertyPrice <= budget * 1.2)
    score += 10;

  //------------------------
  // BHK
  //------------------------

  if (
    filters.bhk &&
    property.bhk_config
      ?.toLowerCase()
      .includes(filters.bhk.toLowerCase())
  ) {
    score += WEIGHTS.bhk;
  }

  //------------------------
  // Property Type
  //------------------------

  if (
    filters.propertyType &&
    property.property_type
      ?.toLowerCase()
      .includes(filters.propertyType.toLowerCase())
  ) {
    score += WEIGHTS.propertyType;
  }

  //------------------------
  // Ready Possession
  //------------------------

  const possession =
    property.possession_status?.toLowerCase() || "";

  if (possession.includes("ready"))
    score += WEIGHTS.possession;
  else if (possession.includes("2026"))
    score += 10;
  else if (possession.includes("2027"))
    score += 5;

  //------------------------
  // RERA
  //------------------------

  if (property.rera_number)
    score += WEIGHTS.rera;

  //------------------------
  // Builder
  //------------------------

  if (
    GOOD_BUILDERS.some(builder =>
      property.builder_name?.includes(builder)
    )
  ) {
    score += WEIGHTS.builder;
  }

  //------------------------
  // Parking
  //------------------------

  if (property.parking)
    score += WEIGHTS.parking;

  //------------------------
  // Amenities
  //------------------------

  if (Array.isArray(property.amenities)) {

    score += Math.min(
      property.amenities.length,
      WEIGHTS.amenities
    );

  }

  score += scorePricePerSqft(
    property,
    filters
);

  return score;

}
export function rankProperties(properties, filters) {

  return properties
    .map(property => ({
      ...property,
      score: calculateScore(property, filters)
    }))
    .sort((a, b) => b.score - a.score);

}
import {
  MARKET_BENCHMARKS,
  LOCALITY_CATEGORY
} from "./marketBenchmarks.js";


