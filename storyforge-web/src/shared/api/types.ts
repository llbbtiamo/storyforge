export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface ApiError extends Error {
  status?: number
  code?: number
}

export type JsonMap = Record<string, unknown>

export type CaptchaPurpose = 'LOGIN' | 'REGISTER_EMAIL'
export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED'
export type ChapterStatus = 'DRAFT' | 'GENERATING' | 'REVIEW' | 'PUBLISHED'

export interface UserInfo {
  id: number
  username: string
  email: string
  nickname?: string
  avatarUrl?: string
  vipLevel: number
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  expiresIn: number
  userInfo: UserInfo
}

export interface CaptchaResponse {
  captchaId: string
  imageBase64: string
  expireSeconds: number
}

export interface RegisterEmailCodeResponse {
  expireSeconds: number
  resendAfterSeconds: number
}

export interface Project {
  id: number
  title: string
  description?: string
  genre?: string
  status: ProjectStatus
  worldTemplateId?: number
  coverUrl?: string
  wordCount: number
  createdAt: string
  updatedAt: string
}

export interface WorldSetting {
  id: number
  projectId?: number
  templateId?: number
  category: string
  name: string
  content: JsonMap
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Character {
  id: number
  projectId: number
  name: string
  roleType?: string
  basicInfo?: JsonMap
  backstory?: string
  motivation?: string
  avatarUrl?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CharacterRelation {
  id: number
  projectId: number
  characterIdA: number
  characterIdB: number
  relationType: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface PlotOutline {
  id: number
  projectId: number
  parentId?: number
  title: string
  summary?: string
  keyEvents?: string[]
  level: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Chapter {
  id: number
  projectId: number
  outlineId?: number
  chapterNumber: number
  title?: string
  content?: string
  wordCount: number
  status: ChapterStatus
  aiModelUsed?: string
  createdAt: string
  updatedAt: string
}

export interface ChapterVersion {
  id: number
  chapterId: number
  versionNumber: number
  content?: string
  source?: string
  generationParams?: JsonMap
  createdAt: string
  updatedAt: string
}

export interface StyleConstraint {
  id: number
  projectId: number
  narrativeVoice?: string
  writingStyle?: string
  tone?: string
  taboos?: string[]
  customRules?: JsonMap
  referenceText?: string
  createdAt: string
  updatedAt: string
}

export interface WorldTemplate {
  id: number
  name: string
  description?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  username: string
  password: string
  captchaId: string
  captchaCode: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  emailVerificationCode: string
  nickname?: string
}

export interface ProjectPayload {
  title: string
  description?: string
  genre?: string
  status?: ProjectStatus
  worldTemplateId?: number
  coverUrl?: string
}

export interface WorldSettingPayload {
  category: string
  name: string
  content: JsonMap
  sortOrder?: number
}

export interface CharacterPayload {
  name: string
  roleType?: string
  basicInfo?: JsonMap
  backstory?: string
  motivation?: string
  avatarUrl?: string
  sortOrder?: number
}

export interface CharacterRelationPayload {
  characterIdA: number
  characterIdB: number
  relationType: string
  description?: string
}

export interface PlotOutlinePayload {
  parentId?: number
  title: string
  summary?: string
  keyEvents?: string[]
  level?: number
  sortOrder?: number
}

export interface ChapterPayload {
  outlineId?: number
  chapterNumber: number
  title?: string
  content?: string
  wordCount?: number
  status: Exclude<ChapterStatus, 'PUBLISHED'>
  aiModelUsed?: string
}

export interface StyleConstraintPayload {
  narrativeVoice?: string
  writingStyle?: string
  tone?: string
  taboos?: string[]
  customRules?: JsonMap
  referenceText?: string
}

export interface WorldTemplatePayload {
  name: string
  description?: string
}

export interface ApplyWorldTemplatePayload {
  worldTemplateId: number
  overwriteExistingSettings?: boolean
}

export interface CreateWorldTemplateFromProjectPayload {
  name?: string
  description?: string
}
