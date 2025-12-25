import ConsoleShell from "@/components/console/ConsoleShell";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return <ConsoleShell userName={user.name} />;
}
