import React from 'react';

export const TermsPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <h1 className="text-4xl font-bold font-serif mb-8 dark:text-white">Terms and Conditions</h1>
      
      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
            <h3 className="text-yellow-800 dark:text-yellow-200 font-bold m-0">Medical Disclaimer</h3>
            <p className="text-yellow-700 dark:text-yellow-300 m-0">
                SafeHaven is a peer support platform. We are <strong>not</strong> a medical facility, and our volunteers (unless explicitly marked as Licensed Professionals) are not doctors. If you are in immediate danger, please call 999 or the crisis hotlines listed on our platform immediately.
            </p>
        </div>

        <h3 className="text-xl font-bold mt-6 mb-2 dark:text-white">1. Acceptance of Terms</h3>
        <p>
            By accessing and using SafeHaven, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2 dark:text-white">2. User Conduct</h3>
        <p>
            SafeHaven is a safe space. Harassment, hate speech, trolling, or any form of abuse towards volunteers or other users will result in an immediate and permanent ban.
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2 dark:text-white">3. Anonymity & Security</h3>
        <p>
            You are responsible for maintaining the confidentiality of your password. Because we do not collect emails, <strong>we cannot recover lost passwords</strong>. You are responsible for safeguarding your Recovery Key.
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2 dark:text-white">4. Limitation of Liability</h3>
        <p>
            SafeHaven and its developers are not liable for any damages or distress arising from the use of this platform. The service is provided "as is" without any warranty.
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2 dark:text-white">5. Modifications</h3>
        <p>
            We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.
        </p>
      </div>
    </div>
  );
};