import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/axios";
import { setToken } from "../../utils/auth";

export default function OrganizerLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/api/auth/organizer/login", {
        email,
        password,
      });

      const token =
        res.data.accessToken ||
        res.data.access_token ||
        res.data.token;

      if (!token) {
        setError("Authentication failed");
        return;
      }

      // ✅ SINGLE SOURCE OF TRUTH
      setToken(token);

      navigate("/organizer/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Invalid credentials"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
      />

      <button type="submit" disabled={isLoading}>
        Login
      </button>

      {error && <p>{error}</p>}

      <Link to="/organizer/register">Register</Link>
    </form>
  );
}
