import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const CITY_IATA_MAP = {
  paris: 'PAR',
  london: 'LON',
  tokyo: 'TYO',
  mumbai: 'BOM',
  delhi: 'DEL',
  goa: 'GOI',
  dubai: 'DXB',
  singapore: 'SIN',
  newyork: 'NYC',
  aspen: 'ASE',
  rome: 'ROM',
  bali: 'DPS',
  santorini: 'JTR',
  zurich: 'ZRH'
};

function resolveCityCode(str) {
  if (!str) return 'PAR';
  const clean = str.toLowerCase().replace(/[^a-z]/g, '');
  if (CITY_IATA_MAP[clean]) return CITY_IATA_MAP[clean];
  if (str.length === 3) return str.toUpperCase();
  return str.slice(0, 3).toUpperCase();
}

export default function HotelSearchPage() {
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || searchParams.get('destination') || '';

  const [form, setForm] = useState({
    cityCode: resolveCityCode(cityParam) || 'PAR',
    checkInDate: '',
    checkOutDate: '',
    adults: 2,
    roomQuantity: 1
  });

  useEffect(() => {
    if (cityParam) {
      setForm((prev) => ({ ...prev, cityCode: resolveCityCode(cityParam) }));
    }
  }, [cityParam]);

  const [state, setState] = useState({ loading: false, error: '', hotels: [], updated: null });

  const search = async (event) => {
    event.preventDefault();
    setState({ loading: true, error: '', hotels: [], updated: null });
    try {
      const params = new URLSearchParams(
        Object.entries(form)
          .filter(([, value]) => value !== '')
          .map(([key, value]) => [key, String(value)])
      );
      const res = await fetch(`/api/hotels?${params}`);
      const data = await res.json();
      if (!res.ok || !data.available) {
        throw new Error(data.error || 'Live hotel availability is currently refreshed for this city.');
      }
      setState({ loading: false, error: '', hotels: data.hotels || [], updated: data.lastUpdated });
    } catch (error) {
      setState({ loading: false, error: error.message, hotels: [], updated: null });
    }
  };

  return (
    <section className="min-h-screen bg-[#0c0c0c] pt-32 pb-20 px-4 sm:px-8 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <span className="text-xs font-mono text-brand-gold uppercase tracking-[.25em]">Curated Stays</span>
          <h1 className="font-serif text-4xl sm:text-6xl mt-2">Boutique & 5-Star Stays</h1>
          <p className="text-white/60 mt-3 max-w-xl">
            Live availability and direct rates across verified boutique properties, chalets, and 5-star hotels worldwide.
          </p>
        </header>

        <form
          onSubmit={search}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 rounded-3xl bg-white/5 border border-white/10 p-4 sm:p-6"
        >
          <label className="text-xs text-white/60">
            City IATA code
            <input
              required
              maxLength={3}
              value={form.cityCode}
              onChange={(e) => setForm({ ...form, cityCode: e.target.value.toUpperCase() })}
              placeholder="PAR"
              className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-3 text-white focus:border-brand-gold focus:outline-none"
            />
          </label>
          <label className="text-xs text-white/60">
            Check-in
            <input
              required
              type="date"
              value={form.checkInDate}
              onChange={(e) => setForm({ ...form, checkInDate: e.target.value })}
              className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-3 text-white focus:border-brand-gold focus:outline-none"
            />
          </label>
          <label className="text-xs text-white/60">
            Check-out
            <input
              required
              type="date"
              value={form.checkOutDate}
              onChange={(e) => setForm({ ...form, checkOutDate: e.target.value })}
              className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-3 text-white focus:border-brand-gold focus:outline-none"
            />
          </label>
          <label className="text-xs text-white/60">
            Adults
            <input
              min={1}
              max={9}
              type="number"
              value={form.adults}
              onChange={(e) => setForm({ ...form, adults: e.target.value })}
              className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-3 text-white focus:border-brand-gold focus:outline-none"
            />
          </label>
          <button
            disabled={state.loading}
            className="self-end rounded-xl bg-brand-gold px-6 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-white transition-all disabled:opacity-50 shadow-lg"
          >
            {state.loading ? 'Searching…' : 'Find Stays ✨'}
          </button>
        </form>

        {state.error && (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
            ⚠️ {state.error}
          </div>
        )}

        {state.updated && (
          <p className="text-xs font-mono text-white/45">Checked live at {new Date(state.updated).toLocaleTimeString()}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.hotels.map((hotel) => (
            <article
              key={hotel.id}
              className="rounded-3xl border border-white/10 bg-[#121214] p-6 hover:border-brand-gold/40 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <p className="text-xs text-brand-gold font-mono uppercase font-semibold">
                  {hotel.stars ? `${hotel.stars}-Star Property` : 'Curated Stay'}
                </p>
                <h2 className="font-serif text-2xl text-white">{hotel.name}</h2>
                <p className="text-sm text-white/60">{hotel.address || 'Address provided upon reservation confirmation'}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10 flex justify-between items-center text-sm">
                <span className="text-xs text-white/50">{hotel.roomTypes?.join(', ') || 'Suite / King Room'}</span>
                <strong className="text-brand-gold font-mono text-lg font-bold">
                  {hotel.price ? `${hotel.currency || '₹'} ${hotel.price}` : 'From ₹35,000'}
                </strong>
              </div>
            </article>
          ))}
        </div>

        {!state.loading && !state.error && state.hotels.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-[#121214] p-10 text-center text-white/55 space-y-2">
            <span className="text-3xl block">🏨</span>
            <p className="text-sm">Enter destination city code (e.g. PAR, LON, TYO, GOI) and dates to find luxury boutique stays.</p>
          </div>
        )}
      </div>
    </section>
  );
}
