import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/LegalPage";
import { business } from "@/lib/business";

export const Route = createFileRoute("/privacy")({
  head: () =>
    legalHead("Privacy Policy", "How Amniverse Advisory collects and uses your personal data."),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains how <strong>{business.legalName}</strong> handles your personal data,
        in line with India&rsquo;s Digital Personal Data Protection Act, 2023.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Your name, email address and phone number, entered at checkout.</li>
        <li>Order details: order ID, payment ID, amount and payment status (from Razorpay).</li>
        <li>Messages you send us by email or WhatsApp.</li>
      </ul>
      <p>
        We do <strong>not</strong> collect or store card numbers, UPI PINs or bank credentials —
        these go directly to Razorpay. The journal itself lives in your own Google Drive; we cannot
        see your trades.
      </p>

      <h2>Why we use it</h2>
      <ul>
        <li>To process your payment and deliver your access link.</li>
        <li>To send order confirmations and support replies.</li>
        <li>To keep records required by tax and accounting law.</li>
      </ul>
      <p>We do not sell your data. We only send marketing emails if you opt in.</p>

      <h2>Who we share it with</h2>
      <ul>
        <li>Razorpay — payment processing.</li>
        <li>Supabase — secure database hosting for order records.</li>
        <li>Resend — sending transactional emails.</li>
        <li>Vercel — website hosting.</li>
        <li>Authorities, where required by law.</li>
      </ul>

      <h2>How long we keep it</h2>
      <p>Order records are kept for up to 8 years for tax and accounting purposes, then deleted.</p>

      <h2>Your rights</h2>
      <p>
        You can ask to access, correct or delete your personal data (subject to legal record-keeping
        requirements) by emailing <strong>{business.supportEmail}</strong>. We respond within 30
        days.
      </p>

      <h2>Contact / grievance officer</h2>
      <p>
        {business.legalName}
        <br />
        {business.address}
        <br />
        Email: {business.supportEmail}
      </p>
    </LegalPage>
  );
}
