// AdminPanel.jsx - KoSh Vote SMM Panel
import { useAuth } from '../context/AuthContext';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <div style={{ background: "#0f172a", color: "white", padding: "20px", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>KoSh Vote</h1>
        <button onClick={logout} style={{ background: "red", color: "white", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer" }}>
          Logout
        </button>
      </div>
      <p>Developed by Aijaz Kosh</p>
    </div>
  );
          }
