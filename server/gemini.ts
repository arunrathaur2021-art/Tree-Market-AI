import { GoogleGenAI, Type } from "@google/genai";
import { Species, TimberMarketPrice } from "./db";

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
    throw new Error("GEMINI_API_KEY is not configured in your Secrets/Environment.");
  }
  
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

export interface TreeAIEstimation {
  // Volume and Prices
  estimatedTimberVolume: number;
  expectedMarketPrice: number;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  suggestedSellingPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  auctionValue: number;
  futurePrice1Year: number;
  futurePrice3Years: number;
  futurePrice5Years: number;
  profitNow: number;
  profitLater: number;
  confidenceScore: number;

  // Price Breakdown
  baseWoodPrice: number;
  timberQualityBonus: number;
  diameterBonus: number;
  heightBonus: number;
  ageBonus: number;
  healthBonus: number;
  locationAdjustment: number;
  transportDeduction: number;
  demandAdjustment: number;
  governmentTaxEstimate: number;
  estimatedFinalSellingPrice: number;

  // AI Scores
  treeQualityScore: number;
  timberGradeResult: 'Grade A' | 'Grade B' | 'Grade C';
  commercialGrade: 'Prime' | 'Commercial' | 'Utility';
  investmentGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  harvestReadiness: 'Ready' | 'Growing' | 'Early';
  marketDemand: 'High' | 'Medium' | 'Low';
  buyerInterest: 'High' | 'Medium' | 'Low';
  overallAiRating: number;

  // Text Analytics
  marketAnalysis: string;
  growthPotential: string;
  professionalDescription: string;
  careInstructions: string;
  carbonStorage: number; // kg of CO2 equivalent
}

