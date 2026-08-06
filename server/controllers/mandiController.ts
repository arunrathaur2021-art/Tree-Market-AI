import { Request, Response } from 'express';
import { GoogleGenAI } from "@google/genai";

// Comprehensive Mock Data Seed for Indian APMC Timber Mandis
export interface MandiItem {
  id: string;
  commodity: string;
  variety: string;
  grade: string;
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
  averagePrice: number;
  arrivalQuantity: number; // Quintals or Tons
  quantityUnit: string;
  mandiName: string;
  district: string;
  state: string;
  dateUpdated: string;
  priceChange: number; // percentage e.g. +2.4 or -1.5
  priceChangeAmount: number; // e.g. +120
  weeklyTrend: string;
  monthlyTrend: string;
  yearlyTrend: string;
  marketStatus: 'Open' | 'Closed';
  demandLevel: 'High' | 'Very High' | 'Moderate' | 'Extreme';
  coordinates: { lat: number; lng: number };
}

const INITIAL_MANDI_DATA: MandiItem[] = [
  {
    id: 'mandi-1',
    commodity: 'Teak (Sagwan)',
    variety: 'Round Logs Grade-A',
    grade: 'A',
    minPrice: 42000,
    modalPrice: 48500,
    maxPrice: 55000,
    averagePrice: 48200,
    arrivalQuantity: 450,
    quantityUnit: 'Ton',
    mandiName: 'Shimoga APMC Wood Market',
    district: 'Shivamogga',
    state: 'Karnataka',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: 3.2,
    priceChangeAmount: 1500,
    weeklyTrend: '+3.2%',
    monthlyTrend: '+7.8%',
    yearlyTrend: '+15.4%',
    marketStatus: 'Open',
    demandLevel: 'Very High',
    coordinates: { lat: 13.9299, lng: 75.5681 }
  },
  {
    id: 'mandi-2',
    commodity: 'Eucalyptus',
    variety: 'Pulpwood Logs',
    grade: 'B',
    minPrice: 4800,
    modalPrice: 5600,
    maxPrice: 6200,
    averagePrice: 5550,
    arrivalQuantity: 1200,
    quantityUnit: 'Ton',
    mandiName: 'Yamunanagar Timber Market',
    district: 'Yamunanagar',
    state: 'Haryana',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: 1.8,
    priceChangeAmount: 100,
    weeklyTrend: '+1.8%',
    monthlyTrend: '+4.2%',
    yearlyTrend: '+11.0%',
    marketStatus: 'Open',
    demandLevel: 'High',
    coordinates: { lat: 30.1290, lng: 77.2674 }
  },
  {
    id: 'mandi-3',
    commodity: 'Poplar',
    variety: 'Plywood Logs (Girth 24"+)',
    grade: 'A',
    minPrice: 7500,
    modalPrice: 8900,
    maxPrice: 9800,
    averagePrice: 8850,
    arrivalQuantity: 1850,
    quantityUnit: 'Quintal',
    mandiName: 'Chhoria Wood APMC',
    district: 'Hoshiarpur',
    state: 'Punjab',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: -0.8,
    priceChangeAmount: -70,
    weeklyTrend: '-0.8%',
    monthlyTrend: '+2.1%',
    yearlyTrend: '+8.6%',
    marketStatus: 'Open',
    demandLevel: 'High',
    coordinates: { lat: 31.5143, lng: 75.9115 }
  },
  {
    id: 'mandi-4',
    commodity: 'Melia Dubia (Malabar Neem)',
    variety: 'Plywood & Veneer Logs',
    grade: 'A',
    minPrice: 6800,
    modalPrice: 7900,
    maxPrice: 8600,
    averagePrice: 7850,
    arrivalQuantity: 620,
    quantityUnit: 'Ton',
    mandiName: 'Mysuru Rural APMC',
    district: 'Mysuru',
    state: 'Karnataka',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: 4.5,
    priceChangeAmount: 340,
    weeklyTrend: '+4.5%',
    monthlyTrend: '+12.3%',
    yearlyTrend: '+22.0%',
    marketStatus: 'Open',
    demandLevel: 'Extreme',
    coordinates: { lat: 12.2958, lng: 76.6394 }
  },
  {
    id: 'mandi-5',
    commodity: 'Sandalwood (Chandan)',
    variety: 'Heartwood Class-I',
    grade: 'Super Fine',
    minPrice: 1200000,
    modalPrice: 1450000,
    maxPrice: 1680000,
    averagePrice: 1445000,
    arrivalQuantity: 12,
    quantityUnit: 'Quintal',
    mandiName: 'Kaveri Govt Sandal Depot APMC',
    district: 'Mysuru',
    state: 'Karnataka',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: 2.1,
    priceChangeAmount: 30000,
    weeklyTrend: '+2.1%',
    monthlyTrend: '+5.4%',
    yearlyTrend: '+18.2%',
    marketStatus: 'Open',
    demandLevel: 'Extreme',
    coordinates: { lat: 12.3106, lng: 76.6433 }
  },
  {
    id: 'mandi-6',
    commodity: 'Bamboo',
    variety: 'Solid Pole (20ft+)',
    grade: 'A',
    minPrice: 1800,
    modalPrice: 2400,
    maxPrice: 2900,
    averagePrice: 2380,
    arrivalQuantity: 3400,
    quantityUnit: 'Quintal',
    mandiName: 'Guwahati Timber & Bamboo Depot',
    district: 'Kamrup Metropolitan',
    state: 'Assam',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: 0.5,
    priceChangeAmount: 12,
    weeklyTrend: '+0.5%',
    monthlyTrend: '+3.1%',
    yearlyTrend: '+6.9%',
    marketStatus: 'Open',
    demandLevel: 'Moderate',
    coordinates: { lat: 26.1445, lng: 91.7362 }
  },
  {
    id: 'mandi-7',
    commodity: 'Neem',
    variety: 'Furniture Timber Timber',
    grade: 'B',
    minPrice: 12000,
    modalPrice: 14800,
    maxPrice: 16500,
    averagePrice: 14700,
    arrivalQuantity: 280,
    quantityUnit: 'Ton',
    mandiName: 'Bareilly APMC Wood Yard',
    district: 'Bareilly',
    state: 'Uttar Pradesh',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: 1.1,
    priceChangeAmount: 160,
    weeklyTrend: '+1.1%',
    monthlyTrend: '+3.8%',
    yearlyTrend: '+9.4%',
    marketStatus: 'Open',
    demandLevel: 'Moderate',
    coordinates: { lat: 28.3670, lng: 79.4304 }
  },
  {
    id: 'mandi-8',
    commodity: 'Sheesham (Rosewood)',
    variety: 'Seasoned Planks & Round Wood',
    grade: 'A',
    minPrice: 38000,
    modalPrice: 44000,
    maxPrice: 49500,
    averagePrice: 43800,
    arrivalQuantity: 310,
    quantityUnit: 'Ton',
    mandiName: 'Saharanpur Wood Crafts APMC',
    district: 'Saharanpur',
    state: 'Uttar Pradesh',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: 2.8,
    priceChangeAmount: 1200,
    weeklyTrend: '+2.8%',
    monthlyTrend: '+8.1%',
    yearlyTrend: '+16.5%',
    marketStatus: 'Open',
    demandLevel: 'Very High',
    coordinates: { lat: 29.9680, lng: 77.5552 }
  },
  {
    id: 'mandi-9',
    commodity: 'Mahogany',
    variety: 'Commercial Timber Round Logs',
    grade: 'A',
    minPrice: 32000,
    modalPrice: 37500,
    maxPrice: 42000,
    averagePrice: 37200,
    arrivalQuantity: 210,
    quantityUnit: 'Ton',
    mandiName: 'Kottayam Timber APMC',
    district: 'Kottayam',
    state: 'Kerala',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: 1.9,
    priceChangeAmount: 700,
    weeklyTrend: '+1.9%',
    monthlyTrend: '+6.2%',
    yearlyTrend: '+13.8%',
    marketStatus: 'Open',
    demandLevel: 'High',
    coordinates: { lat: 9.5916, lng: 76.5222 }
  },
  {
    id: 'mandi-10',
    commodity: 'Casuarina (Chowku)',
    variety: 'Construction Poles & Scaffolding',
    grade: 'B',
    minPrice: 3200,
    modalPrice: 4100,
    maxPrice: 4700,
    averagePrice: 4050,
    arrivalQuantity: 1500,
    quantityUnit: 'Ton',
    mandiName: 'Guntur Rural Wood APMC',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: -1.2,
    priceChangeAmount: -50,
    weeklyTrend: '-1.2%',
    monthlyTrend: '+1.5%',
    yearlyTrend: '+5.2%',
    marketStatus: 'Open',
    demandLevel: 'Moderate',
    coordinates: { lat: 16.3067, lng: 80.4365 }
  },
  {
    id: 'mandi-11',
    commodity: 'Subabul',
    variety: 'Paper Industry Wood',
    grade: 'Standard',
    minPrice: 3900,
    modalPrice: 4600,
    maxPrice: 5100,
    averagePrice: 4580,
    arrivalQuantity: 2100,
    quantityUnit: 'Ton',
    mandiName: 'Rajahmundry APMC Yard',
    district: 'East Godavari',
    state: 'Andhra Pradesh',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: 0.8,
    priceChangeAmount: 35,
    weeklyTrend: '+0.8%',
    monthlyTrend: '+2.9%',
    yearlyTrend: '+7.1%',
    marketStatus: 'Open',
    demandLevel: 'Moderate',
    coordinates: { lat: 17.0005, lng: 81.8040 }
  },
  {
    id: 'mandi-12',
    commodity: 'Mango Wood',
    variety: 'Packing Box & Cheap Furniture Logs',
    grade: 'B',
    minPrice: 8500,
    modalPrice: 10500,
    maxPrice: 12200,
    averagePrice: 10400,
    arrivalQuantity: 780,
    quantityUnit: 'Ton',
    mandiName: 'Nagpur Central Timber Yard',
    district: 'Nagpur',
    state: 'Maharashtra',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: 1.4,
    priceChangeAmount: 140,
    weeklyTrend: '+1.4%',
    monthlyTrend: '+4.0%',
    yearlyTrend: '+10.2%',
    marketStatus: 'Open',
    demandLevel: 'High',
    coordinates: { lat: 21.1458, lng: 79.0882 }
  },
  {
    id: 'mandi-13',
    commodity: 'Silver Oak',
    variety: 'Shuttering & Coffee Shade Logs',
    grade: 'B',
    minPrice: 11000,
    modalPrice: 13200,
    maxPrice: 15000,
    averagePrice: 13100,
    arrivalQuantity: 490,
    quantityUnit: 'Ton',
    mandiName: 'Chikmagalur Coffee & Timber Yard',
    district: 'Chikkamagaluru',
    state: 'Karnataka',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: 2.3,
    priceChangeAmount: 300,
    weeklyTrend: '+2.3%',
    monthlyTrend: '+6.9%',
    yearlyTrend: '+14.0%',
    marketStatus: 'Open',
    demandLevel: 'High',
    coordinates: { lat: 13.3161, lng: 75.7720 }
  },
  {
    id: 'mandi-14',
    commodity: 'Rubber Wood',
    variety: 'Chemically Treated Board Logs',
    grade: 'A',
    minPrice: 6500,
    modalPrice: 7800,
    maxPrice: 8900,
    averagePrice: 7750,
    arrivalQuantity: 1100,
    quantityUnit: 'Ton',
    mandiName: 'Nilambur Teak & Rubber APMC',
    district: 'Malappuram',
    state: 'Kerala',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: 3.1,
    priceChangeAmount: 235,
    weeklyTrend: '+3.1%',
    monthlyTrend: '+9.2%',
    yearlyTrend: '+17.3%',
    marketStatus: 'Open',
    demandLevel: 'Very High',
    coordinates: { lat: 11.2758, lng: 76.2289 }
  },
  {
    id: 'mandi-15',
    commodity: 'Acacia',
    variety: 'Industrial Fuel & Tannin Wood',
    grade: 'Standard',
    minPrice: 4100,
    modalPrice: 4900,
    maxPrice: 5500,
    averagePrice: 4850,
    arrivalQuantity: 890,
    quantityUnit: 'Ton',
    mandiName: 'Gandhidham Port Timber Depot',
    district: 'Kutch',
    state: 'Gujarat',
    dateUpdated: new Date().toISOString().split('T')[0],
    priceChange: 0.9,
    priceChangeAmount: 42,
    weeklyTrend: '+0.9%',
    monthlyTrend: '+3.4%',
    yearlyTrend: '+8.0%',
    marketStatus: 'Open',
    demandLevel: 'Moderate',
    coordinates: { lat: 23.0753, lng: 70.1337 }
  }
];

