/**
 * Luxury Wine Regions, Vineyard Estates & Vintage Chart Intelligence API.
 * Provides sommelier vintage quality ratings, grape varieties, and estate tasting tours.
 */

const WINE_REGIONS = {
  bordeaux: {
    region: 'Bordeaux (Left & Right Bank)',
    country: 'France',
    premierAppellations: ['Pauillac', 'Margaux', 'Saint-Émilion', 'Pomerol'],
    primaryGrapes: 'Cabernet Sauvignon, Merlot, Cabernet Franc, Petit Verdot',
    vintageRatings: [
      { year: 2019, score: '98/100 (Legendary Vintage)', status: 'Drink now or hold for 20+ years' },
      { year: 2016, score: '99/100 (Historic Classic)', status: 'Approaching peak drinking maturity' },
      { year: 2015, score: '97/100 (Opulent & Rich)', status: 'Drinking beautifully now' },
      { year: 2010, score: '99/100 (Immense Structure)', status: 'Collector landmark vintage' }
    ],
    recommendedChateaux: ['Château Margaux', 'Château Latour', 'Château Cheval Blanc']
  },
  tuscany: {
    region: 'Tuscany (Chianti Classico & Brunello)',
    country: 'Italy (near Amalfi / Florence)',
    premierAppellations: ['Brunello di Montalcino', 'Bolgheri Superiore', 'Chianti Classico Gran Selezione'],
    primaryGrapes: 'Sangiovese (Grosso), Cabernet Sauvignon, Merlot',
    vintageRatings: [
      { year: 2016, score: '100/100 (Benchmark Brunello)', status: 'Peak elegance and power' },
      { year: 2019, score: '97/100 (Vibrant & Balanced)', status: 'Drink or cellar' },
      { year: 2015, score: '98/100 (Warm & Velvety)', status: 'Prime drinking window' }
    ],
    recommendedChateaux: ['Tenuta San Guido (Sassicaia)', 'Biondi-Santi', 'Ornellaia']
  },
  champagne: {
    region: 'Champagne (Reims & Épernay)',
    country: 'France',
    premierAppellations: ['Montagne de Reims', 'Côte des Blancs', 'Vallée de la Marne'],
    primaryGrapes: 'Chardonnay, Pinot Noir, Pinot Meunier',
    vintageRatings: [
      { year: 2012, score: '97/100 (Superb Prestige Cuvée)', status: 'Magnificent balance and brioche minerality' },
      { year: 2008, score: '100/100 (Generational Masterpiece)', status: 'Legendary prestige vintage' }
    ],
    recommendedChateaux: ['Dom Pérignon', 'Krug', 'Louis Roederer Cristal']
  },
  nashik: {
    region: 'Nashik Valley (Indian Wine Capital)',
    country: 'India (near Mumbai)',
    premierAppellations: ['Dindori Reserve', 'Sanad Estate'],
    primaryGrapes: 'Cabernet Shiraz, Chenin Blanc, Sauvignon Blanc, Zinfandel',
    vintageRatings: [
      { year: 2022, score: '92/100 (Top Indian Reserve)', status: 'Smooth tannins and tropical fruit' },
      { year: 2020, score: '93/100 (Late Harvest Gold)', status: 'Drinking exceptionally' }
    ],
    recommendedChateaux: ['Sula Vineyards Rasik Estate', 'Chandon India Sparkling', 'Grover Zampa']
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { region = 'bordeaux' } = req.query || {};
  const clean = String(region).toLowerCase().trim();

  let data = WINE_REGIONS[clean];
  if (!data) {
    for (const [k, v] of Object.entries(WINE_REGIONS)) {
      if (clean.includes(k) || v.country.toLowerCase().includes(clean)) {
        data = v;
        break;
      }
    }
  }
  if (!data) data = WINE_REGIONS.bordeaux;

  return res.status(200).json({
    success: true,
    wineRegion: data.region,
    country: data.country,
    appellations: data.premierAppellations,
    grapeVarieties: data.primaryGrapes,
    vintageRatingsChart: data.vintageRatings,
    flagshipEstates: data.recommendedChateaux,
    sommelierNote: 'Horizon Travels arranges private cellar tastings with estate owners and helicopter winery hops.'
  });
}
