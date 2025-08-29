// In a shared types file, e.g., src/types/message.ts

import { DischargeSummaryFormat } from "./dischargeSummary";
import { PrescriptionFormat } from "./prescription";

interface BaseMessage {
  id: string;
  sender: string;
  time: string;
  dbId: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
}

export type Message =
  | (BaseMessage & {
      type: "text" | "file" | "image" | "audio";
      content: string;
      isLoading?: boolean;
      isTranscribing?: boolean;
      medified_audio_text?: string | null;
      transcribedAudioText?: string | null;
      patient_note?: string | null;
      medified_patient_note?: string | null;
      medified_text?: string | null;
    })
  | (BaseMessage & {
      type: "summary";
      content: DischargeSummaryFormat;
    })
  | (BaseMessage & {
      type: "prescription";
      content: PrescriptionFormat;
    });
