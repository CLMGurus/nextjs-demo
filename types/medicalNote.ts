import { FileObject } from "./fileObject";

export interface MedicalNoteCreate {
  admission_id: string;
  patient_id: string;
  organization_id: string;
  note_type: string;
  content?: string;
  file?: FileObject;
  created_by: string;
}

export interface MedicalNoteUpdate {
  content?: string;
  transcribed_audio_text?: string;
  medified_audio_text?: string;
  patient_note?: string | null;
  medified_patient_note?: string | null;
  medified_text?: string;
}

export interface MedicalNoteResponse {
  id: string;
  admission_id: string;
  patient_id: string;
  organization_id: string;
  note_type: string;
  content?: string;
  file?: FileObject;
  created_by: string;
  created_at: string;
  transcribed_audio_text?: string;
  medified_audio_text?: string;
  patient_note?: string;
  medified_patient_note?: string;
  medified_text?: string;
}

export interface TranscriptionResponse {
  patient_id: string;
  admission_id: string;
  timestamp: string;
  transcribed_audio_text?: string;
  medified_audio_text?: string;
  audio_url?: string;
  patient_note?: string | null;
  medified_patient_note?: string | null;
  medified_text?: string;
}
