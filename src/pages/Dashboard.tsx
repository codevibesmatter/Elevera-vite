import { UserButton, useUser } from "@clerk/clerk-react";
import { useConvexUser } from "../hooks/useConvexUser";
import { config } from "../config";

export function Dashboard() {
  const { user } = useUser();
  const { isSuperuser, isLoading, user: convexUser } = useConvexUser();

  const displayName = user?.firstName 
    || user?.username 
    || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] 
    || 'User';

  console.log('Dashboard Debug:', {
    displayName,
    email: user?.emailAddresses?.[0]?.emailAddress,
    configuredSuperUserEmail: config.initialSuperUserEmail,
    isSuperuser,
    isLoading,
    convexUser
  });

  console.log('Clerk User:', {
    id: user?.id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.primaryEmailAddress?.emailAddress
  });
  
  console.log('Convex User:', convexUser);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {displayName}!
          </h1>
          {isLoading ? (
            <div className="animate-pulse bg-base-300 h-4 w-24 mt-2"></div>
          ) : (
            <div className="mt-2">
              {isSuperuser ? (
                <span className="badge badge-primary">Super Admin</span>
              ) : (
                <span className="badge">User</span>
              )}
            </div>
          )}
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mock Stats Cards */}
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Projects</div>
            <div className="stat-value">12</div>
            <div className="stat-desc">↗︎ 40% more than last month</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Active Tasks</div>
            <div className="stat-value">24</div>
            <div className="stat-desc">↘︎ 5% less than last month</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Team Members</div>
            <div className="stat-value">8</div>
            <div className="stat-desc">↗︎ 2 new this month</div>
          </div>
        </div>
      </div>

      {/* Mock Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Project Update</td>
                <td>Updated project documentation</td>
                <td>2 hours ago</td>
              </tr>
              <tr>
                <td>Task Completed</td>
                <td>Implemented new feature</td>
                <td>5 hours ago</td>
              </tr>
              <tr>
                <td>Comment</td>
                <td>Left feedback on design</td>
                <td>1 day ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {isSuperuser && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title">User Management</h3>
              <p>As an admin, you have access to additional features:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Manage user permissions</li>
                <li>View system logs</li>
                <li>Configure system settings</li>
              </ul>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary">Open Admin Panel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
