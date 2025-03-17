// pages/privacy.js

import { TopNav } from "../_components/TopNav";

export default function Privacy() {
    return (

        <>
            <TopNav />
                
            <div className="max-w-4xl mx-auto px-4 py-8 mt-32">
                <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
                <p className="mb-4">
                    Welcome to wele-learn.com. Your privacy is important to us. This privacy
                    policy explains how we collect, use, and protect your information.
                </p>
                <h2 className="text-2xl font-semibold mb-2">Information We Collect</h2>
                <p className="mb-4">
                    We collect information from you when you visit our site, register, or
                    fill out a form. The types of information we may collect include your
                    name, email address, and any other details you provide.
                </p>
                <h2 className="text-2xl font-semibold mb-2">How We Use Your Information</h2>
                <p className="mb-4">
                    We use the information we collect to improve our website, send periodic
                    emails, and respond to inquiries. We do not sell, trade, or otherwise
                    transfer your information to outside parties.
                </p>
                <h2 className="text-2xl font-semibold mb-2">Security</h2>
                <p className="mb-4">
                    We implement a variety of security measures to maintain the safety of
                    your personal information. However, no method of transmission over the
                    Internet is 100% secure.
                </p>
                <h2 className="text-2xl font-semibold mb-2">Changes to Our Privacy Policy</h2>
                <p className="mb-4">
                    We may update this privacy policy from time to time. We will notify you
                    of any changes by posting the new policy on this page.
                </p>
                <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
                <p>
                    If you have any questions about this privacy policy, you can contact us
                    at cao.nguyen@wele-learn.com.
                </p>
            </div>
        </>

    );
}