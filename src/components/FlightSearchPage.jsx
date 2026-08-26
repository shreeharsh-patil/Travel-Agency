import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const CITY_IATA_MAP = {
  london: 'LHR',
  paris: 'CDG',
  tokyo: 'HND',
  mumbai: 'BOM',
  delhi: 'DEL',
  goa: 'GOI',
  dubai: 'DXB',
  singapore: 'SIN',
  newyork: 'JFK',
  aspen: 'ASE',
  rome: 'FCO',
  bali: 'DPS',
  santorini: 'JTR',
  zurich: 'ZRH',
  cairo: 'CAI',
  sydney: 'SYD'
};

function resolveIata(str) {
  if (!str) return '';
  const clean = str.toLowerCase().replace(/[^a-z]/g, '');
  if (CITY_IATA_MAP[clean]) return CITY_IATA_MAP[clean];
  if (str.length === 3) return str.toUpperCase();
  return str.slice(0, 3).toUpperCase();
}

export default function FlightSearchPage() {
  const [searchParams] = useSearchParams();
  const destParam = searchParams.get('to') || searchParams.get('destination') || '';

  const [form, setForm] = useState({
    originLocationCode: 'BOM',
    destinationLocationCode: resolveIata(destParam) || 'LHR',
    departureDate: '',
    returnDate: '',
    adults: 1,
    travelClass: 'BUSINESS'
  });

  useEffect(() => {
    if (destParam) {
      setForm((prev) => ({ ...prev, destinationLocationCode: resolveIata(destParam) }));
    }
  }, [destParam]);

  const [state, setState] = useState({ loading: false, error: '', flights: [], updated: null });

  const search = async (event) => {
    event.preventDefault();
    setState({ loading: true, error: '', flights: [], updated: null });
    try {
      const params = new URLSearchParams(
        Object.entries(form)
          .filter(([, value]) => value !== '')
          .map(([key, value]) => [key, String(value)])
      );
      const res = await fetch(`/api/flight-search?${params}`);
      const data = await res.json();
      if (!res.ok || !data.available) {
        throw new Error(data.error || 'Live flight search returned no direct routes for this selection.');
      }
      setState({ loading: false, error: '', flights: data.flights || [], updated: data.lastUpdated });
    } catch (error) {
      setState({ loading: false, error: error.message, flights: [], updated: null });
    }
  };

  const field = (label, key, type = 'text', extra = {}) => (
    <label className="text-xs text-white/60">
      {label}
      <input
        required={key !== 'returnDate'}
        type={type}
        value={form[key]}
        onChange={(e) =>
          setForm({ ...form, [key]: type === 'text' ? e.target.value.toUpperCase() : e.target.value })
        }
        {...extra}
        className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-3 text-white focus:border-brand-gold focus:outline-none"
      />
    </label>
  );

  return (
    <section className="min-h-screen bg-[#0c0c0c] pt-32 pb-20 px-4 sm:px-8 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <span className="text-xs font-mono text-brand-gold uppercase tracking-[.25em]">Live Global Aviation</span>
          <h1 className="font-serif text-4xl sm:text-6xl mt-2">Private & Scheduled Flights</h1>
          <p className="text-white/60 mt-3 max-w-xl">
            Live availability and route intelligence for premium transatlantic, intercontinental, and regional routes.
          </p>
        </header>

        <form
          onSubmit={search}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 rounded-3xl bg-white/5 border border-white/10 p-4 sm:p-6"
        >
          {field('Origin IATA code', 'originLocationCode', 'text', { maxLength: 3, placeholder: 'BOM' })}
          {field('Destination IATA code', 'destinationLocationCode', 'text', { maxLength: 3, placeholder: 'LHR' })}
          {field('Departure Date', 'departureDate', 'date')}
          {field('Return Date (Optional)', 'returnDate', 'date')}
          {field('Passengers', 'adults', 'number', { min: 1, max: 9 })}
          <label className="text-xs text-white/60">
            Cabin Class
            <select
              value={form.travelClass}
              onChange={(e) => setForm({ ...form, travelClass: e.target.value })}
              className="mt-1 w-full rounded-xl bg-[#1c1c1f] border border-white/10 px-3 py-3 text-white focus:border-brand-gold focus:outline-none"
            >
              <option value="BUSINESS">Business Class</option>
              <option value="FIRST">First Class</option>
              <option value="PREMIUM_ECONOMY">Premium Economy</option>
              <option value="ECONOMY">Economy</option>
            </select>
          </label>
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
            <button
              disabled={state.loading}
              className="rounded-full bg-brand-gold px-8 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-white transition-all disabled:opacity-50 shadow-lg"
            >
              {state.loading ? 'Searching Routes…' : 'Search Flights ✨'}
            </button>
          </div>
        </form>

        {state.error && (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
            ⚠️ {state.error}
          </div>
        )}

        {state.updated && (
          <p className="text-xs font-mono text-white/45">Checked live at {new Date(state.updated).toLocaleTimeString()}</p>
        )}

        <div className="space-y-3">
          {state.flights.map((flight) => (
            <article
              key={flight.id}
              className="rounded-2xl border border-white/10 bg-[#121214] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-gold/40 transition-colors"
            >
              <div>
                <p className="text-xs text-brand-gold font-mono uppercase font-semibold">
                  {flight.airlineCode} {flight.flightNumber}
                </p>
                <h2 className="font-serif text-xl mt-1 text-white">
                  {flight.origin} → {flight.destination}
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  {flight.departureTime} · {flight.duration} · {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-white/40 block">Total Fare</span>
                <strong className="text-brand-gold text-lg font-mono font-bold">
                  {flight.price ? `${flight.currency || '₹'} ${flight.price}` : 'Quote on Request'}
                </strong>
              </div>
            </article>
          ))}
        </div>

        {!state.loading && !state.error && state.flights.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-[#121214] p-10 text-center text-white/55 space-y-2">
            <span className="text-3xl block">🛫</span>
            <p className="text-sm">Search with origin/destination IATA codes and departure dates to view live flight corridors.</p>
          </div>
        )}
      </div>
    </section>
  );
}
