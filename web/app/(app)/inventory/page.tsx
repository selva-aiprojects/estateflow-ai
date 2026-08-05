import { PageHeader, Badge } from "@/components/ui";
import { InventoryMap } from "@/components/inventory-map";

export default function InventoryPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Interactive Inventory Heat Map"
        subtitle="Projects → Towers → Floors → Blocks → Units · real-time state propagation"
        action={
          <Badge tone="primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Live sync &lt; 1s
          </Badge>
        }
      />
      <InventoryMap />
    </div>
  );
}
