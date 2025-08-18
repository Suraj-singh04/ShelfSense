import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authorizedFetch } from "../utils/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await authorizedFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong");
      } else {
        setMessage("Password reset link sent to your email.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Forgot Password
        </h2>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-2">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm text-teal-600 hover:underline block mx-auto mt-2"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
