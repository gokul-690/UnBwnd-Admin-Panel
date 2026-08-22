import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, Shield, Globe } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { token, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);

  useEffect(() => {
    if (token) {
      fetchMaintenanceMode();
    }
  }, [token]);

  const fetchMaintenanceMode = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/settings/maintenance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMaintenanceMode(data.maintenanceMode);
      }
    } catch (error) {
      console.error('Failed to fetch maintenance mode', error);
    }
  };

  const handleToggleMaintenance = async () => {
    if (currentUser?.role !== 'super_admin' && currentUser?.role !== 'Super Admin') {
      alert("Only Super Admins can toggle Maintenance Mode.");
      return;
    }
    
    setLoadingMaintenance(true);
    const newValue = !maintenanceMode;
    
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/settings/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ maintenanceMode: newValue })
      });
      
      if (response.ok) {
        setMaintenanceMode(newValue);
      } else {
        alert("Failed to update maintenance mode.");
      }
    } catch (error) {
      console.error('Error updating maintenance mode', error);
      alert("Error updating maintenance mode.");
    } finally {
      setLoadingMaintenance(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'policies', label: 'App Policies', icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Settings"
        subtitle="Manage global application configuration and policies"
        icon={SettingsIcon}
        action={{ label: 'Save Changes', icon: Save, onClick: () => alert('Settings saved!') }}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 p-2 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm min-h-[500px]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">General Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Name</label>
                  <input type="text" defaultValue="UnBwnd" className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Support Email</label>
                  <input type="email" defaultValue="support@unbwnd.com" className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1a1a1f] rounded-xl border border-gray-200 dark:border-gray-800">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Maintenance Mode</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Disables access to the mobile app for users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={maintenanceMode}
                      onChange={handleToggleMaintenance}
                      disabled={loadingMaintenance}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">API Configuration</h3>
              <p className="text-sm text-gray-500">Manage third-party API integrations and webhooks.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Maps API Key</label>
                  <div className="flex gap-2">
                    <input type={showApiKey ? "text" : "password"} defaultValue="AIzaSyA_mock_api_key_xxxxxxxxxxxxx" className="flex-1 px-4 py-2 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white" />
                    <button onClick={() => setShowApiKey(!showApiKey)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      {showApiKey ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">App Policies</h3>
              <p className="text-sm text-gray-500">Manage terms of service, privacy policy URLs, etc.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Terms of Service URL</label>
                  <input type="text" defaultValue="https://unbwnd.com/terms" className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

