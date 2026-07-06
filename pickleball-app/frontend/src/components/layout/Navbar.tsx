import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="font-semibold text-emerald-700">
          🏓 League Manager
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500 hidden sm:inline">{user?.fullName}</span>
          <Link to="/profile" className="text-slate-600 hover:text-slate-900">
            Profile
          </Link>
          <Button variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
