import { AppShell } from "@/components/AppShell";
import { PickPackDashboardSection } from "./sections/PickPackDashboardSection";

export const OrdersDataGrid = (): JSX.Element => {
  return (
    <AppShell>
      <PickPackDashboardSection />
    </AppShell>
  );
};
