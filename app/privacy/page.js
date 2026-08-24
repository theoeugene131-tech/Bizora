import { BRAND } from "@/lib/brand";

export const metadata = { title: `Privacy Policy — ${BRAND.name}` };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 text-sm text-gray-700 leading-relaxed">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-gray-500 mt-1">Effective: 17 August 2026</p>
      </div>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">1. Who we are</h2>
        <p>
          {BRAND.name} ("we", "us") operates an online business directory and advertising platform.
          This policy explains how we collect, use, store and protect personal data, in line with
          the Nigeria Data Protection Act (NDPA) 2023 and, where applicable, other data-protection
          laws such as the GDPR.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">2. Data we collect</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Listing data:</strong> business name, address, phone, email, website, description, photos and map coordinates that you submit or that owners add to their listings.</li>
          <li><strong>Account data:</strong> your email address and password (stored securely by our authentication provider) when you create an owner account.</li>
          <li><strong>Payment data:</strong> payments for featured listings and adverts are processed by <strong>Paystack</strong>. We never see or store your card number — we keep only the transaction reference, amount, plan and email.</li>
          <li><strong>Usage data:</strong> Google Analytics collects standard usage statistics (pages visited, device type, approximate location, referral source) using cookies — only after you accept cookies.</li>
          <li><strong>Correspondence:</strong> records of emails you send us (e.g. support and complaints).</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">3. How we use your data</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>to publish and manage directory listings;</li>
          <li>to review submissions and operate owner and admin accounts;</li>
          <li>to process payments for platform services and issue receipts;</li>
          <li>to send service emails (submission received, approval, featured activation);</li>
          <li>to understand traffic and improve the platform;</li>
          <li>to comply with legal obligations.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">4. What is public</h2>
        <p>
          The directory is public by design. Business names, addresses, phone numbers, products,
          photos and descriptions are visible to all visitors and are indexed by search engines.
          Please do not submit personal information you do not wish to make public (for example,
          your home address if you run your business from home).
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">5. Legal bases</h2>
        <p>
          We process data on the bases of: your <strong>consent</strong> (submitting a listing,
          creating an account, accepting cookies), <strong>contract</strong> (providing listing and
          advertising services you purchase), <strong>legitimate interests</strong> (security and
          improvement of the platform), and <strong>legal obligation</strong> (keeping payment
          records for tax purposes).
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">6. Sharing and processors</h2>
        <p>
          We do <strong>not</strong> sell personal data. We share it only with the service
          providers that run the platform: <strong>Supabase</strong> (database & file storage),{" "}
          <strong>Paystack</strong> (payments), <strong>Resend</strong> (email delivery),{" "}
          <strong>Google</strong> (analytics and maps) and <strong>Vercel</strong> (hosting). Each
          provider processes data only to deliver its service and is bound by its own privacy
          policy. We may also disclose data where required by law or to protect our legal rights.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">7. Cookies</h2>
        <p>
          We use essential cookies (keeping you logged in) and, only with your consent, Google
          Analytics cookies. You can change your choice anytime via "Cookie preferences" in the
          footer, or block cookies in your browser settings.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">8. Data retention</h2>
        <p>
          Listings are kept while active and for a reasonable period afterwards. Account data is
          kept until you delete your account or request removal. Payment records are kept as long
          as the law requires (tax and accounting). Support emails are kept only as long as needed.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">9. Your rights</h2>
        <p>
          You have the right to access, correct, delete, restrict or object to the processing of
          your data, to data portability, and to withdraw consent at any time. To exercise any
          right, email {BRAND.supportEmail} — we respond within 30 days. You also have the right to
          lodge a complaint with the Nigeria Data Protection Commission (NDPC) or your local
          regulator.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">10. Children</h2>
        <p>
          The platform is not directed at persons under 18, and we do not knowingly collect their
          data.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">11. Security</h2>
        <p>
          We use HTTPS encryption, database row-level security, and PCI-DSS-compliant payment
          processing (Paystack) so that card details never touch our servers. No system is 100%
          secure; report any vulnerability to {BRAND.supportEmail}.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">12. International transfers</h2>
        <p>
          Some of our processors store data outside your country (for example in Europe). We use
          providers that commit to appropriate safeguards for such transfers.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">13. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The date at the top will change accordingly,
          and continued use of the platform means you accept the updated policy.
        </p>
      </section>

      <p className="text-gray-500">
        Questions or requests: {BRAND.supportEmail} · Owned by {BRAND.owner} · WhatsApp {BRAND.whatsapp} · Nigeria bank {BRAND.bank.name} {BRAND.bank.account}
      </p>
    </div>
  );
}
