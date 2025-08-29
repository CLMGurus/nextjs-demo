import { fetchWithClientToken } from "@/lib/fetchApi/client";
import {
  MedicalNoteCreate,
  MedicalNoteResponse,
  MedicalNoteUpdate,
  TranscriptionResponse,
} from "@/types/medicalNote";
import { FileObject } from "@/types/fileObject";

export const medicalNotesService = {
  async fetchNotesForAdmission(
    admissionId: string
  ): Promise<MedicalNoteResponse[]> {
    try {
      return await fetchWithClientToken<MedicalNoteResponse[]>(
        `/api/v1/medical-notes/admission/${admissionId}`
      );
    } catch (error) {
      console.error("Error fetching notes:", error);
      throw new Error("Failed to load notes. Please try again.");
    }
  },

  async persistNoteToDB(
    noteData: MedicalNoteCreate
  ): Promise<MedicalNoteResponse> {
    try {
      return await fetchWithClientToken<MedicalNoteResponse>(
        "/api/v1/medical-notes",
        {
          method: "POST",
          body: noteData,
        }
      );
    } catch (error) {
      console.error("Error persisting note to database:", error);
      throw new Error("Failed to persist note. Please try again.");
    }
  },

  // Get downloadable URL for a file
  async getDownloadableUrl(fileUrl: string): Promise<string> {
    try {
      const filename = fileUrl.split("/").pop();
      if (!filename) return fileUrl;

      const { download_url } = await fetchWithClientToken<{
        download_url: string;
      }>(`/api/v1/generate-download-url`, { query: { filename } });
      return download_url;
    } catch (error) {
      console.error("Error generating download URL:", error);
      throw new Error("Failed to generate download URL. Please try again.");
    }
  },

  async uploadFileAndPersistNote(
    file: File,
    admissionId: string,
    patientId: string,
    organizationId: string,
    createdBy: string
  ): Promise<MedicalNoteResponse> {
    const controller = new AbortController();

    try {
      const { upload_url } = await fetchWithClientToken<{ upload_url: string }>(
        `/api/v1/generate-upload-url`,
        { query: { filename: file.name } }
      );

      const uploadResult = await fetch(upload_url, {
        method: "PUT",
        headers: { "x-ms-blob-type": "BlockBlob" },
        body: file,
        signal: controller.signal,
      });
      if (!uploadResult.ok) {
        throw new Error("File upload failed");
      }

      let type: "file" | "image" | "audio" = "file";

      const fileUrl = `https://pxfilesartifacts.blob.core.windows.net/huemr-blob/${file.name}`;

      const fileObject: FileObject = {
        blob_url: fileUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
      };

      const noteData: MedicalNoteCreate = {
        admission_id: admissionId,
        patient_id: patientId,
        organization_id: organizationId,
        note_type: type,
        file: fileObject,
        created_by: createdBy,
      };

      return await medicalNotesService.persistNoteToDB(noteData);
    } catch (error) {
      console.error("File upload or persistence failed:", error);
      throw new Error("Failed to upload file. Please try again.");
    }
  },

  async transcribeAudio(
    admissionId: string,
    patientId: string,
    audioUrl: string
  ): Promise<TranscriptionResponse> {
    try {
      const response = await fetchWithClientToken<TranscriptionResponse>(
        "/api/v1/transcribe",
        {
          method: "POST",
          body: {
            admission_id: admissionId,
            audio_url: audioUrl,
            patient_id: patientId,
            patient_notes: "",
          },
        }
      );

      console.log("Raw API response:", response);

      if (!response || !response.medified_audio_text) {
        throw new Error("Invalid transcription response");
      }

      return response;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw new Error("Failed to transcribe audio. Please try again.");
    }
  },

  async updateNote(
    noteId: string,
    updates: MedicalNoteUpdate
  ): Promise<MedicalNoteResponse> {
    try {
      return await fetchWithClientToken<MedicalNoteResponse>(
        `/api/v1/medical-notes/${noteId}`,
        {
          method: "PATCH",
          body: updates,
        }
      );
    } catch (error) {
      console.error("Error updating note:", error);
      throw new Error("Failed to update note. Please try again.");
    }
  },
};
