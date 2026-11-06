import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/LegalPage";
import { business } from "@/lib/business";

export const Route = createFileRoute("/terms")({
  head: () =>
    legalHead(
      "Terms & Conditions",
      "Terms of sale and use for the Amniverse Crypto Trading Journal.",
    ),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage title="Terms & Conditions">
      <p>
        These terms govern your purchase and use of the Amniverse Crypto Trading Journal (the
        &ldquo;Product&rdquo;), sold by <strong>{business.legalName}</strong> (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;). By buying or using the Product you agree to these terms.
      </p>

      <h2>1. The Product</h2>
      <p>
        The Product is a digital Google Sheets template with trade-journal, position-sizing,
        analytics and tax-estimation tools, plus setup instructions. It is delivered online; nothing
        is shipped physically.
      </p>

      <h2>2. Price and payment</h2>
      <p>
        The price is shown on the website at the time of purchase (currently ₹999, one-time).
        Payments are processed securely by Razorpay. We never see or store your card, UPI or bank
        details.
      </p>

      <h2>3. Licence</h2>
      <ul>
        <li>
          You get a personal, non-transferable, lifetime licence to use your copy of the Product.
        </li>
        <li>You may not resell, share, publish or redistribute the Product or its access link.</li>
        <li>We may revoke access if the Product is shared or resold in breach of these terms.</li>
      </ul>

      <h2>4. Not financial, investment or tax advice</h2>
      <p>
        {business.brand} is a software and education publisher, <strong>not</strong> a
        SEBI-registered investment adviser, research analyst, or a chartered accountant. The Product
        is a calculation tool for educational purposes. Its outputs (including Net PnL, position
        sizes and Section 115BBH / 194S tax estimates) depend on the data you enter and may contain
        errors. Always verify tax figures with a qualified CA before filing. Crypto and derivatives
        trading carry extreme risk and you can lose all your capital. You are solely responsible for
        your trading and tax decisions.
      </p>

      <h2>5. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, our total liability for any claim relating to the
        Product is limited to the amount you paid for it. We are not liable for trading losses, tax
        penalties or any indirect or consequential loss.
      </p>

      <h2>6. Refunds</h2>
      <p>
        Refunds are handled under our{" "}
        <Link to="/refund-policy" className="underline">
          Refund &amp; Cancellation Policy
        </Link>
        .
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update the Product or these terms. The version published on this page at the time of
        your purchase applies to that purchase.
      </p>

      <h2>8. Governing law</h2>
      <p>
        These terms are governed by the laws of India. Courts at {business.jurisdictionCity} have
        exclusive jurisdiction.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions? Email <strong>{business.supportEmail}</strong> or see our{" "}
        <Link to="/contact" className="underline">
          Contact page
        </Link>
        .
      </p>
    </LegalPage>
  );
}
