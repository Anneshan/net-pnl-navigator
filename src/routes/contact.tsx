import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/LegalPage";
import { business, whatsappLink } from "@/lib/business";

export const Route = createFileRoute("/contact")({
  head: () =>
    legalHead(
      "Contact Us",
      "Get in touch with Amniverse Advisory for support and order questions.",
    ),
  component: Contact,
});

function Contact() {
  return (
    <LegalPage title="Contact Us">
      <p>We usually reply within one working day (Mon–Sat, 10am–7pm IST).</p>

      <div className="panel mt-6 space-y-3 p-6 text-foreground">
        <p>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Business
          </span>
          <br />
          {business.legalName}
        </p>
        <p>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Email
          </span>
          <br />
          <a href={`mailto:${business.supportEmail}`} className="underline">
            {business.supportEmail}
          </a>
        </p>
        <p>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            WhatsApp
          </span>
          <br />
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="underline">
            +{business.whatsappNumber}
          </a>
        </p>
        <p>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Address
          </span>
          <br />
          {business.address}
        </p>
      </div>

      <p className="mt-6">
        For order issues, include your payment ID (from your confirmation email) so we can help
        faster.
      </p>
    </LegalPage>
  );
}
