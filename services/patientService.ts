"use server";

import { cookies } from "next/headers";
import { fetchWithToken } from "@/lib/fetchApi/server";
import { getUserWithToken } from "@/utils/supabase/getUserWithToken";
import { PatientResponse, PatientCreate } from "@/types/patient";

export async function savePatient(formData: FormData, existingId?: string) {
  const cookieStore = await cookies();
  const authOrgsCookie = cookieStore.get("auth_orgs")?.value;
  let organizationId: string | null = null;

  if (authOrgsCookie) {
    try {
      const authOrgs = JSON.parse(authOrgsCookie);
      organizationId = authOrgs.currentOrganization?.id || null;
    } catch (error) {
      console.error("savePatient: Failed to parse auth_orgs:", error);
      return { success: false, error: "Invalid organization data" };
    }
  }

  if (!organizationId) {
    return { success: false, error: "No organization selected" };
  }

  const user = await getUserWithToken();
  if (!user?.accessToken || !user?.id) {
    return { success: false, error: "Authentication required" };
  }

  const patientData: PatientCreate = {
    patient_name: formData.get("patient_name") as string,
    patient_id: formData.get("patient_id") as string | undefined,
    organization_id: organizationId,
    patient_sex: formData.get("patient_sex") as string | undefined,
    patient_birth_date: formData.get("patient_birth_date") as
      | string
      | undefined,
    mobile_no: formData.get("mobile_no") as string | undefined,
    abha_no: formData.get("abha_no") as string | undefined,
    created_by: user.id,
  };

  try {
    const endpoint = existingId
      ? `/api/v1/patients/${existingId}`
      : `/api/v1/patients`;

    const method = existingId ? "PUT" : "POST";

    const result = await fetchWithToken<PatientResponse, PatientCreate>(
      endpoint,
      {
        method,
        body: patientData,
      }
    );

    return { success: true, data: result };
  } catch (error: any) {
    console.error("savePatient: Error:", error);
    return { success: false, error: error.message || "Failed to save patient" };
  }
}
