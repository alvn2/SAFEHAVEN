import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { StorageService } from '../lib/storage';
import { Card, Input, Button } from '../components/ui';
import { KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const AuthPage = () => {
    const { login } = useContext(AuthContext);
    const [view, setView] = useState<'login' | 'recover'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    
    // Recovery State
    const [challengeIndex, setChallengeIndex] = useState<number | null>(null);
    const [recoveryWord, setRecoveryWord] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            if (login(username, password)) {
                const user = StorageService.login(username, password);
                if (user?.role === 'ADMIN') navigate('/developer');
                else if (user?.role === 'VOLUNTEER_APPROVED') navigate('/volunteer/dashboard');
                else navigate('/seeker/dashboard');
            } else {
                setError('Invalid username or password.');
            }
        } catch (err) {
            setError('System error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const initRecovery = () => {
        if (!username) {
            setError('Please enter your username above first.');
            return;
        }
        const data = StorageService.initiateRecovery(username);
        if (data) {
            setChallengeIndex(data.challengeIndex);
            setView('recover');
            setError('');
        } else {
            setError('User not found.');
        }
    };

    const handleRecoverySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (challengeIndex === null) return;
        
        const success = StorageService.verifyRecovery(username, recoveryWord, challengeIndex, newPassword);
        
        if (success) {
            setSuccessMsg('Password reset successful! Logging you in...');
            setTimeout(() => {
                setView('login');
                setPassword('');
                setSuccessMsg('');
            }, 2000);
        } else {
            setError('Incorrect recovery word. Please check your phrase backup.');
        }
    };

    return (
        <div className="max-w-md mx-auto py-16 px-4">
            <Card className="p-8 shadow-xl">
                {view === 'login' ? (
                    <>
                        <h2 className="text-3xl font-bold mb-2 text-center dark:text-white">Welcome Back</h2>
                        <p className="text-center text-gray-500 mb-8">Enter your anonymous credentials.</p>
                        <form onSubmit={handleLogin} className="space-y-5">
                            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your pseudonym" />
                            <div className="relative">
                                <Input label="Password" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600">
                                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            
                            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg text-sm text-center">{error}</div>}
                            {successMsg && <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg text-sm text-center">{successMsg}</div>}
                            
                            <Button type="submit" className="w-full h-12 text-lg" isLoading={isLoading}>Log In</Button>
                        </form>
                        
                        <div className="mt-6 flex justify-between items-center text-sm">
                            <button onClick={initRecovery} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Forgot Password?</button>
                            <Link to="/auth/signup" className="text-primary-600 font-bold hover:underline">Create Account</Link>
                        </div>
                    </>
                ) : (
                    <>
                        <button onClick={() => setView('login')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900 dark:text-gray-400"><ArrowLeft size={16}/> Back to Login</button>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 dark:text-white"><KeyRound className="text-primary-500" /> Account Recovery</h2>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 text-sm text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-900">
                            <p className="font-bold mb-1">Security Challenge</p>
                            To verify it's you, please enter <span className="font-bold underline">Word #{challengeIndex! + 1}</span> from your 12-word recovery phrase.
                        </div>

                        <form onSubmit={handleRecoverySubmit} className="space-y-5">
                            <Input 
                                label={`Enter Word #${challengeIndex! + 1}`} 
                                value={recoveryWord} 
                                onChange={(e) => setRecoveryWord(e.target.value)} 
                                placeholder="e.g. apple" 
                                className="font-mono"
                                required
                            />
                            <Input 
                                label="Set New Password" 
                                type="password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                placeholder="Create a strong password"
                                required 
                            />
                            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">{error}</div>}
                            <Button type="submit" className="w-full h-12">Reset Password</Button>
                        </form>
                    </>
                )}
            </Card>
        </div>
    );
};