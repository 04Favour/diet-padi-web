import { ProviderRow, STATUS_COLORS } from "@/components/provider-utils";
import { Eye, Pencil, Star } from "lucide-react";

interface ProvidersListViewProps {
  filtered: ProviderRow[];
  loading: boolean;
  onView: (provider: ProviderRow) => void;
  onEdit: (provider: ProviderRow) => void;
}

export const ProvidersListView = ({
  filtered,
  loading,
  onView,
  onEdit,
}: ProvidersListViewProps) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="px-5 py-3.5 text-left text-xs font-semibold text-primary">
            Provider
          </th>
          <th className="px-5 py-3.5 text-left text-xs font-semibold text-primary hidden sm:table-cell">
            Clients
          </th>
          <th className="px-5 py-3.5 text-left text-xs font-semibold text-primary">
            Status
          </th>
          <th className="px-5 py-3.5 text-left text-xs font-semibold text-primary hidden md:table-cell">
            Rating
          </th>
          <th className="px-5 py-3.5 text-right text-xs font-semibold text-primary">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((provider) => (
          <tr
            key={provider.id}
            className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
          >
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {provider.name}
                  </p>
                  <p className="text-xs text-gray-400">{provider.specialty}</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-3.5 text-sm text-gray-600 hidden sm:table-cell">
              {provider.clientCount}
            </td>
            <td className="px-5 py-3.5">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[provider.status] || "bg-gray-100 text-muted-foreground"}`}
              >
                {provider.status}
              </span>
            </td>
            <td className="px-5 py-3.5 hidden md:table-cell">
              <div className="flex items-center gap-1.5">
                <Star size={13} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-700">{provider.rating}</span>
              </div>
            </td>
            <td className="px-5 py-3.5">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => onView(provider)}
                  className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  title="View details"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => onEdit(provider)}
                  className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Edit provider"
                >
                  <Pencil size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
              {loading ? "Loading providers..." : "No providers found"}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
