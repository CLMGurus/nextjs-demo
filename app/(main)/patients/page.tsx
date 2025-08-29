import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { fetchWithToken } from "@/lib/fetchApi/server";
import { PatientResponse } from "@/types/patient";
import { getAuthData } from "@/lib/auth";
import { Plus } from "lucide-react";

export default async function PatientPage() {
  const { organizationId } = await getAuthData();

  let patients: PatientResponse[] = [];
  try {
    patients = await fetchWithToken<PatientResponse[]>("/api/v1/patients", {
      query: { organization_id: organizationId ?? undefined },
    });
  } catch (error) {
    console.error("PatientPage: Error fetching patients:", error);
  }

  return (
    <>
      <PageHeader
        title="Patients"
        description="List of all registered patients in your hospital"
        buttonLabel="New Patient"
        buttonLink="/patients/add"
        buttonIcon={Plus}
      />
      <div className="px-6">
        <DataTable columns={columns} data={patients} />
      </div>
    </>
  );
}
