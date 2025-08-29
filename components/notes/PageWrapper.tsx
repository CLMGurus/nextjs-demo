"use client";

import React, { useState, useEffect } from "react";
import { AdmissionResponse } from "@/types/admission";
import { AdmissionsSidebar } from "@/components/notes/AdmissionsSidebar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DialogPrescription } from "@/components/notes/DialogPrescription";
import { DialogSummary } from "@/components/notes/DialogSummary";
import { NoteInput } from "@/components/notes/NoteInput";
import { MessageList } from "@/components/notes/MessageList";
import { DischargeSummaryResponse } from "@/types/dischargeSummary";
import { PrescriptionResponse } from "@/types/prescription";
import { useAdmissionData } from "@/hooks/useAdmissionData";
import { Message } from "@/types/message";

interface PageWrapperProps {
  admissions: AdmissionResponse[];
  organizationId: string;
  selectedAdmissionId?: string;
  user: { id: string; fullName: string; email: string; role: string } | null;
}

const PageWrapper = ({
  admissions,
  organizationId,
  selectedAdmissionId: initialSelectedAdmissionId,
  user,
}: PageWrapperProps) => {
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>(
    initialSelectedAdmissionId || null
  );
  const [selectedAdmission, setSelectedAdmission] =
    useState<AdmissionResponse | null>(null);
  const { messages, setMessages, isLoading, error } =
    useAdmissionData(selectedAdmissionId);

  // Initialize selectedAdmissionId from URL and preselect first admission if none provided
  useEffect(() => {
    if (initialSelectedAdmissionId) {
      setSelectedAdmissionId(initialSelectedAdmissionId);
    } else if (admissions.length > 0 && !selectedAdmissionId) {
      setSelectedAdmissionId(admissions[0].id);
    }
  }, [initialSelectedAdmissionId, admissions, selectedAdmissionId]);

  // Set selected admission details when ID changes
  useEffect(() => {
    if (selectedAdmissionId) {
      const admission = admissions.find(
        (adm) => adm.id === selectedAdmissionId
      );
      setSelectedAdmission(admission || null);
    } else {
      setSelectedAdmission(null);
    }
  }, [admissions, selectedAdmissionId]); // Added selectedAdmissionId to dependencies

  const handleSummarySave = (response: DischargeSummaryResponse) => {
    setMessages((prev) =>
      [
        ...prev,
        {
          id: `${response.admission_id}-summary-${Date.now()}-${Math.random()}`,
          type: "summary",
          sender: "System",
          content: response.summary,
          time: new Date().toISOString(),
          dbId: null,
          fileName: null,
          fileType: null,
          fileSize: null,
        } satisfies Message,
      ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    );
  };

  const handlePrescriptionSave = (response: PrescriptionResponse) => {
    setMessages((prev) =>
      [
        ...prev,
        {
          id: `${
            response.admission_id
          }-prescription-${Date.now()}-${Math.random()}`,
          type: "prescription",
          sender: "System",
          content: response.prescription,
          time: new Date().toISOString(),
          dbId: null,
          fileName: null,
          fileType: null,
          fileSize: null,
        } satisfies Message,
      ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    );
  };

  return (
    <div className="grid grid-cols-[300px_1fr] h-full overflow-hidden">
      <AdmissionsSidebar
        admissions={admissions}
        selectedAdmissionId={selectedAdmissionId ?? ""}
      />

      <Card className="flex flex-col h-[calc(100vh-64px)] py-0 rounded-none border-0">
        {selectedAdmission ? (
          <>
            {/* Header */}
            <div className="border-b p-4 flex items-center gap-3 bg-muted/30">
              <Avatar>
                <AvatarFallback>
                  {selectedAdmission.patient_name
                    ? selectedAdmission.patient_name.slice(0, 2).toUpperCase()
                    : ""}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {selectedAdmission.patient_name
                    ? selectedAdmission.patient_name.toUpperCase()
                    : "Select a patient"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedAdmission
                    ? `Patient ID: ${selectedAdmission.patient_id} • ${selectedAdmission.ward} • Bed ${selectedAdmission.bed_no}`
                    : "No patient selected"}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <DialogPrescription
                  admissionId={selectedAdmission.id}
                  patientId={selectedAdmission.patient_id}
                  organizationId={organizationId}
                  onSave={handlePrescriptionSave}
                />
                <DialogSummary
                  admissionId={selectedAdmission.id}
                  patientId={selectedAdmission.patient_id}
                  organizationId={organizationId}
                  onSave={handleSummarySave}
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="text-red-500 text-center p-4">{error}</div>
            )}

            {/* Messages */}
            <MessageList
              messages={messages}
              setMessages={setMessages}
              selectedAdmission={selectedAdmission}
              isLoading={isLoading}
            />

            {/* Input */}
            <NoteInput
              selectedAdmission={selectedAdmission}
              organizationId={organizationId}
              userId={user?.id ?? null}
              setMessages={setMessages}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select an admission to view and add notes
          </div>
        )}
      </Card>
    </div>
  );
};

export default PageWrapper;
