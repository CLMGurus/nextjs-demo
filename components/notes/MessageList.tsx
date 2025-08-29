"use client";

import React, { useState } from "react";
import { AdmissionResponse } from "@/types/admission";
import { TranscriptionResponse } from "@/types/medicalNote";
import { medicalNotesService } from "@/services/medicalNotesService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ServiceError } from "@/types/fetchOptions";
import {
  FileText,
  FileAudio,
  FileImage,
  Captions,
  Download,
  ClipboardList,
  Pill,
} from "lucide-react";
import { formatFileSize } from "@/utils/fileUtils";
import { Message } from "@/types/message";
import { PrescriptionFormat } from "@/types/prescription";
import { DischargeSummaryFormat } from "@/types/dischargeSummary";

interface MessageListProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  selectedAdmission?: AdmissionResponse;
  isLoading: boolean;
}

export function MessageList({
  messages,
  setMessages,
  selectedAdmission,
  isLoading,
}: MessageListProps) {
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [transcribingFile, setTranscribingFile] = useState<string | null>(null);

  // Handle file download
  const handleFileDownload = async (fileUrl: string, fileName: string) => {
    try {
      setLoadingFile(fileName);
      const downloadUrl = await medicalNotesService.getDownloadableUrl(fileUrl);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    } finally {
      setLoadingFile(null);
    }
  };

  // Handle audio transcription
  const handleTranscribeFile = async (
    fileUrl: string,
    fileName: string,
    selectedAdmission: AdmissionResponse
  ) => {
    try {
      setTranscribingFile(fileName);
      const downloadUrl = await medicalNotesService.getDownloadableUrl(fileUrl);
      console.log("Download URL:", downloadUrl);

      const transcribedNote: TranscriptionResponse =
        await medicalNotesService.transcribeAudio(
          selectedAdmission.id,
          selectedAdmission.patient_id,
          downloadUrl
        );
      console.log("Transcription Response:", transcribedNote);

      if (messages.length > 0) {
        const originalFileNote = messages.find(
          (msg) => msg.fileName === fileName && msg.type === "file"
        );

        if (originalFileNote?.dbId) {
          await medicalNotesService.updateNote(originalFileNote.dbId, {
            transcribed_audio_text: transcribedNote.transcribed_audio_text,
            medified_audio_text: transcribedNote.medified_audio_text,
            patient_note: transcribedNote.patient_note,
            medified_patient_note: transcribedNote.medified_patient_note,
            medified_text: transcribedNote.medified_text,
          });
        }
      }

      if (
        !transcribedNote?.medified_audio_text &&
        !transcribedNote?.medified_text
      ) {
        throw new Error("Transcription response missing medified text");
      }

      // Update the existing file message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.fileName === fileName && msg.type === "file"
            ? {
                ...msg,
                medified_audio_text:
                  transcribedNote?.medified_audio_text ||
                  transcribedNote?.medified_text ||
                  "No transcription available",
                time: new Date(transcribedNote.timestamp).toLocaleString(),
              }
            : msg
        )
      );
    } catch (err: unknown) {
      const serviceError = err as ServiceError;
      console.error("Error transcribing file:", serviceError);
      alert(
        `Failed to transcribe audio: ${serviceError.message || "Unknown error"}`
      );
    } finally {
      setTranscribingFile(null);
    }
  };

  return (
    <div className="flex-1 min-h-0">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              Loading data...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No notes, summaries, or prescriptions for this admission
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border p-4 shadow-sm space-y-2 ${
                  msg.type === "summary"
                    ? "border-blue-500 bg-blue-50"
                    : msg.type === "prescription"
                    ? "border-green-500 bg-green-50"
                    : "bg-card"
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {msg.type === "summary" ? (
                      <ClipboardList className="h-5 w-5 text-blue-500" />
                    ) : msg.type === "prescription" ? (
                      <Pill className="h-5 w-5 text-green-500" />
                    ) : null}
                    <span className="font-medium text-sm">
                      {msg.type === "summary"
                        ? "Discharge Summary"
                        : msg.type === "prescription"
                        ? "Prescription"
                        : msg.sender}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {msg.time}
                  </span>
                </div>

                {/* Text Message */}
                {msg.type === "text" && (
                  <p
                    className={`text-sm leading-relaxed bg-muted/30 p-3 rounded-lg ${
                      msg.isLoading ? "text-gray-400 italic" : ""
                    }`}
                  >
                    {msg.content}
                  </p>
                )}

                {/* File / Image / Audio */}
                {(msg.type === "file" ||
                  msg.type === "image" ||
                  msg.type === "audio") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        {msg.fileType?.includes("image") ? (
                          <FileImage className="h-5 w-5 text-muted-foreground" />
                        ) : msg.fileType?.includes("audio") ? (
                          <FileAudio className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium truncate max-w-[180px]">
                          {msg.isLoading ? "Uploading..." : msg.fileName}
                        </span>
                        {msg.fileSize && (
                          <span className="text-xs text-muted-foreground">
                            ({formatFileSize(msg.fileSize)})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {msg.fileType?.includes("audio") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              selectedAdmission &&
                              handleTranscribeFile(
                                msg.content,
                                msg.fileName ?? "",
                                selectedAdmission
                              )
                            }
                            disabled={
                              !selectedAdmission ||
                              transcribingFile === msg.fileName
                            }
                          >
                            {transcribingFile === msg.fileName ? (
                              "Transcribing..."
                            ) : (
                              <Captions className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleFileDownload(
                              msg.content as string,
                              msg.fileName ?? ""
                            )
                          }
                          disabled={loadingFile === msg.fileName}
                        >
                          {loadingFile === msg.fileName ? (
                            "Loading..."
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {msg.isTranscribing ? (
                      <p className="text-sm italic text-muted-foreground">
                        Transcribing...
                      </p>
                    ) : msg.medified_audio_text ? (
                      <p className="text-sm text-muted-foreground bg-muted/20 p-2 rounded-md">
                        {msg.medified_audio_text}
                      </p>
                    ) : null}
                  </div>
                )}

                {/* Discharge Summary */}
                {/* Discharge Summary */}
                {msg.type === "summary" && (
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const content = msg.content as DischargeSummaryFormat;
                      return (
                        <>
                          <p>
                            <strong>Symptoms at Admission:</strong>{" "}
                            {content.symptoms_at_admission}
                          </p>
                          <p>
                            <strong>Diagnosis:</strong>{" "}
                            {content.diagnosis_initial_final}
                          </p>
                          <p>
                            <strong>Examinations/Investigations:</strong>{" "}
                            {content.examinations_investigations}
                          </p>
                          <p>
                            <strong>Treatments/Procedures:</strong>{" "}
                            {content.treatments_procedures}
                          </p>
                          <p>
                            <strong>Follow-up Advice:</strong>{" "}
                            {content.followup_advice}
                          </p>
                          <p>
                            <strong>Next Follow-up:</strong>{" "}
                            {content.next_followup}
                          </p>
                          <div className="flex justify-end space-x-1">
                            <Button variant="outline" color="primary" size="sm">
                              Edit
                            </Button>
                            <Button color="primary" size="sm">
                              Finalize
                            </Button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Prescription */}
                {msg.type === "prescription" && (
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const content = msg.content as PrescriptionFormat;
                      return (
                        <>
                          <p>
                            <strong>Vitals:</strong> {content.vitals}
                          </p>
                          <p>
                            <strong>Symptoms:</strong> {content.symptoms}
                          </p>
                          <p>
                            <strong>Diagnosis:</strong> {content.diagnosis}
                          </p>
                          <p>
                            <strong>Medicines Prescribed:</strong>{" "}
                            {content.medicines_prescribed}
                          </p>
                          <p>
                            <strong>Advice/Follow-up:</strong>{" "}
                            {content.advice_followup}
                          </p>
                          <div className="flex justify-end space-x-1">
                            <Button variant="outline" color="primary" size="sm">
                              Edit
                            </Button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