export const getMandiPrices = async (req: Request, res: Response) => {
  try {
    const { state, district, commodity, search, sortBy } = req.query;

    let result = [...INITIAL_MANDI_DATA];

    if (state && typeof state === 'string' && state !== 'All') {
      result = result.filter(item => item.state.toLowerCase() === state.toLowerCase());
    }

    if (district && typeof district === 'string' && district.trim()) {
      result = result.filter(item => item.district.toLowerCase().includes(district.toLowerCase()));
    }

    if (commodity && typeof commodity === 'string' && commodity !== 'All') {
      result = result.filter(item => item.commodity.toLowerCase().includes(commodity.toLowerCase()));
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(item => 
        item.commodity.toLowerCase().includes(q) ||
        item.mandiName.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        item.variety.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'priceHigh') {
      result.sort((a, b) => b.modalPrice - a.modalPrice);
    } else if (sortBy === 'priceLow') {
      result.sort((a, b) => a.modalPrice - b.modalPrice);
    } else if (sortBy === 'arrival') {
      result.sort((a, b) => b.arrivalQuantity - a.arrivalQuantity);
    } else if (sortBy === 'trend') {
      result.sort((a, b) => b.priceChange - a.priceChange);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch mandi prices' });
  }
};

export const getMandiHistory = async (req: Request, res: Response) => {
  try {
    const { commodity, timeframe } = req.query; // timeframe: '7d', '30d', '6m', '1y'

    const targetCommodity = typeof commodity === 'string' ? commodity : 'Teak (Sagwan)';
    const tf = typeof timeframe === 'string' ? timeframe : '30d';

    const pointsCount = tf === '7d' ? 7 : tf === '30d' ? 12 : tf === '6m' ? 12 : 12;
    const historyData = [];

    const baseItem = INITIAL_MANDI_DATA.find(i => i.commodity.toLowerCase().includes(targetCommodity.toLowerCase())) || INITIAL_MANDI_DATA[0];
    const basePrice = baseItem.modalPrice;

    const now = new Date();

    for (let i = pointsCount - 1; i >= 0; i--) {
      const date = new Date(now);
      if (tf === '7d') date.setDate(now.getDate() - i);
      else if (tf === '30d') date.setDate(now.getDate() - i * 2.5);
      else if (tf === '6m') date.setMonth(now.getMonth() - i * 0.5);
      else date.setMonth(now.getMonth() - i);

      const variance = (Math.sin(i * 0.8) * 0.05) + ((pointsCount - i) * 0.008);
      const modal = Math.round(basePrice * (1 + variance));
      const minP = Math.round(modal * 0.88);
      const maxP = Math.round(modal * 1.12);
      const arrivals = Math.round(baseItem.arrivalQuantity * (0.8 + Math.random() * 0.4));

      historyData.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        modalPrice: modal,
        minPrice: minP,
        maxPrice: maxP,
        arrivals
      });
    }

    res.json({
      commodity: baseItem.commodity,
      mandi: baseItem.mandiName,
      unit: baseItem.quantityUnit,
      timeframe: tf,
      history: historyData
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate history' });
  }
};

export const getAIMandiAnalysis = async (req: Request, res: Response) => {
  try {
    const { commodity, state, district } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are India's leading APMC timber mandi analyst at TreeMarket AI India (developed by Arun Rathaur).
Provide a brief JSON market analysis for timber commodity: "${commodity || 'Teak'}" in State: "${state || 'Karnataka'}", District: "${district || 'Mysuru'}".

Return ONLY valid JSON matching this schema:
{
  "bestMarketToSell": "Name of top paying APMC mandi",
  "bestTimeToSell": "Optimal harvest/sale month or season e.g. Oct-Nov post monsoon",
  "expectedFuturePrice": "Estimated price range per Ton/Quintal in 30-60 days e.g. ₹52,000 - ₹56,000",
  "demandLevel": "High | Extreme | Very High | Moderate",
  "priceForecastTrend": "Positive | Highly Bullish | Stable | Moderately Rising",
  "profitEstimatePerUnit": "Estimated net profit per ton e.g. ₹12,500/ton",
  "summaryReasoning": "1-2 sentence explanation based on paper mill demand, furniture craft hubs, or construction season."
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json(parsed);
        }
      } catch (geminiErr) {
        console.warn("Gemini AI mandi analysis fallback:", geminiErr);
      }
    }

    // Fallback static AI analysis
    res.json({
      bestMarketToSell: `${district || 'Shimoga'} APMC Wood Yard (${state || 'Karnataka'})`,
      bestTimeToSell: "Post-monsoon season (October - January) during peak construction activity",
      expectedFuturePrice: "₹48,000 - ₹54,000 / Ton (+8.5% expected growth)",
      demandLevel: "Very High",
      priceForecastTrend: "Highly Bullish",
      profitEstimatePerUnit: "₹14,200 net profit per Ton",
      summaryReasoning: `Strong industrial demand from plywood factories and seasoned furniture artisans across ${state || 'India'}. Supply is tightening due to sustainable cutting quotas.`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
};
