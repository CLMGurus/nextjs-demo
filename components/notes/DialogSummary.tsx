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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { dischargeSummaryService } from "@/services/dischargeSummaryService";
import { ServiceError } from "@/types/fetchOptions";

interface DischargeSummaryResponse {
  patient_id: string;
  admission_id: string;
  summary: {
    symptoms_at_admission: string;
    diagnosis_initial_final: string;
    examinations_investigations: string;
    treatments_procedures: string;
    followup_advice: string;
    next_followup: string;
  };
  message: string;
}

interface DialogSummaryProps {
  admissionId: string;
  patientId: string;
  organizationId: string;
  onSave?: (response: DischargeSummaryResponse) => void; // Add onSave prop
}

export function DialogSummary({
  admissionId,
  patientId,
  organizationId,
  onSave,
}: DialogSummaryProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState({
    symptoms_at_admission: "",
    diagnosis_initial_final: "",
    examinations_investigations: "",
    treatments_procedures: "",
    followup_advice: "",
    next_followup: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSummary({
        symptoms_at_admission: "",
        diagnosis_initial_final: "",
        examinations_investigations: "",
        treatments_procedures: "",
        followup_advice: "",
        next_followup: "",
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
        summary,
        status: "draft" as const,
      };

      console.log("Submitting discharge summary:", payload);

      const response = await dischargeSummaryService.createDischargeSummary(
        payload
      );
      console.log("✅ Created Discharge Summary:", response);
      alert("Discharge summary saved successfully!");
      onSave?.(response); // Call onSave with response
      setOpen(false);
    } catch (err: unknown) {
      const serviceError = err as ServiceError;
      console.error("Error creating summary:", serviceError);
      setError(
        serviceError.message || "Failed to save summary. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAISummary() {
    setLoading(true);
    setError(null);
    try {
      const response = await dischargeSummaryService.generateDischargeSummary(
        admissionId
      );
      if (response?.summary) {
        setSummary(response.summary);
        alert("AI summary generated and prefilled!");
      }
    } catch (err: unknown) {
      const serviceError = err as ServiceError;
      console.error("AI summary generation failed:", serviceError);
      setError(
        serviceError.message ||
          "Failed to generate AI summary. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Discharge Summary</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] w-full max-h-[90vh] overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <DialogHeader className="space-y-1">
              <DialogTitle>Generate Discharge Summary</DialogTitle>
              <DialogDescription>
                Either auto-generate or manually fill in the discharge details.
              </DialogDescription>
            </DialogHeader>
            <Button
              type="button"
              variant="secondary"
              className="self-start sm:self-auto"
              onClick={handleGenerateAISummary}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate AI Summary"}
            </Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="symptoms_at_admission">Symptoms at Admission</Label>
            <Textarea
              id="symptoms_at_admission"
              name="symptoms_at_admission"
              value={summary.symptoms_at_admission}
              onChange={(e) =>
                setSummary({
                  ...summary,
                  symptoms_at_admission: e.target.value,
                })
              }
              placeholder="Enter symptoms at admission"
              className="resize-y"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="diagnosis_initial_final">Diagnosis</Label>
            <Textarea
              id="diagnosis_initial_final"
              name="diagnosis_initial_final"
              value={summary.diagnosis_initial_final}
              onChange={(e) =>
                setSummary({
                  ...summary,
                  diagnosis_initial_final: e.target.value,
                })
              }
              placeholder="Enter initial/final diagnosis"
              className="resize-y"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="examinations_investigations">
              Examinations / Investigations
            </Label>
            <Textarea
              id="examinations_investigations"
              name="examinations_investigations"
              value={summary.examinations_investigations}
              onChange={(e) =>
                setSummary({
                  ...summary,
                  examinations_investigations: e.target.value,
                })
              }
              placeholder="Enter investigations performed"
              className="resize-y"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="treatments_procedures">
              Treatments / Procedures
            </Label>
            <Textarea
              id="treatments_procedures"
              name="treatments_procedures"
              value={summary.treatments_procedures}
              onChange={(e) =>
                setSummary({
                  ...summary,
                  treatments_procedures: e.target.value,
                })
              }
              placeholder="Enter treatments or procedures"
              className="resize-y"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="followup_advice">Follow-up Advice</Label>
            <Textarea
              id="followup_advice"
              name="followup_advice"
              value={summary.followup_advice}
              onChange={(e) =>
                setSummary({
                  ...summary,
                  followup_advice: e.target.value,
                })
              }
              placeholder="Enter follow-up advice"
              className="resize-y"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="next_followup">Next Follow-up</Label>
            <Input
              id="next_followup"
              name="next_followup"
              value={summary.next_followup}
              onChange={(e) =>
                setSummary({
                  ...summary,
                  next_followup: e.target.value,
                })
              }
              placeholder="e.g. In 2 weeks"
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
