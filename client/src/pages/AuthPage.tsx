import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Card, Input, Button } from '../components/ui';
import { KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const AuthPage = () => {
    const { login, recover } = useContext(AuthContext);
    const [view, setView] = useState<'login' | 'recover'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [recoveryKey, setRecoveryKey] = useState('');
    const [showPass, setShowPass] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await login(username.trim(), password);
            if (success) {
                const storedToken = sessionStorage.getItem('sh_token');
                let role = '';
                if (storedToken) {
                    try {
                        const payload = JSON.parse(atob(storedToken.split('.')[1]));
                        role = payload.role;
                    } catch { /* fallback */ }
                }
                if (role === 'ADMIN') {
                    navigate('/admin');
                } else if (role === 'VOLUNTEER_APPROVED') {
                    navigate('/volunteer/dashboard');
                } else {
                    navigate('/seeker/dashboard');
                }
            } else {
                setError('Invalid username or password.');
            }
        } catch (err: any) {
            setError(err?.message || 'System error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecover = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!recoveryKey.trim().includes(' ')) {
            setError('Recovery key should be your 12-word phrase.');
            return;
        }
        setIsLoading(true);
        try {
            await recover(username, recoveryKey, password);
            navigate('/seeker/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid username or recovery key.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-8 sm:py-16 px-4">
            <Card className="p-5 sm:p-8 shadow-xl">
                {view === 'login' ? (
                    <>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center dark:text-white">Welcome Back</h2>
                        <p className="text-center text-gray-500 mb-6 sm:mb-8 text-sm">Enter your anonymous credentials.</p>
                        <form onSubmit={handleLogin} className="space-y-5">
                            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your pseudonym" />
                            <div className="relative">
                                <Input label="Password" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-1 top-[24px] sm:top-[28px] w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label={showPass ? "Hide password" : "Show password"}>
                                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            
                            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg text-sm text-center">{error}</div>}
                            
                            <Button type="submit" className="w-full h-12 text-base sm:text-lg" isLoading={isLoading}>Log In</Button>
                        </form>
                        
                        <div className="mt-6 flex justify-between items-center text-sm">
                            <button onClick={() => { setView('recover'); setError(''); setPassword(''); }} className="min-h-[44px] flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Forgot Password?</button>
                            <Link to="/auth/signup" className="min-h-[44px] flex items-center text-primary-600 font-bold hover:underline">Create Account</Link>
                        </div>
                    </>
                ) : (
                    <>
                        <button onClick={() => { setView('login'); setError(''); setPassword(''); }} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900 dark:text-gray-400 min-h-[44px]"><ArrowLeft size={16}/> Back to Login</button>
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 dark:text-white"><KeyRound className="text-primary-500" /> Account Recovery</h2>
                        <p className="text-gray-500 mb-6 text-sm">Enter the 12-word recovery phrase you received during registration to reset your password.</p>
                        
                        <form onSubmit={handleRecover} className="space-y-5">
                            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your account name" required />
                            <Input label="12-Word Recovery Phrase" value={recoveryKey} onChange={(e) => setRecoveryKey(e.target.value)} placeholder="word1 word2 word3..." required />
                            <div className="relative">
                                <Input label="New Password" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-1 top-[24px] sm:top-[28px] w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label={showPass ? "Hide password" : "Show password"}>
                                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            
                            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg text-sm text-center">{error}</div>}
                            
                            <Button type="submit" className="w-full h-12 text-base sm:text-lg" isLoading={isLoading}>Reset Password & Log In</Button>
                        </form>
                    </>
                )}
            </Card>
        </div>
    );
};