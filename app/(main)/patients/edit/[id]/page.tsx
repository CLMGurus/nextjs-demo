import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { fetchWithToken } from "@/lib/fetchApi/server";
import { getAuthData } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Patient } from "@/types/patient";
import PatientForm from "@/app/(main)/patients/PatientForm";

interface ItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPatientPage({ params }: ItemPageProps) {
  const { id: patientId } = await params;

  await getAuthData();

  const patient = await fetchWithToken(`/api/v1/patients/${patientId}`);

  return (
    <>
      <PageHeader
        title="Edit Patient"
        description="Fill in the patient details below to edit the existing patient in
            your hospital."
        buttonLabel="View all"
        buttonLink="/patients"
        buttonIcon={Eye}
      />
      <div className="px-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <PatientForm patientData={patient as Patient} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
