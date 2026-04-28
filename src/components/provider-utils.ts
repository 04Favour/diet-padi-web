export interface ProviderRow {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  specialty: string;
  status: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  licenseNumber: string;
  joined: string;
  appointmentCount: number;
  clientCount: number;
  rating: number;
}

export const STATUS_COLORS: Record<string, string> = {
  Active: "bg-[hsl(142,71%,45%)]/10 text-[hsl(142,71%,38%)]",
  Inactive: "bg-gray-100 text-muted-foreground",
  Pending: "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,80%,40%)]",
  Suspended: "bg-red-100 text-red-600",
};

export const normalizeStatus = (value: string) =>
  value
    ? `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`
    : "Active";

export const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "N/A";
  }
};

export const makeRatingFromId = (id: string) => {
  const seed = Array.from(id).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  const rating = 3.8 + (seed % 13) * 0.1;
  return Number(rating.toFixed(1));
};

export const downloadProviderCsv = (provider: ProviderRow) => {
  const headers = [
    "Provider",
    "Specialty",
    "Status",
    "Email",
    "Phone",
    "Location",
    "License Number",
    "Joined",
    "Clients",
    "Appointments",
  ];
  const rows = [
    [
      provider.name,
      provider.specialty,
      provider.status,
      provider.email,
      provider.phone,
      provider.location,
      provider.licenseNumber,
      provider.joined,
      provider.clientCount.toString(),
      provider.appointmentCount.toString(),
    ],
  ];

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${provider.name.replace(/\s+/g, "_")}_provider_data.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
