import { fetchWithClientToken } from "@/lib/fetchApi/client";
import {
  DischargeSummaryCreate,
  DischargeSummaryResponse,
  DischargeSummaryUpdate,
} from "@/types/dischargeSummary";
import { PrescriptionCreate, PrescriptionResponse } from "@/types/prescription";

export const dischargeSummaryService = {
  async createDischargeSummary(
    summaryData: DischargeSummaryCreate
  ): Promise<DischargeSummaryResponse> {
    try {
      return await fetchWithClientToken<DischargeSummaryResponse>(
        "/api/v1/create-discharge-summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: summaryData,
        }
      );
    } catch (error) {
      console.error("Error creating discharge summary:", error);
      throw new Error("Failed to create discharge summary. Please try again.");
    }
  },

  async updateDischargeSummary(
    summaryId: string,
    updates: DischargeSummaryUpdate
  ): Promise<DischargeSummaryResponse> {
    try {
      return await fetchWithClientToken<DischargeSummaryResponse>(
        `/api/v1/update-discharge-summary/${summaryId}`,
        {
          method: "PUT",
          body: JSON.stringify(updates), // Explicitly serialize to JSON
        }
      );
    } catch (error) {
      console.error("Error updating discharge summary:", error);
      throw new Error("Failed to update discharge summary. Please try again.");
    }
  },

  async generateDischargeSummary(
    admissionId: string
  ): Promise<DischargeSummaryResponse> {
    try {
      const response = await fetchWithClientToken<DischargeSummaryResponse>(
        `/api/v1/generate-discharge-summary?admission_id=${admissionId}`,
        { method: "POST" }
      );
      return response;
    } catch (error: any) {
      console.error("Error generating discharge summary:", error);
      let errorMessage =
        "Failed to generate discharge summary. Please try again.";
      if (error.response) {
        const errorData = await error.response.json();
        errorMessage = errorData.detail || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },
  async generatePrescription(
    admissionId: string
  ): Promise<PrescriptionResponse> {
    try {
      const response = await fetchWithClientToken<PrescriptionResponse>(
        `/api/v1/generate-prescription?admission_id=${admissionId}`,
        { method: "POST" }
      );
      return response;
    } catch (error: any) {
      console.error("Error generating prescription:", error);
      let errorMessage = "Failed to generate prescription. Please try again.";
      if (error.response) {
        const errorData = await error.response.json();
        errorMessage = errorData.detail || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },
  async createPrescription(
    prescriptionData: PrescriptionCreate
  ): Promise<PrescriptionResponse> {
    try {
      return await fetchWithClientToken<PrescriptionResponse>(
        "/api/v1/create-prescription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: prescriptionData,
        }
      );
    } catch (error: any) {
      console.error("Error creating prescription:", error);
      let errorMessage = "Failed to create prescription. Please try again.";
      if (error.response) {
        const errorData = await error.response.json();
        errorMessage = errorData.detail || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  async fetchDischargeSummaries(
    admissionId: string
  ): Promise<DischargeSummaryResponse[]> {
    try {
      return await fetchWithClientToken<DischargeSummaryResponse[]>(
        `/api/v1/discharge-summaries/${admissionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      console.error("Error fetching discharge summaries:", error);
      let errorMessage =
        "Failed to fetch discharge summaries. Please try again.";
      if (error.response) {
        const errorData = await error.response.json();
        errorMessage = errorData.detail || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },
  async fetchPrescriptions(
    admissionId: string
  ): Promise<PrescriptionResponse[]> {
    try {
      return await fetchWithClientToken<PrescriptionResponse[]>(
        `/api/v1/prescriptions/${admissionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      console.error("Error fetching prescriptions:", error);
      let errorMessage = "Failed to fetch prescriptions. Please try again.";
      if (error.response) {
        const errorData = await error.response.json();
        errorMessage = errorData.detail || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },
};
