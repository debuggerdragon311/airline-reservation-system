import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Login({ isRegistering: initialIsRegistering = false }) {
    const navigate = useNavigate()

    const [isRegistering, setIsRegistering] = useState(initialIsRegistering)
    const [isLoading, setIsLoading] = useState(false)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')

    const handleToggle = () => {
        setIsRegistering(!isRegistering)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        setIsLoading(true)
        const endpoint = isRegistering ? '/api/v1/auth/register' : '/api/v1/auth/login'
        const payload = isRegistering
            ? { firstName, lastName, email, password }
            : { email, password }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error('Authentication failed. Please check your credentials.')
            }

            const data = await response.json()

            if (data.token) {
                sessionStorage.setItem('token', data.token)//changing local storage to sessionstorage as requested by reviewer
            }

            toast.success(isRegistering ? "Welcome to the crew, traveler!" : "Login successful!")
            navigate('/flights')

        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Mockup function for social buttons
    const handleSocialMockup = (provider) => {
        toast(`Connecting to ${provider}... (Mockup)`)
    }

    return (
        // FULL SCREEN BACKGROUND: Uses your .jpeg aurora image
        <div
            className="relative flex min-h-screen w-full font-sans bg-cover bg-center"
            style={{ backgroundImage: "url('/aurora.jpeg')" }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40 z-0"></div>

            <div className="relative z-10 flex w-full min-h-screen">

                {/* LEFT PANEL - Ultra Minimalist Branding */}
                <div className="hidden lg:flex w-1/2 flex-col justify-center items-start pl-20 pr-10 text-white">
                    <p className="text-lg text-white/90 max-w-md drop-shadow-md">
                        Your journey begins here. Experience the extraordinary from the moment you log in.
                    </p>
                </div>

                {/* RIGHT PANEL - The Animated White Card */}
                <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">

                    <motion.div
                        layout
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-100"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isRegistering ? "register" : "login"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="mb-6 text-center sm:text-left">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                        {isRegistering ? 'Sign Up' : 'Sign In'}
                                    </h2>
                                    <p className="text-gray-500 text-sm">
                                        {isRegistering
                                            ? 'Enter your details to create a new account'
                                            : 'Hey enter your details to sign in to your account'}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">

                                    {/* Registration Name Fields */}
                                    {isRegistering && (
                                        <div className="flex gap-4">
                                            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-rose-600 focus-within:ring-1 focus-within:ring-rose-600 w-1/2 transition-all">
                                                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                                <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full outline-none text-gray-700 text-sm bg-transparent" />
                                            </div>
                                            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-rose-600 focus-within:ring-1 focus-within:ring-rose-600 w-1/2 transition-all">
                                                <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full outline-none text-gray-700 text-sm bg-transparent" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Email Field */}
                                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-rose-600 focus-within:ring-1 focus-within:ring-rose-600 transition-all">
                                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full outline-none text-gray-700 text-sm bg-transparent" />
                                    </div>

                                    {/* Password Field */}
                                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-rose-600 focus-within:ring-1 focus-within:ring-rose-600 transition-all">
                                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                        <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full outline-none text-gray-700 text-sm bg-transparent" />
                                    </div>

                                    {/* Rose Colored Action Button */}
                                    <button type="submit" disabled={isLoading} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 rounded-lg mt-2 transition-colors flex justify-center items-center">
                                        {isLoading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        ) : (
                                            isRegistering ? 'Sign Up' : 'Sign In'
                                        )}
                                    </button>
                                </form>

                                {/* SOCIAL LOGIN MOCKUPS */}
                                <div className="mt-6">
                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-gray-200"></div>
                                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase">Or continue with</span>
                                        <div className="flex-grow border-t border-gray-200"></div>
                                    </div>

                                    <div className="flex gap-4 mt-4">
                                        {/* Google Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleSocialMockup('Google')}
                                            className="w-1/2 flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                            </svg>
                                            <span className="text-sm font-medium text-gray-700 ml-2">Google</span>
                                        </button>

                                        {/* Apple Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleSocialMockup('Apple')}
                                            className="w-1/2 flex items-center justify-center py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.74 3.58-.8 1.58-.15 2.94.43 3.84 1.48-3.03 1.83-2.55 5.5.49 6.64-.75 1.88-1.63 3.65-2.99 4.85zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.35 2.4-1.92 4.35-3.74 4.25z"/>
                                            </svg>
                                            <span className="text-sm font-medium ml-2">Apple</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Bottom Toggle Link */}
                                <div className="mt-8 text-center text-sm text-gray-600">
                                    {isRegistering ? "Already have an account? " : "Don't have an account? "}
                                    <button type="button" onClick={handleToggle} className="text-rose-700 font-semibold hover:underline outline-none">
                                        {isRegistering ? 'Sign In' : 'Sign Up Now'}
                                    </button>
                                </div>

                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>

            </div>
        </div>
    )
}