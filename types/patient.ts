export interface PatientBase {
  patient_name: string;
  patient_id?: string;
  organization_id?: string;
  patient_sex?: string;
  patient_birth_date?: string;
  mobile_no?: string;
  abha_no?: string;
  created_by?: string;
}

export interface StudyInfo {
  study_instance_uid: string;
  study_date?: string;
  study_description?: string;
  modalities: string[];
  parent_study?: string;
  parent_patient?: string;
}

export interface Patient extends PatientBase {
  id: string;
  study_info?: StudyInfo;
  last_updated: string;
}

export type PatientCreate = PatientBase;

export interface PatientResponse extends PatientCreate {
  id: string;
  last_updated?: string;
  created_at?: string;
}
