import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Phone } from 'lucide-react';

export const Footer = () => (
    <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 mt-auto pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-2 space-y-4">
                    <Logo />
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
                        A junction for healing. A collective for peace. SafeHaven is a non-profit initiative dedicated to providing free, private, and accessible mental health support to every Kenyan.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/auth/volunteer/apply" className="text-sm font-bold text-primary-600 hover:underline">Volunteer with Us</Link>
                    </div>
                </div>
                <div>
                    <h4 className="font-serif font-bold text-gray-900 dark:text-white mb-6">Platform</h4>
                    <ul className="space-y-4 text-gray-500 dark:text-gray-400 text-sm">
                        <li><Link to="/volunteers" className="hover:text-primary-600 transition-colors">Volunteer Directory</Link></li>
                        <li><Link to="/community" className="hover:text-primary-600 transition-colors">Community Hub</Link></li>
                        <li><Link to="/resources" className="hover:text-primary-600 transition-colors">Self-Help Library</Link></li>
                        <li><Link to="/seeker/dashboard" className="hover:text-primary-600 transition-colors">Safety Plan</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-serif font-bold text-gray-900 dark:text-white mb-6">Legal & Privacy</h4>
                    <ul className="space-y-4 text-gray-500 dark:text-gray-400 text-sm">
                        <li><Link to="/legal/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
                        <li><Link to="/legal/terms" className="hover:text-primary-600 transition-colors">Terms of Service</Link></li>
                        <li><Link to="/legal/whitepaper" className="hover:text-primary-600 transition-colors">Security Whitepaper</Link></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm gap-4">
                <div className="text-center md:text-left">
                    <p>© 2025 SafeHaven Kenya. Built with ❤️ in Nairobi.</p>
                    <p className="mt-1 text-xs">Developed by <a href="https://devlinktechnologies.co.ke" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Devlink Technologies</a></p>
                </div>
                <div className="flex gap-4 items-center">
                    <Phone size={16} /> <span>Crisis Hotline: 0722 178 177</span>
                </div>
            </div>

            <div className="mt-8 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-justify border border-gray-200 dark:border-gray-800">
                <strong>Disclaimer:</strong> SafeHaven is a peer support and resource platform. We are not a medical facility. If you are in immediate danger of hurting yourself or others, please call the emergency numbers listed or visit the nearest hospital immediately. Volunteers are verified for identity but peer listeners are not medical professionals.
            </div>
        </div>
    </footer>
);