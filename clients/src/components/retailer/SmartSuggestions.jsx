import { useRetailerSuggestions } from "../../hooks/useRetailerSuggestion";

const SmartSuggestions = () => {
  const { suggestionsQuery, confirmMutation, rejectMutation } =
    useRetailerSuggestions();

  if (suggestionsQuery.isLoading) return <div>Loading suggestions…</div>;
  if (suggestionsQuery.isError)
    return (
      <div className="text-red-600">
        {suggestionsQuery.error?.message || "Failed to load suggestions"}
      </div>
    );

  const suggestions = suggestionsQuery.data || [];

  const loadingConfirm =
    confirmMutation?.isPending ?? confirmMutation?.isLoading ?? false;
  const loadingReject =
    rejectMutation?.isPending ?? rejectMutation?.isLoading ?? false;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">💡 Smart Recommendations</h1>

      {!suggestions.length ? (
        <p className="text-gray-500">No suggestions right now.</p>
      ) : (
        suggestions.map((s) => (
          <SuggestionCard
            key={s.suggestionId}
            suggestion={s}
            onConfirm={() => confirmMutation.mutate(s.suggestionId)}
            onReject={() => rejectMutation.mutate(s.suggestionId)}
            loading={loadingConfirm || loadingReject}
          />
        ))
      )}
    </div>
  );
};

const statusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "confirmed":
      return "bg-green-600";
    case "rejected":
      return "bg-red-500";
    case "reassigned":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

function SuggestionCard({ suggestion, onConfirm, onReject, loading }) {
  return (
    <div className="rounded-xl border p-4 shadow-sm bg-white flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{suggestion.productName}</h3>
          <p className="text-sm text-gray-600">
            Quantity suggested: <b>{suggestion.quantity}</b>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Attempts: {suggestion.attempts ?? 1}
          </p>
        </div>

        <span
          className={`px-2 py-1 rounded text-white text-xs ${statusColor(
            suggestion.status
          )}`}
        >
          {suggestion.status}
        </span>
      </div>

      {suggestion.status === "pending" && (
        <div className="mt-3 flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
          >
            {loading ? "Please wait…" : "Confirm"}
          </button>
          <button
            onClick={onReject}
            disabled={loading}
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white disabled:opacity-60"
          >
            {loading ? "Please wait…" : "Reject"}
          </button>
        </div>
      )}
    </div>
  );
}

export default SmartSuggestions;
