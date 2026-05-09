import React from 'react';
import { Car, Hotel, MapPin, Calendar, User, ShieldCheck, Briefcase, Clock, CheckCircle } from 'lucide-react';

export const VendorView = ({ bookings, user, acceptBooking, markDelivered }) => {
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const myActiveJobs = bookings.filter(b => b.status === 'accepted' && b.vendorId === user?.uid);
  const myCompletedJobs = bookings.filter(b => b.status === 'delivered' && b.vendorId === user?.uid);

  const BookingCard = ({ booking, actionBtn }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600 shrink-0 mt-1">
          {booking.serviceType === 'cabs' && <Car size={24} />}
          {booking.serviceType === 'hotels' && <Hotel size={24} />}
          {booking.serviceType === 'guides' && <MapPin size={24} />}
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 capitalize">{booking.serviceType} Request</h3>
          <div className="text-sm text-gray-600 mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            <span className="flex items-center gap-1"><MapPin size={14} className="text-gray-400" /> {booking.location}</span>
            <span className="flex items-center gap-1"><Calendar size={14} className="text-gray-400" /> {booking.date}</span>
            <span className="flex items-center gap-1"><User size={14} className="text-gray-400" /> Customer: {booking.customerEmail}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Posted: {new Date(booking.timestamp).toLocaleString()}</p>
        </div>
      </div>
      <div className="w-full sm:w-auto shrink-0">
        {actionBtn}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
            <p className="text-gray-500">Manage your service requests and active jobs.</p>
          </div>
          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-indigo-200">
            <ShieldCheck size={20} /> Verified Vendor
          </div>
        </div>

        <div className="space-y-12">
          {/* Active Jobs */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
              <Briefcase className="text-blue-600" /> My Active Jobs ({myActiveJobs.length})
            </h2>
            {myActiveJobs.length === 0 ? (
              <p className="text-gray-500 italic bg-white p-6 rounded-xl border border-gray-200">No active jobs right now. Accept a request below to get started!</p>
            ) : (
              <div className="space-y-4">
                {myActiveJobs.map(booking => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    actionBtn={
                      <button 
                        onClick={() => markDelivered(booking.id)}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} /> Finish & Deliver Job
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* Available Requests */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
              <Clock className="text-yellow-600" /> Available Requests ({pendingBookings.length})
            </h2>
            {pendingBookings.length === 0 ? (
              <p className="text-gray-500 italic bg-white p-6 rounded-xl border border-gray-200">No pending requests available in your area.</p>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map(booking => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    actionBtn={
                      <button 
                        onClick={() => acceptBooking(booking.id)}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-colors"
                      >
                        Accept Job
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* Completed Jobs */}
          {myCompletedJobs.length > 0 && (
            <section className="opacity-75">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                <CheckCircle className="text-green-600" /> Completed Jobs ({myCompletedJobs.length})
              </h2>
              <div className="space-y-4">
                {myCompletedJobs.map(booking => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    actionBtn={<span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={16}/> Delivered</span>}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
