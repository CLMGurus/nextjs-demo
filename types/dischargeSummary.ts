export interface DischargeSummaryFormat {
  symptoms_at_admission: string;
  diagnosis_initial_final: string;
  examinations_investigations: string;
  treatments_procedures: string;
  followup_advice: string;
  next_followup: string;
}

export interface DischargeSummaryCreate {
  patient_id: string;
  admission_id: string;
  organization_id: string;
  summary: DischargeSummaryFormat;
  status?: "draft" | "final";
}

export interface DischargeSummaryUpdate {
  summary?: Partial<DischargeSummaryFormat>;
  status?: "draft" | "final";
}

export interface DischargeSummaryResponse {
  patient_id: string;
  admission_id: string;
  summary: DischargeSummaryFormat;
  message: string;
}
