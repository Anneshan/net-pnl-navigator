// Business details shown on the policy and contact pages.
// Razorpay checks these pages when approving your website — fill in every TODO
// with your real details before submitting the site to Razorpay.
export const business = {
  brand: "Amniverse Advisory",
  // Legal name exactly as registered with Razorpay (proprietor name or company name).
  legalName: "Amniverse Advisory",
  supportEmail: "amniverseadvisory@gmail.com",
  whatsappNumber: "918134959078", // digits only, with country code
  address: "TODO: Full registered address, City, State, PIN, India",
  jurisdictionCity: "TODO: Your city", // courts for disputes
  refundWindowDays: 7,
  policiesUpdated: "6 November 2026",
} as const;

export const whatsappLink = (
  text = "Hi Amniverse Advisory, I have a question about the Crypto Trading Journal.",
) => `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(text)}`;
