import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Activity, ChevronDown, Search, Filter, Clock, Tag, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';

// Module-level caches
let _cached_places = [];
let _cached_isLoading = true;

function formatTitleCase(str) {
  if (!str) return '';
  return str
    .toString()
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Nice label map for raw accessibility feature keys
const FEATURE_LABELS = {
  wheelchair: '♿ Wheelchair',
  ramp: '🔰 Ramp',
  elevator: '🛗 Elevator',
  accessible_restroom: '🚻 Restroom',
  braille: '⠿ Braille',
  hearing_support: '🔊 Hearing',
  quiet_zone: '🤫 Quiet',
  accessible_parking: '🅿️ Parking',
  accessible_seating: '💺 Seating',
  guide_rails: '🚧 Rails',
  tactile_paving: '🟡 Tactile',
};

// Robustly extract 6-digit Indian pincode (or postal code) from place object or address
const getPlacePincode = (place) => {
  if (!place) return '';
  if (place.pincode) return String(place.pincode).trim();
  if (place.postal_code) return String(place.postal_code).trim();
  if (place.pin_code) return String(place.pin_code).trim();
  const match = place.address?.match(/\b\d{6}\b/);
  return match ? match[0] : '';
};

function CircularScore({ score }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const colorClass = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500';
  const bgColorClass = score >= 80 ? 'text-emerald-500/20' : score >= 50 ? 'text-amber-500/20' : 'text-red-500/20';

  return (
    <div className="relative flex items-center justify-center w-12 h-12 flex-shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
        <circle className={bgColorClass} strokeWidth="3" stroke="currentColor" fill="transparent" r={radius} cx="22" cy="22" />
        <circle 
          className={`${colorClass} transition-all duration-1000 ease-out`} 
          strokeWidth="3" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
          stroke="currentColor" 
          fill="transparent" 
          r={radius} 
          cx="22" 
          cy="22" 
        />
      </svg>
      <span className={`absolute text-[11px] font-bold ${colorClass}`}>{score}</span>
    </div>
  );
}

function PlaceCard({ place, onSelectCategory, onSelectPincode }) {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const sortedFeatures = Object.entries(place.feature_counts || {}).sort((a, b) => b[1] - a[1]);
  const topFeatures = sortedFeatures.slice(0, 4);
  const remainingFeatures = sortedFeatures.slice(4);
  
  const displayFeatures = showAllFeatures ? sortedFeatures : topFeatures;
    
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col h-full hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors break-words">{place.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2" title={place.address}>{place.address || 'Address not provided'}</p>
        </div>
        <CircularScore score={place.access_score || 96} />
      </div>
      
      {/* Interactive Category & Pincode Badges */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelectCategory?.(place.category); }}
          title="Click to filter by this category"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 capitalize hover:bg-primary/20 transition-all cursor-pointer shadow-xs"
        >
          🏷️ {formatTitleCase(place.category)}
        </button>
        {place.pincode ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelectPincode?.(place.pincode); }}
            title="Click to filter by this pincode"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer shadow-xs"
          >
            📍 PIN: {place.pincode}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700/50">
            PIN N/A
          </span>
        )}
      </div>

      <div className="flex-1 mb-5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Verified Features</p>
        <div className="flex flex-wrap gap-1.5">
          {displayFeatures.map(([f, count]) => (
            <div key={f} className="px-2 py-1 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-100 dark:border-gray-800 rounded-md flex items-center gap-1.5 shadow-xs">
              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{FEATURE_LABELS[f] || f.replace(/_/g, ' ')}</span>
              <span className="text-[10px] text-gray-400 font-semibold">{count}</span>
            </div>
          ))}
          {!showAllFeatures && remainingFeatures.length > 0 && (
            <button 
              type="button"
              onClick={() => setShowAllFeatures(true)}
              className="px-2 py-1 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-100 dark:border-gray-800 rounded-md flex items-center justify-center shadow-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              <span className="text-[10px] text-gray-500 font-medium">+{remainingFeatures.length}</span>
            </button>
          )}
          {showAllFeatures && remainingFeatures.length > 0 && (
            <button 
              type="button"
              onClick={() => setShowAllFeatures(false)}
              className="px-2 py-1 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-100 dark:border-gray-800 rounded-md flex items-center justify-center shadow-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              <span className="text-[10px] text-gray-500 font-medium">Show Less</span>
            </button>
          )}
          {Object.keys(place.feature_counts || {}).length === 0 && (
            <span className="text-xs text-gray-400 italic">No features reported yet.</span>
          )}
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-auto">
        <div className="flex items-center -space-x-2">
          {Array.from(place.contributors || []).slice(0, 3).map((name, i) => (
            <div key={i} style={{ zIndex: 3 - i }} className="w-7 h-7 rounded-full bg-gradient-to-br from-[#155E75] to-[#0e8fa8] border-2 border-white dark:border-[#121214] flex items-center justify-center text-white text-[10px] font-bold relative shadow-xs" title={name}>
              {String(name || 'U').charAt(0).toUpperCase()}
            </div>
          ))}
          {(place.contributors?.size || 0) > 3 && (
            <div style={{ zIndex: 0 }} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-[#121214] flex items-center justify-center text-gray-600 dark:text-gray-300 text-[10px] font-bold relative shadow-xs">
              +{place.contributors.size - 3}
            </div>
          )}
        </div>
        <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(place.updated_at || place.created_at || Date.now()).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

export default function LocationManagement() {
  const [places, setPlaces] = useState(_cached_places);
  const [isLoading, setIsLoading] = useState(_cached_isLoading);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [pincodeFilter, setPincodeFilter] = useState('');

  useEffect(() => { _cached_places = places; }, [places]);
  useEffect(() => { _cached_isLoading = isLoading; }, [isLoading]);

  useEffect(() => {
    const fetchData = () => {
      fetch((import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com') + '/api/admin/places', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.ok) setPlaces(data.places || []);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    };
    
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Group places for unique view & extract Pincode
  const groupedPlaces = useMemo(() => {
    const grouped = Object.values(places.reduce((acc, place) => {
      const key = place.name?.trim().toLowerCase();
      if (!key) return acc;
      
      if (!acc[key]) {
        acc[key] = { 
          ...place, 
          feature_counts: {}, 
          total_assessments: 0,
          contributors: new Set()
        };
      }
      
      acc[key].total_assessments += 1;
      
      if (place.contributed_by_name) {
        acc[key].contributors.add(place.contributed_by_name);
      }

      if (Array.isArray(place.accessibility_features)) {
        place.accessibility_features.forEach(f => {
          acc[key].feature_counts[f] = (acc[key].feature_counts[f] || 0) + 1;
        });
      }

      const currentUpdate = new Date(place.updated_at || place.created_at);
      const accUpdate = new Date(acc[key].updated_at || acc[key].created_at);
      if (currentUpdate > accUpdate) {
        acc[key].updated_at = place.updated_at || place.created_at;
        acc[key].created_at = place.created_at;
      }
      
      return acc;
    }, {})).map(p => ({
      ...p,
      pincode: getPlacePincode(p),
      contributorCount: p.contributors.size,
      firstContributor: Array.from(p.contributors)[0]
    }));

    grouped.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
    return grouped;
  }, [places]);

  // Extract unique categories & pincodes
  const categories = useMemo(() => {
    return ['All', ...new Set(groupedPlaces.map(p => p.category).filter(Boolean))];
  }, [groupedPlaces]);

  const uniquePincodes = useMemo(() => {
    const pins = groupedPlaces.map(p => p.pincode).filter(Boolean);
    return ['All Pincodes', ...new Set(pins)].sort();
  }, [groupedPlaces]);

  // Comprehensive Filtering by Pincode & Category
  const displayGrouped = useMemo(() => {
    return groupedPlaces.filter(place => {
      const matchesSearch = !searchQuery || 
                            place.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            place.address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || place.category === categoryFilter;
      
      const matchesPincode = !pincodeFilter || 
                             place.pincode.includes(pincodeFilter.trim()) || 
                             place.address?.toLowerCase().includes(pincodeFilter.trim().toLowerCase());
      
      return matchesSearch && matchesCategory && matchesPincode;
    });
  }, [groupedPlaces, searchQuery, categoryFilter, pincodeFilter]);

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'All' || pincodeFilter !== '';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Places Directory"
        subtitle="All registered accessible locations, filterable by Category and Pincode"
        icon={MapPin}
        iconColor="text-primary"
        badge={{ count: displayGrouped.length, label: 'places' }}
      />

      {/* Interactive Pincode & Category Search Panel */}
      <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
            <Filter className="w-4 h-4 text-primary" />
            <span>Directory Filter & Pincode Search</span>
            {hasActiveFilters && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-semibold">
                Filtering ({displayGrouped.length} matches)
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setPincodeFilter('');
              }}
              className="text-xs font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 px-3 py-1.5 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-all cursor-pointer shadow-xs"
            >
              ✕ Reset All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* General Search Input */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Search Place / Address</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Name, street, keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[#1a1a1f] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs font-bold px-1">✕</button>
              )}
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Category Filter</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[#1a1a1f] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none capitalize cursor-pointer font-medium transition-all shadow-xs"
              >
                <option value="All">All Categories ({groupedPlaces.length})</option>
                {categories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{formatTitleCase(cat)} ({groupedPlaces.filter(p => p.category === cat).length})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Pincode Selector Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Pincode Directory</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              <select
                value={uniquePincodes.includes(pincodeFilter) ? pincodeFilter : (pincodeFilter === '' ? 'All Pincodes' : 'Custom')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'All Pincodes') setPincodeFilter('');
                  else if (val !== 'Custom') setPincodeFilter(val);
                }}
                className="w-full pl-10 pr-9 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[#1a1a1f] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none font-mono cursor-pointer transition-all shadow-xs font-medium"
              >
                <option value="All Pincodes">All Pincodes ({uniquePincodes.length - 1})</option>
                {uniquePincodes.filter(p => p !== 'All Pincodes').map(pin => (
                  <option key={pin} value={pin}>PIN: {pin} ({groupedPlaces.filter(p => p.pincode === pin).length})</option>
                ))}
                {!uniquePincodes.includes(pincodeFilter) && pincodeFilter !== '' && (
                  <option value="Custom">Custom: "{pincodeFilter}"</option>
                )}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Pincode Search Input */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Custom Pincode Search</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              <input
                type="text"
                placeholder="Type Pincode (e.g. 638001)..."
                value={pincodeFilter}
                onChange={(e) => setPincodeFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[#1a1a1f] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono transition-all shadow-xs"
              />
              {pincodeFilter && (
                <button onClick={() => setPincodeFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs font-bold px-1">✕</button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Pincode Pill Chips */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">📍 Quick Pincodes:</span>
          {uniquePincodes.filter(p => p !== 'All Pincodes').map(pin => {
            const isSelected = pincodeFilter === pin;
            return (
              <button
                key={pin}
                type="button"
                onClick={() => setPincodeFilter(isSelected ? '' : pin)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-500 dark:hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 shadow-xs'
                }`}
              >
                {pin}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {groupedPlaces.filter(p => p.pincode === pin).length}
                </span>
              </button>
            );
          })}
          {uniquePincodes.length <= 1 && (
            <span className="text-xs text-gray-400 italic">No explicit 6-digit pincodes detected in existing addresses.</span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayGrouped.map((place, i) => (
            <PlaceCard
              key={i}
              place={place}
              onSelectCategory={(cat) => setCategoryFilter(categoryFilter === cat ? 'All' : cat)}
              onSelectPincode={(pin) => setPincodeFilter(pincodeFilter === pin ? '' : pin)}
            />
          ))}
          {displayGrouped.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No matching places found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">No places match your combined Category and Pincode filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('All');
                  setPincodeFilter('');
                }}
                className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all text-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


