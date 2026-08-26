import { ReactLenis } from '@studio-freight/react-lenis';
import { Fragment, useEffect, lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import GenericPage from './components/GenericPage';
import NotFoundPage from './components/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Route-level code splitting — each page loads only when visited.
const HomePage = lazy(() => import('./components/HomePage'));
const TravelPage = lazy(() => import('./components/TravelPage'));
const ServicePage = lazy(() => import('./components/ServicePage'));
const GalleryPage = lazy(() => import('./components/GalleryPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const JournalPage = lazy(() => import('./components/JournalPage'));
const PlaceDetailPage = lazy(() => import('./components/PlaceDetailPage'));
const SuggestPlacePage = lazy(() => import('./components/SuggestPlacePage'));
const FavoritesPage = lazy(() => import('./components/FavoritesPage'));
const AdminDashboardPage = lazy(() => import('./components/AdminDashboardPage'));
const PlanTripPage = lazy(() => import('./components/PlanTripPage'));
const MyTripsPage = lazy(() => import('./components/MyTripsPage'));
const UserAccountPage = lazy(() => import('./components/UserAccountPage'));
const GuidesListingPage = lazy(() => import('./components/GuidesListingPage'));
const SeasonalOffersPage = lazy(() => import('./components/SeasonalOffersPage'));
const TripsGalleryPage = lazy(() => import('./components/TripsGalleryPage'));
const HotelSearchPage = lazy(() => import('./components/HotelSearchPage'));
const FlightSearchPage = lazy(() => import('./components/FlightSearchPage'));
const LegalPage = lazy(() => import('./components/LegalPage'));
const SitemapPage = lazy(() => import('./components/SitemapPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
      <div className="w-9 h-9 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function SmoothScroll({ children }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 767px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(!mobile.matches && !reducedMotion.matches);
    update();
    mobile.addEventListener('change', update);
    reducedMotion.addEventListener('change', update);
    return () => {
      mobile.removeEventListener('change', update);
      reducedMotion.removeEventListener('change', update);
    };
  }, []);

  if (!enabled) return <Fragment>{children}</Fragment>;
  return (
    <ReactLenis root options={{ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}

function App() {
  return (
    <SmoothScroll>
      <Router>
        <CurrencyProvider>
          <ToastProvider>
            <div className="bg-[#0c0c0c] min-h-screen text-white selection:bg-white selection:text-black font-sans relative">
              <Header />
              <ScrollToTop />

              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/journal" element={<JournalPage />} />
                    <Route path="/about" element={<GenericPage title="About Us" subtitle="Our Story" image="/images/swiss_alps.png" />} />
                    <Route path="/dates" element={<GenericPage title="Availability" subtitle="Plan Your Stay" image="/images/tropical_beach.png" />} />
                    <Route path="/travel" element={<TravelPage />} />
                    <Route path="/hotels" element={<HotelSearchPage />} />
                    <Route path="/flights" element={<FlightSearchPage />} />
                    <Route path="/privacy" element={<LegalPage type="privacy" />} />
                    <Route path="/terms" element={<LegalPage type="terms" />} />
                    <Route path="/sitemap" element={<SitemapPage />} />

                    {/* Real Data Platform Routes */}
                    <Route path="/places/:slug" element={<PlaceDetailPage />} />
                    <Route path="/destinations/:slug" element={<PlaceDetailPage />} />
                    <Route path="/suggest-place" element={<SuggestPlacePage />} />
                    <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                    <Route path="/account/saved" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute admin><AdminDashboardPage /></ProtectedRoute>} />

                    <Route path="/plan-trip" element={<ProtectedRoute><PlanTripPage /></ProtectedRoute>} />
                    <Route path="/my-trips" element={<ProtectedRoute><MyTripsPage /></ProtectedRoute>} />
                    <Route path="/trips" element={<TripsGalleryPage />} />
                    <Route path="/account" element={<ProtectedRoute><UserAccountPage /></ProtectedRoute>} />
                    <Route path="/guides" element={<GuidesListingPage />} />
                    <Route path="/offers" element={<SeasonalOffersPage />} />

                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route
                      path="/private-jets"
                      element={
                        <ServicePage
                          title="Private Aviation"
                          subtitle="Fly on Your Terms"
                          heroImage="/images/private_jet.png"
                          description="Bypass long lines and commercial terminals. Experience the ultimate freedom of private aviation with our fleet of long-range jets, tailored catering, and seamless ground transport."
                          features={[
                            { title: 'Global Reach', desc: 'Access to 5,000+ airports' },
                            { title: 'On-Demand', desc: 'Ready in as little as 4 hours' },
                            { title: 'Pet Friendly', desc: 'Bring your companions' },
                            { title: 'Privacy', desc: 'Discrete terminals & lounges' }
                          ]}
                        />
                      }
                    />
                    <Route
                      path="/villas"
                      element={
                        <ServicePage
                          title="Luxury Villas"
                          subtitle="Your Private Sanctuary"
                          heroImage="/images/villa_mansion.png"
                          description="From clifftop estates in Amalfi to beachfront mansions in Turks & Caicos. Our portfolio of private villas offers the space, privacy, and amenities of a five-star resort, exclusively for you."
                          features={[
                            { title: 'Private Staff', desc: 'Chefs, butlers, & housekeeping' },
                            { title: 'Exclusive Access', desc: 'Beaches & golf courses' },
                            { title: 'Concierge', desc: '24/7 Itinerary planning' },
                            { title: 'Design', desc: 'Award-winning architecture' }
                          ]}
                        />
                      }
                    />
                    <Route
                      path="/luxury-stays"
                      element={
                        <ServicePage
                          title="Luxury Villas & Stays"
                          subtitle="Exclusive Sanctuaries"
                          heroImage="/images/villa_mansion.png"
                          description="From clifftop estates in Amalfi to beachfront mansions in Turks & Caicos. Our portfolio of private villas offers the space, privacy, and amenities of a five-star resort, exclusively for you."
                          features={[
                            { title: 'Private Staff', desc: 'Chefs, butlers, & housekeeping' },
                            { title: 'Exclusive Access', desc: 'Beaches & golf courses' },
                            { title: 'Concierge', desc: '24/7 Itinerary planning' },
                            { title: 'Design', desc: 'Award-winning architecture' }
                          ]}
                        />
                      }
                    />
                    <Route
                      path="/yacht-charters"
                      element={
                        <ServicePage
                          title="Yacht Charters"
                          subtitle="The Open Ocean"
                          heroImage="/images/tropical_beach.png"
                          description="Navigate the Mediterranean, Caribbean, or remote archipelagos aboard world-class motor yachts and sailing vessels with seasoned crews."
                          features={[
                            { title: 'Full Crew', desc: 'Captain, chef & deckhands' },
                            { title: 'Water Toys', desc: 'Seabobs, foils & tenders' },
                            { title: 'Custom Routes', desc: 'Anchor in hidden coves' },
                            { title: 'Event Ready', desc: 'Corporate & celebration cruises' }
                          ]}
                        />
                      }
                    />
                    <Route
                      path="/experiences"
                      element={
                        <ServicePage
                          title="Curated Experiences"
                          subtitle="Memories for a Lifetime"
                          heroImage="/images/yacht.png"
                          description="Go beyond the guidebook. Whether it's a private after-hours tour of the Vatican, shark diving in South Africa, or truffle hunting in Piedmont, we unlock the world's most exclusive moments."
                          features={[
                            { title: 'Access', desc: 'Behind closed doors' },
                            { title: 'Guides', desc: 'Local experts & historians' },
                            { title: 'Adventure', desc: 'Custom expeditions' },
                            { title: 'Culture', desc: 'Immersive workshops' }
                          ]}
                        />
                      }
                    />
                    <Route
                      path="/curated-experiences"
                      element={
                        <ServicePage
                          title="Curated Experiences"
                          subtitle="Memories for a Lifetime"
                          heroImage="/images/yacht.png"
                          description="Go beyond the guidebook. Whether it's a private after-hours tour of the Vatican, shark diving in South Africa, or truffle hunting in Piedmont, we unlock the world's most exclusive moments."
                          features={[
                            { title: 'Access', desc: 'Behind closed doors' },
                            { title: 'Guides', desc: 'Local experts & historians' },
                            { title: 'Adventure', desc: 'Custom expeditions' },
                            { title: 'Culture', desc: 'Immersive workshops' }
                          ]}
                        />
                      }
                    />
                    <Route
                      path="/concierge"
                      element={
                        <ServicePage
                          title="Global Concierge"
                          subtitle="Your Wish, Granted"
                          heroImage="/images/hotel_lobby.png"
                          description="Our dedicated lifestyle managers are at your service 24/7. From last-minute restaurant reservations to sourcing rare gifts, we handle the details so you can enjoy the journey."
                          features={[
                            { title: '24/7 Support', desc: 'Always available' },
                            { title: 'Dining', desc: 'Priority reservations' },
                            { title: 'Events', desc: 'VIP tickets & access' },
                            { title: 'Logistics', desc: 'Seamless transfers' }
                          ]}
                        />
                      }
                    />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/auth/login" element={<LoginPage />} />
                    <Route path="/careers" element={<GenericPage title="Careers" subtitle="Join Our Team" image="/images/amalfi_scenic.png" />} />
                    <Route path="/press" element={<GenericPage title="Press" subtitle="News & Media" image="/images/swiss_alps.png" />} />
                    <Route path="/support" element={<GenericPage title="Support" subtitle="We're Here to Help" image="/images/amalfi_scenic.png" />} />

                    {/* Catch-all: custom 404 page */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>

              <Footer />
              <ScrollToTopButton />
            </div>
          </ToastProvider>
        </CurrencyProvider>
      </Router>
    </SmoothScroll>
  );
}

export default App;
