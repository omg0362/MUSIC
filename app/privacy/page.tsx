import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | MUSIC",
  description: "Privacy policy for MUSIC.",
};

const sections = [
  {
    title: "Information we collect",
    body: [
      "Account information such as your email address, name, and profile image when you sign in with Google.",
      "Prompt and generation data, including music prompts, optional lyrics, selected generation settings, generated audio metadata, and saved track records.",
      "Billing and credit information related to checkout sessions, payment status, purchased credit packs, and credit balance changes.",
      "Technical information such as browser, device, IP address, authentication session data, logs, and error diagnostics needed to keep the service secure and reliable.",
    ],
  },
  {
    title: "How we use information",
    body: [
      "To authenticate users and provide access to the music workspace.",
      "To generate, store, list, play, rename, download, and delete music files requested by you.",
      "To process credit purchases, maintain credit balances, prevent duplicate credit grants, and handle refunds or failed generations.",
      "To monitor abuse, troubleshoot errors, improve reliability, and protect the service from unauthorized access.",
    ],
  },
  {
    title: "Service providers",
    body: [
      "We use Supabase for authentication, database, and file storage.",
      "We use Replicate or similar model infrastructure to process music generation requests.",
      "We use Polar for checkout, billing events, and credit purchase fulfillment.",
      "These providers process information only as needed to operate the service, support payments, or deliver generated content.",
    ],
  },
  {
    title: "Generated content",
    body: [
      "Your prompts, optional lyrics, and generated audio may be processed by model providers to create the requested output.",
      "You are responsible for the prompts and lyrics you submit and for how you use generated audio.",
      "We store generated files and related metadata so you can access them from your workspace.",
    ],
  },
  {
    title: "Data retention and deletion",
    body: [
      "We keep account, payment, credit, and generated music records for as long as needed to provide the service, comply with legal obligations, resolve disputes, and maintain audit history.",
      "You can delete generated tracks from the workspace. Deleting a track removes the stored file and associated music record from active workspace access.",
      "Some billing records may be retained where required for accounting, fraud prevention, tax, or compliance purposes.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You may stop using the service at any time.",
      "You may request access, correction, export, or deletion of personal information by contacting us.",
      "Some requests may be limited where retention is required for security, billing, tax, or legal reasons.",
    ],
  },
  {
    title: "Security",
    body: [
      "We use authentication, access controls, server-side credit checks, signed storage URLs, and webhook verification to protect accounts and billing flows.",
      "No internet service is perfectly secure, but we work to keep personal information protected against unauthorized access, alteration, and misuse.",
    ],
  },
];

export default function PrivacyPage() {
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
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="/workspace" className="transition hover:text-white">
              Workspace
            </Link>
          </nav>
        </header>

        <section className="mb-12">
          <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-white/34">
            PRIVACY POLICY
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            How MUSIC handles your information.
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/52">
            This policy explains what we collect, why we collect it, and how we
            use it to provide AI music generation, account access, billing, and
            credit management. Last updated: May 21, 2026.
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
          Contact us if you have privacy questions or requests related to your
          account, generated music, or billing records.
        </footer>
      </div>
    </main>
  );
}
