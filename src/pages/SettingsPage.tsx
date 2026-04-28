import { useState } from 'react';
import { Bell, Shield, Settings, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [notifSettings, setNotifSettings] = useState({
    email_new_client: true,
    email_appointment_reminder: true,
    email_prescription_updates: false,
    inapp_alert_banners: true,
    inapp_notification_sounds: false,
  });
  const [accountSettings, setAccountSettings] = useState({
    platform_name: 'DietPadi',
    support_email: 'support@dietpadi.com',
    enforce_strong_password: true,
    allow_self_registration: false,
  });

  const toggleNotif = (key: keyof typeof notifSettings) => setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const saveNotif = () => toast({ title: 'Notification settings saved' });
  const saveSession = () => toast({ title: 'Session timeout updated' });
  const saveAccount = () => toast({ title: 'Account settings saved' });

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}>
      <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage application settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Session Timeout */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Settings size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Session Timeout</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Configure how long users can remain inactive before being automatically logged out. A warning will appear 5 minutes before the session expires.
          </p>
          <div className="mb-2">
            <label className="mb-1 block text-sm font-medium text-foreground">Inactivity timeout duration</label>
            <div className="flex items-center gap-2">
              <input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))}
                className="w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Users with "Remember me" enabled will not be affected by this setting.</p>
          </div>
          <button onClick={saveSession} className="mt-3 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Save size={14} /> Save Changes
          </button>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">Configure email and in-app notification settings for the platform.</p>

          <h3 className="mb-3 text-sm font-semibold text-foreground">Email Notifications</h3>
          <div className="mb-6 space-y-3">
            {[
              { key: 'email_new_client' as const, label: 'New client registration', desc: 'Receive an email when a new client signs up' },
              { key: 'email_appointment_reminder' as const, label: 'Appointment reminders', desc: 'Send reminder emails before scheduled appointments' },
              { key: 'email_prescription_updates' as const, label: 'Prescription updates', desc: 'Notify when a prescription is created or modified' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Toggle checked={notifSettings[item.key]} onChange={() => toggleNotif(item.key)} />
              </div>
            ))}
          </div>

          <h3 className="mb-3 text-sm font-semibold text-foreground">In-App Notifications</h3>
          <div className="mb-4 space-y-3">
            {[
              { key: 'inapp_alert_banners' as const, label: 'Show alert banners', desc: 'Display toast alerts for important events' },
              { key: 'inapp_notification_sounds' as const, label: 'Notification sounds', desc: 'Play a sound for new notifications' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Toggle checked={notifSettings[item.key]} onChange={() => toggleNotif(item.key)} />
              </div>
            ))}
          </div>
          <button onClick={saveNotif} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Save size={14} /> Save Notification Settings
          </button>
        </div>

        {/* Account Management */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Account Management</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">Configure platform-wide account and security policies.</p>

          <div className="mb-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Platform name</label>
              <input type="text" value={accountSettings.platform_name} onChange={e => setAccountSettings(prev => ({ ...prev, platform_name: e.target.value }))}
                className="w-full max-w-sm rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              <p className="mt-1 text-xs text-muted-foreground">Displayed in the header and emails</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Support email</label>
              <input type="email" value={accountSettings.support_email} onChange={e => setAccountSettings(prev => ({ ...prev, support_email: e.target.value }))}
                className="w-full max-w-sm rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              <p className="mt-1 text-xs text-muted-foreground">Contact email shown to users for help requests</p>
            </div>
          </div>

          <h3 className="mb-3 text-sm font-semibold text-foreground">Security Policies</h3>
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Enforce strong password policy</p>
                <p className="text-xs text-muted-foreground">Require minimum 8 characters, uppercase, number, and special character</p>
              </div>
              <Toggle checked={accountSettings.enforce_strong_password} onChange={() => setAccountSettings(prev => ({ ...prev, enforce_strong_password: !prev.enforce_strong_password }))} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Allow self-registration</p>
                <p className="text-xs text-muted-foreground">Let new providers create accounts without admin invitation</p>
              </div>
              <Toggle checked={accountSettings.allow_self_registration} onChange={() => setAccountSettings(prev => ({ ...prev, allow_self_registration: !prev.allow_self_registration }))} />
            </div>
          </div>
          <button onClick={saveAccount} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Save size={14} /> Save Account Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
