import React, { useState, useEffect } from 'react';
import { Plane, LogOut } from 'lucide-react';

import { supabase } from './supabase/config';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { CustomerView } from './views/CustomerView';
import { VendorView } from './views/VendorView';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authStep, setAuthStep] = useState('email');
  const [authRole, setAuthRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    const fetchData = async () => {
      const { data: usersData, error: usersError } = await supabase.from('users').select('*');
      if (usersError) console.error("Error fetching users:", usersError);
      else {
        setAllUsers(usersData);
        const myProfile = usersData.find(u => u.id === user.id);
        setProfile(myProfile || null);
      }

      const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select('*').order('timestamp', { ascending: false });
      if (bookingsError) console.error("Error fetching bookings:", bookingsError);
      else setBookings(bookingsData);
    };

    fetchData();

    // Setup Realtime Subscriptions
    const channel = supabase.channel('public-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, payload => {
        fetchData(); // Refetching for simplicity
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLogin = async () => {
    if (!email.includes('@') || !password) {
      showToast('Please enter a valid email and password', 'error');
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      setIsAuthModalOpen(false);
      showToast('Logged in successfully!');
      setEmail('');
      setPassword('');
      setAuthStep('email');
    } catch (error) {
      console.error("Error logging in:", error);
      showToast(error.message || 'Login failed. Invalid credentials.', 'error');
    }
  };

  const handleSignUp = async () => {
    if (!email.includes('@') || password.length < 6) {
      showToast('Please enter a valid email and 6+ character password', 'error');
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      // If Supabase returns a session immediately, it means "Confirm Email" is turned OFF
      // in your Supabase Dashboard, so no OTP was sent! We must log them in directly.
      if (data.session) {
        const { error: upsertError } = await supabase.from('users').upsert({
          id: data.user.id,
          role: authRole,
          email: email,
          created_at: Date.now()
        });
        
        if (upsertError) throw upsertError;

        setIsAuthModalOpen(false);
        showToast(`Successfully created account as ${authRole}!`);
        setAuthMode('login');
        setEmail('');
        setPassword('');
        setProfile({ role: authRole, email: email });
      } else {
        // If no session is returned, Supabase locked the account and sent the OTP email.
        setAuthStep('otp');
        showToast('Verification code sent to your email!');
      }
    } catch (error) {
      console.error("Error signing up:", error);
      showToast(error.message || 'Failed to sign up', 'error');
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length < 6) {
      showToast('Please enter the 6-digit code', 'error');
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup'
      });
      
      if (error) throw error;

      // Update or create user profile in public users table
      const { error: upsertError } = await supabase.from('users').upsert({
        id: data.user.id,
        role: authRole,
        email: email,
        created_at: Date.now()
      });
      
      if (upsertError) throw upsertError;

      setIsAuthModalOpen(false);
      showToast(`Successfully created account as ${authRole}!`);
      setAuthMode('login');
      setAuthStep('email');
      setEmail('');
      setPassword('');
      setOtpCode('');
      
      // Update local state immediately for better UX
      setProfile({ role: authRole, email: email });
      
    } catch (error) {
      console.error("Error verifying OTP:", error);
      showToast(error.message || 'Invalid code or verification failed', 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    showToast('Logged out successfully');
  };

  const createBooking = async (serviceType, location, date) => {
    if (!profile || profile.role !== 'customer') {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const { error } = await supabase.from('bookings').insert([{
        customer_id: user.id,
        customer_email: profile.email,
        service_type: serviceType,
        location,
        date,
        status: 'pending',
        vendor_id: null,
        timestamp: Date.now()
      }]);
      
      if (error) throw error;
      
      showToast('Booking created successfully!');
    } catch (error) {
      console.error("Error creating booking:", error);
      showToast('Failed to create booking', 'error');
    }
  };

  const acceptBooking = async (bookingId) => {
    if (!profile || profile.role !== 'vendor') return;
    try {
      const { error } = await supabase.from('bookings')
        .update({ status: 'accepted', vendor_id: user.id })
        .eq('id', bookingId);
        
      if (error) throw error;
      
      showToast('Job accepted successfully!');
    } catch (error) {
      console.error("Error accepting booking:", error);
      showToast('Failed to accept job', 'error');
    }
  };

  const markDelivered = async (bookingId) => {
    if (!profile || profile.role !== 'vendor') return;
    try {
      const { error } = await supabase.from('bookings')
        .update({ status: 'delivered' })
        .eq('id', bookingId);
        
      if (error) throw error;
      
      showToast('Service marked as delivered!');
    } catch (error) {
      console.error("Error marking delivered:", error);
      showToast('Failed to update status', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin text-blue-600"><Plane size={48} /></div>
      </div>
    );
  }

  // Format bookings to match the property names used in child components
  const formattedBookings = bookings.map(b => ({
    id: b.id,
    customerId: b.customer_id,
    customerEmail: b.customer_email,
    serviceType: b.service_type,
    location: b.location,
    date: b.date,
    status: b.status,
    vendorId: b.vendor_id,
    timestamp: b.timestamp
  }));

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      <nav className="bg-white shadow-md fixed w-full top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Plane size={24} className="transform -rotate-45" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Service<span className="text-blue-600">Trip</span>
            </span>
          </div>

          <div>
            {!profile ? (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-sm transition-all"
              >
                Login / Signup
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-800 capitalize">{profile.role}</span>
                  <span className="text-xs text-gray-500">{profile.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {(!profile || profile.role === 'customer') && (
        <CustomerView 
          bookings={formattedBookings}
          user={{ uid: user?.id }} // Mock the uid to id to match child components
          profile={profile}
          showToast={showToast}
          setIsAuthModalOpen={setIsAuthModalOpen}
          createBooking={createBooking}
        />
      )}
      
      {profile?.role === 'vendor' && (
        <VendorView 
          bookings={formattedBookings}
          user={{ uid: user?.id }} // Mock the uid to id to match child components
          acceptBooking={acceptBooking}
          markDelivered={markDelivered}
        />
      )}

      <AuthModal 
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authStep={authStep}
        setAuthStep={setAuthStep}
        authRole={authRole}
        setAuthRole={setAuthRole}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        handleSignUp={handleSignUp}
        handleVerifyOTP={handleVerifyOTP}
        handleLogin={handleLogin}
      />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
    </div>
  );
}

