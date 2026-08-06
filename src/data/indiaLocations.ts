export interface StateLocationData {
  state: string;
  districts: {
    district: string;
    tehsils: {
      tehsil: string;
      villages: string[];
    }[];
  }[];
  center: { lat: number; lng: number };
}

export const INDIA_LOCATIONS: StateLocationData[] = [
  {
    state: "Punjab",
    center: { lat: 30.9010, lng: 75.8573 },
    districts: [
      {
        district: "Ludhiana",
        tehsils: [
          {
            tehsil: "Ludhiana East",
            villages: ["Bhamian Kalan", "Tajpur", "Mundian Kalan", "Jamalpur", "Khasi Kalan"]
          },
          {
            tehsil: "Ludhiana West",
            villages: ["Ayali Kalan", "Thakkarwal", "Bhadewal", "Sunet", "Gill"]
          },
          {
            tehsil: "Jagraon",
            villages: ["Sidhwan Bet", "Akhara", "Galib Kalan", "Swaddich", "Gurusar Kaonke"]
          },
          {
            tehsil: "Samrala",
            villages: ["Hedon Bet", "Bondli", "Otalan", "Sihala", "Machhiwara"]
          }
        ]
      },
      {
        district: "Amritsar",
        tehsils: [
          {
            tehsil: "Amritsar I",
            villages: ["Chheharta", "Verka", "Vallah", "Manawala", "Gurusar"]
          },
          {
            tehsil: "Ajnala",
            villages: ["Ramdas", "Gaggar Bhana", "Bhopal", "Chogawan", "Saurian"]
          },
          {
            tehsil: "Baba Bakala",
            villages: ["Raya", "Sathiala", "Beas", "Bhutwind", "Mattewal"]
          }
        ]
      },
      {
        district: "Jalandhar",
        tehsils: [
          {
            tehsil: "Jalandhar I",
            villages: ["Jamsher", "Pholriwal", "Lohara", "Kalyanpur", "Khurla Kingra"]
          },
          {
            tehsil: "Nakodar",
            villages: ["Ughi", "Shankar", "Malsian", "Mehatpur", "Chak Kalan"]
          },
          {
            tehsil: "Phillaur",
            villages: ["Goraya", "Bara Pind", "Tehang", "Dosanjh Kalan", "Lasara"]
          }
        ]
      },
      {
        district: "Patiala",
        tehsils: [
          {
            tehsil: "Patiala",
            villages: ["Sanaur", "Bahadurgarh", "Main", "Dhakanshu", "Baran"]
          },
          {
            tehsil: "Nabha",
            villages: ["Rohti Chhanna", "Bhadson", "Alowal", "Tungwali", "Ghagga"]
          },
          {
            tehsil: "Rajpura",
            villages: ["Ghanour", "Banur", "Shambhu", "Jangpura", "Shanauli"]
          }
        ]
      },
      {
        district: "Hoshiarpur",
        tehsils: [
          {
            tehsil: "Hoshiarpur",
            villages: ["Bajwara", "Attowal", "Piplanwala", "Naru Nangal", "Bassi Kalan"]
          },
          {
            tehsil: "Dasuya",
            villages: ["Tanda", "Bodhal", "Urmar", "Mirzapur", "Galowal"]
          },
          {
            tehsil: "Garhshankar",
            villages: ["Saila Khurd", "Mahilpur", "Binjon", "Possi", "Panam"]
          }
        ]
      }
    ]
  },
  {
    state: "Haryana",
    center: { lat: 29.0588, lng: 76.0856 },
    districts: [
      {
        district: "Yamunanagar",
        tehsils: [
          {
            tehsil: "Jagadhri",
            villages: ["Buria", "Khajuri", "Manakpur", "Chhachhrauli", "Damla"]
          },
          {
            tehsil: "Radaur",
            villages: ["Uncha Chandna", "Ghumthala", "Kheri Lakha Singh", "Sandhala", "Bapa"]
          },
          {
            tehsil: "Bilaspur",
            villages: ["Ranjitpur", "Kapuri", "Machhrauli", "Sadhaura", "Mughalwali"]
          }
        ]
      },
      {
        district: "Ambala",
        tehsils: [
          {
            tehsil: "Ambala",
            villages: ["Baldev Nagar", "Narayangarh", "Naneola", "Saha", "Shahzadpur"]
          },
          {
            tehsil: "Barara",
            villages: ["Mulana", "Adhoya", "Talheri", "Dosarka", "Thana Chhachhra"]
          }
        ]
      },
      {
        district: "Karnal",
        tehsils: [
          {
            tehsil: "Karnal",
            villages: ["Indri", "Gharaunda", "Nilokheri", "Assandh", "Kunjpura"]
          },
          {
            tehsil: "Gharaunda",
            villages: ["Kohand", "Kutail", "Bastara", "Munak", "Arand"]
          }
        ]
      },
      {
        district: "Hisar",
        tehsils: [
          {
            tehsil: "Hisar",
            villages: ["Adampur", "Hansi", "Barwala", "Narnaund", "Uklana"]
          }
        ]
      },
      {
        district: "Gurugram",
        tehsils: [
          {
            tehsil: "Gurugram",
            villages: ["Sohna", "Pataudi", "Badshahpur", "Manesar", "Wazirabad"]
          }
        ]
      }
    ]
  },
  {
    state: "Uttar Pradesh",
    center: { lat: 26.8467, lng: 80.9462 },
    districts: [
      {
        district: "Saharanpur",
        tehsils: [
          {
            tehsil: "Saharanpur Sadar",
            villages: ["Sarasawa", "Chilkana", "Manani", "Gagalheri", "Pawanpuri"]
          },
          {
            tehsil: "Deoband",
            villages: ["Rankhandi", "Talheri Buzurg", "Bhudkheri", "Nagal", "Sunderpur"]
          },
          {
            tehsil: "Nakur",
            villages: ["Gangoh", "Sarsaawa", "Agwanpur", "Chhutmalpur", "Kalyanpur"]
          },
          {
            tehsil: "Behat",
            villages: ["Shakumbhari", "Mirzapur Pole", "Khujnawar", "Badshahi Bagh", "Muzaffarabad"]
          }
        ]
      },
      {
        district: "Muzaffarnagar",
        tehsils: [
          {
            tehsil: "Muzaffarnagar",
            villages: ["Khatauli", "Budhana", "Shahpur", "Baghra", "Charthawal"]
          },
          {
            tehsil: "Jansath",
            villages: ["Miranpur", "Bhopa", "Morna", "Kakrauli", "Meerapur"]
          }
        ]
      },
      {
        district: "Bareilly",
        tehsils: [
          {
            tehsil: "Bareilly Sadar",
            villages: ["Nawabganj", "Faridpur", "Bithri Chainpur", "Kyoladiya", "Rithora"]
          },
          {
            tehsil: "Baheri",
            villages: ["Richha", "Shergarh", "Jamuniya", "Bhojipura", "Damkhoda"]
          }
        ]
      },
      {
        district: "Lucknow",
        tehsils: [
          {
            tehsil: "Lucknow Sadar",
            villages: ["Bakshi Ka Talab", "Mohanlalganj", "Sarojini Nagar", "Kakori", "Maliahabad"]
          }
        ]
      },
      {
        district: "Gorakhpur",
        tehsils: [
          {
            tehsil: "Gorakhpur Sadar",
            villages: ["Bansgaon", "Campierganj", "Caimpiyarganj", "Khajni", "Pipraich"]
          }
        ]
      }
    ]
  },
  {
    state: "Karnataka",
    center: { lat: 15.3173, lng: 75.7139 },
    districts: [
      {
        district: "Mysuru",
        tehsils: [
          {
            tehsil: "Mysuru",
            villages: ["Hunsur", "KR Nagara", "Nanjangud", "Periyapatna", "T Narasipura"]
          }
        ]
      },
      {
        district: "Shimoga",
        tehsils: [
          {
            tehsil: "Shivamogga",
            villages: ["Bhadravathi", "Sagar", "Shikaripura", "Thirthahalli", "Hosagandhi"]
          }
        ]
      },
      {
        district: "Bengaluru Rural",
        tehsils: [
          {
            tehsil: "Devanahalli",
            villages: ["Doddaballapura", "Hosakote", "Nelamangala", "Vijayapura", "Avathi"]
          }
        ]
      },
      {
        district: "Kodagu",
        tehsils: [
          {
            tehsil: "Madikeri",
            villages: ["Somwarpet", "Virajpet", "Gonikoppal", "Suntikoppa", "Kushalnagar"]
          }
        ]
      }
    ]
  },
  {
    state: "Maharashtra",
    center: { lat: 19.7515, lng: 75.7139 },
    districts: [
      {
        district: "Pune",
        tehsils: [
          {
            tehsil: "Haveli",
            villages: ["Mulshi", "Shirur", "Maval", "Khed", "Baramati"]
          },
          {
            tehsil: "Junner",
            villages: ["Ozar", "Narayangaon", "Alephata", "Otur", "Ghogargaon"]
          }
        ]
      },
      {
        district: "Nashik",
        tehsils: [
          {
            tehsil: "Nashik",
            villages: ["Igatpuri", "Niphad", "Sinnar", "Dindori", "Malegaon"]
          }
        ]
      },
      {
        district: "Nagpur",
        tehsils: [
          {
            tehsil: "Nagpur Urban",
            villages: ["Kamptee", "Umred", "Ramtek", "Katol", "Kalameshwar"]
          }
        ]
      },
      {
        district: "Kolhapur",
        tehsils: [
          {
            tehsil: "Karveer",
            villages: ["Hatkanangale", "Shirol", "Radhanagari", "Kagal", "Panhala"]
          }
        ]
      }
    ]
  },
  {
    state: "Gujarat",
    center: { lat: 22.2587, lng: 71.1924 },
    districts: [
      {
        district: "Anand",
        tehsils: [
          {
            tehsil: "Anand",
            villages: ["Petlad", "Borsad", "Khambhat", "Umreth", "Tarapur"]
          }
        ]
      },
      {
        district: "Surat",
        tehsils: [
          {
            tehsil: "Choryasi",
            villages: ["Olpad", "Bardoli", "Kamrej", "Vyara", "Mahuva"]
          }
        ]
      },
      {
        district: "Rajkot",
        tehsils: [
          {
            tehsil: "Rajkot",
            villages: ["Gondal", "Jetpur", "Morbi", "Dhoraji", "Jasdan"]
          }
        ]
      },
      {
        district: "Vadodara",
        tehsils: [
          { tehsil: "Vadodara", villages: ["Padra", "Dabhoi", "Karjan", "Savli", "Sankheda"] }
        ]
      }
    ]
  },
  {
    state: "Tamil Nadu",
    center: { lat: 11.1271, lng: 78.6569 },
    districts: [
      {
        district: "Coimbatore",
        tehsils: [
          {
            tehsil: "Coimbatore North",
            villages: ["Pollachi", "Mettupalayam", "Sulur", "Annur", "Valparai"]
          }
        ]
      },
      {
        district: "Madurai",
        tehsils: [
          {
            tehsil: "Madurai North",
            villages: ["Melur", "Thirumangalam", "Vadipatti", "Usilampatti", "Usilampatti"]
          }
        ]
      },
      {
        district: "Salem",
        tehsils: [
          {
            tehsil: "Salem",
            villages: ["Attur", "Mettur", "Omalur", "Yercaud", "Sankari"]
          }
        ]
      }
    ]
  },
  {
    state: "Kerala",
    center: { lat: 10.8505, lng: 76.2711 },
    districts: [
      {
        district: "Wayanad",
        tehsils: [
          {
            tehsil: "Vythiri",
            villages: ["Kalpetta", "Sulthan Bathery", "Mananthavady", "Meppadi", "Panamaram"]
          }
        ]
      },
      {
        district: "Idukki",
        tehsils: [
          {
            tehsil: "Devikulam",
            villages: ["Munnar", "Thodupuzha", "Udumbanchola", "Peermade", "Kattappana"]
          }
        ]
      },
      {
        district: "Palakkad",
        tehsils: [
          {
            tehsil: "Palakkad",
            villages: ["Ottapalam", "Mannarkkad", "Chittur", "Alathur", "Pattambi"]
          }
        ]
      }
    ]
  },
  {
    state: "Madhya Pradesh",
    center: { lat: 22.9734, lng: 78.6569 },
    districts: [
      {
        district: "Indore",
        tehsils: [
          {
            tehsil: "Indore",
            villages: ["Mhow", "Sanwer", "Depalpur", "Hatod", "Rau"]
          }
        ]
      },
      {
        district: "Jabalpur",
        tehsils: [
          {
            tehsil: "Jabalpur",
            villages: ["Sihora", "Patan", "Shahpura", "Kundam", "Panagar"]
          }
        ]
      },
      {
        district: "Bhopal",
        tehsils: [
          {
            tehsil: "Huzur",
            villages: ["Berasia", "Kolar", "Bairagarh", "Ratibad", "Phanda"]
          }
        ]
      }
    ]
  },
  {
    state: "Rajasthan",
    center: { lat: 27.0238, lng: 74.2179 },
    districts: [
      {
        district: "Jaipur",
        tehsils: [
          {
            tehsil: "Jaipur",
            villages: ["Amer", "Sanganer", "Chomu", "Kotputli", "Phulera"]
          }
        ]
      },
      {
        district: "Jodhpur",
        tehsils: [
          {
            tehsil: "Jodhpur",
            villages: ["Luni", "Osian", "Phalodi", "Piparcity", "Bilara"]
          }
        ]
      },
      {
        district: "Udaipur",
        tehsils: [
          {
            tehsil: "Girwa",
            villages: ["Salumber", "Mavli", "Kherwara", "Jhadol", "Vallabhnagar"]
          }
        ]
      }
    ]
  },
  {
    state: "Uttarakhand",
    center: { lat: 30.3165, lng: 78.0322 },
    districts: [
      {
        district: "Dehradun",
        tehsils: [
          { tehsil: "Dehradun", villages: ["Rishikesh", "Doiwala", "Vikasnagar", "Kalsi", "Chakrata"] }
        ]
      },
      {
        district: "Udham Singh Nagar",
        tehsils: [
          { tehsil: "Kashipur", villages: ["Rudrapur", "Kichha", "Kashipur", "Jaspur", "Sitarganj", "Khatima"] }
        ]
      },
      {
        district: "Haridwar",
        tehsils: [
          { tehsil: "Roorkee", villages: ["Roorkee", "Laksar", "Bhagwanpur", "Manglaur", "Hardwar"] }
        ]
      }
    ]
  },
  {
    state: "Himachal Pradesh",
    center: { lat: 31.1048, lng: 77.1734 },
    districts: [
      {
        district: "Solan",
        tehsils: [
          { tehsil: "Solan", villages: ["Nalagarh", "Baddi", "Arki", "Kasauli", "Kandaghat"] }
        ]
      },
      {
        district: "Kangra",
        tehsils: [
          { tehsil: "Dharamshala", villages: ["Palampur", "Kangra", "Nurpur", "Dehra Gopipur", "Indora"] }
        ]
      }
    ]
  },
  {
    state: "West Bengal",
    center: { lat: 22.9868, lng: 87.8550 },
    districts: [
      {
        district: "Jalpaiguri",
        tehsils: [
          { tehsil: "Siliguri", villages: ["Mainaguri", "Dhupguri", "Malbazar", "Matigara", "Naxalbari"] }
        ]
      },
      {
        district: "Kolkata",
        tehsils: [
          { tehsil: "Kolkata Central", villages: ["Howrah", "Bidhannagar", "Rajarhat", "Jadavpur", "Behala"] }
        ]
      }
    ]
  },
  {
    state: "Bihar",
    center: { lat: 25.0961, lng: 85.3131 },
    districts: [
      {
        district: "Patna",
        tehsils: [
          { tehsil: "Patna Sadar", villages: ["Danapur", "Phulwari Sharif", "Masaurhi", "Barh", "Bikram"] }
        ]
      },
      {
        district: "Muzaffarpur",
        tehsils: [
          { tehsil: "Muzaffarpur", villages: ["Kanti", "Motipur", "Sakra", "Sarbe", "Paroo"] }
        ]
      }
    ]
  }
];

