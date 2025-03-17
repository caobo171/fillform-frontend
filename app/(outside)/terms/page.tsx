// pages/terms.js

import { TopNav } from "../_components/TopNav";

export default function TermsOfUse() {
    return (
        <>
            <TopNav />
            <div className="max-w-4xl mx-auto px-4 py-8 mt-32">
                <h1 className="text-3xl font-bold mb-4">Terms of Use</h1>
                <p className="mb-4">
                    Welcome to wele-learn.com. By accessing or using our website, you agree
                    to comply with and be bound by the following terms and conditions of
                    use. Please read these terms carefully before using our site.
                </p>

                <h2 className="text-2xl font-semibold mb-2">Acceptance of Terms</h2>
                <p className="mb-4">
                    By using this website, you signify your acceptance of these terms of
                    use. If you do not agree to these terms, please do not use our website.
                </p>

                <h2 className="text-2xl font-semibold mb-2">Modification of Terms</h2>
                <p className="mb-4">
                    We reserve the right to change these terms at any time. Any changes will
                    be posted on this page, and it is your responsibility to review these
                    terms regularly. Your continued use of the site after any changes
                    signifies your acceptance of the new terms.
                </p>

                <h2 className="text-2xl font-semibold mb-2">Use of the Site</h2>
                <p className="mb-4">
                    You agree to use the site only for lawful purposes and in a way that
                    does not infringe the rights of, restrict, or inhibit anyone else's use
                    and enjoyment of the site.
                </p>

                <h2 className="text-2xl font-semibold mb-2">Intellectual Property</h2>
                <p className="mb-4">
                    All content on this site, including text, graphics, logos, and images,
                    is the property of wele-learn.com and is protected by international
                    copyright laws.
                </p>

                <h2 className="text-2xl font-semibold mb-2">Limitation of Liability</h2>
                <p className="mb-4">
                    Wele-learn.com will not be liable for any damages arising from the use
                    or inability to use the site or any content, services, or products
                    provided through the site.
                </p>

                <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
                <p>
                    If you have any questions about these terms, please contact us at
                    cao.nguyen@wele-learn.com.
                </p>
            </div>
        </>

    );
}