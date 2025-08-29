import { AdmissionResponse } from "@/types/admission";
import { fetchWithToken } from "@/lib/fetchApi/server";
import { getAuthData } from "@/lib/auth";
import PageWrapper from "@/components/notes/PageWrapper";

interface Props {
  searchParams: Promise<{ selectedAdmissionId?: string }>;
}

async function NotesPage({ searchParams }: Props) {
  const { selectedAdmissionId } = await searchParams;
  const { organizationId, user } = await getAuthData();

  let admissions: AdmissionResponse[] = [];
  try {
    admissions = await fetchWithToken<AdmissionResponse[]>(
      "/api/v1/admissions",
      {
        query: { organization_id: organizationId ?? undefined },
      }
    );
  } catch (error) {
    console.error("NotesPage: Error fetching admissions:", error);
  }

  return (
    <PageWrapper
      admissions={admissions}
      organizationId={organizationId ?? ""}
      selectedAdmissionId={selectedAdmissionId}
      user={user}
    />
  );
}

export default NotesPage;