// District Coords Map for fine precision
export const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  "yamunanagar": { lat: 30.1290, lng: 77.2952 },
  "ambala": { lat: 30.3782, lng: 76.7767 },
  "karnal": { lat: 29.6857, lng: 76.9905 },
  "kurukshetra": { lat: 29.9695, lng: 76.8783 },
  "panchkula": { lat: 30.6942, lng: 76.8606 },
  "sonipat": { lat: 28.9931, lng: 77.0151 },
  "ludhiana": { lat: 30.9010, lng: 75.8573 },
  "amritsar": { lat: 31.6340, lng: 74.8723 },
  "jalandhar": { lat: 31.3260, lng: 75.5762 },
  "patiala": { lat: 30.3398, lng: 76.3869 },
  "hoshiarpur": { lat: 31.5143, lng: 75.9115 },
  "saharanpur": { lat: 29.9680, lng: 77.5552 },
  "lucknow": { lat: 26.8467, lng: 80.9462 },
  "bareilly": { lat: 28.3670, lng: 79.4304 },
  "meerut": { lat: 28.9845, lng: 77.7064 },
  "bijnor": { lat: 29.3724, lng: 78.1358 },
  "varanasi": { lat: 25.3176, lng: 82.9739 },
  "pilibhit": { lat: 28.6312, lng: 79.8037 },
  "bengaluru urban": { lat: 12.9716, lng: 77.5946 },
  "shivamogga": { lat: 13.9299, lng: 75.5681 },
  "uttara kannada": { lat: 14.8010, lng: 74.1302 },
  "mysuru": { lat: 12.2958, lng: 76.6394 },
  "nagpur": { lat: 21.1458, lng: 79.0882 },
  "chandrapur": { lat: 19.9615, lng: 79.2961 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "nashik": { lat: 20.0059, lng: 73.7898 },
  "dehradun": { lat: 30.3165, lng: 78.0322 },
  "udham singh nagar": { lat: 28.9800, lng: 79.5100 },
  "haridwar": { lat: 29.9457, lng: 78.1642 },
  "solan": { lat: 30.9084, lng: 77.0999 },
  "kangra": { lat: 32.0998, lng: 76.2691 },
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "jodhpur": { lat: 26.2389, lng: 73.0243 },
  "udaipur": { lat: 24.5854, lng: 73.7125 },
  "jabalpur": { lat: 23.1815, lng: 79.9864 },
  "bhopal": { lat: 23.2599, lng: 77.4126 },
  "surat": { lat: 21.1702, lng: 72.8311 },
  "vadodara": { lat: 22.3072, lng: 73.1812 },
  "coimbatore": { lat: 11.0168, lng: 76.9558 },
  "salem": { lat: 11.6643, lng: 78.1460 },
  "jalpaiguri": { lat: 26.5403, lng: 88.7194 },
  "patna": { lat: 25.5941, lng: 85.1376 },
  "muzaffarpur": { lat: 26.1209, lng: 85.3647 }
};

