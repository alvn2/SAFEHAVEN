import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Card, Input, Button } from '../components/ui';
import { KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const AuthPage = () => {
    const { login } = useContext(AuthContext);
    const [view, setView] = useState<'login' | 'recover'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await login(username, password);
            if (success) {
                // Fetch user info to determine redirect
                // The AuthContext already sets the user, we can read it after a tick
                setTimeout(() => {
                    const storedToken = sessionStorage.getItem('sh_token');
                    if (storedToken) {
                        // Decode the token to get role (simple base64 decode of payload)
                        try {
                            const payload = JSON.parse(atob(storedToken.split('.')[1]));
                            if (payload.role === 'ADMIN') navigate('/developer');
                            else if (payload.role === 'VOLUNTEER_APPROVED') navigate('/volunteer/dashboard');
                            else navigate('/seeker/dashboard');
                        } catch {
                            navigate('/seeker/dashboard');
                        }
                    } else {
                        navigate('/seeker/dashboard');
                    }
                }, 100);
            } else {
                setError('Invalid username or password.');
            }
        } catch (err) {
            setError('System error. Please try again.');
        } finally {
            setIsLoading(false);
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
                            
                            <Button type="submit" className="w-full h-12 text-lg" isLoading={isLoading}>Log In</Button>
                        </form>
                        
                        <div className="mt-6 flex justify-between items-center text-sm">
                            <span className="text-gray-400 cursor-not-allowed">Forgot Password?</span>
                            <Link to="/auth/signup" className="text-primary-600 font-bold hover:underline">Create Account</Link>
                        </div>
                    </>
                ) : (
                    <>
                        <button onClick={() => setView('login')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900 dark:text-gray-400"><ArrowLeft size={16}/> Back to Login</button>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 dark:text-white"><KeyRound className="text-primary-500" /> Account Recovery</h2>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 text-sm text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-900">
                            <p className="font-bold mb-1">Coming Soon</p>
                            Account recovery via the backend is not yet available. Please contact support.
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};