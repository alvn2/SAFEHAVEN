import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, User, Heart, Lock, Check, BookOpen, Plus, Minus, MessageSquare, Database, Activity, EyeOff, Globe } from 'lucide-react';
import { TriageModal } from '../components/TriageModal';
import { Button, Card } from '../components/ui';
import { volunteerApi } from '../lib/api';
import { Volunteer } from '../types';
import { Avatar } from '../components/Avatar';

const SectionTitle = ({ title, subtitle, centered = true }: { title: string, subtitle: string, centered?: boolean }) => (
    <div className={`mb-12 max-w-4xl px-4 ${centered ? 'text-center mx-auto' : ''}`}>
        <span className="text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider text-xs md:text-sm mb-2 block">SafeHaven Kenya</span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-serif leading-tight">{title}</h2>
        <div className={`w-16 h-1 bg-primary-500 mb-6 rounded-full ${centered ? 'mx-auto' : ''}`}></div>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{subtitle}</p>
    </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 dark:border-gray-800 last:border-0">
            <button
                className="w-full flex justify-between items-center py-5 text-left focus:outline-none group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white pr-8 group-hover:text-primary-600 transition-colors">{question}</span>
                {isOpen ? <Minus className="text-primary-500 shrink-0 w-5 h-5" /> : <Plus className="text-gray-400 shrink-0 group-hover:text-primary-500 w-5 h-5" />}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">{answer}</p>
            </div>
        </div>
    );
};

