"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui";

interface TermsAndConditionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsAndConditions({
  open,
  onOpenChange,
}: TermsAndConditionsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please read these terms carefully before using our service.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-sm text-foreground/90">
          <section>
            <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
            <p>
              By accessing and using this service, you accept and agree to be bound by the
              terms and provision of this agreement. If you do not agree to abide by the
              above, please do not use this service.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2">2. Fair Use and Legal Compliance</h3>
            <p>
              You agree to use this service in a fair, legal, and ethical manner. You must
              comply with all applicable laws, regulations, and ethical standards in your
              jurisdiction and the jurisdiction in which this service operates. This includes,
              but is not limited to, laws regarding intellectual property, privacy, data
              protection, harassment, discrimination, and content regulation.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2">3. Community Standards</h3>
            <p>
              You agree to maintain respectful and constructive interactions with other users
              and the community at large. You will not engage in any activity that is harmful,
              abusive, threatening, defamatory, or otherwise objectionable. You will not post
              content that is illegal, infringes on the rights of others, or violates community
              guidelines.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2">4. Prohibited Activities</h3>
            <p>
              The following activities are strictly prohibited and may result in immediate
              account suspension or termination:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
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
            <h3 className="font-semibold text-base mb-2">5. Right to Take Action</h3>
            <p>
              We reserve the complete and absolute right to take any action we deem necessary
              to protect the integrity of our service, our users, and the community. This
              includes, but is not limited to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Removing or modifying content that violates these terms</li>
              <li>Temporarily or permanently suspending user accounts</li>
              <li>Banning users who engage in prohibited activities</li>
              <li>Reporting illegal activities to appropriate authorities</li>
              <li>Taking legal action when necessary</li>
            </ul>
            <p className="mt-2">
              We are not obligated to provide warnings before taking action, and our decisions
              regarding violations are final.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2">6. User Responsibilities</h3>
            <p>
              You are solely responsible for your conduct and any content you post, submit, or
              transmit through the service. You agree to indemnify and hold us harmless from
              any claims, damages, losses, liabilities, and expenses arising from your use of
              the service or violation of these terms.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2">7. Service Modifications</h3>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of the service
              at any time, with or without notice. We may also update these terms from time to
              time, and your continued use of the service constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2">8. Limitation of Liability</h3>
            <p>
              To the fullest extent permitted by law, we shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits
              or revenues, whether incurred directly or indirectly, or any loss of data, use,
              goodwill, or other intangible losses resulting from your use of the service.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2">9. Contact</h3>
            <p>
              If you have any questions about these Terms and Conditions, please contact us
              through the appropriate channels provided on our platform.
            </p>
          </section>

          <section className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

