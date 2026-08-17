export const COUNTRIES = {
  ng: {
    code: "ng",
    label: "Nigeria",
    flag: "🇳🇬",
    currency: { symbol: "₦", locale: "en-NG" },
    regions: [
      "Lagos", "Abuja (FCT)", "Rivers", "Kano", "Oyo", "Enugu",
      "Kaduna", "Anambra", "Edo", "Delta", "Ogun", "Cross River",
    ],
  },
  ke: {
    code: "ke",
    label: "Kenya",
    flag: "🇰🇪",
    currency: { symbol: "KSh ", locale: "en-KE" },
    regions: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika"],
  },
  gh: {
    code: "gh",
    label: "Ghana",
    flag: "🇬🇭",
    currency: { symbol: "GH₵", locale: "en-GH" },
    regions: ["Greater Accra", "Ashanti", "Western", "Central", "Eastern", "Northern"],
  },
  za: {
    code: "za",
    label: "South Africa",
    flag: "🇿🇦",
    currency: { symbol: "R", locale: "en-ZA" },
    regions: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"],
  },
};

export const DEFAULT_COUNTRY = "ng";

export function getCountry(code) {
  return COUNTRIES[code] ?? COUNTRIES[DEFAULT_COUNTRY];
}
