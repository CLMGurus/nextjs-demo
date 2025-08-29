export interface AdmissionCreate {
  admission_type: "inpatient" | "outpatient" | "emergency";
  admission_reason?: string;
  ward?: string;
  bed_no?: string;
  admission_date: string; // "yyyy-MM-dd" or ISO string
  status: "admitted" | "discharged";
  patient_id: string;
  organization_id: string;
  created_by: string;
  discharge_date?: string;
}

export interface AdmissionResponse extends AdmissionCreate {
  id: string;
  patient_name?: string;
  created_at: string;
  updated_at: string;
}
