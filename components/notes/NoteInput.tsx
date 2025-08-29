"use client";

import React, { useState, useRef } from "react";
import { Send, Plus, Mic } from "lucide-react";
import { AdmissionResponse } from "@/types/admission";
import { MedicalNoteCreate, TranscriptionResponse } from "@/types/medicalNote";
import { medicalNotesService } from "@/services/medicalNotesService";
import { convertWebMToWAV } from "@/utils/audioUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message } from "@/types/message";
import { ServiceError } from "@/types/fetchOptions";

interface NoteInputProps {
  selectedAdmission?: AdmissionResponse;
  organizationId: string;
  userId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function NoteInput({
  selectedAdmission,
  organizationId,
  userId,
  setMessages,
}: NoteInputProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Trigger hidden file input
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection & upload
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !selectedAdmission?.id || !selectedAdmission || !userId) {
      alert("Please select an admission and ensure you are logged in.");
      return;
    }
    const tempMessageId = String(Date.now());

    // Add placeholder
    setMessages((prev) => [
      ...prev,
      {
        id: tempMessageId,
        type: file.type.startsWith("audio")
          ? "audio"
          : file.type.startsWith("image")
          ? "image"
          : "file",
        sender: "Me",
        content: "Uploading...",
        time: new Date().toLocaleString(),
        dbId: null,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        isLoading: true,
      } as Message,
    ]);