export const HomePage = () => {
    const navigate = useNavigate();
    const [showTriage, setShowTriage] = useState(false);
    const [previewVolunteers, setPreviewVolunteers] = useState<Volunteer[]>([]);

    useEffect(() => {
        volunteerApi.getAll()
            .then(data => {
                const verified = (data || []).filter((v: any) => v.verified);
                setPreviewVolunteers(verified.slice(0, 2));
            })
            .catch(() => setPreviewVolunteers([]));
    }, []);

    return (
        <div className="space-y-0 overflow-x-hidden bg-white dark:bg-gray-950">
            <TriageModal isOpen={showTriage} onClose={() => setShowTriage(false)} onNavigate={navigate} />

            {/* --- HERO SECTION --- */}
            <header className="relative hero-pattern pt-44 pb-20 lg:pt-52 lg:pb-32 -mt-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 border border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-6 shadow-sm animate-fade-in-up">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
                            </span>
                            100% Free, Private & Anonymous
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight font-serif animate-fade-in-up animation-delay-200">
                            Free, Anonymous Mental Health <br />
                            <span className="text-primary-600 dark:text-primary-400">Support Across Kenya.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
                            Built for complete privacy. Connect with verified volunteer counselors and peer listeners without providing your phone number, email, or real identity.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
                            <Button size="lg" onClick={() => setShowTriage(true)} className="w-full sm:w-auto text-lg px-8 py-6 shadow-xl shadow-primary-900/20 hover:shadow-2xl hover:-translate-y-1">
                                I Need Help Now <ArrowRight size={20} className="ml-2" />
                            </Button>
                            <Button variant="secondary" size="lg" onClick={() => navigate('/resources')} className="w-full sm:w-auto text-lg px-8 py-6 hover:-translate-y-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                                <BookOpen size={20} className="mr-2" /> Self-Help Library
                            </Button>
                        </div>

                        <div className="mt-16 pt-8 border-t border-gray-200/60 dark:border-gray-800/60 flex flex-wrap justify-center gap-x-8 gap-y-4 text-gray-500 dark:text-gray-400 text-xs md:text-sm font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2"><Shield size={18} className="text-primary-500" /><span>Zero Data Collected</span></div>
                            <div className="flex items-center gap-2"><Check size={18} className="text-blue-500" /><span>Verified Volunteers</span></div>
                            <div className="flex items-center gap-2"><Heart size={18} className="text-red-500" /><span>Always Free</span></div>
                            <div className="flex items-center gap-2"><Lock size={18} className="text-orange-500" /><span>Client-Side Encrypted</span></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- MISSION / ORIGIN --- */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg relative z-10 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm text-primary-600 dark:text-primary-400 shrink-0"><Check size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Vetted Through Official Channels</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Licensed counselors are verified through official government regulatory bodies and recognized NGO health partner channels. Peer listeners complete active-listening training.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm text-blue-600 dark:text-blue-400 shrink-0"><EyeOff size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Total Identity Anonymity</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Your identity cannot be breached or tracked because it is never collected. No phone numbers, no emails, and no administrative user rosters.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm text-orange-500 dark:text-orange-400 shrink-0"><Globe size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Accessible on Low-Bandwidth Networks</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Lightweight (under 100KB), fast on 3G mobile connections across Kenya, and installable as an offline-first web app with a local device vault.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <span className="text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider text-sm mb-2 block">Our Origin & Mission</span>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 font-serif">Bridging Care & Privacy <br />in Nairobi and Beyond.</h2>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                                SafeHaven was conceived in Nairobi to address two critical barriers in Kenya: the high cost of therapy and the social stigma that keeps individuals from seeking help under their real names.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                                We operate as an independent, volunteer-driven initiative. To keep SafeHaven 100% free and expand our volunteer training and crisis infrastructure, <strong>we are actively seeking philanthropic partners and grant funding</strong>.
                            </p>
                            <div className="pl-6 border-l-4 border-primary-500 text-gray-800 dark:text-gray-200 text-base font-medium leading-relaxed">
                                "No fees, no email harvesting, no corporate tracking. Real mental health support when you need it most."
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section className="py-20 bg-gray-50 dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionTitle
                        title="No Forms. No Fees. Just Help."
                        subtitle="We stripped away everything that makes asking for help scary."
                    />

                    <div className="grid md:grid-cols-3 gap-8 relative mt-12">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gray-200 dark:bg-gray-800 -z-10 border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>

                        {[
                            { title: 'Create Anonymous ID', desc: 'Generate a random username. We give you a 12-word Recovery Key. No email or phone number is ever needed.', icon: User, color: 'blue' },
                            { title: 'Connect with Verified Listeners', desc: 'Chat directly with verified professionals and trained peer listeners via encrypted private channels.', icon: MessageSquare, color: 'green' },
                            { title: 'Keep an Encrypted Vault', desc: 'Store private reflections and safety plans encrypted on your phone, or export them to an offline KeePassXC vault.', icon: Shield, color: 'red' }
                        ].map((step, idx) => (
                            <Card key={idx} hoverable className="p-8 group">
                                <div className={`w-16 h-16 bg-${step.color}-50 dark:bg-${step.color}-900/20 text-${step.color}-600 dark:text-${step.color}-400 rounded-2xl flex items-center justify-center mb-6 text-xl font-bold mx-auto shadow-inner ring-1 ring-${step.color}-100 dark:ring-${step.color}-900/40`}>
                                    <step.icon size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">{step.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed text-sm">{step.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- PRIVACY DIRECTIVE (Technical Core) --- */}
            <section className="py-20 bg-gray-900 text-white overflow-hidden relative my-12 mx-2 sm:mx-8 rounded-2xl border border-gray-800 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-primary-400 font-bold uppercase tracking-wider text-xs mb-2 block">Zero-Knowledge Architecture</span>
                            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 font-serif leading-tight">We can't read your data. <br />Even if we tried.</h2>
                            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                                Most apps encrypt data "at rest" but hold the decryption keys on their servers. SafeHaven uses <strong>Client-Side AES-256 Encryption</strong>. Your password <em>is</em> the key, and it never leaves your device unhashed.
                            </p>
                            <ul className="space-y-4 text-base">
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 bg-green-500/20 p-1.5 rounded-lg text-green-400"><Database size={18} /></div>
                                    <span className="text-gray-300">Reflections are encrypted in your browser <strong>before</strong> upload.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 bg-blue-500/20 p-1.5 rounded-lg text-blue-400"><Activity size={18} /></div>
                                    <span className="text-gray-300">We do not log IP addresses, device identifiers, or tracking cookies.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 bg-red-500/20 p-1.5 rounded-lg text-red-400"><Shield size={18} /></div>
                                    <span className="text-gray-300">The <strong>"Kill Switch"</strong> instantly and permanently purges all records.</span>
                                </li>
                            </ul>
                            <div className="mt-10">
                                <Link to="/legal/whitepaper" className="inline-flex bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors items-center gap-3 shadow-xl shadow-white/10 text-sm">
                                    <Lock size={18} /> Read Security Whitepaper
                                </Link>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-gray-950 border border-gray-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Cryptographic Zero-Knowledge Pipeline
                                    </span>
                                    <span className="text-[11px] text-gray-500 font-mono">CLIENT-SIDE AES-256</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-900/80 rounded-xl border border-gray-800 flex items-start gap-3.5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono">01</div>
                                        <div>
                                            <h5 className="text-sm font-bold text-white mb-1">Local Key Derivation</h5>
                                            <p className="text-xs text-gray-400 leading-relaxed">Your device derives an AES-256 key from your private passphrase. The raw key never touches a network cable or server.</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-900/80 rounded-xl border border-gray-800 flex items-start gap-3.5">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono">02</div>
                                        <div>
                                            <h5 className="text-sm font-bold text-white mb-1">Pre-Upload Encryption</h5>
                                            <p className="text-xs text-gray-400 leading-relaxed">Your reflections and peer chat payloads are encrypted into salted ciphertext (<code className="text-emerald-400 font-mono text-[11px]">U2FsdGVkX1...</code>) directly in your browser.</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-900/80 rounded-xl border border-gray-800 flex items-start gap-3.5">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono">03</div>
                                        <div>
                                            <h5 className="text-sm font-bold text-white mb-1">Zero Server Legibility</h5>
                                            <p className="text-xs text-gray-400 leading-relaxed">SafeHaven servers store only ciphertext blobs. Neither server administrators nor third parties can decrypt your thoughts.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- VOLUNTEERS PREVIEW --- */}
            <section className="py-20 bg-white dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionTitle
                        title="Real People. Verified."
                        subtitle="Connect with listeners who understand. From licensed professionals to trained peers, everyone is here to help."
                        centered={false}
                    />

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {previewVolunteers.map(vol => (
                            <div key={vol.id} className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-400 transition-all hover:shadow-lg flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <Avatar name={vol.name} photo={vol.photo} size="xl" />
                                        <div>
                                            <h4 className="font-bold text-lg dark:text-white">{vol.name}</h4>
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full mt-1">
                                                <Check size={12} /> {vol.role === 'licensed' ? 'Licensed Professional' : 'Peer Listener'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">{vol.bio || 'Verified listener available for confidential support.'}</p>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {(vol.topics || []).slice(0, 3).map(t => (
                                            <span key={t} className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => navigate('/volunteers')} className="text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1.5 text-xs pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <span>Connect Confidentially</span> <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}

                        {/* Directory Link Card if fewer than 2 */}
                        {previewVolunteers.length < 2 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-4">
                                        <Users size={24} />
                                    </div>
                                    <h4 className="font-bold text-lg dark:text-white mb-2">Verified Listeners</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">Browse our full directory of certified therapists, counselors, and trained peers across Kenya.</p>
                                </div>
                                <button onClick={() => navigate('/volunteers')} className="text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1.5 text-xs pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <span>Browse All Volunteers</span> <ArrowRight size={14} />
                                </button>
                            </div>
                        )}

                        {/* Join Network Card */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center hover:bg-gray-100/80 dark:hover:bg-gray-800/60 transition-colors">
                            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400 shadow-sm border border-gray-200 dark:border-gray-700">
                                <Plus size={28} />
                            </div>
                            <h4 className="font-bold text-lg dark:text-white mb-2">Join the Network</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">Are you a licensed psychologist or trained peer counselor in Kenya? We welcome you.</p>
                            <button onClick={() => navigate('/volunteer/apply')} className="text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-1.5 text-sm">
                                <span>Apply to Volunteer</span> <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FAQ --- */}
            <section className="py-20 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionTitle title="Frequently Asked Questions" subtitle="Clarity is key to safety." />
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-10 border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
                        <FAQItem
                            question="Is SafeHaven really free?"
                            answer="Yes, 100%. SafeHaven is a non-profit initiative run by volunteers. There are no hidden fees, subscriptions, or ads."
                        />
                        <FAQItem
                            question="Can SafeHaven trace me?"
                            answer="No. We do not collect your IP address for journal entries, and we don't ask for your email or phone number. We literally do not know who you are."
                        />
                        <FAQItem
                            question="What happens if I lose my password?"
                            answer="Because we don't have your email, we cannot reset your password. The ONLY way to recover your account is using the 12-word Recovery Key given to you during signup. Please keep it safe."
                        />
                        <FAQItem
                            question="Are the volunteers real doctors?"
                            answer="Some are. We have two types of volunteers: 'Licensed Pros' (Green Badge) who are verified psychologists, and 'Peer Listeners' (Blue Badge) who are trained in active listening but are not medical professionals."
                        />
                    </div>
                </div>
            </section>

            {/* --- CTA --- */}
            <section className="py-20 relative bg-primary-50/60 dark:bg-primary-950/30 border-t border-primary-100 dark:border-primary-900/40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 font-serif leading-tight">
                        You don't have to carry it alone.
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button onClick={() => navigate('/auth/signup')} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl hover:-translate-y-1">
                            Create Anonymous Account
                        </button>
                        <button onClick={() => navigate('/volunteers')} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:-translate-y-1">
                            Browse Volunteers
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};