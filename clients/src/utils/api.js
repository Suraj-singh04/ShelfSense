export const authorizedFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:5000${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Request failed");
  }

  return res;
};
