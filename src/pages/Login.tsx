import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { sketchInput, sketchCard, sketchBtnPrimary } from '../lib/sketchStyles';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-paper p-4">
            <div className={`${sketchCard} p-8 w-full max-w-md`}>
                <img
                    src="/logo-k.png"
                    alt="Kylie Schedule"
                    className="h-14 w-14 object-contain mx-auto mb-4"
                />
                <h1 className="font-marker text-4xl font-bold text-center text-accent mb-2">
                    {isLogin ? 'Welcome Back! 💃' : 'Join Kylie Schedule'}
                </h1>
                <p className="font-hand text-center text-ink-muted mb-6">
                    {isLogin ? 'Sign in to access your schedule' : 'Create an account to start tracking'}
                </p>

                {error && (
                    <div className="bg-highlight text-accent border border-line rounded-sketch p-3 text-sm mb-4 font-hand">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="font-hand block text-sm text-ink mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full ${sketchInput}`}
                            required
                        />
                    </div>
                    <div>
                        <label className="font-hand block text-sm text-ink mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full ${sketchInput}`}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`${sketchBtnPrimary} w-full py-3`}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="font-hand text-sm text-annotation hover:underline decoration-dashed underline-offset-2"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
