"use client";

import { AdmissionResponse } from "@/types/admission";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface AdmissionsSidebarProps {
  admissions: AdmissionResponse[];
  selectedAdmissionId: string;
}

export function AdmissionsSidebar({
  admissions,
  selectedAdmissionId,
}: AdmissionsSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Update URL when an admission is clicked
  const handleAdmissionClick = (admission: AdmissionResponse) => {
    router.push(`?selectedAdmissionId=${admission.id}`, { scroll: false });
  };

  // Debug URL sync
  useEffect(() => {
    const urlAdmissionId = searchParams.get("selectedAdmissionId");
    console.log(
      `URL selectedAdmissionId: ${urlAdmissionId}, Component selectedAdmissionId: ${selectedAdmissionId}`
    );
  }, [searchParams, selectedAdmissionId]);

  return (
    <aside className="border-r bg-muted/20 p-4">
      <h2 className="font-bold text-lg mb-4">Admissions</h2>
      <div className="space-y-3">
        {admissions.map((admission) => (
          <div
            key={admission.id}
            className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted ${
              selectedAdmissionId === admission.id ? "bg-muted" : ""
            }`}
            onClick={() => handleAdmissionClick(admission)}
          >
            <Avatar>
              <AvatarFallback>
                {admission.patient_name
                  ? admission.patient_name.slice(0, 2).toUpperCase()
                  : ""}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{admission.patient_name}</p>
              <p className="text-xs text-muted-foreground">
                {admission.admission_reason} ({admission.ward} -{" "}
                {admission.bed_no})
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
