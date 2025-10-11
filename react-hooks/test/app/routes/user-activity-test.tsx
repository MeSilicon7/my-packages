import { useUserActivity } from "@mesilicon7/use-user-activity";

export default function ActivityDemo() {
  const { isActive, isIdle, isVisible, lastActiveAt } = useUserActivity({ idleTimeout: 10000 });

  return (
    <div className="p-6 text-center space-y-3">
      <h2 className="text-xl font-semibold">User Activity Tracker</h2>
      <div className="text-gray-600">
        <p>👁️ Visible: {isVisible ? "Yes" : "No"}</p>
        <p>💤 Idle: {isIdle ? "Yes" : "No"}</p>
        <p>🔥 Active: {isActive ? "Yes" : "No"}</p>
        <p>🕓 Last Active: {new Date(lastActiveAt).toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
