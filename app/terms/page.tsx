import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | MUSIC",
  description: "Terms of service for MUSIC.",
};

const sections = [
  {
    title: "Using MUSIC",
    body: [
      "MUSIC lets users sign in, purchase credits, submit prompts and optional lyrics, generate audio, and manage generated tracks in a personal workspace.",
      "You must provide accurate account information and keep your account credentials secure.",
      "You are responsible for all activity that occurs through your account.",
    ],
  },
  {
    title: "Credits and billing",
    body: [
      "Music generation uses credits. The base generation cost is 1 credit, with additional credits charged for longer duration and multiple returned tracks.",
      "Credits are deducted when generation starts. If generation fails, the deducted credits are returned where the failure is detected by the service.",
      "Credit purchases are processed through Polar. Billing, tax, payment, and refund handling may be subject to Polar's checkout and merchant-of-record processes.",
      "Credits have no cash value and are intended only for use within MUSIC unless we state otherwise in writing.",
    ],
  },
  {
    title: "Generated content",
    body: [
      "You are responsible for the prompts, lyrics, and other content you submit.",
      "Do not submit content that infringes rights, violates laws, impersonates others, or contains harmful, abusive, or unauthorized material.",
      "You are responsible for reviewing generated output before publishing, distributing, or monetizing it.",
      "Generated content may be affected by model limitations and may not be unique, error-free, or suitable for every use.",
    ],
  },
  {
    title: "Storage and workspace actions",
    body: [
      "Generated tracks may be stored so they can be played, renamed, downloaded, or deleted from your workspace.",
      "Deleting a track removes it from active workspace access, but some logs or records may remain where required for security, billing, compliance, or backup integrity.",
      "We may limit or remove access to content if needed to protect the service, comply with law, or address abuse.",
    ],
  },
  {
    title: "Acceptable use",
    body: [
      "Do not abuse the service, attempt to bypass credit checks, interfere with billing flows, exploit security issues, scrape private data, or overload infrastructure.",
      "Do not use MUSIC to create or distribute unlawful, infringing, deceptive, hateful, or harmful content.",
      "We may suspend or restrict accounts that violate these terms or create risk for the service or other users.",
    ],
  },
  {
    title: "Service availability",
    body: [
      "MUSIC depends on third-party services for authentication, storage, billing, and model generation.",
      "The service may be interrupted, delayed, or unavailable because of maintenance, model provider issues, payment provider issues, or operational incidents.",
      "We may update, modify, or discontinue features as the product evolves.",
    ],
  },
  {
    title: "Disclaimers and liability",
    body: [
      "MUSIC is provided as is and as available. We do not guarantee uninterrupted service, specific generation results, or fitness for a particular purpose.",
      "To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages.",
      "Our total liability for claims related to the service is limited to the amount you paid for the service in the three months before the claim.",
    ],
  },
  {
    title: "Changes to these terms",
    body: [
      "We may update these terms as the service changes.",
      "If changes are material, we will take reasonable steps to notify users through the product or other appropriate channels.",
      "Continuing to use MUSIC after changes take effect means you accept the updated terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#181818] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-14 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link
            href="/"
            className="text-xs font-semibold tracking-[0.28em] text-white/72 transition hover:text-white"
          >
            MUSIC
          </Link>
          <nav className="flex items-center gap-4 text-xs font-medium text-white/46">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/workspace" className="transition hover:text-white">
              Workspace
            </Link>
          </nav>
        </header>

        <section className="mb-12">
          <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-white/34">
            TERMS OF SERVICE
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            The rules for using MUSIC.
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/52">
            These terms govern your access to MUSIC, including account access,
            AI music generation, credits, payments, generated files, and
            workspace features. Last updated: May 21, 2026.
          </p>
        </section>

        <div className="space-y-5">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[8px] border border-white/12 bg-white/[0.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6"
            >
              <h2 className="text-base font-semibold text-white">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/58">
                {section.body.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/34" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-white/10 pt-6 text-xs leading-6 text-white/40">
          If you do not agree to these terms, do not use MUSIC.
        </footer>
      </div>
    </main>
  );
}
