import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, Heart, Lock, Check, BookOpen, User, Plus, Minus, MessageSquare, Database, Activity, EyeOff, Globe } from 'lucide-react';
import { TriageModal } from '../components/TriageModal';
import { Button, Card } from '../components/ui';

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

    return (
        <div className="space-y-0 overflow-x-hidden bg-white dark:bg-gray-950">
            <TriageModal isOpen={showTriage} onClose={() => setShowTriage(false)} onNavigate={navigate} />

            {/* --- HERO SECTION --- */}
            <header className="relative hero-pattern pt-44 pb-20 lg:pt-52 lg:pb-32 -mt-32 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-20 right-0 -mr-20 w-72 h-72 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-20 w-64 h-64 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-6 shadow-sm animate-fade-in-up">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
                            </span>
                            100% Free, Private & Anonymous
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight font-serif animate-fade-in-up animation-delay-200">
                            A Safe Space for Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-500">Mind to Breathe.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
                            SafeHaven is Kenya's first <strong>zero-knowledge</strong> mental health platform. Connect with verified volunteers, journal privately, and find peace—without giving up your identity.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
                            <Button size="lg" onClick={() => setShowTriage(true)} className="w-full sm:w-auto text-lg px-8 py-6 shadow-xl shadow-primary-900/20 hover:shadow-2xl hover:-translate-y-1">
                                I Need Help Now <ArrowRight size={20} className="ml-2" />
                            </Button>
                            <Button variant="secondary" size="lg" onClick={() => navigate('/resources')} className="w-full sm:w-auto text-lg px-8 py-6 hover:-translate-y-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                <BookOpen size={20} className="mr-2" /> Self-Help Library
                            </Button>
                        </div>

                        <div className="mt-16 pt-8 border-t border-gray-200/60 dark:border-gray-800/60 flex flex-wrap justify-center gap-x-8 gap-y-4 text-gray-500 dark:text-gray-400 text-xs md:text-sm font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2"><Shield size={18} className="text-primary-500" /><span>Zero Data Collected</span></div>
                            <div className="flex items-center gap-2"><Check size={18} className="text-blue-500" /><span>Verified Volunteers</span></div>
                            <div className="flex items-center gap-2"><Heart size={18} className="text-red-500" /><span>Always Free</span></div>
                            <div className="flex items-center gap-2"><Lock size={18} className="text-orange-500" /><span>End-to-End Encrypted</span></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- MISSION / ORIGIN --- */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="absolute -top-6 -left-6 w-32 h-32 bg-yellow-100 dark:bg-yellow-900/20 rounded-full blur-2xl opacity-70"></div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl relative z-10 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm text-primary-600 dark:text-primary-400 shrink-0"><Users size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Community First</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Built by Kenyan developers and psychologists volunteering their time. A solution for us, by us.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm text-blue-600 dark:text-blue-400 shrink-0"><EyeOff size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Anonymity is Power</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Stigma silences people. By removing identity, we remove the fear of judgment. Be your true self.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm text-orange-500 dark:text-orange-400 shrink-0"><Globe size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Accessible to All</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Works on low-bandwidth connections. No app download required. Accessible via any browser.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <span className="text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider text-sm mb-2 block">Our Origin Story</span>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 font-serif">Born from a need for <br />Silence & Safety.</h2>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                                SafeHaven started with a simple observation in Nairobi: Mental health support is expensive, and stigma makes people afraid to use their real names.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                                We asked ourselves: <em className="text-gray-900 dark:text-white font-semibold">"What if we could build a platform where the user is invisible, but the help is real?"</em>
                            </p>
                            <div className="pl-6 border-l-4 border-primary-500 italic text-gray-800 dark:text-gray-200 text-lg font-serif">
                                "We don't want your data. We don't want your email. We just want you to be okay."
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
                            { title: 'Create Anonymous ID', desc: 'Generate a random username. We give you a 12-word Recovery Key. No email needed.', icon: User, color: 'blue' },
                            { title: 'Connect or Journal', desc: 'Chat with verified volunteers via encrypted channels or use your private, encrypted journal.', icon: MessageSquare, color: 'green' },
                            { title: 'Heal at Your Pace', desc: 'Access resources, join support groups, or just breathe. You are in full control.', icon: Heart, color: 'red' }
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
            <section className="py-20 bg-gray-900 text-white overflow-hidden relative my-12 mx-2 sm:mx-8 rounded-[2.5rem]">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-primary-600 rounded-full blur-[120px]"></div>
                    <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-blue-600 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-primary-400 font-bold uppercase tracking-wider text-xs mb-2 block">The Zero-Knowledge Architecture</span>
                            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 font-serif leading-none">We can't read your data. <br />Even if we tried.</h2>
                            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                                Most apps encrypt data "at rest" but hold the keys. SafeHaven uses <strong>Client-Side Encryption (AES-256)</strong>. Your password <em>is</em> the key, and it never leaves your device unhashed.
                            </p>
                            <ul className="space-y-4 text-base">
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 bg-green-500/20 p-1.5 rounded-lg text-green-400"><Database size={18} /></div>
                                    <span className="text-gray-300">Journal entries are encrypted <strong>before</strong> upload.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 bg-blue-500/20 p-1.5 rounded-lg text-blue-400"><Activity size={18} /></div>
                                    <span className="text-gray-300">We don't track IPs or browser fingerprints on journal entries.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 bg-red-500/20 p-1.5 rounded-lg text-red-400"><Shield size={18} /></div>
                                    <span className="text-gray-300">The <strong>"Kill Switch"</strong> instantly cryptographically shreds your data.</span>
                                </li>
                            </ul>
                            <div className="mt-10">
                                <Link to="/legal/whitepaper" className="inline-flex bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors items-center gap-3 shadow-xl shadow-white/10 text-sm">
                                    <Lock size={18} /> Read Security Whitepaper
                                </Link>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="bg-gray-950/80 backdrop-blur-xl border border-gray-800 p-6 rounded-3xl shadow-2xl relative">
                                <div className="flex items-center gap-4 mb-6 border-b border-gray-800 pb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <div className="ml-auto text-xs text-gray-500 font-mono">ENCRYPTION PROTOCOL</div>
                                </div>
                                <div className="space-y-3 font-mono text-xs md:text-sm">
                                    <div className="flex gap-2 text-green-400"><span className="opacity-50">&gt;</span> <span>Initiating handshake...</span></div>
                                    <div className="flex gap-2 text-blue-400"><span className="opacity-50">&gt;</span> <span>Generating PBKDF2 Key Derivation...</span></div>
                                    <div className="flex gap-2 text-primary-400"><span className="opacity-50">&gt;</span> <span>Encrypting payload with AES-256-GCM...</span></div>

                                    <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-800 relative overflow-hidden group-hover:border-primary-900 transition-colors">
                                        <p className="text-gray-500 text-[10px] mb-1">SERVER VIEW (WHAT WE SEE)</p>
                                        <p className="text-gray-400 break-all text-[10px] leading-loose">
                                            U2FsdGVkX1+v8w5+...98s7df98s7df98s7df...<br />
                                            <span className="text-gray-600">Encrypted Blob</span>
                                        </p>
                                    </div>

                                    <div className="flex gap-2 text-green-400 mt-4"><span className="opacity-50">&gt;</span> <span>Transmission Secure. Keys discarded.</span></div>
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
                        {/* Licensed Card */}
                        <div className="group bg-green-50 dark:bg-green-900/10 rounded-[1.5rem] p-6 border border-green-100 dark:border-green-900/30 hover:border-green-200 transition-all hover:shadow-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <img src="https://ui-avatars.com/api/?name=Dr+Amina&background=10b981&color=fff" alt="Vol" className="w-14 h-14 rounded-full shadow-md" />
                                <div>
                                    <h4 className="font-bold text-lg dark:text-white">Dr. Amina J.</h4>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-200/50 dark:text-green-300 dark:bg-green-900/50 px-2 py-0.5 rounded-full mt-1">
                                        <Check size={10} /> Licensed Pro
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">"I specialize in trauma and anxiety. Let's work together to find your grounding techniques."</p>
                            <div className="flex flex-wrap gap-2">
                                {['Anxiety', 'Trauma', 'Grief'].map(t => <span key={t} className="text-[10px] font-bold text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg">{t}</span>)}
                            </div>
                        </div>

                        {/* Peer Listener Card */}
                        <div className="group bg-blue-50 dark:bg-blue-900/10 rounded-[1.5rem] p-6 border border-blue-100 dark:border-blue-900/30 hover:border-blue-200 transition-all hover:shadow-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <img src="https://ui-avatars.com/api/?name=Sarah+O&background=3b82f6&color=fff" alt="Vol" className="w-14 h-14 rounded-full shadow-md" />
                                <div>
                                    <h4 className="font-bold text-lg dark:text-white">Sarah O.</h4>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-200/50 dark:text-blue-300 dark:bg-blue-900/50 px-2 py-0.5 rounded-full mt-1">
                                        <Heart size={10} /> Peer Listener
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">"I'm here to listen without judgment. Sometimes you just need to be heard by someone who gets it."</p>
                            <div className="flex flex-wrap gap-2">
                                {['Loneliness', 'Stress', 'Relationships'].map(t => <span key={t} className="text-[10px] font-bold text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg">{t}</span>)}
                            </div>
                        </div>

                        {/* Join Card */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors">
                            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400 shadow-sm">
                                <Plus size={32} />
                            </div>
                            <h4 className="font-bold text-xl dark:text-white mb-2">Join the Network</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">Are you a mental health professional or empathetic listener? We need you.</p>
                            <button onClick={() => navigate('/auth/volunteer/apply')} className="text-primary-600 font-bold hover:text-primary-700 flex items-center gap-2 text-sm">
                                Apply to Volunteer <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FAQ --- */}
            <section className="py-20 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionTitle title="Frequently Asked Questions" subtitle="Clarity is key to safety." />
                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 md:p-10 border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
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
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-50 dark:bg-primary-900/10 -skew-y-3 transform origin-bottom-right scale-110"></div>
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