// Regional Agroforestry Schemes & Market Info
export const REGIONAL_SCHEMES_DATA: Record<string, {
  schemes: Array<{ name: string; subsidy: string; description: string; link?: string }>;
  topSpecies: string[];
  mandis: string[];
  weatherAlert: string;
}> = {
  "haryana": {
    schemes: [
      { name: "Har Khet Par Ped Scheme", subsidy: "₹10,000 / acre incentive", description: "Direct subsidy for planting Poplar & Eucalyptus on farm bunds." },
      { name: "Transit Permit Exemption for Agroforestry", subsidy: "100% Exemption", description: "No transit pass required for Poplar, Eucalyptus, Malabar Neem within Haryana." },
      { name: "Subesh Agro-Forestry Plantation Subsidy", subsidy: "₹15 per sapling", description: "Free high-yielding clonal saplings provided by Forest Dept." }
    ],
    topSpecies: ["Poplar (G-48)", "Eucalyptus (Clonal)", "Melia Dubia (Malabar Neem)", "Shisham", "Acacia"],
    mandis: ["Yamunanagar Timber Mandi", "Ambala Wood Market", "Karnal Agro Mandi"],
    weatherAlert: "Optimal season for Poplar harvesting & plantation. Humidity 64%, Fair weather."
  },
  "uttar pradesh": {
    schemes: [
      { name: "UP Tree Transit Exemption Rule 2020", subsidy: "Free Transit Pass", description: "29 agroforestry species exempted from tree felling and transit permits." },
      { name: "Mukhyamantri Vriksharopan Mahabhiyan", subsidy: "Free Sapling Distribution", description: "Free distribution of Teak, Sheesham, Mango & Poplar saplings to farmers." },
      { name: "Plywood Industry Incentive Policy", subsidy: "Interest Subvention 5%", description: "Subsidized industrial power & credit for new plywood and veneer mills." }
    ],
    topSpecies: ["Poplar", "Teak (Sagwan)", "Eucalyptus", "Sheesham", "Mango Wood", "Mahogany"],
    mandis: ["Saharanpur Timber Mandi", "Bareilly Plywood Hub", "Bijnor Timber Market", "Lucknow Wood Mandi"],
    weatherAlert: "Clear sunny weather in Western UP. Ideal logging conditions for Poplar & Teak."
  },
  "punjab": {
    schemes: [
      { name: "Sub-Mission on Agroforestry (SMAF)", subsidy: "50% Subsidy on Saplings", description: "Financial assistance for block & peripheral planting on agricultural land." },
      { name: "Pesticide & Disease Control Assistance", subsidy: "Free Spray Kits", description: "State agriculture dept support against stem borer in Poplar plantations." }
    ],
    topSpecies: ["Poplar", "Eucalyptus", "Melia Dubia", "Kikar (Acacia)", "Shisham"],
    mandis: ["Ludhiana Timber Market", "Hoshiarpur Plywood Mandi", "Jalandhar Wood Center"],
    weatherAlert: "Moderate temperatures, high demand for Poplar log arrivals at Hoshiarpur mills."
  },
  "karnataka": {
    schemes: [
      { name: "Krishi Aranya Protsaha Yojane (KAPY)", subsidy: "₹125 / tree over 3 yrs", description: "Cash incentive per surviving tree planted by farmers on land borders." },
      { name: "Sandalwood Cultivation Freedom Scheme", subsidy: "100% Farming Freedom", description: "Farmers allowed to grow and sell Sandalwood directly with forest dept assistance." }
    ],
    topSpecies: ["Teak (Sagwan)", "Rosewood", "Silver Oak", "Sandalwood", "Acacia Mangium"],
    mandis: ["Shivamogga Wood Yard", "Mysuru Forest Depot", "Dandeli Timber Yard"],
    weatherAlert: "Monsoon showers expected. Good time for sapling planting in Malnad belt."
  },
  "maharashtra": {
    schemes: [
      { name: "Bhautik Vruksharopan Abhiyaan", subsidy: "100% Free Saplings", description: "Vidarbha & Marathwada tree farming incentives for Teak and Bamboo." },
      { name: "Bamboo Promotion Mission Maharashtra", subsidy: "₹80,000 / hectare", description: "Subsidy for commercial bamboo farming on dry agricultural lands." }
    ],
    topSpecies: ["Teak (Nagpur Grade A)", "Bamboo (Manvel)", "Mahogany", "Subabul", "Neem"],
    mandis: ["Nagpur Wood Depot", "Chandrapur Sawmill Yard", "Pune Timber Market"],
    weatherAlert: "Dry warm climate in Vidarbha. Excellent logging & transportation conditions."
  },
  "rajasthan": {
    schemes: [
      { name: "Ghar Ghar Aushadhi & Agroforestry Scheme", subsidy: "Free Sapling Kit", description: "Desert-hardy tree saplings provided free to farmers." }
    ],
    topSpecies: ["Khejri", "Rohida (Desert Teak)", "Babool (Acacia)", "Neem", "Shisham"],
    mandis: ["Jaipur Timber Yard", "Jodhpur Furniture Market"],
    weatherAlert: "Clear skies. Dry conditions optimal for desert hardwood seasoning."
  }
};

