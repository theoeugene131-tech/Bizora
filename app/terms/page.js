import { BRAND } from "@/lib/brand";

export const metadata = { title: `Terms & Disclaimer — ${BRAND.name}` };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 text-sm text-gray-700 leading-relaxed">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Terms of Use & Legal Disclaimer</h1>
        <p className="text-gray-500 mt-1">Last updated: 17 August 2026</p>
      </div>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">1. {BRAND.name} is a directory only</h2>
        <p>
          {BRAND.name} is an online business-listing and advertising platform. We display information,
          products and adverts supplied by independent businesses ("Listed Businesses"). We are{" "}
          <strong>not a party to any transaction</strong> between users and Listed Businesses, and we
          do not sell, supply, store or deliver any product or service shown on this platform.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">
          2. Sellers are fully responsible for their products and adverts
        </h2>
        <p>Each Listed Business ("the Seller") is <strong>solely and fully responsible</strong> for:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>the quality, safety, fitness and accurate description of every product and service it advertises or displays on {BRAND.name};</li>
          <li>all legal requirements for its business and products, including corporate registration (CAC) and any regulatory approvals such as NAFDAC, SON or other applicable licences and certifications;</li>
          <li>ensuring its adverts are truthful, not misleading, and compliant with Nigerian advertising law and the Advertising Regulatory Council of Nigeria (ARCON) guidelines;</li>
          <li>honouring the prices, warranties, refunds and delivery promises shown on the platform;</li>
          <li><strong>ensuring receipt of payment</strong> for its products and services, including agreeing payment methods, confirming funds have cleared before delivery, issuing receipts, and resolving payment disputes with customers;</li>
          <li>all taxes, consumer-protection obligations under the Federal Competition and Consumer Protection Act, and any disputes arising from its transactions.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">3. No endorsement or warranty by {BRAND.name}</h2>
        <p>
          Listing, featuring or verifying a business does not constitute an endorsement of that
          business or its products. Any "Verified" badge confirms only that a business registration
          was sighted by us — it does <strong>not</strong> certify product quality, safety or
          legality. All listings and adverts are provided "as is", without warranty of any kind.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">4. Users transact at their own risk</h2>
        <p>
          Users should perform their own due diligence (inspect goods, confirm prices, request
          receipts) before transacting with any Listed Business. To the maximum extent permitted by
          law, {BRAND.name} shall not be liable for any loss, damage, injury, or dispute arising from
          transactions between users and Listed Businesses.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">
          5. Customer payments are the Seller's responsibility
        </h2>
        <p>
          Payments for products and services are made directly between the customer and the Seller.
          {" "}{BRAND.name} does not collect, hold or transfer customer payments on the Seller's behalf and
          has no obligation to ensure a Seller gets paid. Each Seller is{" "}
          <strong>solely responsible for ensuring receipt of payment</strong> — including agreeing
          payment methods, confirming that funds have cleared before delivery, issuing receipts,
          and bearing all risk of non-payment, fraud or chargebacks in its own transactions.
          Payments made on this platform (e.g. via Paystack) relate only to {BRAND.name} advertising
          services such as featured listings and adverts.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">6. Complaints and takedowns</h2>
        <p>
          We take complaints seriously. Report misleading adverts, counterfeit, prohibited or
          illegal products to {BRAND.supportEmail}. We may suspend or remove any listing, product or
          advert, at our sole discretion and without notice, where we believe applicable law or
          these terms have been breached.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">7. Platform fees</h2>
        <p>
          Fees paid for featured listings and adverts purchase advertising space only. They are
          non-refundable once the advertising service has commenced, and they do not create any
          partnership, agency or endorsement relationship between {BRAND.name} and the Seller.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">8. Governing law</h2>
        <p>
          These terms are governed by the laws of the Federal Republic of Nigeria. By submitting a
          listing, purchasing a listing upgrade, or using this platform, you agree to these terms.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">9. Ownership & contact</h2>
        <p>
          {BRAND.name} is owned and managed by <strong>{BRAND.owner}</strong>. To contact us send WhatsApp to{" "}
          <a href={BRAND.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">
            {BRAND.whatsapp}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-gray-900 mb-2">10. Nigeria payments</h2>
        <p>
          All payments from Nigeria should go to <strong>{BRAND.bank.name} Ac {BRAND.bank.account} ({BRAND.bank.holder})</strong>. Platform fees via Paystack
          are for advertising services only.
        </p>
      </section>

      <p className="text-gray-500">Questions: {BRAND.supportEmail} · WhatsApp {BRAND.whatsapp}</p>
    </div>
  );
}
