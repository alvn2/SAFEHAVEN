import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Card, Input, Button } from '../components/ui';
import { Logo } from '../components/Logo';
import { CheckCircle, Info, Copy, ShieldCheck, RefreshCw } from 'lucide-react';

export const SeekerSignupPage = () => {
    const { registerSeeker } = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [becomePeerListener, setBecomePeerListener] = useState(false);
    const [recoveryKey, setRecoveryKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Auto-generate Reddit-style username on load
    React.useEffect(() => {
        const adjs = ["Quiet", "Brave", "Calm", "Gentle", "Swift", "Silent", "Noble", "Bright", "Warm", "Safe"];
        const nouns = ["River", "Mountain", "Forest", "Ocean", "Sky", "Star", "Eagle", "Wolf", "Breeze", "Dawn"];
        setUsername(`${adjs[Math.floor(Math.random()*adjs.length)]}${nouns[Math.floor(Math.random()*nouns.length)]}${Math.floor(Math.random()*1000)}`);
    }, []);

    // Verification Challenge State
    const [challengeIndices, setChallengeIndices] = useState<number[]>([]);
    const [challengeWords, setChallengeWords] = useState<string[]>(['', '']);
    const [verificationError, setVerificationError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreedToTerms) {
            alert("You must agree to the Terms and Conditions to proceed.");
            return;
        }
        setIsLoading(true);
        
        try {
            const key = await registerSeeker(username, password, agreedToTerms, becomePeerListener);
            setRecoveryKey(key);
            setStep(2);
        } catch (err: any) {
            alert(err.message || 'Registration failed. Try a different username.');
        } finally {
            setIsLoading(false);
        }
    };

    const setupVerification = () => {
        const idx1 = Math.floor(Math.random() * 12);
        let idx2 = Math.floor(Math.random() * 12);
        while(idx2 === idx1) idx2 = Math.floor(Math.random() * 12);
        setChallengeIndices([idx1, idx2].sort((a,b) => a-b));
        setStep(3);
    };

    const handleVerify = () => {
        const actualWords = recoveryKey.split(' ');
        const word1Correct = actualWords[challengeIndices[0]] === challengeWords[0].trim().toLowerCase();
        const word2Correct = actualWords[challengeIndices[1]] === challengeWords[1].trim().toLowerCase();

        if (word1Correct && word2Correct) {
            navigate('/seeker/dashboard');
        } else {
            setVerificationError("Incorrect words. Please double-check your recovery phrase.");
        }
    };

    return (
        <div className="max-w-md mx-auto py-12">
            <Card className="p-8">
                <div className="text-center mb-8">
                    <Logo />
                    <h2 className="text-2xl font-bold mt-4 dark:text-white">
                        {step === 1 && "Anonymous Sign Up"}
                        {step === 2 && "Save Recovery Key"}
                        {step === 3 && "Verify Key"}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                        {step === 1 && "No email required. Privacy first."}
                        {step === 2 && "This is the ONLY way to restore your account."}
                        {step === 3 && "Prove you saved it to continue."}
                    </p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleSignup} className="space-y-4">
                        <Input label="Anonymous Username" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Choose a pseudonym" />
                        <p className="text-[10px] text-gray-500 -mt-3 ml-1">We've generated a random secure username for you, but you can change it.</p>
                        
                        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Create a strong password" />
                        
                        <div className="space-y-3 mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" className="mt-1 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} required />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>. I understand that SafeHaven does not collect my email.
                                </span>
                            </label>
                            
                            <label className="flex items-start gap-3 cursor-pointer mt-4">
                                <input type="checkbox" className="mt-1 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" checked={becomePeerListener} onChange={e => setBecomePeerListener(e.target.checked)} />
                                <div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Become a Peer Listener</span>
                                    <p className="text-xs text-gray-500 mt-0.5">Opt-in to help others. You can chat anonymously and provide community support.</p>
                                </div>
                            </label>
                        </div>

                        <Button type="submit" className="w-full mt-6" isLoading={isLoading}>Create Account</Button>
                        <div className="text-center mt-4">
                             <Link to="/auth" className="text-sm text-primary-600 hover:underline">Already have an account? Log In</Link>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 relative group">
                            <div className="grid grid-cols-3 gap-2">
                                {recoveryKey.split(' ').map((word, i) => (
                                    <div key={i} className="flex items-center gap-1 text-xs">
                                        <span className="text-gray-400 select-none">{i+1}.</span>
                                        <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{word}</span>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => navigator.clipboard.writeText(recoveryKey)}
                                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                                title="Copy to clipboard"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex gap-2 items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                            <Info className="w-5 h-5 shrink-0" />
                            <p>Write these 12 words down or save them in a password manager. You will need to verify them next.</p>
                        </div>

                        <Button className="w-full" onClick={setupVerification}>
                            I Saved It, Continue
                        </Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex gap-3">
                            <ShieldCheck className="w-6 h-6 text-yellow-600 shrink-0" />
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                To ensure you don't lose access, please enter the following words from your phrase.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1 dark:text-white">Word #{challengeIndices[0] + 1}</label>
                                <Input 
                                    value={challengeWords[0]}
                                    onChange={e => setChallengeWords([e.target.value, challengeWords[1]])}
                                    placeholder="Enter word..."
                                    className={verificationError ? 'border-red-500' : ''}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 dark:text-white">Word #{challengeIndices[1] + 1}</label>
                                <Input 
                                    value={challengeWords[1]}
                                    onChange={e => setChallengeWords([challengeWords[0], e.target.value])}
                                    placeholder="Enter word..."
                                    className={verificationError ? 'border-red-500' : ''}
                                />
                            </div>
                        </div>

                        {verificationError && (
                            <p className="text-red-500 text-sm text-center font-bold flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4" /> {verificationError}
                            </p>
                        )}

                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">Back</Button>
                            <Button className="flex-1" onClick={handleVerify}>Verify & Finish</Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};