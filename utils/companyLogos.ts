// Company logo mappings
export const companyLogos = {
  "Solid Rock": {
    name: "SOLID ROCK",
    subtitle: "STONE WORK LLC",
    logo: "https://img.icons8.com/ios-filled/100/mountain.png",
    color: "#00234C"
  },
  "Terry Asphalt": {
    name: "TERRY ASPHALT", 
    subtitle: "HAULING & GRADING, INC.",
    logo: "https://img.icons8.com/ios-filled/100/laurel-wreath.png",
    color: "#00234C"
  }
};

export function getCompanyInfo(companyName: string | null) {
  if (!companyName) return null;
  return companyLogos[companyName as keyof typeof companyLogos] || null;
}
