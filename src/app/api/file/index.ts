import axios from "axios"
import { apiGet } from "../common"
import { NextRequest } from "next/server"
import { underscoreJsonToCamelCase } from "../camelCase"

export const FILE_URL = '/core/file/'

export enum AcceptedMimeTypes {
  'csv' = 'text/csv',
  'tsv' = 'text/tab-separated-values',
  'xlsx' = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xml' = 'application/xml',
  'txt' = 'text/plain',
}

export interface FileListItem {
  id: number;
  file: string;
  fileName: string;
}

export interface FileList {
  count: number;
  next: string;
  previous: string;
  results: FileListItem[];
}

export interface SpecialCharacters {
  field: string;
  rows: number[];
  values: string[];
}

export interface MissingValues {
  field: string;
  rows: number[];
}

export type GenericFieldValue = string | number | boolean | null | Date

export type GenericData = Record<string, GenericFieldValue>

export interface BasicFileData {
  id: number;
  file: string;
  fileName: string;
}

export interface FileData extends BasicFileData {
  data: GenericData[];
  anomalyData: AnomalyList;
  extraData: {
    session: string;
    specialCharacters: SpecialCharacters[];
    missingValues: MissingValues[];
    specialCharactersPercentage: Record<string, number>;
    missingValuesPercentage: Record<string, number>;
  }
}

export interface UploadFileResponse {
  id: number;
}

export interface Anomalies {
  missingValue: boolean;
  specialCharacters: boolean;
}

export interface AnomalyDataRow {
  totalIndex: number;
  columns: AnomalyData[];
}

export type AnomalyList = AnomalyDataRow[]

export interface AnomalyData {
  fieldName: string;
  value: GenericFieldValue;
  anomalies: Anomalies;
}

export const getFileList = async (page: number, search?: string, ordering?: string): Promise<FileList> => {
  const response = await axios.get('/api/file', {
    params: {
      page,
      search,
      ordering,
    }
  })

  if (!response) {
    throw new Error('Get list failed')
  }

  return response.data
}

export const getFileData = async (id: number): Promise<FileData> => {
  const response = await axios.get(`/api/file/${id}`)

  return response.data
}

export const uploadFile = async (formData: FormData): Promise<UploadFileResponse> => {
  const response = await axios.post('/api/file/upload', formData, {
    headers: {
      "Content-Type": 'multipart/form-data'
    }
  })

  return response.data
}

export const getFileDataFromApi = async (req: NextRequest, id: number, accessToken: string): Promise<FileData> => {
  const response = await apiGet(req, `${FILE_URL}${id}/`, {}, accessToken)

  if (!response) {
    throw new Error('Get File from API failed')
  }

  return underscoreJsonToCamelCase(response.data) as unknown as FileData
}

export const getFileUrl = (fileData: FileData) => `/media/files/${fileData.fileName}`
