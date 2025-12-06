import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Landmark, ArrowLeft } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function SignupPage() {
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard/visual');
    } catch (error) {
      console.error("Signup failed", error);
      alert("Signup failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gov-bg flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </NavLink>
          <div>
            <h2 className="font-bold text-slate-800 text-sm md:text-base">Sign Up</h2>
          </div>
        </div>
      </nav>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Landmark size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Join the Community</h1>
          <p className="text-slate-500 mb-8">Create your SubaybayPH account</p>
          
          <div className="space-y-4">
            <button onClick={handleGoogleSignup} className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              <span>Sign up with Google</span>
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-sm"><span class="px-2 bg-white text-slate-500">Or</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-blue" />
              <input type="text" placeholder="Last Name" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-blue" />
            </div>
            <input type="email" placeholder="Email address" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-blue" />
            <input type="password" placeholder="Create Password" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-blue" />
            
            <button className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors">
              Create Account
            </button>
          </div>
          
          <p className="mt-6 text-sm text-slate-500">
            Already have an account? <NavLink to="/login" className="text-gov-blue font-bold hover:underline">Sign In</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}