export async function calculateLocalArboristPrices(params: {
  name: string;
  category: string;
  species?: string;
  age: number;
  height: number;
  diameter: number;
  quantity: number;
  location: string;
  state: string;
  district: string;
  
  trunkCircumference?: number;
  healthCondition?: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  growthRate?: 'Slow' | 'Moderate' | 'Fast';
  trunkStraightness?: 'Very Straight' | 'Slightly Curved' | 'Crooked';
  woodDensity?: 'High' | 'Medium' | 'Low';
  moistureLevel?: 'Dry' | 'Semi-dry' | 'Fresh/Green';
  timberGrade?: 'Grade A' | 'Grade B' | 'Grade C';
  landType?: string;
  soilType?: string;
  rainfallZone?: string;
}) {
  const age = params.age || 10;
  const quantity = params.quantity || 1;
  const state = params.state || 'Karnataka';
  const category = params.category || 'Teak (Sagwan)';
  
  // Approximate missing diameter based on age & category
  let diameter = params.diameter;
  if (!diameter || diameter <= 0) {
    if (category.includes('Sandalwood')) diameter = Math.max(2, age * 0.45);
    else if (category.includes('Teak')) diameter = Math.max(3, age * 0.6);
    else if (category.includes('Bamboo')) diameter = Math.max(1.5, age * 0.5);
    else if (category.includes('Eucalyptus')) diameter = Math.max(3, age * 1.1);
    else diameter = Math.max(3, age * 0.5);
  }

  // Approximate missing height based on age & category
  let height = params.height;
  if (!height || height <= 0) {
    if (category.includes('Sandalwood')) height = Math.max(8, age * 1.5);
    else if (category.includes('Teak')) height = Math.max(12, age * 2.5);
    else if (category.includes('Bamboo')) height = Math.max(10, age * 4);
    else if (category.includes('Eucalyptus')) height = Math.max(15, age * 6);
    else height = Math.max(10, age * 2);
  }

  // Trunk Circumference (inches)
  const trunkCircumference = params.trunkCircumference || (diameter * Math.PI);
  
  // Quarter Girth Hoppus Formula: Volume (CFT) = (Circumference / 4)^2 * Height / 144
  const quarterGirth = trunkCircumference / 4;
  const estimatedTimberVolume = Math.round(((quarterGirth * quarterGirth * height) / 144) * 100) / 100;

  // Let's query base species price from our list or database
  let baseCftRate = 600;
  let maturityAge = 12;
  let woodDensityFactor = 0.65;
  let carbonFactor = 0.45;

  if (category.includes('Sandalwood')) { baseCftRate = 12000; maturityAge = 15; woodDensityFactor = 0.90; carbonFactor = 0.52; }
  else if (category.includes('Teak')) { baseCftRate = 2200; maturityAge = 20; woodDensityFactor = 0.65; carbonFactor = 0.45; }
  else if (category.includes('Rosewood')) { baseCftRate = 3200; maturityAge = 25; woodDensityFactor = 0.82; carbonFactor = 0.50; }
  else if (category.includes('Shisham')) { baseCftRate = 1500; maturityAge = 12; woodDensityFactor = 0.78; carbonFactor = 0.48; }
  else if (category.includes('Mahogany')) { baseCftRate = 1300; maturityAge = 15; woodDensityFactor = 0.70; carbonFactor = 0.47; }
  else if (category.includes('Neem')) { baseCftRate = 800; maturityAge = 10; woodDensityFactor = 0.68; carbonFactor = 0.46; }
  else if (category.includes('Eucalyptus')) { baseCftRate = 450; maturityAge = 7; woodDensityFactor = 0.55; carbonFactor = 0.42; }
  else if (category.includes('Poplar')) { baseCftRate = 400; maturityAge = 6; woodDensityFactor = 0.45; carbonFactor = 0.38; }
  else if (category.includes('Bamboo')) { baseCftRate = 250; maturityAge = 4; woodDensityFactor = 0.40; carbonFactor = 0.35; }
  else if (category.includes('Mango')) { baseCftRate = 600; maturityAge = 10; woodDensityFactor = 0.60; carbonFactor = 0.44; }

  // Query DB
  try {
    const list = await Species.find({ name: category });
    if (list && list.length > 0) {
      baseCftRate = list[0].basePricePerCft;
      maturityAge = list[0].maturityAgeYears;
      woodDensityFactor = list[0].woodDensityGcm3;
      carbonFactor = list[0].carbonStorageFactor;
    }

    const regionalPrices = await TimberMarketPrice.find({ state, speciesName: category });
    if (regionalPrices && regionalPrices.length > 0) {
      baseCftRate = regionalPrices[0].mandiPricePerCft;
    }
  } catch (err) {
    console.warn("DB not ready, using static defaults in calculation engine");
  }

  // Base Wood Price calculation
  const baseWoodPrice = Math.round(estimatedTimberVolume * baseCftRate * quantity);

  // Bonus/Deductions
  const grade = params.timberGrade || 'Grade B';
  let timberQualityBonus = 0;
  if (grade === 'Grade A') timberQualityBonus = Math.round(baseWoodPrice * 0.25);
  else if (grade === 'Grade C') timberQualityBonus = Math.round(-baseWoodPrice * 0.15);

  const straightness = params.trunkStraightness || 'Slightly Curved';
  let straightnessBonus = 0;
  if (straightness === 'Very Straight') straightnessBonus = Math.round(baseWoodPrice * 0.15);
  else if (straightness === 'Crooked') straightnessBonus = Math.round(-baseWoodPrice * 0.20);

  let diameterBonus = 0;
  if (diameter > 18) diameterBonus = Math.round(baseWoodPrice * 0.20);
  else if (diameter > 12) diameterBonus = Math.round(baseWoodPrice * 0.10);
  else if (diameter < 6) diameterBonus = Math.round(-baseWoodPrice * 0.15);

  let heightBonus = 0;
  if (height > 40) heightBonus = Math.round(baseWoodPrice * 0.15);
  else if (height > 25) heightBonus = Math.round(baseWoodPrice * 0.05);

  let ageBonus = 0;
  if (age >= maturityAge) ageBonus = Math.round(baseWoodPrice * 0.15);
  else ageBonus = Math.round(-baseWoodPrice * 0.20);

  const health = params.healthCondition || 'Good';
  let healthBonus = 0;
  if (health === 'Excellent') healthBonus = Math.round(baseWoodPrice * 0.10);
  else if (health === 'Fair') healthBonus = Math.round(-baseWoodPrice * 0.15);
  else if (health === 'Poor') healthBonus = Math.round(-baseWoodPrice * 0.35);

  let demandAdjustment = 0;
  const demand = ((category.includes('Sandalwood') || category.includes('Teak') || category.includes('Rosewood')) ? 'High' : 'Medium') as string;
  if (demand === 'High') demandAdjustment = Math.round(baseWoodPrice * 0.10);
  else if (demand === 'Low') demandAdjustment = Math.round(-baseWoodPrice * 0.15);

  let locationAdjustment = 0;
  if (state === 'Karnataka' || state === 'Maharashtra' || state === 'Punjab' || state === 'Haryana') {
    locationAdjustment = Math.round(baseWoodPrice * 0.05);
  } else {
    locationAdjustment = Math.round(-baseWoodPrice * 0.03);
  }

  const transportDeduction = Math.round(-baseWoodPrice * 0.08);

  const estimatedFinalSellingPrice = Math.max(
    1000,
    baseWoodPrice + timberQualityBonus + straightnessBonus + diameterBonus + heightBonus + ageBonus + healthBonus + demandAdjustment + locationAdjustment + transportDeduction
  );
  
  const governmentTaxEstimate = Math.round(estimatedFinalSellingPrice * 0.18);

  // Price ranges
  const minPrice = Math.round(estimatedFinalSellingPrice * 0.85);
  const avgPrice = Math.round(estimatedFinalSellingPrice);
  const maxPrice = Math.round(estimatedFinalSellingPrice * 1.15);
  const suggestedSellingPrice = Math.round(estimatedFinalSellingPrice);
  const wholesalePrice = Math.round(estimatedFinalSellingPrice * 0.80);
  const retailPrice = Math.round(estimatedFinalSellingPrice * 1.25);
  const auctionValue = Math.round(estimatedFinalSellingPrice * 1.10);

  // Growth compounding future estimates
  let compoundGrowthFactor = 1.08;
  if (category.includes('Eucalyptus') || category.includes('Poplar') || category.includes('Bamboo')) {
    compoundGrowthFactor = 1.15;
  }
  const futurePrice1Year = Math.round(estimatedFinalSellingPrice * compoundGrowthFactor);
  const futurePrice3Years = Math.round(estimatedFinalSellingPrice * Math.pow(compoundGrowthFactor, 3));
  const futurePrice5Years = Math.round(estimatedFinalSellingPrice * Math.pow(compoundGrowthFactor, 5));

  const profitNow = Math.round(estimatedFinalSellingPrice * 0.35);
  const profitLater = Math.round(futurePrice5Years * 0.50);

  // Carbon Storage sequestration
  const biomassKg = estimatedTimberVolume * woodDensityFactor * 28.3 * quantity;
  const carbonStorage = Math.round(biomassKg * 0.50 * 3.67 * 100) / 100;

  // AI Quality Scores
  let treeQualityScore = 75;
  if (health === 'Excellent') treeQualityScore += 10;
  else if (health === 'Fair') treeQualityScore -= 15;
  else if (health === 'Poor') treeQualityScore -= 40;

  if (straightness === 'Very Straight') treeQualityScore += 10;
  else if (straightness === 'Crooked') treeQualityScore -= 20;

  if (grade === 'Grade A') treeQualityScore += 5;
  treeQualityScore = Math.max(10, Math.min(100, treeQualityScore));

  const commercialGrade = treeQualityScore >= 80 ? 'Prime' : treeQualityScore >= 50 ? 'Commercial' : 'Utility';
  const investmentGrade = treeQualityScore >= 90 ? 'A+' : treeQualityScore >= 75 ? 'A' : treeQualityScore >= 60 ? 'B' : treeQualityScore >= 45 ? 'C' : 'D';
  const harvestReadiness = age >= maturityAge ? 'Ready' : (age >= maturityAge * 0.7) ? 'Growing' : 'Early';
  const buyerInterest = (demand === 'High' && treeQualityScore >= 60) ? 'High' : 'Medium';
  const overallAiRating = Math.max(1, Math.min(5, Math.round((treeQualityScore / 20) * 10) / 10));

  // Data completeness confidence score
  let missingFieldsCount = 0;
  if (!params.trunkCircumference) missingFieldsCount++;
  if (!params.healthCondition) missingFieldsCount++;
  if (!params.trunkStraightness) missingFieldsCount++;
  if (!params.woodDensity) missingFieldsCount++;
  if (!params.moistureLevel) missingFieldsCount++;
  if (!params.timberGrade) missingFieldsCount++;

  const confidenceScore = Math.max(50, 100 - (missingFieldsCount * 8));

  return {
    estimatedTimberVolume,
    expectedMarketPrice: avgPrice,
    minPrice,
    avgPrice,
    maxPrice,
    suggestedSellingPrice,
    wholesalePrice,
    retailPrice,
    auctionValue,
    futurePrice1Year,
    futurePrice3Years,
    futurePrice5Years,
    profitNow,
    profitLater,
    confidenceScore,

    baseWoodPrice,
    timberQualityBonus: timberQualityBonus + straightnessBonus,
    diameterBonus,
    heightBonus,
    ageBonus,
    healthBonus,
    locationAdjustment,
    transportDeduction,
    demandAdjustment,
    governmentTaxEstimate,
    estimatedFinalSellingPrice,

    treeQualityScore,
    timberGradeResult: grade as any,
    commercialGrade: commercialGrade as any,
    investmentGrade: investmentGrade as any,
    harvestReadiness: harvestReadiness as any,
    marketDemand: demand as any,
    buyerInterest: buyerInterest as any,
    overallAiRating,
    carbonStorage
  };
}

