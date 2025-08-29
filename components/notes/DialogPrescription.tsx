"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { dischargeSummaryService } from "@/services/dischargeSummaryService";
import { ServiceError } from "@/types/fetchOptions";

interface PrescriptionResponse {
  patient_id: string;
  admission_id: string;
  prescription: {
    vitals: string;
    symptoms: string;
    diagnosis: string;
    medicines_prescribed: string;
    advice_followup: string;
  };
  message: string;
}

interface DialogPrescriptionProps {
  admissionId: string;
  patientId: string;
  organizationId: string;
  onSave?: (response: PrescriptionResponse) => void;
}

export function DialogPrescription({
  admissionId,
  patientId,
  organizationId,
  onSave,
}: DialogPrescriptionProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [prescription, setPrescription] = useState({
    vitals: "",
    symptoms: "",
    diagnosis: "",
    medicines_prescribed: "",
    advice_followup: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPrescription({
        vitals: "",
        symptoms: "",
        diagnosis: "",
        medicines_prescribed: "",
        advice_followup: "",
      });
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        patient_id: patientId,
        admission_id: admissionId,
        organization_id: organizationId,
        prescription,
        status: "draft" as const,
      };

      console.log("Submitting prescription:", payload);

      const response = await dischargeSummaryService.createPrescription(
        payload
      );
      console.log("✅ Created Prescription:", response);
      alert("Prescription saved successfully!");
      onSave?.(response);
      setOpen(false);
    } catch (err: unknown) {
      const serviceError = err as ServiceError;
      console.error("Error creating prescription:", serviceError);
      setError(
        serviceError.message || "Failed to save prescription. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAIPrescription() {
    setLoading(true);
    setError(null);
    try {
      const response = await dischargeSummaryService.generatePrescription(
        admissionId
      );
      if (response?.prescription) {
        setPrescription(response.prescription);
        alert("AI prescription generated and prefilled!");
      }
    } catch (err: unknown) {
      const serviceError = err as ServiceError;
      console.error("AI prescription generation failed:", serviceError);
      setError(
        serviceError.message ||
          "Failed to generate AI prescription. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Prescription</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] w-full max-h-[90vh] overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <DialogHeader className="space-y-1">
              <DialogTitle>Generate Prescription</DialogTitle>
              <DialogDescription>
                Either auto-generate or manually fill in the prescription
                details.
              </DialogDescription>
            </DialogHeader>
            <Button
              type="button"
              variant="secondary"
              className="self-start sm:self-auto"
              onClick={handleGenerateAIPrescription}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate AI Prescription"}
            </Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="vitals">Vitals</Label>
            <Textarea
              id="vitals"
              name="vitals"
              value={prescription.vitals}
              onChange={(e) =>
                setPrescription({ ...prescription, vitals: e.target.value })
              }
              placeholder="Enter vitals (e.g., BP, heart rate)"
              className="resize-y"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea
              id="symptoms"
              name="symptoms"
              value={prescription.symptoms}
              onChange={(e) =>
                setPrescription({ ...prescription, symptoms: e.target.value })
              }
              placeholder="Enter symptoms"
              className="resize-y"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              name="diagnosis"
              value={prescription.diagnosis}
              onChange={(e) =>
                setPrescription({ ...prescription, diagnosis: e.target.value })
              }
              placeholder="Enter diagnosis"
              className="resize-y"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="medicines_prescribed">Medicines Prescribed</Label>
            <Textarea
              id="medicines_prescribed"
              name="medicines_prescribed"
              value={prescription.medicines_prescribed}
              onChange={(e) =>
                setPrescription({
                  ...prescription,
                  medicines_prescribed: e.target.value,
                })
              }
              placeholder="Enter medicines prescribed"
              className="resize-y"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="advice_followup">Advice / Follow-up</Label>
            <Textarea
              id="advice_followup"
              name="advice_followup"
              value={prescription.advice_followup}
              onChange={(e) =>
                setPrescription({
                  ...prescription,
                  advice_followup: e.target.value,
                })
              }
              placeholder="Enter advice or follow-up instructions"
              className="resize-y"
            />
          </div>

          {error && <div className="text-red-500">{error}</div>}

          <DialogFooter className="flex justify-end space-x-2 pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
