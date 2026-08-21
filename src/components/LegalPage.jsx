import { Link } from 'react-router-dom';

const PRIVACY_SECTIONS = [
  ['Information we collect', 'We collect account details you provide, such as your name, email address, profile preferences, saved places, trips, and booking requests. We also collect limited technical information required to keep the service secure and reliable.'],
  ['How we use information', 'We use your information to operate your account, save your travel plans, respond to requests, improve the platform, and protect Horizon Travels from misuse. We do not sell personal information.'],
  ['Travel providers and links', 'Hotel, flight, weather, mapping, and currency information may come from independent providers. When you continue to a provider, its privacy policy and terms apply to the information you give it.'],
  ['Cookies and sessions', 'We use essential cookies to maintain a signed-in session and protect the service. You can manage non-essential browser storage through your browser settings.'],
  ['Your choices', 'You can update your profile, remove saved items, or request account deletion from your account area. For privacy requests, contact us through the support page.'],
  ['Security and retention', 'We use reasonable safeguards to protect account information and retain it only as long as necessary for the purposes described here or where required by law. No online service can guarantee absolute security.']
];

const TERMS_SECTIONS = [
  ['Using Horizon Travels', 'Use the platform lawfully and provide accurate account information. You are responsible for keeping your account credentials confidential and for activity performed through your account.'],
  ['Travel information', 'Provider information, availability, pricing, taxes, and policies can change. We show provider data when it is available, but it is not a guarantee of availability or a confirmed reservation.'],
  ['Booking requests and provider redirects', 'A booking request or a click to a third-party provider is not a confirmed booking. A booking is confirmed only when the relevant provider gives you a confirmation and reference.'],
  ['User content', 'You retain ownership of content you submit, such as reviews and place suggestions. By submitting it, you allow Horizon Travels to display and moderate it to operate the service. Do not submit unlawful, misleading, or infringing content.'],
  ['Third-party services', 'External sites and services are controlled by their respective operators. Horizon Travels is not responsible for their content, availability, or transactions.'],
  ['Changes and contact', 'We may update these terms as the platform develops. Continued use after an update means you accept the revised terms. Contact us through Support if you have a question.']
];

export default function LegalPage({ type }) {
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Use';
  const intro = isPrivacy
    ? 'How Horizon Travels handles personal information while you explore, save, and plan trips.'
    : 'The rules for using Horizon Travels and understanding travel-provider information.';
  const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;

  return (
    <main className="min-h-screen bg-[#0c0c0c] px-4 pb-24 pt-32 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-brand-gold">Horizon Travels</p>
        <h1 className="font-serif text-4xl text-white sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">{intro}</p>
        <p className="mt-5 font-mono text-xs uppercase tracking-wider text-white/40">Last updated: August 21, 2026</p>

        <div className="mt-12 space-y-5">
          {sections.map(([heading, content]) => (
            <section key={heading} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <h2 className="font-serif text-2xl text-white">{heading}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">{content}</p>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-white/55">
          Need help? <Link className="text-brand-gold hover:text-white" to="/support">Visit Support</Link> or <Link className="text-brand-gold hover:text-white" to="/contact">contact us</Link>.
        </p>
      </div>
    </main>
  );
}
