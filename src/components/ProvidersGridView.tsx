import { ProviderRow, STATUS_COLORS } from "@/components/provider-utils";
import { Eye, Pencil, Star } from "lucide-react";

interface ProvidersGridViewProps {
  filtered: ProviderRow[];
  loading: boolean;
  onView: (provider: ProviderRow) => void;
  onEdit: (provider: ProviderRow) => void;
}

export const ProvidersGridView = ({
  filtered,
  loading,
  onView,
  onEdit,
}: ProvidersGridViewProps) => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {filtered.length === 0 ? (
      <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {loading ? "Loading providers..." : "No providers found"}
      </div>
    ) : (
      filtered.map((provider) => (
        <div
          key={provider.id}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="relative h-32 bg-gradient-to-r from-primary/20 to-primary/10">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 rounded-full object-cover border-4 border-white"
            />
          </div>

          <div className="pt-12 px-5 pb-5 text-center">
            <h3 className="font-semibold text-gray-800">{provider.name}</h3>
            <p className="text-xs text-gray-400 mt-1">{provider.specialty}</p>

            <div className="flex items-center justify-center gap-1 mt-2">
              <Star size={13} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-700">{provider.rating}</span>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <div>
                <p className="text-gray-400">Clients</p>
                <p className="font-semibold text-gray-800">
                  {provider.clientCount}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Appointments</p>
                <p className="font-semibold text-gray-800">
                  {provider.appointmentCount}
                </p>
              </div>
            </div>

            <span
              className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-3 ${STATUS_COLORS[provider.status] || "bg-gray-100 text-muted-foreground"}`}
            >
              {provider.status}
            </span>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => onView(provider)}
                className="flex-1 p-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
              >
                <Eye size={14} className="mx-auto" />
              </button>
              <button
                onClick={() => onEdit(provider)}
                className="flex-1 p-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
              >
                <Pencil size={14} className="mx-auto" />
              </button>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);
