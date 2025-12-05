import React from 'react';
import { Card } from '../components/ui';
import { Shield, Lock, Trash2, Key, Server } from 'lucide-react';

export const SecurityWhitepaperPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400 mb-4">
          <Shield size={48} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 dark:text-white">Security Architecture</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          SafeHaven is built on a "Zero-Knowledge" principle. This document outlines the technical measures we take to ensure we cannot access your data.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-8 border-t-4 border-t-primary-500">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
            <Key className="text-primary-500" /> Client-Side Encryption
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            All sensitive user data (journal entries, safety plans) is encrypted <strong>in your browser</strong> using AES-256-GCM before it is ever sent to our servers. Your password is used to derive the encryption key (PBKDF2). This means SafeHaven servers only receive encrypted blobs of text that look like random noise. We do not possess the key to decrypt them.
          </p>
        </Card>

        <Card className="p-8 border-t-4 border-t-blue-500">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
            <Shield className="text-blue-500" /> Anonymous Identity
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We do not collect email addresses or phone numbers for Seekers. Accounts are identified solely by a randomly generated ID and a username. Authentication is handled via a salted hash of your password. Since we don't have your email, we cannot reset your password—this is a feature, not a bug, ensuring no link to your real identity exists.
          </p>
        </Card>
      </div>

      <div className="space-y-8">
        <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">Data Lifecycle</h2>
        
        <div className="relative border-l-4 border-gray-200 dark:border-gray-800 ml-4 pl-8 space-y-12">
          <div className="relative">
            <span className="absolute -left-[42px] bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</span>
            <h4 className="text-xl font-bold mb-2 dark:text-white">Input</h4>
            <p className="text-gray-600 dark:text-gray-400">You type a journal entry: <em>"I am feeling anxious today."</em></p>
          </div>
          
          <div className="relative">
            <span className="absolute -left-[42px] bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</span>
            <h4 className="text-xl font-bold mb-2 dark:text-white">Encryption (Local)</h4>
            <p className="text-gray-600 dark:text-gray-400">Your device encrypts this using your password. Result: <code>U2FsdGVkX1+v8w5+...</code></p>
          </div>
          
          <div className="relative">
            <span className="absolute -left-[42px] bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</span>
            <h4 className="text-xl font-bold mb-2 dark:text-white">Transmission</h4>
            <p className="text-gray-600 dark:text-gray-400">The encrypted text is sent over HTTPS (TLS 1.3) to our database.</p>
          </div>

          <div className="relative">
             <span className="absolute -left-[42px] bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">4</span>
             <h4 className="text-xl font-bold mb-2 dark:text-white">Storage</h4>
             <p className="text-gray-600 dark:text-gray-400">We store the encrypted string. If a hacker breaches our database, they see only gibberish.</p>
          </div>
        </div>
      </div>

      <Card className="p-8 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
        <h3 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-3">
          <Trash2 /> The "Kill Switch" Mechanism
        </h3>
        <p className="text-gray-800 dark:text-gray-200 mb-4">
          For users in unsafe domestic situations, we provide a "Nuke Data" feature. When activated:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>All records associated with your User ID are immediately deleted from the database.</li>
          <li>Local storage on your device is cleared.</li>
          <li>Your session is terminated.</li>
          <li>You are redirected to a neutral page.</li>
        </ul>
        <p className="mt-4 text-sm font-bold text-red-600 dark:text-red-400">
          This action is irreversible and cryptographic. Once deleted, the data cannot be recovered by anyone, including SafeHaven admins.
        </p>
      </Card>

      <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 mb-4">SafeHaven Codebase is Open Source.</p>
        <a href="#" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:underline">
          <Server size={18} /> View Source Code on GitHub
        </a>
      </div>
    </div>
  );
};