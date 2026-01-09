"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/signin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sign In
      </Link>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-muted-foreground">
            Please read these terms carefully before using our service.
          </p>
        </div>

        <div className="space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-base leading-relaxed">
              By accessing and using this service, you accept and agree to be bound by the
              terms and provision of this agreement. If you do not agree to abide by the
              above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Fair Use and Legal Compliance</h2>
            <p className="text-base leading-relaxed">
              You agree to use this service in a fair, legal, and ethical manner. You must
              comply with all applicable laws, regulations, and ethical standards in your
              jurisdiction and the jurisdiction in which this service operates. This includes,
              but is not limited to, laws regarding intellectual property, privacy, data
              protection, harassment, discrimination, and content regulation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Community Standards</h2>
            <p className="text-base leading-relaxed">
              You agree to maintain respectful and constructive interactions with other users
              and the community at large. You will not engage in any activity that is harmful,
              abusive, threatening, defamatory, or otherwise objectionable. You will not post
              content that is illegal, infringes on the rights of others, or violates community
              guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Prohibited Activities</h2>
            <p className="text-base leading-relaxed mb-3">
              The following activities are strictly prohibited and may result in immediate
              account suspension or termination:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base">
              <li>Any illegal activity or content</li>
              <li>Harassment, bullying, or intimidation of other users</li>
              <li>Spam, fraud, or deceptive practices</li>
              <li>Violation of intellectual property rights</li>
              <li>Distribution of malware, viruses, or harmful code</li>
              <li>Attempting to gain unauthorized access to systems or data</li>
              <li>Any activity that disrupts or harms the service or its users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Right to Take Action</h2>
            <p className="text-base leading-relaxed mb-3">
              We reserve the complete and absolute right to take any action we deem necessary
              to protect the integrity of our service, our users, and the community. This
              includes, but is not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base">
              <li>Removing or modifying content that violates these terms</li>
              <li>Temporarily or permanently suspending user accounts</li>
              <li>Banning users who engage in prohibited activities</li>
              <li>Reporting illegal activities to appropriate authorities</li>
              <li>Taking legal action when necessary</li>
            </ul>
            <p className="text-base leading-relaxed mt-3">
              We are not obligated to provide warnings before taking action, and our decisions
              regarding violations are final.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. User Responsibilities</h2>
            <p className="text-base leading-relaxed">
              You are solely responsible for your conduct and any content you post, submit, or
              transmit through the service. You agree to indemnify and hold us harmless from
              any claims, damages, losses, liabilities, and expenses arising from your use of
              the service or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Service Modifications</h2>
            <p className="text-base leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any aspect of the service
              at any time, with or without notice. We may also update these terms from time to
              time, and your continued use of the service constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="text-base leading-relaxed">
              To the fullest extent permitted by law, we shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits
              or revenues, whether incurred directly or indirectly, or any loss of data, use,
              goodwill, or other intangible losses resulting from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
            <p className="text-base leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us
              through the appropriate channels provided on our platform.
            </p>
          </section>

          <section className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

