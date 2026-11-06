import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/LegalPage";
import { business } from "@/lib/business";

export const Route = createFileRoute("/shipping-policy")({
  head: () =>
    legalHead(
      "Shipping & Delivery Policy",
      "How the Amniverse Crypto Trading Journal is delivered.",
    ),
  component: Shipping,
});

function Shipping() {
  return (
    <LegalPage title="Shipping & Delivery Policy">
      <p>
        The Amniverse Crypto Trading Journal is a <strong>digital product</strong>. Nothing is
        shipped physically and there are no shipping charges.
      </p>

      <h2>How you receive it</h2>
      <ul>
        <li>
          Right after a successful payment, your access link is shown on the confirmation screen.
        </li>
        <li>
          The same link and setup instructions are emailed to the address you entered at checkout.
        </li>
        <li>Delivery is usually instant and always within 24 hours.</li>
      </ul>

      <h2>Didn&rsquo;t get it?</h2>
      <p>
        Check your spam/promotions folder first. If it&rsquo;s not there, email{" "}
        <strong>{business.supportEmail}</strong> with your payment ID and we&rsquo;ll resend it.
      </p>
    </LegalPage>
  );
}
