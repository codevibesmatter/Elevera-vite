import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Users, Building2 } from "lucide-react";

export default function AdminNav() {
  return (
    <div className="tabs tabs-boxed">
      <Link
        to="/admin"
        className={({ isActive }) =>
          `tab gap-2 ${isActive ? "tab-active" : ""}`
        }
      >
        <LayoutDashboard className="w-4 h-4" />
        Dashboard
      </Link>
      <Link
        to="/admin/users"
        className={({ isActive }) =>
          `tab gap-2 ${isActive ? "tab-active" : ""}`
        }
      >
        <Users className="w-4 h-4" />
        Users
      </Link>
      <Link
        to="/admin/teams"
        className={({ isActive }) =>
          `tab gap-2 ${isActive ? "tab-active" : ""}`
        }
      >
        <Building2 className="w-4 h-4" />
        Teams
      </Link>
    </div>
  );
}
