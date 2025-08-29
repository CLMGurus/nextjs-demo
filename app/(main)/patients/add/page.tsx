import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PatientForm from "@/app/(main)/patients/PatientForm";
import { getAuthData } from "@/lib/auth";
import { Eye } from "lucide-react";

export default async function AddPatientPage() {
  await getAuthData();

  return (
    <>
      <PageHeader
        title="New Patient"
        description="Fill in the patient details below to register a new patient in your hospital."
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
            <PatientForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
