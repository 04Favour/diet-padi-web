import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Save, Bell, Settings, Clock, Calendar, Globe, Shield, Volume2, Vibrate } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type AccountTab = 'profile' | 'notifications' | 'settings';
type ProfileSection = 'personal' | 'professional' | 'availability';

const Account = () => {
  const { user, profile, role } = useAuth();
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const [profileSection, setProfileSection] = useState<ProfileSection>('personal');

  // Personal
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Professional
  const [specialty, setSpecialty] = useState(profile?.specialty || '');
  const [licenseNumber, setLicenseNumber] = useState(profile?.license_number || '');
  const [clinic, setClinic] = useState(profile?.clinic || '');
  const [bio, setBio] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [certifications, setCertifications] = useState('');
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [visibility, setVisibility] = useState('public');

  // Availability
  const [workDays, setWorkDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [consultDuration, setConsultDuration] = useState('30');

  // Notification preferences
  const [notifSound, setNotifSound] = useState(true);
  const [notifVibration, setNotifVibration] = useState(false);
  const [publicNotif, setPublicNotif] = useState(true);
  const [inAppChat, setInAppChat] = useState(true);
  const [subscriptionNotif, setSubscriptionNotif] = useState(true);
  const [prescriptionNotif, setPrescriptionNotif] = useState(true);
  const [apptReminderNotif, setApptReminderNotif] = useState(true);
  const [dietPlanNotif, setDietPlanNotif] = useState(true);
  const [dailyTipsNotif, setDailyTipsNotif] = useState(false);
  const [clientMissedNotif, setClientMissedNotif] = useState(true);

  // Settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('WAT (UTC+1)');

  const roleLabel = role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Provider';

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatar_url || '');
      setSpecialty(profile.specialty || '');
      setLicenseNumber(profile.license_number || '');
      setClinic(profile.clinic || '');
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl + '?t=' + Date.now();
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', user.id);
    setAvatarUrl(publicUrl);
    toast({ title: 'Avatar updated!' });
    setUploading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: fullName, phone, specialty,
      license_number: licenseNumber || null,
      clinic: clinic || null,
    }).eq('user_id', user.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Profile updated!' });
    setSaving(false);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Password updated!' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    }
  };

  const toggleWorkDay = (day: string) => {
    setWorkDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${value ? 'bg-primary' : 'bg-muted'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-primary">Account Manager</h1>

      {/* Tab Navigation */}
      <div className="mb-6 flex border-b border-border overflow-x-auto">
        {[
          { key: 'profile' as AccountTab, label: 'Profile', icon: <Camera size={16} /> },
          { key: 'notifications' as AccountTab, label: 'Notifications', icon: <Bell size={16} /> },
          { key: 'settings' as AccountTab, label: 'Settings', icon: <Settings size={16} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 whitespace-nowrap px-4 sm:px-5 py-3 text-sm font-medium transition-colors ${activeTab === t.key ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6">
              <div className="relative mb-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                    {fullName.charAt(0) || 'U'}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Camera size={14} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>
              <h2 className="text-lg font-semibold text-foreground">{fullName || 'User'}</h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{roleLabel}</span>
              {uploading && <p className="mt-2 text-xs text-muted-foreground">Uploading...</p>}
            </div>

            {/* Profile Sections */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 lg:col-span-2">
              <div className="mb-4 flex border-b border-border overflow-x-auto">
                {[
                  { key: 'personal' as ProfileSection, label: 'Personal' },
                  { key: 'professional' as ProfileSection, label: 'Professional' },
                  { key: 'availability' as ProfileSection, label: 'Availability' },
                ].map(s => (
                  <button key={s.key} onClick={() => setProfileSection(s.key)}
                    className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${profileSection === s.key ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              {profileSection === 'personal' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Full Name</label>
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Phone</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                      <input type="email" value={user?.email || ''} disabled
                        className="w-full rounded-lg border border-input bg-muted px-4 py-2.5 text-sm text-muted-foreground" />
                    </div>
                  </div>
                  <button onClick={handleSaveProfile} disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {profileSection === 'professional' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Specialty</label>
                      <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="e.g., Clinical Dietitian"
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">License Number</label>
                      <input type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="RD-2024-XXX"
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Clinic / Organization</label>
                      <input type="text" value={clinic} onChange={e => setClinic(e.target.value)} placeholder="Clinic name"
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Years of Experience</label>
                      <input type="number" value={yearsExp} onChange={e => setYearsExp(e.target.value)} placeholder="e.g., 5"
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Profile Visibility</label>
                      <select value={visibility} onChange={e => setVisibility(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                        <option value="public">Public</option>
                        <option value="verified">Verified Users Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Languages</label>
                      <input type="text" value={languages.join(', ')} onChange={e => setLanguages(e.target.value.split(',').map(l => l.trim()))}
                        placeholder="English, Yoruba, Hausa"
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-foreground">Bio</label>
                      <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Brief professional bio..."
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" rows={3} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-foreground">Certifications</label>
                      <input type="text" value={certifications} onChange={e => setCertifications(e.target.value)} placeholder="e.g., RDN, CSSD"
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                  </div>
                  <button onClick={handleSaveProfile} disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {profileSection === 'availability' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Working Days</h3>
                    <div className="flex flex-wrap gap-2">
                      {allDays.map(day => (
                        <button key={day} onClick={() => toggleWorkDay(day)}
                          className={`rounded-lg border px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${workDays.includes(day) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:bg-muted'}`}>
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Start Time</label>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-accent" />
                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">End Time</label>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-accent" />
                        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Consultation Duration</label>
                      <select value={consultDuration} onChange={e => setConsultDuration(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                        {['15', '30', '45', '60'].map(d => <option key={d} value={d}>{d} minutes</option>)}
                      </select>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
                    <Save size={16} /> Save Availability
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Sound & Vibration */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2"><Volume2 size={18} className="text-accent" /> Sound & Vibration</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div><p className="text-sm font-medium text-foreground">Notification Sound</p><p className="text-xs text-muted-foreground">Play a sound for new notifications</p></div>
                <ToggleSwitch value={notifSound} onChange={setNotifSound} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div><p className="text-sm font-medium text-foreground">Vibration</p><p className="text-xs text-muted-foreground">Vibrate on new notifications</p></div>
                <ToggleSwitch value={notifVibration} onChange={setNotifVibration} />
              </div>
            </div>
          </div>

          {/* General Notifications */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2"><Globe size={18} className="text-accent" /> General Notifications</h2>
            <div className="space-y-3">
              {[
                { label: 'Public Notifications', desc: 'Platform-wide announcements', value: publicNotif, set: setPublicNotif },
                { label: 'In-App Chat', desc: 'New message notifications', value: inAppChat, set: setInAppChat },
                { label: 'Subscription Updates', desc: 'Billing and plan changes', value: subscriptionNotif, set: setSubscriptionNotif },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <ToggleSwitch value={item.value} onChange={item.set} />
                </div>
              ))}
            </div>
          </div>

          {/* Personalised Notifications */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2"><Bell size={18} className="text-accent" /> Personalised Notifications</h2>
            <div className="space-y-3">
              {[
                { label: 'Prescription Alerts', desc: 'When prescriptions need attention', value: prescriptionNotif, set: setPrescriptionNotif },
                { label: 'Appointment Reminders', desc: 'Reminders before appointments', value: apptReminderNotif, set: setApptReminderNotif },
                { label: 'Diet Plan Updates', desc: 'Notifications on diet plan changes', value: dietPlanNotif, set: setDietPlanNotif },
                { label: 'Daily Health Tips', desc: 'Receive daily health tip notifications', value: dailyTipsNotif, set: setDailyTipsNotif },
                { label: 'Client Missed Alerts', desc: 'Get notified when a client misses a diet plan or prescription', value: clientMissedNotif, set: setClientMissedNotif },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <ToggleSwitch value={item.value} onChange={item.set} />
                </div>
              ))}
            </div>
          </div>

          <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
            Save Preferences
          </button>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Change Password</h2>
            <div className="grid gap-4 sm:grid-cols-3 max-w-2xl">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
              </div>
            </div>
            <button onClick={handleUpdatePassword}
              className="mt-4 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
              Update Password
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Preferences</h2>
            <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                  <option>English</option>
                  <option>Yoruba</option>
                  <option>Hausa</option>
                  <option>Igbo</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Timezone</label>
                <select value={timezone} onChange={e => setTimezone(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                  <option>WAT (UTC+1)</option>
                  <option>GMT (UTC+0)</option>
                  <option>EST (UTC-5)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
