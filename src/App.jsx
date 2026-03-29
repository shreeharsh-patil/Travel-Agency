import { ReactLenis } from '@studio-freight/react-lenis'
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HeroCanvas from './components/HeroCanvas';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';
import GenericPage from './components/GenericPage';
import TravelPage from './components/TravelPage';
import ServicePage from './components/ServicePage';
import HomePage from './components/HomePage';
import GalleryPage from './components/GalleryPage'; // Added GalleryPage import
import ContactPage from './components/ContactPage'; // Added ContactPage import
import JournalPage from './components/JournalPage'; // Added JournalPage import

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const lenisOptions = {
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  };

  return (
    <ReactLenis root options={lenisOptions}>
      <Router>
        <div className="bg-[#0c0c0c] min-h-screen text-white selection:bg-white selection:text-black font-sans">
          <Header />
          <ScrollToTop />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/journal" element={<JournalPage />} /> {/* Added JournalPage route */}
            <Route path="/about" element={<GenericPage title="About Us" subtitle="Our Story" image="/images/swiss_alps.png" />} />
            <Route path="/dates" element={<GenericPage title="Availability" subtitle="Plan Your Stay" image="/images/tropical_beach.png" />} />
            <Route path="/travel" element={<TravelPage />} />
            <Route path="/gallery" element={<GalleryPage />} /> {/* Changed to GalleryPage */}
            <Route path="/private-jets" element={
              <ServicePage
                title="Private Aviation"
                subtitle="Fly on Your Terms"
                heroImage="/images/private_jet.png"
                description="Bypass long lines and commercial terminals. Experience the ultimate freedom of private aviation with our fleet of long-range jets, tailored catering, and seamless ground transport."
                features={[
                  { title: "Global Reach", desc: "Access to 5,000+ airports" },
                  { title: "On-Demand", desc: "Ready in as little as 4 hours" },
                  { title: "Pet Friendly", desc: "Bring your companions" },
                  { title: "Privacy", desc: "Discrete terminals & lounges" }
                ]}
              />
            } />
            <Route path="/villas" element={
              <ServicePage
                title="Luxury Villas"
                subtitle="Your Private Sanctuary"
                heroImage="/images/villa_mansion.png"
                description="From clifftop estates in Amalfi to beachfront mansions in Turks & Caicos. Our portfolio of private villas offers the space, privacy, and amenities of a five-star resort, exclusively for you."
                features={[
                  { title: "Private Staff", desc: "Chefs, butlers, & housekeeping" },
                  { title: "Exclusive Access", desc: "Beaches & golf courses" },
                  { title: "Concierge", desc: "24/7 Itinerary planning" },
                  { title: "Design", desc: "Award-winning architecture" }
                ]}
              />
            } />
            <Route path="/experiences" element={
              <ServicePage
                title="Curated Experiences"
                subtitle="Memories for a Lifetime"
                heroImage="/images/yacht.png"
                description="Go beyond the guidebook. Whether it's a private after-hours tour of the Vatican, shark diving in South Africa, or truffle hunting in Piedmont, we unlock the world's most exclusive moments."
                features={[
                  { title: "Access", desc: "Behind closed doors" },
                  { title: "Guides", desc: "Local experts & historians" },
                  { title: "Adventure", desc: "Custom expeditions" },
                  { title: "Culture", desc: "Immersive workshops" }
                ]}
              />
            } />
            <Route path="/concierge" element={
              <ServicePage
                title="Global Concierge"
                subtitle="Your Wish, Granted"
                heroImage="/images/hotel_lobby.png"
                description="Our dedicated lifestyle managers are at your service 24/7. From last-minute restaurant reservations to sourcing rare gifts, we handle the details so you can enjoy the journey."
                features={[
                  { title: "24/7 Support", desc: "Always available" },
                  { title: "Dining", desc: "Priority reservations" },
                  { title: "Events", desc: "VIP tickets & access" },
                  { title: "Logistics", desc: "Seamless transfers" }
                ]}
              />
            } />
            <Route path="/contact" element={<ContactPage />} /> {/* Changed to ContactPage */}
            <Route path="/support" element={<GenericPage title="Support" subtitle="We're Here to Help" image="/images/amalfi_scenic.png" />} />
          </Routes>

          <Footer />
        </div>
      </Router>
    </ReactLenis>
  )
}

export default App
