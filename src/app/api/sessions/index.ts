import axios from "axios"
import { BasicFileData } from "../file";

export const SESSIONS_URL = "/core/sessions"

export interface Session {
  id: number;
  user: string | null;
  session: string;
  file: BasicFileData;
  viewedSession: boolean;
  dateCreated: boolean;
}

export interface SessionList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Session[];
}

export async function getSessionList(page?: number, ordering?: string, search?: string, file?: number): Promise<SessionList> {
  const response = await axios.get('/api/sessions', { params: { page, ordering, search, file }})

  return response.data
}

export async function getValidationReport(sessionId: string): Promise<Blob> {
  const response = await axios.get(`/api/sessions/${sessionId}/generate-report`, { responseType: "blob" })

  return response.data
}
