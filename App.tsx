
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { SERVICE_CATEGORIES } from './data/categories';
import { MOCK_PROVIDERS, MOCK_BOOKINGS, MOCK_USERS } from './data/mockData';
import { Provider, Booking, User, ServiceCategory } from './types';
import { ServiceCard } from './components/ServiceCard';
import { SkeletonServiceCard } from './components/SkeletonServiceCard';
import LoginPageComponent from './pages/Login';

// --- Shared Components ---

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 group"
    >
      <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
        ←
      </div>
      <span className="text-sm font-semibold tracking-wide">Go Back</span>
    </button>
  );
};

const Navbar: React.FC<{ currentUser: User | null; onLogout: () => void }> = ({ currentUser, onLogout }) => {
  return (
    <nav className="bg-white/80 backdrop-blur border-b border-sky-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-sm">
                LS
              </span>
              <span className="text-lg font-black text-slate-900">LocalServe</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="px-3 py-2 rounded-xl text-slate-600 hover:bg-sky-50 hover:text-indigo-700 transition-colors font-medium">
              Home
            </Link>

            {(!currentUser || currentUser.role === 'Customer') && (
              <Link to="/search" className="px-3 py-2 rounded-xl text-slate-600 hover:bg-sky-50 hover:text-indigo-700 transition-colors font-medium">
                Find Service
              </Link>
            )}

            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-xl font-bold transition-all bg-sky-50 text-sky-700 hover:bg-sky-100"
                >
                  {currentUser.role === 'Admin'
                    ? 'Admin Console'
                    : currentUser.role === 'Provider'
                      ? 'Provider Console'
                      : 'My Dashboard'}
                </Link>

                <div className="flex items-center gap-3 pl-4 border-l border-sky-100">
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800 leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{currentUser.role}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 hover:bg-rose-50 rounded-xl text-rose-500 transition-colors"
                    title="Logout"
                  >
                    <span className="text-lg">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-xl text-slate-600 font-semibold hover:bg-sky-50 hover:text-indigo-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/join"
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p className="text-slate-500 text-sm">© 2024 LocalServe App. Trusted by 5,000+ neighbors.</p>
    </div>
  </footer>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'Accepted': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Rejected': 'bg-rose-100 text-rose-700 border-rose-200',
    'Completed': 'bg-indigo-100 text-indigo-700 border-indigo-200'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
};

// --- Role Dashboards ---

const CustomerDashboard: React.FC<{ user: User; bookings: Booking[] }> = ({ user, bookings }) => {
  const navigate = useNavigate();
  const myBookings = bookings.filter(b => b.customerId === user.id);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-2 font-medium">You have {myBookings.filter(b => b.status === 'Pending').length} pending requests.</p>
        </div>
        <button onClick={() => navigate('/search')} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:scale-105 transition-transform">
          + Book New Service
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">My Activity</h2>
              <span className="text-xs font-bold text-slate-400">Showing last {myBookings.length} bookings</span>
            </div>
            <div className="divide-y divide-slate-50">
              {myBookings.length > 0 ? myBookings.map(b => (
                <div key={b.id} className="p-8 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-black text-lg text-slate-800">{b.providerName}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-sm font-bold text-indigo-600">{b.category} Service</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      {b.date} • {b.timeSlot}
                    </p>
                    <p
                      className="text-xs text-slate-500 mt-2"
                      title={b.problemDescription}
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {b.problemDescription}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">{b.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Details</button>
                    {b.status === 'Accepted' && <button className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl transition-colors">Contact</button>}
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center">
                  <p className="text-slate-300 font-bold text-lg">No bookings yet.</p>
                  <p className="text-slate-400 text-sm mt-1">Hire your first professional today!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white">
            <h3 className="text-xl font-black mb-4">Quick Tip</h3>
            <p className="opacity-80 text-sm leading-relaxed mb-6">Always verify the professional's ID card when they arrive at your location for safety.</p>
            <button className="w-full bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold transition-colors">Safety Guide</button>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 mb-4">Support</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-colors">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-bold text-sm">Live Chat</p>
                  <p className="text-xs text-slate-400">Average response: 5 mins</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-colors">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="font-bold text-sm">Help Center</p>
                  <p className="text-xs text-slate-400">FAQs and Guides</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProviderDashboard: React.FC<{
  user: User;
  providers: Provider[];
  bookings: Booking[];
  onStatusChange: (id: string, s: Booking['status']) => void;
  onUpdateProvider: (id: string, patch: Partial<Provider>) => void;
  onAddProvider: (p: Provider) => void;
}> = ({ user, providers, bookings, onStatusChange, onUpdateProvider, onAddProvider }) => {
  const myListings = providers.filter(p => p.ownerUserId === user.id);
  const listingById = new Map<string, Provider>(myListings.map(l => [l.id, l]));

  const myRequests = bookings.filter(b => b.providerOwnerId === user.id);

  const earnings = myRequests
    .filter(b => b.status === 'Accepted' || b.status === 'Completed')
    .reduce((sum, b) => sum + (listingById.get(b.providerId)?.pricePerVisit ?? 0), 0 as number);

  const avgRating = myListings.length ? myListings.reduce((s, p) => s + p.rating, 0) / myListings.length : 0;
  const pendingCount = myRequests.filter(b => b.status === 'Pending').length;

  const [edits, setEdits] = useState<Record<string, { pricePerVisit: number; availability: Provider['availability'] }>>({});
  useEffect(() => {
    setEdits(
      Object.fromEntries(
        myListings.map(l => [
          l.id,
          {
            pricePerVisit: l.pricePerVisit,
            availability: l.availability,
          },
        ]),
      ),
    );
  }, [myListings]);

  const [newService, setNewService] = useState({
    category: 'Plumber' as ServiceCategory,
    pricePerVisit: '',
    location: '',
    phoneNumber: '',
    experienceYears: 5,
    description: '',
  });

  const createNewService = () => {
    const pricePerVisit = clampInt(Number(newService.pricePerVisit) || 0, 200, 1500);
    const experienceYears = clampInt(Number(newService.experienceYears) || 5, 1, 15);
    const distanceKm = round1(0.5 + Math.random() * 10);
    const rating = round1(3.5 + Math.random() * 1.5);

    const provider: Provider = {
      id: `prov-${Date.now()}`,
      ownerUserId: user.id,
      name: user.name,
      category: newService.category,
      experienceYears,
      rating,
      reviewsCount: 0,
      pricePerVisit,
      location: newService.location,
      distanceKm,
      availability: 'Available today',
      phoneNumber: newService.phoneNumber,
      description:
        newService.description ||
        `Local ${newService.category.toLowerCase()} specialist with ${experienceYears} years of experience.`,
      image: `https://source.unsplash.com/400x400/?${newService.category.toLowerCase().replace(/\s+/g, '+')},professional&sig=${
        Date.now() % 10000
      }`,
    };

    onAddProvider(provider);
    setNewService({
      category: 'Plumber' as ServiceCategory,
      pricePerVisit: '',
      location: '',
      phoneNumber: '',
      experienceYears: 5,
      description: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in slide-in-from-bottom duration-500">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Professional Console</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your services & incoming bookings, {user.name}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Total Earnings</p>
          <p className="text-4xl font-black text-slate-800">₹{earnings}</p>
          <div className="mt-4 text-emerald-500 text-xs font-bold">Based on accepted/completed jobs</div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Average Rating</p>
          <p className="text-4xl font-black text-slate-800">{avgRating.toFixed(1)}</p>
          <div className="mt-4 text-indigo-500 text-xs font-bold">
            ⭐ Across your {myListings.length} services
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">New Requests</p>
          <p className="text-4xl font-black text-slate-800">{pendingCount}</p>
          <div className="mt-4 text-slate-400 text-xs font-bold">Respond to pending bookings</div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-xl font-black text-slate-800">Your Services</h2>
          <span className="bg-sky-50 text-sky-700 border border-sky-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
            {myListings.length} listings
          </span>
        </div>

        <div className="p-8 grid gap-6 md:grid-cols-2">
          {myListings.length > 0 ? (
            myListings.map(l => (
              <div key={l.id} className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-6">
                <div className="flex items-center gap-4">
                  <img src={l.image} alt={l.name} className="w-14 h-14 rounded-full object-cover shadow-sm ring-1 ring-sky-100 bg-sky-50" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {SERVICE_CATEGORIES.find(c => c.name === l.category)?.icon ?? '🛠️'}
                      </span>
                      <div className="font-black text-slate-800">{l.category}</div>
                    </div>
                    <div className="text-xs font-bold text-slate-400 mt-1">Phone: {l.phoneNumber}</div>
                  </div>
                </div>

                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Price (₹/visit)</label>
                    <input
                      type="number"
                      value={edits[l.id]?.pricePerVisit ?? l.pricePerVisit}
                      onChange={e =>
                        setEdits(prev => ({
                          ...prev,
                          [l.id]: { availability: edits[l.id]?.availability ?? l.availability, pricePerVisit: Number(e.target.value) },
                        }))
                      }
                      className="w-full p-3 bg-white border-none rounded-2xl outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Availability</label>
                    <select
                      value={edits[l.id]?.availability ?? l.availability}
                      onChange={e =>
                        setEdits(prev => ({
                          ...prev,
                          [l.id]: { pricePerVisit: edits[l.id]?.pricePerVisit ?? l.pricePerVisit, availability: e.target.value as any },
                        }))
                      }
                      className="w-full p-3 bg-white border-none rounded-2xl outline-none font-bold"
                    >
                      {(['Available today', 'Busy', 'Available tomorrow'] as Provider['availability'][]).map(a => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      const nextPrice = clampInt(edits[l.id]?.pricePerVisit ?? l.pricePerVisit, 200, 1500);
                      const nextAvailability = edits[l.id]?.availability ?? l.availability;
                      onUpdateProvider(l.id, { pricePerVisit: nextPrice, availability: nextAvailability });
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:shadow-lg transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-slate-50 border border-slate-100 rounded-[2rem] p-10 text-center">
              <div className="text-4xl mb-3">🛠️</div>
              <div className="font-black text-slate-800">No services yet.</div>
              <div className="text-sm text-slate-500 mt-2">Add your first service listing below.</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-xl font-black text-slate-800">Add New Service</h2>
        </div>
        <div className="p-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Category</label>
              <select
                value={newService.category}
                onChange={e => setNewService(prev => ({ ...prev, category: e.target.value as ServiceCategory }))}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold"
              >
                {SERVICE_CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Price (₹/visit)</label>
              <input
                type="number"
                value={newService.pricePerVisit}
                onChange={e => setNewService(prev => ({ ...prev, pricePerVisit: e.target.value }))}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Experience (years)</label>
              <input
                type="number"
                value={newService.experienceYears}
                onChange={e => setNewService(prev => ({ ...prev, experienceYears: Number(e.target.value) }))}
                min={1}
                max={15}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Area location</label>
              <input
                value={newService.location}
                onChange={e => setNewService(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold"
                placeholder="e.g. Andheri"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Phone number</label>
              <input
                value={newService.phoneNumber}
                onChange={e => setNewService(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold"
                placeholder="+91 9XXXXXXXXX"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Description</label>
              <textarea
                value={newService.description}
                onChange={e => setNewService(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none resize-none font-medium"
                placeholder="Short service description"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={createNewService}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:shadow-lg transition-all"
            >
              Add Listing
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-xl font-black text-slate-800">Incoming Bookings</h2>
          <div className="flex gap-2">
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
              {pendingCount} Pending
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Issue</th>
                <th className="px-8 py-5">Schedule</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myRequests.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-800">{b.customerName}</td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-slate-500 max-w-[280px] truncate" title={b.problemDescription}>
                      {b.problemDescription}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{b.address}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-700">{b.date}</p>
                    <p className="text-xs text-slate-400">{b.timeSlot}</p>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    {b.status === 'Pending' ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => onStatusChange(b.id, 'Accepted')}
                          className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:shadow-lg transition-all"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => onStatusChange(b.id, 'Rejected')}
                          className="bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:shadow-lg transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {myRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-bold italic">
                    No incoming bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<{
  users: User[];
  bookings: Booking[];
  providers: Provider[];
  onDeleteProvider: (id: string) => void;
}> = ({ users, bookings, providers, onDeleteProvider }) => {
  const categoryCounts = providers.reduce((acc: Record<string, number>, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const uniqueCategories = Object.keys(categoryCounts).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Admin Console</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage providers, bookings, and platform stats</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Providers', val: providers.length, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Total Bookings', val: bookings.length, color: 'text-indigo-700', bg: 'bg-indigo-50' },
          { label: 'Categories', val: uniqueCategories, color: 'text-sky-700', bg: 'bg-sky-50' },
          { label: 'Total Users', val: users.length, color: 'text-slate-800', bg: 'bg-slate-100' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-3xl border border-transparent`}>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
        <div className="p-8 border-b border-slate-50 font-black text-xl">Category Breakdown</div>
        <div className="p-8 flex flex-wrap gap-3">
          {(Object.entries(categoryCounts) as [string, number][])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([cat, count]) => {
              const meta = SERVICE_CATEGORIES.find(c => c.name === cat);
              return (
                <span
                  key={cat}
                  className="px-4 py-2 rounded-full border border-slate-100 bg-slate-50 text-slate-700 text-xs font-black"
                >
                  {meta?.icon ?? '🧾'} {cat}: {count}
                </span>
              );
            })}
          {Object.keys(categoryCounts).length > 10 && (
            <span className="text-sm font-bold text-slate-400 mt-2">+ More categories</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
        <div className="p-8 border-b border-slate-50 font-black text-xl">Providers</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">Provider</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Rating</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Availability</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {providers.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-sky-100 bg-sky-50" />
                      <div>
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-800">
                    {SERVICE_CATEGORIES.find(c => c.name === p.category)?.icon ?? '🛠️'} {p.category}
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-800">{p.rating.toFixed(1)}</div>
                    <div className="text-xs text-slate-400">{p.reviewsCount} reviews</div>
                  </td>
                  <td className="px-8 py-6 font-black text-indigo-700">₹{p.pricePerVisit}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                      p.availability === 'Available today'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : p.availability === 'Available tomorrow'
                          ? 'bg-sky-50 text-sky-700 border-sky-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {p.availability}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => {
                        const ok = window.confirm(`Delete provider listing "${p.name}" (${p.category})?`);
                        if (ok) onDeleteProvider(p.id);
                      }}
                      className="bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:shadow-lg transition-all"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {providers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-300 font-bold italic">
                    No providers available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 font-black text-xl">All Bookings</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">Provider</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Schedule</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-800">
                    {SERVICE_CATEGORIES.find(c => c.name === b.category)?.icon ?? '🛠️'} {b.providerName}
                    <div className="text-xs text-slate-400">{b.category}</div>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-800">{b.customerName}</td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-slate-700">{b.date}</div>
                    <div className="text-xs text-slate-400">{b.timeSlot}</div>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-bold italic">
                    No bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main App Logic ---

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <section className="bg-indigo-600 text-white py-24 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-6xl font-black mb-8 leading-tight">Expert help for your home.</h1>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto font-light">Find trusted plumbers, electricians, and professionals in your neighborhood within minutes.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/search')} className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:-translate-y-1">Find a Professional</button>
            <button onClick={() => navigate('/join')} className="bg-indigo-500/50 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-bold text-lg border border-indigo-400 hover:bg-indigo-400 transition-all">Join as a Provider</button>
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {SERVICE_CATEGORIES.map(cat => (
            <div key={cat.name} onClick={() => navigate(`/search?category=${cat.name}`)} className="bg-white p-8 rounded-[2.5rem] text-center border border-slate-100 hover:border-indigo-200 hover:shadow-xl cursor-pointer transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">{cat.icon}</div>
              <h3 className="font-bold text-slate-800 text-sm">{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const LoginPage: React.FC<{ onLogin: (user: User) => void; users?: User[] }> = ({ onLogin }) => {
  return <LoginPageComponent onLogin={onLogin} />;
};

const JoinPage: React.FC<{
  onRegisterUser: (u: User) => void;
  onRegisterProvider: (p: Provider) => void;
}> = ({ onRegisterUser, onRegisterProvider }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'Customer' | 'Provider'>('Customer');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    category: 'Plumber' as ServiceCategory,
    pricePerVisit: '',
    location: '',
    phoneNumber: '',
    experienceYears: 5,
    description: '',
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();

    const userId = `u${Date.now()}`;
    const newUser: User = { id: userId, name: form.name, email: form.email, role };
    onRegisterUser(newUser);

    if (role === 'Provider') {
      const exp = clampInt(form.experienceYears, 1, 15);
      const distanceKm = round1(1 + Math.random() * 12.5);
      const rating = round1(3.5 + Math.random() * 1.5);
      const reviewsCount = Math.floor(Math.random() * 120);

      onRegisterProvider({
        id: `prov-${Date.now()}`,
        ownerUserId: userId,
        name: form.name,
        category: form.category,
        experienceYears: exp,
        rating,
        reviewsCount,
        pricePerVisit: Math.max(200, Math.min(1500, Number(form.pricePerVisit) || 0)),
        location: form.location,
        distanceKm,
        availability: 'Available today',
        phoneNumber: form.phoneNumber,
        description:
          form.description ||
          `Local ${form.category.toLowerCase()} specialist with ${exp} years of experience. Prompt service and clear communication.`,
        image: `https://source.unsplash.com/400x400/?${form.category.toLowerCase().replace(/\s+/g, '+')},professional&sig=${
          Date.now() % 10000
        }`,
      });
    }
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <BackButton />
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-100">
        <div className="lg:w-1/3 bg-indigo-600 p-12 text-white">
          <h2 className="text-3xl font-black mb-8 leading-tight">Join our growing community</h2>
          <div className="space-y-4">
            <button
              onClick={() => setRole('Customer')}
              className={`w-full text-left p-6 rounded-2xl border transition-all ${
                role === 'Customer' ? 'bg-white text-indigo-600 font-bold' : 'border-white/20 hover:bg-white/10'
              }`}
            >
              👤 I'm a Customer
            </button>
            <button
              onClick={() => setRole('Provider')}
              className={`w-full text-left p-6 rounded-2xl border transition-all ${
                role === 'Provider' ? 'bg-white text-indigo-600 font-bold' : 'border-white/20 hover:bg-white/10'
              }`}
            >
              🛠️ I'm a Professional
            </button>
          </div>
        </div>
        <div className="lg:w-2/3 p-12">
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <input
                required
                placeholder="Full Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full p-4 bg-slate-50 border-none rounded-xl outline-none"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full p-4 bg-slate-50 border-none rounded-xl outline-none"
              />
            </div>

            {role === 'Provider' && (
              <div className="grid sm:grid-cols-2 gap-6 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as ServiceCategory })}
                  className="w-full p-4 bg-white border-none rounded-xl outline-none font-bold"
                >
                  {SERVICE_CATEGORIES.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>

                <input
                  required
                  type="number"
                  min={200}
                  max={1500}
                  placeholder="Price per visit (₹)"
                  value={form.pricePerVisit}
                  onChange={e => setForm({ ...form, pricePerVisit: e.target.value })}
                  className="w-full p-4 bg-white border-none rounded-xl outline-none"
                />

                <input
                  required
                  placeholder="Area location"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full p-4 bg-white border-none rounded-xl outline-none"
                />

                <input
                  required
                  placeholder="Phone number (e.g. +91 9XXXXXXXXX)"
                  value={form.phoneNumber}
                  onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full p-4 bg-white border-none rounded-xl outline-none"
                />

                <input
                  required
                  type="number"
                  min={1}
                  max={15}
                  placeholder="Experience (years)"
                  value={form.experienceYears}
                  onChange={e => setForm({ ...form, experienceYears: Number(e.target.value) })}
                  className="w-full p-4 bg-white border-none rounded-xl outline-none"
                />

                <textarea
                  required
                  placeholder="Short description of your service"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="sm:col-span-2 w-full p-4 bg-white border-none rounded-xl outline-none resize-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-800 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-900 transition-all"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
function clampInt(n: number, min: number, max: number) {
  const v = Number.isFinite(n) ? n : min;
  return Math.max(min, Math.min(max, v));
}

const SearchPage: React.FC<{ providers: Provider[] }> = ({ providers }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const q = new URLSearchParams(location.search);

  const [query, setQuery] = useState(q.get('q') || '');
  const [area, setArea] = useState(q.get('area') || q.get('location') || '');
  const [cat, setCat] = useState<ServiceCategory | ''>((q.get('category') as ServiceCategory) || '');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Derive unique cities from providers dataset
  const cities = Array.from(
    new Set(
      providers
        .map(p => {
          const parts = p.location.split(', ');
          return parts.length >= 2 ? parts[parts.length - 1].trim() : '';
        })
        .filter(Boolean)
    )
  ).sort();

  // Filters (combine freely).
  const [minRating, setMinRating] = useState<number>(3.5);
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [maxDistance, setMaxDistance] = useState<number>(15);
  const [sortBy, setSortBy] = useState<'nearest' | 'highestRated' | 'lowestPrice'>('nearest');

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(t);
  }, [query, area, cat, selectedCity, minRating, maxPrice, maxDistance, sortBy]);

  const normalizedQuery = query.trim().toLowerCase();
  const normalizedArea = area.trim().toLowerCase();

  const filtered = providers
    .filter(p => (!cat || p.category === cat))
    .filter(p => (normalizedArea ? p.location.toLowerCase().includes(normalizedArea) : true))
    .filter(p => {
      if (!selectedCity) return true;
      const parts = p.location.split(', ');
      const providerCity = parts.length >= 2 ? parts[parts.length - 1].trim() : '';
      return providerCity.toLowerCase() === selectedCity.toLowerCase();
    })
    .filter(p => {
      if (!normalizedQuery) return true;
      const hay = `${p.name} ${p.category} ${p.location}`.toLowerCase();
      return hay.includes(normalizedQuery);
    })
    .filter(p => p.rating >= minRating)
    .filter(p => p.pricePerVisit <= maxPrice)
    .filter(p => p.distanceKm <= maxDistance);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'nearest') return a.distanceKm - b.distanceKm;
    if (sortBy === 'highestRated') return b.rating - a.rating || b.reviewsCount - a.reviewsCount || a.distanceKm - b.distanceKm;
    return a.pricePerVisit - b.pricePerVisit || b.rating - a.rating;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <BackButton />

      <div className="bg-white/80 backdrop-blur border border-sky-100 rounded-[2rem] shadow-sm p-6 sm:p-8 mb-10">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Search</label>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Provider name, service, or area"
              className="w-full p-4 bg-sky-50 border-none rounded-2xl outline-none font-bold"
            />
          </div>

          <div className="w-full lg:w-56">
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Category</label>
            <select
              value={cat}
              onChange={e => setCat(e.target.value as ServiceCategory)}
              className="w-full p-4 bg-sky-50 border-none rounded-2xl outline-none font-bold"
            >
              <option value="">All categories</option>
              {SERVICE_CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full lg:w-56">
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Area</label>
            <input
              value={area}
              onChange={e => setArea(e.target.value)}
              placeholder="e.g. Andheri"
              className="w-full p-4 bg-sky-50 border-none rounded-2xl outline-none font-bold"
            />
          </div>

          <div className="w-full lg:w-56">
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">City</label>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="w-full p-4 bg-sky-50 border-none rounded-2xl outline-none font-bold"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="w-full lg:w-56">
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Sort</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full p-4 bg-sky-50 border-none rounded-2xl outline-none font-bold"
            >
              <option value="nearest">Nearest</option>
              <option value="highestRated">Highest rated</option>
              <option value="lowestPrice">Lowest price</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Min rating</label>
            <select value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold">
              {[3.5, 4.0, 4.5].map(r => (
                <option key={r} value={r}>
                  {r}+
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Max price</label>
            <select value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold">
              {[500, 800, 1000, 1200, 1500].map(p => (
                <option key={p} value={p}>
                  ₹{p} max
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Max distance</label>
            <select value={maxDistance} onChange={e => setMaxDistance(Number(e.target.value))} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold">
              {[2, 5, 10, 15].map(d => (
                <option key={d} value={d}>
                  {d} km
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-sm font-bold text-slate-600">
            Showing <span className="text-indigo-700">{sorted.length}</span> providers
          </div>
          <button
            onClick={() => {
              setQuery('');
              setArea('');
              setCat('');
              setSelectedCity('');
              setMinRating(3.5);
              setMaxPrice(1500);
              setMaxDistance(15);
              setSortBy('nearest');
            }}
            className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            Reset filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 9 }).map((_, idx) => (
            <SkeletonServiceCard key={idx} />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sorted.length > 0 ? (
            sorted.map(p => <ServiceCard key={p.id} provider={p} onBook={() => navigate(`/book/${p.id}`)} />)
          ) : (
            <div className="md:col-span-2 lg:col-span-3 bg-white rounded-[2rem] border border-slate-100 p-14 text-center">
              <div className="text-4xl mb-3">🔎</div>
              <div className="font-black text-slate-800 text-lg">No matching providers</div>
              <div className="text-sm text-slate-500 mt-2">Try lowering rating or increasing max distance.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const BookingFlow: React.FC<{ providers: Provider[]; currentUser: User | null; onBook: (b: Booking) => void }> = ({
  providers,
  currentUser,
  onBook,
}) => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const provider = providers.find(p => p.id === providerId);
  const [submitted, setSubmitted] = useState<Booking | null>(null);

  const today = new Date();
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayStr = fmt(today);
  const tomorrowStr = fmt(new Date(today.getTime() + 86400000));

  const [form, setForm] = useState({
    date: todayStr,
    timeSlot: '09:00 - 11:00',
    address: '',
    problemDescription: '',
  });

  if (!provider) return <div className="p-20 text-center font-bold">Provider Not Found</div>;
  if (!currentUser)
    return (
      <div className="max-w-md mx-auto p-12 text-center bg-white rounded-3xl mt-12 shadow-xl border border-slate-100">
        <h2 className="text-2xl font-black mb-6">Login Required</h2>
        <p className="text-slate-500 mb-8">You need a Customer account to book a professional.</p>
        <Link to="/login" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold inline-block">
          Sign In
        </Link>
      </div>
    );

  const allowedByAvailability =
    provider.availability === 'Available today' ||
    (provider.availability === 'Available tomorrow' && form.date >= tomorrowStr);

  const timeSlotOptions = ['09:00 - 11:00', '11:00 - 13:00', '13:00 - 15:00', '15:00 - 17:00', '17:00 - 19:00'];

  const confirm = () => {
    if (!allowedByAvailability) return;
    const booking: Booking = {
      id: `b${Date.now()}`,
      providerId: provider.id,
      providerOwnerId: provider.ownerUserId,
      providerName: provider.name,
      category: provider.category,
      customerId: currentUser.id,
      customerName: currentUser.name,
      date: form.date,
      timeSlot: form.timeSlot,
      address: form.address,
      problemDescription: form.problemDescription,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    onBook(booking);
    setSubmitted(booking);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <BackButton />

      {submitted ? (
        <div className="bg-white p-16 rounded-[4rem] shadow-2xl text-center border border-slate-50">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8">
            🎉
          </div>
          <h2 className="text-4xl font-black mb-6 text-slate-800 tracking-tight">Booking Confirmed</h2>
          <p className="text-slate-500 text-lg mb-10">
            Your request is now with <span className="font-black text-slate-800">{provider.name}</span>. Status: Pending.
          </p>
          <div className="bg-sky-50 border border-sky-100 rounded-[1.5rem] p-6 text-left mb-12">
            <div className="text-sm font-bold text-slate-700">Booking ID: {submitted.id}</div>
            <div className="text-sm text-slate-500 mt-1">
              {submitted.date} • {submitted.timeSlot}
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-800 text-white px-12 py-5 rounded-2xl font-black shadow-2xl transition-all"
          >
            Go to My Dashboard
          </button>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100">
          <div className="mb-8">
            <h1 className="text-3xl font-black">Book Service</h1>
            <p className="text-slate-500 mt-2 font-medium">
              {provider.category} • {provider.experienceYears} yrs exp
            </p>
          </div>

          <div className="flex items-center gap-6 mb-10 p-6 bg-slate-50 rounded-[2rem]">
            <img src={provider.image} className="w-20 h-20 rounded-full object-cover shadow-sm ring-1 ring-sky-100 bg-sky-50" />
            <div>
              <p className="font-black text-xl">{provider.name}</p>
              <p className="text-indigo-600 font-bold">{provider.availability}</p>
              <p className="text-xs text-slate-400 mt-1 font-bold">
                {provider.distanceKm.toFixed(1)} km away • ₹{provider.pricePerVisit}/visit
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {!allowedByAvailability && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl p-4 text-sm font-bold">
                {provider.availability === 'Busy'
                  ? 'This provider is currently busy. Choose another date or provider.'
                  : 'This provider is available tomorrow. Select a later date to continue.'}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Date</label>
                <input
                  required
                  type="date"
                  value={form.date}
                  min={todayStr}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Time slot</label>
                <select
                  required
                  value={form.timeSlot}
                  onChange={e => setForm({ ...form, timeSlot: e.target.value })}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold"
                >
                  {timeSlotOptions.map(ts => (
                    <option key={ts} value={ts}>
                      {ts}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Address</label>
              <textarea
                required
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                rows={3}
                placeholder="Building / house number, street, area"
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none resize-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                Problem description
              </label>
              <textarea
                required
                value={form.problemDescription}
                onChange={e => setForm({ ...form, problemDescription: e.target.value })}
                rows={5}
                placeholder="Describe what you need (leak, installation, repair, etc.)"
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none resize-none font-medium"
              />
            </div>

            <button
              onClick={confirm}
              disabled={!allowedByAvailability}
              className={`w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-xl transition-all ${
                !allowedByAvailability ? 'opacity-60 cursor-not-allowed hover:shadow-none' : ''
              }`}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- App Hub ---

export default function App() {
  const [providers, setProviders] = useState<Provider[]>(MOCK_PROVIDERS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const registerUser = (u: User) => setUsers(prev => [...prev, u]);
  const registerProvider = (p: Provider) => setProviders(prev => [...prev, p]);
  const handleBooking = (b: Booking) => setBookings(prev => [b, ...prev]);
  const updateStatus = (id: string, s: Booking['status']) =>
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, status: s } : b)));
  const updateProvider = (id: string, patch: Partial<Provider>) =>
    setProviders(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  const deleteProvider = (id: string) => setProviders(prev => prev.filter(p => p.id !== id));
  const logout = () => setCurrentUser(null);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-100 selection:text-indigo-600">
        <Navbar currentUser={currentUser} onLogout={logout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage onLogin={setCurrentUser} users={users} />} />
            <Route path="/join" element={<JoinPage onRegisterUser={registerUser} onRegisterProvider={registerProvider} />} />
            <Route path="/search" element={<SearchPage providers={providers} />} />
            <Route path="/book/:providerId" element={<BookingFlow providers={providers} currentUser={currentUser} onBook={handleBooking} />} />
            <Route path="/dashboard" element={
              currentUser ? (
                currentUser.role === 'Admin' ? (
                  <AdminDashboard users={users} bookings={bookings} providers={providers} onDeleteProvider={deleteProvider} />
                ) : currentUser.role === 'Provider' ? (
                  <ProviderDashboard
                    user={currentUser}
                    providers={providers}
                    bookings={bookings}
                    onStatusChange={updateStatus}
                    onUpdateProvider={updateProvider}
                    onAddProvider={registerProvider}
                  />
                ) : (
                <CustomerDashboard user={currentUser} bookings={bookings} />
                )
              ) : (
                <LoginPage onLogin={setCurrentUser} users={users} />
              )
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
