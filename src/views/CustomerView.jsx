import React, { useState } from 'react';
import { Plane, Car, Hotel, User, MapPin, Calendar, Clock, Briefcase } from 'lucide-react';

export const CustomerView = ({ bookings, user, profile, showToast, setIsAuthModalOpen, createBooking }) => {
  const [activeTab, setActiveTab] = useState('cabs');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');

  const handleBook = () => {
    if (!location || !date) {
      showToast('Please fill in all details', 'error');
      return;
    }
    createBooking(activeTab, location, date);
    setLocation('');
    setDate('');
  };

  const myBookings = bookings.filter(b => b.customerId === user?.uid);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* MMT Style Hero Section */}
      <div className="bg-gradient-to-b from-[#0a1429] to-[#124289] pt-20 pb-48 px-4 sm:px-8 relative">
        <div className="max-w-6xl mx-auto text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Book Services Instantly</h1>
          <p className="text-blue-100 text-lg">Trusted vendors for your travel and local needs.</p>
        </div>
      </div>

      {/* Floating Search/Booking Widget */}
      <div className="max-w-5xl mx-auto -mt-32 px-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-2 sm:p-6 mb-10">
          {/* Tabs */}
          <div className="flex justify-center border-b border-gray-100 mb-6 gap-2 sm:gap-8 pb-4">
            {[
              { id: 'cabs', icon: Car, label: 'Airport Cabs' },
              { id: 'hotels', icon: Hotel, label: 'Hotels' },
              { id: 'guides', icon: MapPin, label: 'Local Guides' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-3 sm:px-6 sm:py-3 rounded-xl transition-all ${activeTab === tab.id ? 'text-blue-600 bg-blue-50 shadow-sm font-bold' : 'text-gray-500 hover:text-blue-500 hover:bg-gray-50 font-medium'}`}
              >
                <tab.icon size={24} className="mb-1" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
                <MapPin size={12} /> Location / Destination
              </label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai Airport" 
                className="w-full text-lg font-bold text-gray-800 outline-none placeholder-gray-300 bg-transparent"
              />
            </div>
            <div className="border border-gray-200 rounded-lg p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
                <Calendar size={12} /> Date of Service
              </label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-lg font-bold text-gray-800 outline-none bg-transparent"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleBook}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-xl py-4 rounded-xl shadow-lg transform transition active:scale-95"
              >
                SEARCH & BOOK
              </button>
            </div>
          </div>
        </div>

        {/* Customer Dashboard - My Bookings */}
        {profile && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Briefcase className="text-blue-600" /> My Recent Bookings
            </h2>
            
            {myBookings.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center border border-gray-200 shadow-sm">
                <Clock className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium text-lg">No bookings yet. Start by booking a service above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myBookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      {booking.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200">Pending</span>}
                      {booking.status === 'accepted' && <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">Vendor Assigned</span>}
                      {booking.status === 'delivered' && <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">Completed</span>}
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                        {booking.serviceType === 'cabs' && <Car size={24} />}
                        {booking.serviceType === 'hotels' && <Hotel size={24} />}
                        {booking.serviceType === 'guides' && <MapPin size={24} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 capitalize">{booking.serviceType} Booking</h3>
                        <p className="text-sm text-gray-500">{new Date(booking.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500 block text-xs uppercase font-bold">Location</span>
                        <span className="font-semibold text-gray-800">{booking.location}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs uppercase font-bold">Date</span>
                        <span className="font-semibold text-gray-800">{booking.date}</span>
                      </div>
                    </div>

                    {booking.vendorId && (
                       <div className="mt-4 border-t border-gray-100 pt-3 flex items-center gap-2 text-sm">
                         <User size={16} className="text-gray-400" />
                         <span className="text-gray-600">Assigned Vendor ID: <span className="font-mono text-xs">{booking.vendorId.slice(0,6)}...</span></span>
                       </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
