import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { fetchWithToken } from "@/lib/fetchApi/server";
import { AdmissionResponse } from "@/types/admission";
import { getAuthData } from "@/lib/auth";
import { Plus } from "lucide-react";

export default async function AdmissionPage() {
  const { organizationId } = await getAuthData();

  let admissions: AdmissionResponse[] = [];
  try {
    admissions = await fetchWithToken<AdmissionResponse[]>(
      "/api/v1/admissions",
      {
        query: { organization_id: organizationId ?? undefined },
      }
    );
  } catch (error) {
    console.error("AdmissionPage: Error fetching admissions:", error);
  }

  return (
    <>
      <PageHeader
        title="Admissions"
        description="List of all admissions in your hospital"
        buttonLabel="New Admission"
        buttonLink="/admissions/add"
        buttonIcon={Plus}
      />
      <div className="px-6">
        <DataTable columns={columns} data={admissions} />
      </div>
    </>
  );
}
