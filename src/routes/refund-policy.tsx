import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/LegalPage";
import { business } from "@/lib/business";

export const Route = createFileRoute("/refund-policy")({
  head: () =>
    legalHead(
      "Refund & Cancellation Policy",
      "Refund and cancellation terms for the Amniverse Crypto Trading Journal.",
    ),
  component: Refund,
});

function Refund() {
  const days = business.refundWindowDays;
  return (
    <LegalPage title="Refund & Cancellation Policy">
      <p>
        The Amniverse Crypto Trading Journal is a digital product delivered instantly, so orders
        cannot be cancelled once payment is complete. We still want you to be happy with it:
      </p>

      <h2>When you can get a refund</h2>
      <ul>
        <li>
          <strong>Access not delivered:</strong> if you did not receive your access link within 24
          hours and we can&rsquo;t fix it, you get a full refund.
        </li>
        <li>
          <strong>Duplicate payment:</strong> if you were charged more than once for the same order,
          the extra payment is refunded in full.
        </li>
        <li>
          <strong>Product doesn&rsquo;t work as described:</strong> if a core feature is broken and
          we can&rsquo;t fix it within 3 working days of your report, you get a full refund.
        </li>
      </ul>
      <p>
        Refund requests must be made within <strong>{days} days</strong> of purchase.
      </p>

      <h2>When refunds are not given</h2>
      <ul>
        <li>Change of mind after the access link has been opened.</li>
        <li>Trading losses or tax outcomes — the Product is a calculation tool, not advice.</li>
        <li>Requests after {days} days from purchase.</li>
      </ul>

      <h2>How to request a refund</h2>
      <p>
        Email <strong>{business.supportEmail}</strong> with your payment ID (it&rsquo;s in your
        confirmation email) and the reason. We reply within 2 working days.
      </p>

      <h2>Refund timeline</h2>
      <p>
        Approved refunds are issued through Razorpay to your original payment method within 5–7
        working days. Your bank may take a few additional days to show the credit.
      </p>
    </LegalPage>
  );
}
