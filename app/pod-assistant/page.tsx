import PodForm from "@/components/PodForm";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function PodAssistantPage() {
  requireAdminPage();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">FDE Pod Formation Assistant</h2>
        <p className="text-sm text-neutral-500">
          Input: client need + technology stack. Output: recommended pod lead, engineers, certification coverage,
          and estimated cost/margin.
        </p>
      </div>
      <PodForm />
    </div>
  );
}