export async function estimateTreeDetails(params: {
  name: string;
  category: string;
  species?: string;
  age: number;
  height: number;
  diameter: number;
  quantity: number;
  location: string;
  state: string;
  district: string;
  
  trunkCircumference?: number;
  healthCondition?: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  growthRate?: 'Slow' | 'Moderate' | 'Fast';
  trunkStraightness?: 'Very Straight' | 'Slightly Curved' | 'Crooked';
  woodDensity?: 'High' | 'Medium' | 'Low';
  moistureLevel?: 'Dry' | 'Semi-dry' | 'Fresh/Green';
  timberGrade?: 'Grade A' | 'Grade B' | 'Grade C';
  landType?: string;
  soilType?: string;
  rainfallZone?: string;
}): Promise<TreeAIEstimation> {
  // First run high-fidelity arborist calculation local model
  const arboristData = await calculateLocalArboristPrices(params);

  try {
    const ai = getGeminiClient();
    
    const prompt = `Analyze this tree on the Indian timber & nursery market and write professional narrative copy:
- Title/Listing Name: ${params.name}
- Common/Category Name: ${params.category}
- Scientific/Botanical Name: ${params.species || params.category}
- Tree Age: ${params.age} years old
- Tree Height: ${params.height} feet
- Trunk Diameter (DBH): ${params.diameter} inches
- Trunk Circumference: ${params.trunkCircumference || "approx. " + (params.diameter * Math.PI).toFixed(1)} inches
- Quantity Available: ${params.quantity} trees
- State: ${params.state}
- District/Location: ${params.district}, ${params.location}
- Calculated Timber Volume: ${arboristData.estimatedTimberVolume} CFT
- Computed Final Market Value: INR ₹${arboristData.avgPrice.toLocaleString('en-IN')}
- Timber Quality Grade: ${arboristData.timberGradeResult}
- Carbon Storage Sequestered: ${arboristData.carbonStorage} kg of CO2 equivalent
- Investment Grade: ${arboristData.investmentGrade}

Please enrich these values and return strictly a JSON object with contextual, beautifully-formatted Indian marketplace narratives.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert tree horticulturist, professional arborist, and Indian timber mandi / landscape market analyst. Based on the provided physical arborist specs, write detailed narratives. Do not invent new mathematical numbers, respect the calculated timber price and volume exactly. Return strictly a JSON object with fields: 'marketAnalysis' (a detailed 3-4 sentence paragraph discussing mandi demand, supply scarcity, and APMC trends for this tree type in India), 'growthPotential' (2-3 sentences discussing biomass accumulation, heartwood expansion potential, and longevity), 'professionalDescription' (a highly compelling, search-optimized 4-5 sentence sales pitch ready to publish on the marketplace), and 'careInstructions' (5 bulleted points with specific transplanting, watering, soil drainage, and Indian pest care advice). No markdown around the JSON block.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketAnalysis: {
              type: Type.STRING,
              description: "Mandi demand, price trends, and APMC relevance in this state/district."
            },
            growthPotential: {
              type: Type.STRING,
              description: "Heartwood growth, carbon capacity, and future maturation potential."
            },
            professionalDescription: {
              type: Type.STRING,
              description: "A gorgeous, highly professional market sales description."
            },
            careInstructions: {
              type: Type.STRING,
              description: "Five bullet points detailing care, irrigation, transplanting, and pest protection."
            }
          },
          required: ["marketAnalysis", "growthPotential", "professionalDescription", "careInstructions"]
        }
      }
    });

    const text = response.text || "";
    const parsedText = JSON.parse(text.trim());

    return {
      ...arboristData,
      marketAnalysis: parsedText.marketAnalysis || `Steady, highly reliable market demand for ${params.category} trees in ${params.state}. Currently valued for construction timber, high-quality furniture grains, and agroforestry integrations.`,
      growthPotential: parsedText.growthPotential || `This specimen possesses strong heartwood development potential. Expected to grow substantially over the next decade, adding high-density trunk mass.`,
      professionalDescription: parsedText.professionalDescription || `A pristine, well-maintained listing of ${params.name}. Standing at ${params.height} feet with a trunk diameter of ${params.diameter} inches. Ready for commercial trade, landscaping, or sustainable timber felling.`,
      careInstructions: parsedText.careInstructions || `1. Protect the main taproot during heavy felling or transplant excavation.\n2. Irrigate deeply twice a week in alluvial or red soil types.\n3. Keep the base clear of weed overgrowths and crop residues.\n4. Apply neem cake organic fertilizers to discourage termite infestations.\n5. Prune secondary branches carefully during dormant winter seasons.`
    };
  } catch (error) {
    console.error("Gemini API estimation failure, executing full arborist local fallback:", error);
    
    // Fallback text narratives incorporating parameters
    return {
      ...arboristData,
      marketAnalysis: `Robust regional market demand is recorded for ${params.category} in the mandis of ${params.state}. Large diameter specimen logs fetch prime rates in current APMC auctions due to high furniture-manufacturing demands.`,
      growthPotential: `This tree has excellent heartwood development potential. Compound biomass accumulation over the next 5 years is projected to yield high financial value as wood density increments organically.`,
      professionalDescription: `Presenting a premium specimen listing of ${params.name} situated in ${params.district}, ${params.state}. Measuring ${params.height} feet in height with a healthy trunk diameter of ${params.diameter} inches at breast height (DBH). Fully vetted and registered for sustainable agroforestry harvesting.`,
      careInstructions: `1. Keep the root ball securely wrapped and moistened during transport.\n2. Dig a transplant pit twice as wide as the root diameter in well-draining soil.\n3. Water deeply twice weekly for the first six months post-planting.\n4. Protect against wood-boring pests with natural neem-oil sprays.\n5. Maintain standard distance gaps between adjacent trees to ensure full solar access.`
    };
  }
}
