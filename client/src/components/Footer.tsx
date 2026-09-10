import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Phone, Heart } from 'lucide-react';

export const Footer = () => (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-2 space-y-4">
                    <Logo />
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm text-sm">
                        SafeHaven is an independent, volunteer-led initiative providing free, confidential peer support and mental health resources across Kenya. We are actively seeking philanthropic partners and grant funding to sustain and expand free access across East Africa.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/volunteer/apply" className="text-sm font-bold text-primary-600 hover:underline">Volunteer with Us</Link>
                    </div>
                </div>
                <div>
                    <h4 className="font-serif font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Platform</h4>
                    <ul className="space-y-1 sm:space-y-2 text-gray-500 dark:text-gray-400 text-sm">
                        <li><Link to="/volunteers" className="hover:text-primary-600 transition-colors py-1.5 inline-flex items-center min-h-[36px]">Volunteer Directory</Link></li>
                        <li><Link to="/community" className="hover:text-primary-600 transition-colors py-1.5 inline-flex items-center min-h-[36px]">Community Hub</Link></li>
                        <li><Link to="/resources" className="hover:text-primary-600 transition-colors py-1.5 inline-flex items-center min-h-[36px]">Self-Help Library</Link></li>
                        <li><Link to="/seeker/dashboard" className="hover:text-primary-600 transition-colors py-1.5 inline-flex items-center min-h-[36px]">Safety Plan</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-serif font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Legal & Privacy</h4>
                    <ul className="space-y-1 sm:space-y-2 text-gray-500 dark:text-gray-400 text-sm">
                        <li><Link to="/legal/privacy" className="hover:text-primary-600 transition-colors py-1.5 inline-flex items-center min-h-[36px]">Privacy Policy</Link></li>
                        <li><Link to="/legal/terms" className="hover:text-primary-600 transition-colors py-1.5 inline-flex items-center min-h-[36px]">Terms of Service</Link></li>
                        <li><Link to="/legal/whitepaper" className="hover:text-primary-600 transition-colors py-1.5 inline-flex items-center min-h-[36px]">Security Whitepaper</Link></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm gap-4">
                <div className="text-center md:text-left">
                    <p className="flex items-center justify-center md:justify-start gap-1">
                        <span>© {new Date().getFullYear()} SafeHaven Kenya. Built with</span>
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" aria-hidden="true" />
                        <span>in Nairobi.</span>
                    </p>
                    <p className="mt-1 text-xs">Developed by <a href="https://devlinktechnologies.co.ke" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Devlink Technologies</a></p>
                </div>
                <div className="flex gap-2 items-center">
                    <Phone size={16} className="text-primary-500 shrink-0" />
                    <a href="tel:+254722178177" className="font-bold text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 min-h-[44px] inline-flex items-center">
                        Crisis Hotline: 0722 178 177
                    </a>
                </div>
            </div>

            <div className="mt-8 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-left border border-gray-200 dark:border-gray-800">
                <strong>Disclaimer:</strong> SafeHaven is a peer support and resource platform. We are not a medical facility. If you are in immediate danger of hurting yourself or others, please call the emergency numbers listed or visit the nearest hospital immediately. Volunteers are verified for identity but peer listeners are not medical professionals.
            </div>
        </div>
    </footer>
);