    try {
      // Upload file
      const persistedNote = await medicalNotesService.uploadFileAndPersistNote(
        file,
        selectedAdmission.id,
        selectedAdmission.patient_id,
        organizationId,
        userId
      );

      // Replace placeholder with real note
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessageId
            ? ({
                ...msg,
                content: persistedNote.file?.blob_url || "",
                dbId: persistedNote.id,
                fileName: persistedNote.file?.file_name || file.name,
                fileSize: persistedNote.file?.file_size,
                fileType: persistedNote.file?.file_type,
                isLoading: false,
              } as Message)
            : msg
        )
      );
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      console.error("File upload or persistence failed:", serviceError);
      alert(
        `Failed to upload file: ${serviceError.message || "Unknown error"}`
      );
      // Remove placeholder on failure
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
    } finally {
      event.target.value = ""; // Reset input
    }
  };

  // Send audio
  const sendAudio = async () => {
    if (
      !pendingAudio ||
      !selectedAdmission?.id ||
      !selectedAdmission ||
      !userId
    ) {
      alert(
        "Please select an admission, record audio, and ensure you are logged in."
      );
      return;
    }

    const audioMessageId = String(Date.now());

    setMessages((prev) => [
      ...prev,
      {
        id: audioMessageId,
        type: "audio",
        sender: "User",
        content: "Audio note",
        time: new Date().toLocaleString(),
        dbId: null,
        fileName: "Uploading audio...",
        fileSize: null,
        isLoading: true,
        isTranscribing: false,
        medified_audio_text: null,
      } as Message,
    ]);

    const controller = new AbortController();
    try {
      const wavBlob = await fetch(pendingAudio, {
        signal: controller.signal,
      }).then((res) => res.blob());

      const audioFile = new File([wavBlob], `audio_${Date.now()}.wav`, {
        type: "audio/wav",
      });

      const persistedNote = await medicalNotesService.uploadFileAndPersistNote(
        audioFile,
        selectedAdmission.id,
        selectedAdmission.patient_id,
        organizationId,
        userId
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === audioMessageId
            ? ({
                ...msg,
                content: persistedNote.file?.blob_url || "",
                dbId: persistedNote.id,
                fileName: persistedNote.file?.file_name || audioFile.name,
                fileSize: persistedNote.file?.file_size,
                fileType: persistedNote.file?.file_type,
                isLoading: false,
                isTranscribing: true,
              } as Message)
            : msg
        )
      );

      // Check if blob_url exists before proceeding
      if (!persistedNote.file?.blob_url) {
        throw new Error("No blob URL returned for uploaded audio");
      }

      const downloadUrl = await medicalNotesService.getDownloadableUrl(
        persistedNote.file.blob_url
      );

      const transcribedNote: TranscriptionResponse =
        await medicalNotesService.transcribeAudio(
          selectedAdmission.id,
          selectedAdmission.patient_id,
          downloadUrl
        );

      if (
        !transcribedNote?.medified_audio_text &&
        !transcribedNote?.medified_text
      ) {
        throw new Error("Transcription response missing medified text");
      }

      // Persist transcription back to DB
      await medicalNotesService.updateNote(persistedNote.id, {
        transcribed_audio_text: transcribedNote.transcribed_audio_text,
        medified_audio_text: transcribedNote.medified_audio_text,
        patient_note: transcribedNote.patient_note,
        medified_patient_note: transcribedNote.medified_patient_note,
        medified_text: transcribedNote.medified_text,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === audioMessageId
            ? {
                ...msg,
                medified_audio_text:
                  transcribedNote?.medified_audio_text ||
                  transcribedNote?.medified_text ||
                  "No transcription available",
                time: new Date(transcribedNote.timestamp).toLocaleString(),
                isLoading: false,
                isTranscribing: false,
              }
            : msg
        )
      );
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      console.error(
        "Audio upload or transcription failed:",
        serviceError.message,
        serviceError
      );
      alert(
        `Failed to upload or transcribe audio: ${
          serviceError.message || "Unknown error"
        }`
      );
      setMessages((prev) => prev.filter((msg) => msg.id !== audioMessageId));
    } finally {
      if (pendingAudio) {
        URL.revokeObjectURL(pendingAudio);
      }
      setPendingAudio(null);
      controller.abort();
    }
  };

  // Toggle recording
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      if (pendingAudio) {
        URL.revokeObjectURL(pendingAudio);
        setPendingAudio(null);
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        const recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });

        recorder.ondataavailable = (e) => {
          audioChunks.current.push(e.data);
        };

        recorder.onstop = async () => {
          const webmBlob = new Blob(audioChunks.current, {
            type: "audio/webm",
          });
          audioChunks.current = [];

          const wavBlob = await convertWebMToWAV(webmBlob);
          const audioURL = URL.createObjectURL(wavBlob);
          setPendingAudio(audioURL);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err: unknown) {
        const serviceError = err as ServiceError;
        console.error("Mic access denied:", serviceError);
        alert("Microphone access denied. Please allow access to record audio.");
      }
    }
  };

  // Cancel audio
  const cancelAudio = () => {
    if (pendingAudio) {
      URL.revokeObjectURL(pendingAudio);
      setPendingAudio(null);
    }
    setIsRecording(false);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current?.stop();
    }
  };

  // Handle sending text notes
  const handleSend = async () => {
    if (
      !newMessage.trim() ||
      !selectedAdmission?.id ||
      !selectedAdmission ||
      !userId
    ) {
      alert(
        "Please select an admission, enter a message, and ensure you are logged in."
      );
      return;
    }

    try {
      const noteData: MedicalNoteCreate = {
        admission_id: selectedAdmission.id,
        patient_id: selectedAdmission.patient_id,
        organization_id: organizationId,
        note_type: "text",
        content: newMessage,
        created_by: userId,
      };

      const persistedNote = await medicalNotesService.persistNoteToDB(noteData);

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          type: "text",
          sender: "Me",
          content: newMessage,
          time: new Date().toLocaleString(),
          dbId: persistedNote.id,
          fileName: null,
          fileType: null,
          fileSize: null,
        } as Message,
      ]);
      setNewMessage("");
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      console.error("Failed to persist message:", serviceError);
      alert(
        `Failed to send message: ${serviceError.message || "Unknown error"}`
      );
    }
  };

  return (
    <div className="border-t p-4 flex items-center gap-2 bg-muted/30">
      {pendingAudio ? (
        <>
          <audio controls src={pendingAudio} className="flex-1" />
          <Button variant="ghost" size="icon" onClick={cancelAudio}>
            <Plus className="h-5 w-5 rotate-45" />
          </Button>
          <Button size="icon" onClick={sendAudio}>
            <Send className="h-5 w-5" />
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" size="icon" onClick={handleFileClick}>
            <Plus className="h-5 w-5" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*, .pdf, audio/*"
          />
          <Input
            placeholder="Write a note..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1"
          />
          <Button
            variant={isRecording ? "destructive" : "ghost"}
            size="icon"
            onClick={toggleRecording}
          >
            <Mic
              className={isRecording ? "animate-pulse text-white" : "h-5 w-5"}
            />
          </Button>
          <Button onClick={handleSend} size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </>
      )}
    </div>
  );
}