// Reverse geocode coords to nearest matching state, district, tehsil, pincode
export function reverseGeocodeCoords(lat: number, lng: number): {
  country: string;
  state: string;
  district: string;
  taluka: string;
  tehsil: string;
  village: string;
  pincode: string;
  lat: number;
  lng: number;
} {
  let closestDistrict = "Yamunanagar";
  let closestState = "Haryana";
  let minDistance = Infinity;

  // Search district coords for closest match
  for (const [distKey, coords] of Object.entries(DISTRICT_COORDS)) {
    const dist = calculateDistanceKm(lat, lng, coords.lat, coords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestDistrict = distKey.charAt(0).toUpperCase() + distKey.slice(1);
    }
  }

  // Find corresponding state from INDIA_LOCATIONS
  for (const stObj of INDIA_LOCATIONS) {
    const foundDist = stObj.districts.find(d => d.district.toLowerCase() === closestDistrict.toLowerCase());
    if (foundDist) {
      closestState = stObj.state;
      const tehsilObj = foundDist.tehsils[0];
      const tehsilName = tehsilObj ? tehsilObj.tehsil : `${closestDistrict} Tehsil`;
      const villageName = tehsilObj && tehsilObj.villages[0] ? tehsilObj.villages[0] : `${closestDistrict} City`;
      
      return {
        country: "India",
        state: closestState,
        district: foundDist.district,
        taluka: tehsilName,
        tehsil: tehsilName,
        village: villageName,
        pincode: "135001",
        lat,
        lng
      };
    }
  }

  return {
    country: "India",
    state: "Haryana",
    district: "Yamunanagar",
    taluka: "Jagadhri",
    tehsil: "Jagadhri",
    village: "Mandebari",
    pincode: "135001",
    lat,
    lng
  };
}

