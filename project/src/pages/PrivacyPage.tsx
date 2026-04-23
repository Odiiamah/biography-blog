import SEOHead from '../components/SEOHead';
import AdSlot from '../components/AdSlot';

export default function PrivacyPage() {
  return (
    <>
      <SEOHead
        title="Privacy Policy — BiographyHub"
        description="Read BiographyHub's Privacy Policy. We are committed to protecting your privacy and being transparent about how we collect and use data."
      />

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 pt-28 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <AdSlot type="leaderboard" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="prose prose-slate prose-base max-w-none space-y-8">
          {[
            {
              title: '1. Introduction',
              text: 'BiographyHub ("we," "our," or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our website located at biographyhub.com. By using our website, you agree to the terms of this Privacy Policy.',
            },
            {
              title: '2. Information We Collect',
              text: 'We collect information you voluntarily provide when using our contact form, including your name, email address, and message content. We also automatically collect certain technical information when you visit our site, such as your IP address, browser type, operating system, referring URLs, and pages visited. This information is collected through server logs and third-party analytics services.',
            },
            {
              title: '3. How We Use Your Information',
              text: 'We use the information we collect to respond to your contact form submissions, improve our website content and user experience, analyze website traffic and usage patterns, and comply with legal obligations. We do not sell, trade, or otherwise transfer your personally identifiable information to third parties without your consent, except as described in this policy.',
            },
            {
              title: '4. Google AdSense and Advertising',
              text: 'We use Google AdSense to display advertisements on our website. Google AdSense uses cookies to serve ads based on your prior visits to our website and other sites on the internet. Google\'s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the internet. You may opt out of personalized advertising by visiting Google\'s Ads Settings at www.google.com/settings/ads. For more information about how Google uses data when you use our site, please visit www.google.com/policies/privacy/partners.',
            },
            {
              title: '5. Cookies',
              text: 'Our website uses cookies — small text files placed on your device — to enhance your experience. Essential cookies are required for the website to function properly. Analytics cookies help us understand how visitors interact with our website. Advertising cookies are used by Google AdSense to serve relevant advertisements. You can control cookie preferences through your browser settings. Note that disabling certain cookies may affect website functionality.',
            },
            {
              title: '6. Third-Party Services',
              text: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to read the privacy policies of any third-party site you visit. We use Supabase for data storage and management, which is governed by Supabase\'s own privacy policy.',
            },
            {
              title: '7. Data Retention',
              text: 'We retain contact form submissions for up to 12 months, after which they are deleted unless we have an ongoing legitimate reason to retain them. Analytics data is retained according to our analytics provider\'s default retention settings.',
            },
            {
              title: '8. Your Rights',
              text: 'Depending on your location, you may have the right to access the personal information we hold about you, request correction of inaccurate data, request deletion of your personal data, object to our processing of your data, and request restriction of processing. To exercise any of these rights, please contact us using our Contact page.',
            },
            {
              title: '9. Children\'s Privacy',
              text: 'Our website is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected information from a child, please contact us immediately.',
            },
            {
              title: '10. Changes to This Policy',
              text: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page with an updated revision date. We encourage you to review this Privacy Policy periodically.',
            },
            {
              title: '11. Contact Us',
              text: 'If you have any questions about this Privacy Policy or our privacy practices, please contact us through our Contact page.',
            },
          ].map((section) => (
            <section key={section.title} className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3">{section.title}</h2>
              <p className="text-slate-700 text-sm leading-[1.8]">{section.text}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
