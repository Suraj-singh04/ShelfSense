import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authorizedFetch } from "../utils/api";

const getMySuggestions = async () => {
  const res = await authorizedFetch("/api/smart-routing/my-suggestions");
  return res.json();
};

const confirmSuggestion = async (suggestionId) => {
  const res = await authorizedFetch(
    `/api/suggestions/confirm/${suggestionId}`,
    {
      method: "POST",
    }
  );
  return res.json();
};

const rejectSuggestion = async (suggestionId) => {
  const res = await authorizedFetch(`/api/suggestions/reject/${suggestionId}`, {
    method: "POST",
  });
  return res.json();
};

export const useRetailerSuggestions = () => {
  const qc = useQueryClient();

  const suggestionsQuery = useQuery({
    queryKey: ["retailer-suggestions"],
    queryFn: async () => {
      const data = await getMySuggestions();
      if (!data.success) throw new Error(data.message || "Failed to fetch");
      return data.suggestions;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: confirmSuggestion,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["retailer-suggestions"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectSuggestion,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["retailer-suggestions"] }),
  });

  return { suggestionsQuery, confirmMutation, rejectMutation };
};
