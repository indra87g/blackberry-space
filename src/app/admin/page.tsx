'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Settings, ShieldAlert, Check, X } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [_profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileData?.isAdmin) {
        router.push('/');
        return;
      }

      setProfile(profileData);

      const { data: settings } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'maintenance_mode')
        .single();

      setMaintenanceMode(settings?.value === true);
      setLoading(false);
    }

    checkAdmin();
  }, [supabase, router]);

  const toggleMaintenance = async () => {
    setSaving(true);
    const newValue = !maintenanceMode;
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ value: newValue })
        .eq('key', 'maintenance_mode');

      if (error) throw error;
      setMaintenanceMode(newValue);
    } catch (err) {
      console.error('Failed to update maintenance mode:', err);
      alert('Failed to update maintenance mode');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-outline" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-on-surface uppercase tracking-[0.05em]">
          Admin Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-container p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-on-surface-variant" />
              <div>
                <h3 className="font-bold text-on-surface uppercase tracking-wider">
                  Maintenance Mode
                </h3>
                <p className="text-sm text-on-surface-variant">
                  When active, non-admin users cannot access the site.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleMaintenance}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                maintenanceMode ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div
            className={`p-4 border ${maintenanceMode ? 'bg-[rgba(255,180,171,0.1)] border-error text-error' : 'bg-[rgba(107,251,154,0.1)] border-primary text-primary'} font-bold uppercase tracking-wider text-xs flex items-center gap-2`}
          >
            {maintenanceMode ? (
              <>
                <X className="w-4 h-4" />
                Maintenance Mode is ON
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Site is ONLINE
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
