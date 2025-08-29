export interface PrescriptionFormat {
  vitals: string;
  symptoms: string;
  diagnosis: string;
  medicines_prescribed: string;
  advice_followup: string;
}

export interface PrescriptionResponse {
  patient_id: string;
  admission_id: string;
  prescription: PrescriptionFormat;
  message: string;
}

export interface PrescriptionCreate {
  patient_id: string;
  admission_id: string;
  organization_id: string;
  prescription: PrescriptionFormat;
  status?: "draft" | "final";
}
