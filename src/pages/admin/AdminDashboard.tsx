import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Users, Building2, ArrowUpRight, TrendingUp, HardDrive } from "lucide-react";
import { Link } from "@tanstack/react-router";
import AdminNav from "../../components/admin/AdminNav";

export default function AdminDashboard() {
  const stats = useQuery(api.admin.queries.getDashboardStats);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      change: stats.usersCreatedLast30Days,
      icon: Users,
      link: "/admin/users",
    },
    {
      title: "Total Teams",
      value: stats.totalTeams,
      change: stats.teamsCreatedLast30Days,
      icon: Building2,
      link: "/admin/teams",
    },
    {
      title: "Total Storage",
      value: `${(stats.totalStorage / 1024 / 1024 / 1024).toFixed(1)} GB`,
      change: null,
      icon: HardDrive,
      link: "/admin/teams",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <AdminNav />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <Link
              key={stat.title}
              to={stat.link}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="card-title text-base-content/70">
                      {stat.title}
                    </h2>
                    <p className="text-4xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                {stat.change !== null && (
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>+{stat.change} in last 30 days</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Quick Stats</h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <tbody>
                    <tr>
                      <td>Average Team Size</td>
                      <td className="text-right">
                        {stats.averageMembersPerTeam.toFixed(1)} members
                      </td>
                    </tr>
                    <tr>
                      <td>New Users (30 days)</td>
                      <td className="text-right">
                        {stats.usersCreatedLast30Days} users
                      </td>
                    </tr>
                    <tr>
                      <td>New Teams (30 days)</td>
                      <td className="text-right">
                        {stats.teamsCreatedLast30Days} teams
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Quick Actions</h2>
              <div className="flex flex-col gap-4">
                <Link
                  to="/admin/users"
                  className="btn btn-primary gap-2"
                >
                  <Users className="w-4 h-4" />
                  Manage Users
                </Link>
                <Link
                  to="/admin/teams"
                  className="btn btn-primary gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Manage Teams
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
