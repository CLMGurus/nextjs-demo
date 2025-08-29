import { AdmissionResponse } from "@/types/admission";
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

export default async function EditAdmissionPage({ params }: ItemPageProps) {
  const { id: admissionId } = await params;

  const { user, organizationId } = await getAuthData();

  let admission: AdmissionResponse[] = [];
  try {
    admission = await fetchWithToken<AdmissionResponse[]>(
      "/api/v1/admissions",
      {
        query: { admission_id: admissionId },
      }
    );
  } catch (error) {
    console.error("Error fetching Admissions:", error);
  }

  let patients: PatientResponse[] = [];
  try {
    patients = await fetchWithToken<PatientResponse[]>("/api/v1/patients", {
      query: { organization_id: organizationId ?? undefined },
    });
  } catch (error) {
    console.error("paient: Error fetching patients:", error);
  }

  return (
    <>
      <PageHeader
        title="Edit Admission"
        description="Fill in the patient details below to edit the patient's admission."
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
              admissionData={
                admission.length > 0
                  ? {
                      ...admission[0],
                      admission_type:
                        admission[0].admission_type === "inpatient" ||
                        admission[0].admission_type === "outpatient"
                          ? admission[0].admission_type
                          : undefined,
                      admission_date: admission[0].admission_date
                        ? new Date(admission[0].admission_date)
                        : undefined,
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
