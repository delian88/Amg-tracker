import React from 'react';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (user) return <Navigate to="/" />;

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists
      const userDoc = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDoc);

      if (!docSnap.exists()) {
        // Create initial profile
        await setDoc(userDoc, {
          uid: user.uid,
          name: user.displayName || 'Anonymous',
          email: user.email,
          role: 'team_member', // Default role
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
        });
      }

      navigate('/');
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-6 shadow-lg shadow-indigo-200">
              A
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">AMG Project Tracker</h1>
            <p className="text-slate-500">Azariah Management Group Enterprise Portal</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-medium">Enterprise Access Only</span>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 leading-relaxed">
              By signing in, you agree to Azariah Management Group's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-sm text-slate-500">
          Need help? <a href="#" className="text-indigo-600 font-medium hover:underline">Contact IT Support</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
