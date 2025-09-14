import React, { useState, useEffect } from 'react';
import { Splash } from './components/Splash';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { OTPVerification } from './components/OTPVerification';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { Toaster } from './components/ui/sonner';
import { auth, AuthUser } from './utils/auth';
import { api } from './utils/api';
import { userDataService } from './utils/userData';

type AppState = 'splash' | 'login' | 'signup' | 'otp' | 'profile-setup' | 'dashboard' | 'admin';

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('splash');
  const [userPhone, setUserPhone] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { user: sessionUser, token } = await auth.getSession();
      if (sessionUser && token) {
        setUser(sessionUser);
        api.setToken(token);
        setCurrentState('dashboard');
      }
    };
    
    // Delay session check until after splash
    const timer = setTimeout(checkSession, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    setIsSignUp(false);
    setCurrentState('login');
  };

  const handleSignUp = () => {
    setIsSignUp(true);
    setCurrentState('signup');
  };

  const handleLoginSubmit = (phone: string) => {
    setUserPhone(phone);
    setIsSignUp(false);
    setCurrentState('otp');
  };

  const handleSignUpSubmit = (phone: string) => {
    setUserPhone(phone);
    setIsSignUp(true);
    setCurrentState('otp');
  };

  const handleOTPVerified = async () => {
    if (isSignUp) {
      // For signup, check if phone number already exists
      const existingUser = userDataService.loginUser(userPhone);
      if (existingUser) {
        // Phone number already exists, show error
        alert('This phone number is already registered. Please use Login instead.');
        setCurrentState('splash');
        return;
      }
      // New user, proceed to profile setup
      setCurrentState('profile-setup');
    } else {
      // For login, check if user exists
      const existingUser = userDataService.loginUser(userPhone);
      if (existingUser) {
        // User exists, set in auth and go to dashboard
        auth.setCurrentUser(existingUser);
        setUser(existingUser);
        api.setToken(`mock-token-${existingUser.id}`);
        setCurrentState('dashboard');
      } else {
        // No existing user, show error
        alert('No account found with this phone number. Please sign up first.');
        setCurrentState('splash');
      }
    }
  };

  const handleProfileSetup = async (profileData: any) => {
    try {
      console.log('App: Profile setup started with data:', profileData);
      console.log('App: User phone:', userPhone);
      
      // Register user in database with phone number from OTP verification
      const userData = {
        ...profileData,
        phone: userPhone
      };
      
      console.log('App: Registering user with data:', userData);
      const newUser = userDataService.registerUser(userData);
      console.log('App: User registered successfully:', newUser);
      
      // Set user in auth service
      auth.setCurrentUser(newUser);
      
      setUser(newUser);
      setCurrentState('dashboard');
      console.log('App: Navigated to dashboard');
    } catch (error) {
      console.error('Profile setup error:', error);
      if (error instanceof Error && error.message === 'Phone number already exists') {
        alert('This phone number is already registered. Please use Login instead.');
        setCurrentState('splash');
      } else {
        alert('Registration failed. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserPhone('');
    api.setToken(null);
    setCurrentState('login');
  };

  // Secret admin access (press Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setCurrentState('admin');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="size-full bg-background">
      {currentState === 'splash' && <Splash onLogin={handleLogin} onSignUp={handleSignUp} />}
      {currentState === 'login' && <Login onSubmit={handleLoginSubmit} />}
      {currentState === 'signup' && <SignUp onSubmit={handleSignUpSubmit} />}
      {currentState === 'otp' && <OTPVerification phone={userPhone} onVerified={handleOTPVerified} />}
      {currentState === 'profile-setup' && <ProfileSetup onComplete={handleProfileSetup} />}
      {currentState === 'dashboard' && <Dashboard user={user} onLogout={handleLogout} />}
      {currentState === 'admin' && <AdminPanel />}
    </div>
  );
}
