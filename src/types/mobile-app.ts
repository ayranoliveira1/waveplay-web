// Tipos para distribuicao de versoes do app mobile.
// Espelham os shapes do BC mobile-app no waveplay-api (Task 31).

export interface AppVersion {
  version: string
  downloadUrl: string
  forceUpdate: boolean
  releaseNotes: string | null
}

export interface AdminAppVersion {
  id: string
  version: string
  downloadUrl: string
  fileSize: number
  releaseNotes: string | null
  forceUpdate: boolean
  isCurrent: boolean
  publishedAt: string
  publishedBy: string
}

export interface GenerateUploadUrlRequest {
  version: string
}

export interface GenerateUploadUrlResponse {
  uploadUrl: string
  storageKey: string
  expiresAt: string
}

export interface CreateAppVersionRequest {
  version: string
  storageKey: string
  fileSize: number
  releaseNotes?: string
  forceUpdate?: boolean
}
