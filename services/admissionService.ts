"use server";

import { cookies } from "next/headers";
import { fetchWithToken } from "@/lib/fetchApi/server";
import { getUserWithToken } from "@/utils/supabase/getUserWithToken";
import { AdmissionCreate, AdmissionResponse } from "@/types/admission";

export async function saveAdmission(formData: FormData, existingId?: string) {
  const cookieStore = await cookies();
  const authOrgsCookie = cookieStore.get("auth_orgs")?.value;
  let organizationId: string | null = null;

  if (authOrgsCookie) {
    const authOrgs = JSON.parse(authOrgsCookie);
    organizationId = authOrgs.currentOrganization?.id || null;
  }

  const user = await getUserWithToken();
  if (!user?.accessToken || !user?.id || !organizationId) {
    return { success: false, error: "Authentication required" };
  }

  const admissionData: AdmissionCreate = {
    admission_type: formData.get("admission_type") as any,
    admission_reason: formData.get("admission_reason") as string,
    ward: formData.get("ward") as string,
    bed_no: formData.get("bed_no") as string,
    admission_date: formData.get("admission_date") as string,
    status: formData.get("status") as any,
    patient_id: formData.get("patient_id") as string,
    organization_id: organizationId,
    created_by: user.id,
  };

  if (existingId && admissionData.status === "discharged") {
    admissionData["discharge_date"] = new Date().toISOString();
  }

  try {
    const endpoint = existingId
      ? `/api/v1/admissions/${existingId}`
      : `/api/v1/patients/${formData.get("patient_id")}/admissions`;
    const method = existingId ? "PUT" : "POST";

    const result = await fetchWithToken<AdmissionResponse, AdmissionCreate>(
      endpoint,
      { method, body: admissionData }
    );

    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save admission" };
  }
}
