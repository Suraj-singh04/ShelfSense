export const authorizedFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");

  return fetch(`http://localhost:5000${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include", // if your cookie/session needs it
  });
};