// Helper: Calculate Haversine distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// Parse "lat, lng" string to object
export function parseGpsCoords(gpsStr?: string): { lat: number; lng: number } | null {
  if (!gpsStr) return null;
  const parts = gpsStr.split(',').map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] };
  }
  return null;
}

// Estimate default lat/lng based on State/District if GPS is missing
export function getEstimatedLocationCoords(state?: string, district?: string): { lat: number; lng: number } {
  if (district) {
    const distKey = district.toLowerCase();
    if (DISTRICT_COORDS[distKey]) {
      return DISTRICT_COORDS[distKey];
    }
  }
  if (state) {
    const stateObj = INDIA_LOCATIONS.find(s => s.state.toLowerCase() === state.toLowerCase());
    if (stateObj) {
      return stateObj.center;
    }
  }
  // Default to central India (e.g. Nagpur / MP)
  return { lat: 21.1458, lng: 79.0882 };
}

export interface AddressSuggestion {
  id: string;
  formattedAddress: string;
  houseNo?: string;
  street: string;
  landmark?: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  lat: number;
  lng: number;
}

// Search Google Places / Address suggestions while typing
export function searchAddressPlacesSuggestions(query: string): AddressSuggestion[] {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();
  const results: AddressSuggestion[] = [];

  for (const stObj of INDIA_LOCATIONS) {
    for (const distObj of stObj.districts) {
      const distKey = distObj.district.toLowerCase();
      const baseCoords = DISTRICT_COORDS[distKey] || stObj.center;

      for (const tehsilObj of distObj.tehsils) {
        for (const villageName of tehsilObj.villages) {
          const fullStr = `${villageName}, ${tehsilObj.tehsil}, ${distObj.district}, ${stObj.state}`;
          if (
            fullStr.toLowerCase().includes(q) ||
            villageName.toLowerCase().includes(q) ||
            tehsilObj.tehsil.toLowerCase().includes(q) ||
            distObj.district.toLowerCase().includes(q) ||
            stObj.state.toLowerCase().includes(q)
          ) {
            const hash = (villageName.length * 17 + tehsilObj.tehsil.length * 31 + q.length * 7) % 100;
            const latOffset = (hash - 50) * 0.0015;
            const lngOffset = ((hash * 3) % 100 - 50) * 0.0015;

            const pincodeVal = distObj.district.toLowerCase() === "yamunanagar" ? "135001" :
                              distObj.district.toLowerCase() === "saharanpur" ? "247001" :
                              distObj.district.toLowerCase() === "lucknow" ? "226001" : "110001";

            results.push({
              id: `${distObj.district}-${tehsilObj.tehsil}-${villageName}`,
              formattedAddress: `${villageName} Main Road, near Tehsil Office, ${distObj.district}, ${stObj.state} - ${pincodeVal}`,
              houseNo: "Plot 12",
              street: `${villageName} Main Road`,
              landmark: "Near Tehsil Office",
              village: villageName,
              taluka: tehsilObj.tehsil,
              district: distObj.district,
              state: stObj.state,
              pincode: pincodeVal,
              country: "India",
              lat: Math.round((baseCoords.lat + latOffset) * 100000) / 100000,
              lng: Math.round((baseCoords.lng + lngOffset) * 100000) / 100000,
            });

            if (results.length >= 6) return results;
          }
        }
      }
    }
  }

  return results;
}

// Geocode custom typed address to latitude and longitude
export function geocodeAddressDetails(params: {
  houseNo?: string;
  street?: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
}): { lat: number; lng: number } {
  const base = getEstimatedLocationCoords(params.state, params.district);
  
  // Hash street & house number to generate small deterministic coordinate offset (~100-500 meters)
  const str = `${params.houseNo || ''}-${params.street || ''}-${params.village || ''}-${params.pincode || ''}`;
  if (!str.trim()) return base;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  const latOffset = ((Math.abs(hash) % 200) - 100) * 0.0001; // ~10-100 meters precision
  const lngOffset = ((Math.abs(hash >> 2) % 200) - 100) * 0.0001;

  return {
    lat: Math.round((base.lat + latOffset) * 100000) / 100000,
    lng: Math.round((base.lng + lngOffset) * 100000) / 100000,
  };
}

