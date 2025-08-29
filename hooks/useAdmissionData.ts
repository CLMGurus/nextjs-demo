import { useState, useEffect } from "react";
import { MedicalNoteResponse } from "@/types/medicalNote";
import { DischargeSummaryResponse } from "@/types/dischargeSummary";
import { PrescriptionResponse } from "@/types/prescription";
import { medicalNotesService } from "@/services/medicalNotesService";
import { dischargeSummaryService } from "@/services/dischargeSummaryService";
import { Message } from "@/types/message";

export function useAdmissionData(admissionId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotesForAdmission = async (admissionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setMessages([]);
      console.log(`Fetching data for admissionId: ${admissionId}`);

      // Fetch medical notes
      const notesData = await medicalNotesService.fetchNotesForAdmission(
        admissionId
      );
      console.log("Fetched notes:", notesData);

      // Fetch discharge summaries
      const summariesData =
        await dischargeSummaryService.fetchDischargeSummaries(admissionId);
      console.log("Fetched summaries:", summariesData);

      // Fetch prescriptions
      const prescriptionsData =
        await dischargeSummaryService.fetchPrescriptions(admissionId);
      console.log("Fetched prescriptions:", prescriptionsData);

      const formattedNotes: Message[] = notesData.map(
        (note: MedicalNoteResponse) => {
          const noteType = note.note_type.toLowerCase();
          const safeType: Extract<
            Message["type"],
            "text" | "file" | "image" | "audio"
          > = ["text", "file", "image", "audio"].includes(noteType)
            ? (noteType as any)
            : "text";

          return {
            id: note.id,
            type: safeType,
            sender: note.created_by,
            content: note.content || (note.file?.blob_url ?? ""),
            time: new Date(note.created_at).toISOString(),
            dbId: note.id,
            fileName:
              note.file?.file_name || note.content?.split("/").pop() || "file",
            fileType: note.file?.file_type,
            fileSize: note.file?.file_size,
            transcribedAudioText: note.transcribed_audio_text,
            medified_audio_text: note.medified_audio_text,
            patient_note: note.patient_id,
            medified_patient_note: note.medified_patient_note,
            medified_text: note.medified_text,
          } as Message;
        }
      );

      const formattedSummaries: Message[] = summariesData.map(
        (summary: DischargeSummaryResponse) =>
          ({
            id: `${
              summary.admission_id
            }-summary-${Date.now()}-${Math.random()}`,
            type: "summary",
            sender: "System",
            content: summary.summary,
            time: new Date().toISOString(),
            dbId: null,
            fileName: null,
            fileType: null,
            fileSize: null,
          } as Message)
      );

      const formattedPrescriptions: Message[] = prescriptionsData.map(
        (prescription: PrescriptionResponse) =>
          ({
            id: `${
              prescription.admission_id
            }-prescription-${Date.now()}-${Math.random()}`,
            type: "prescription",
            sender: "System",
            content: prescription.prescription,
            time: new Date().toISOString(),
            dbId: null,
            fileName: null,
            fileType: null,
            fileSize: null,
          } as Message)
      );

      // Combine and sort by time
      setMessages(
        [
          ...formattedNotes,
          ...formattedSummaries,
          ...formattedPrescriptions,
        ].sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        )
      );
    } catch (error: any) {
      console.error("Error fetching data for admission:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (admissionId) {
      fetchNotesForAdmission(admissionId);
    } else {
      setMessages([]);
      setError(null);
    }
  }, [admissionId]);

  return { messages, setMessages, isLoading, error };
}
