import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { fetchWithToken } from "@/lib/fetchApi/server";
import { getAuthData } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { PatientResponse } from "@/types/patient";
import AdmissionForm from "@/app/(main)/admissions/AdmissionForm";

interface ItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AddAdmissionPage({ params }: ItemPageProps) {
  const { user, organizationId } = await getAuthData();

  const patientIdArray = await params;
  const patientId = Array.isArray(patientIdArray.id)
    ? patientIdArray.id[0]
    : patientIdArray.id;

  let patients: PatientResponse[] = [];
  try {
    patients = await fetchWithToken<PatientResponse[]>("/api/v1/patients", {
      query: { organization_id: organizationId ?? undefined },
    });
  } catch (error) {
    console.error("patient: Error fetching patients:", error);
  }

  return (
    <>
      <PageHeader
        title="New Admission"
        description="Fill in the patient details below to admit in your hospital."
        buttonLabel="View all"
        buttonLink="/admissions"
        buttonIcon={Eye}
      />
      <div className="px-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <AdmissionForm
              userId={user?.id ?? ""}
              organizationId={organizationId ?? ""}
              patients={patients.map((p) => ({
                ...p,
                last_updated: p.last_updated ?? "",
              }))}
              admissionData={patientId ? { patient_id: patientId } : undefined}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
