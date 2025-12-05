import React from 'react';

export const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <h1 className="text-4xl font-bold font-serif mb-8 dark:text-white">Privacy Policy</h1>
      
      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
        <p className="text-lg font-medium text-gray-900 dark:text-white">Last Updated: October 2025</p>
        <p>At SafeHaven, privacy isn't just a policy—it's our core architecture. We collect the absolute minimum amount of data required to provide our service.</p>

        <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">1. Data We Do Not Collect</h3>
        <ul className="list-disc pl-5 space-y-2">
            <li><strong>No Real Names:</strong> We do not ask for your legal name. You operate entirely under a pseudonym.</li>
            <li><strong>No Email Addresses:</strong> We do not require or store an email address for Seekers.</li>
            <li><strong>No Phone Numbers:</strong> We do not require a phone number for Seekers.</li>
            <li><strong>No IP Tracking:</strong> We do not log IP addresses associated with your journal entries or chat messages.</li>
        </ul>

        <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">2. Data We Do Collect</h3>
        <p>To operate the service, we store:</p>
        <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Credentials:</strong> A salted hash of your password and a randomly generated User ID.</li>
            <li><strong>Encrypted Content:</strong> Your journal entries, messages, and safety plans are stored as encrypted text blobs (ciphertext). We cannot decrypt them because we do not have your password.</li>
            <li><strong>Volunteer Data:</strong> If you apply as a volunteer, we collect your name, email, phone, and credentials for verification purposes only. This data is kept separate from Seeker data.</li>
        </ul>

        <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">3. Client-Side Encryption</h3>
        <p>We use industry-standard AES-256-GCM encryption. Encryption happens <strong>on your device</strong> before data is sent to our servers. Your password acts as the decryption key. If you lose your password and recovery phrase, your data is mathematically impossible to recover.</p>

        <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">4. Data Deletion</h3>
        <p>You may delete your account at any time using the "Nuke Data" button in your dashboard. This performs a cryptographic erasure: we delete your encrypted data and the keys required to access it, rendering it permanently unrecoverable.</p>
      </div>
    </div>
  );
};