import { useState, type ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  User,
  Star,
  AlertTriangle,
  Trash2,
  Download,
  Plus,
  X,
} from "lucide-react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import type { ProviderRow } from "@/components/provider-utils";

const ModalShell = ({
  children,
  wide = false,
  onClose,
}: {
  children: ReactNode;
  wide?: boolean;
  onClose?: () => void;
}) => (
  <Dialog defaultOpen onOpenChange={(open) => !open && onClose?.()}>
    <DialogContent
      className={`w-full ${wide ? "max-w-4xl" : "max-w-2xl"} p-0 overflow-hidden`}
    >
      {children}
    </DialogContent>
  </Dialog>
);

export const ProviderDetailsModal = ({
  provider,
  onClose,
  onEdit,
  onMessage,
  onSuspend,
  onDelete,
  onExport,
}: {
  provider: ProviderRow;
  onClose: () => void;
  onEdit: (provider: ProviderRow) => void;
  onMessage: (provider: ProviderRow) => void;
  onSuspend: (provider: ProviderRow) => void;
  onDelete: (provider: ProviderRow) => void;
  onExport: (provider: ProviderRow) => void;
}) => {
  const [tab, setTab] = useState("details");

  return (
    <ModalShell wide>
      <div className="bg-primary p-5 relative">
        <div className="flex items-center gap-4">
          <img
            src={provider.avatar}
            alt={provider.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-white font-bold text-lg">{provider.name}</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-400/20 text-green-200">
                {provider.status}
              </span>
            </div>
            <p className="text-white/70 text-sm">{provider.specialty}</p>
            <div className="flex items-center gap-4 mt-1.5 text-white/70 text-xs">
              <span>
                {provider.clientCount} Client
                {provider.clientCount !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                {provider.rating}
              </span>
              <span>Joined {provider.joined}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={() => onMessage(provider)}
            className="bg-[hsl(88,56%,28%)] hover:bg-[hsl(88,56%,24%)] text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Bell size={13} /> Notify
          </button>
          <button
            onClick={() => onSuspend(provider)}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle size={13} /> Suspend Account
          </button>
          <button
            onClick={() => onDelete(provider)}
            className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={13} /> Delete Account
          </button>
          <button
            onClick={() => onExport(provider)}
            className="border border-white/30 hover:bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download size={13} /> Export Data
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-100">
        {[
          { key: "details", label: "Provider Personal Details" },
          { key: "activity", label: "Activity Log" },
        ].map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === tabItem.key
                ? "text-primary border-b-2 border-primary"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto flex-1 p-5">
        {tab === "details" ? (
          <div className="space-y-5">
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Mail size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email Address</p>
                    <p className="text-sm font-medium text-gray-800">
                      {provider.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <MapPin size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm font-medium text-gray-800">
                      {provider.location}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Phone size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone Number</p>
                    <p className="text-sm font-medium text-gray-800">
                      {provider.phone}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <User size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Bio</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {provider.bio}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-4">
                Professional Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Specialty</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {provider.specialty}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">License Number</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {provider.licenseNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Joined</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {provider.joined}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {provider.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Appointments",
                  value: provider.appointmentCount,
                  icon: <CalendarDays size={18} className="text-orange-500" />,
                },
                {
                  label: "Clients",
                  value: provider.clientCount,
                  icon: <User size={18} className="text-orange-500" />,
                },
                {
                  label: "Rating",
                  value: provider.rating,
                  icon: <Star size={18} className="text-orange-500" />,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border border-gray-100 rounded-xl p-3 flex items-start justify-between"
                >
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {item.value}
                    </p>
                  </div>
                  {item.icon}
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Recent Activities
              </h3>
              <p className="text-sm text-gray-400 text-center py-6">
                No recent activities
              </p>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
};

export const EditProviderModal = ({
  provider,
  onClose,
  onSave,
}: {
  provider: ProviderRow;
  onClose: () => void;
  onSave: (provider: ProviderRow) => void;
}) => {
  const [form, setForm] = useState(provider);
  const setField = (key: keyof ProviderRow, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <ModalShell wide>
      <div className="bg-primary p-5 relative flex items-center gap-4">
        <img
          src={provider.avatar}
          alt={provider.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
        />
        <div>
          <h2 className="text-white font-bold text-lg">Edit Provider</h2>
          <p className="text-white/70 text-sm">
            Update provider information and settings
          </p>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-5 space-y-5">
        <div className="border border-gray-100 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-gray-800">Personal Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Full Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Email</label>
              <input
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Phone Number
              </label>
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Location
              </label>
              <input
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-gray-800">
            Professional Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Specialty
              </label>
              <input
                value={form.specialty}
                onChange={(e) => setField("specialty", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                License Number
              </label>
              <input
                value={form.licenseNumber}
                onChange={(e) => setField("licenseNumber", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-[hsl(88,56%,30%)]"
        >
          Save Changes
        </button>
      </div>
    </ModalShell>
  );
};

export const SendMessageModal = ({
  provider,
  onClose,
}: {
  provider: ProviderRow;
  onClose: () => void;
}) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) return;
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <ModalShell>
      <div className="p-5 relative">
        <h2 className="text-primary font-bold text-xl mb-5">Send Message</h2>

        <div className="border border-gray-100 rounded-xl p-3 flex items-center gap-3 mb-5">
          <img
            src={provider.avatar}
            className="w-11 h-11 rounded-full object-cover"
            alt={provider.name}
          />
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {provider.name}
            </p>
            <p className="text-xs text-gray-400">{provider.specialty}</p>
          </div>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail size={22} className="text-green-600" />
            </div>
            <p className="font-semibold text-gray-800">Message Sent!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Type your message here"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-[hsl(88,56%,30%)] disabled:opacity-50"
                disabled={!subject.trim() || !message.trim()}
              >
                Send Message
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
};

export const CreateProviderModal = ({
  onClose,
  onCreate,
  loading,
}: {
  onClose: () => void;
  onCreate: (data: Record<string, string>) => void;
  loading: boolean;
}) => {
  const [form, setForm] = useState({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    specialty: "",
    licenseNumber: "",
    clinic: "",
  });
  const setField = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <ModalShell wide>
      <div className="bg-primary p-5 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Create Provider</h2>
            <p className="text-white/70 text-sm">
              Create a new healthcare provider account
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-5 space-y-5">
        <div className="border border-gray-100 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-gray-800">Personal Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Title</label>
              <select
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="">Select title</option>
                {["Dr", "RD", "RN", "Prof", "Mr", "Mrs", "Ms"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                First Name
              </label>
              <input
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                placeholder="Clara"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Last Name
              </label>
              <input
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                placeholder="Diamond"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Email Address
              </label>
              <input
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="provider@email.com"
                type="email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Password
              </label>
              <input
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="Create password"
                type="password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Phone Number
              </label>
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+234 8012 345 6789"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-gray-800">
            Professional Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Specialty
              </label>
              <input
                value={form.specialty}
                onChange={(e) => setField("specialty", e.target.value)}
                placeholder="Dietitian"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                License Number
              </label>
              <input
                value={form.licenseNumber}
                onChange={(e) => setField("licenseNumber", e.target.value)}
                placeholder="RD-2024-00001"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Clinic / Location
              </label>
              <input
                value={form.clinic}
                onChange={(e) => setField("clinic", e.target.value)}
                placeholder="Lagos, Nigeria"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onCreate(form)}
          disabled={
            !form.email ||
            !form.password ||
            !form.firstName ||
            !form.lastName ||
            loading
          }
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-[hsl(88,56%,30%)] disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Provider"}
        </button>
      </div>
    </ModalShell>
  );
};
