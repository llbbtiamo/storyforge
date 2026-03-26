import type { AxiosResponse } from 'axios'

import { apiClient } from '@/shared/api/client'
import type {
  ApiResponse,
  ApplyWorldTemplatePayload,
  AuthSession,
  CaptchaPurpose,
  CaptchaResponse,
  Chapter,
  ChapterPayload,
  ChapterVersion,
  Character,
  CharacterPayload,
  CharacterRelation,
  CharacterRelationPayload,
  CreateWorldTemplateFromProjectPayload,
  LoginRequest,
  PlotOutline,
  PlotOutlinePayload,
  Project,
  ProjectPayload,
  RegisterEmailCodeResponse,
  RegisterRequest,
  StyleConstraint,
  StyleConstraintPayload,
  UserInfo,
  WorldSetting,
  WorldSettingPayload,
  WorldTemplate,
  WorldTemplatePayload,
} from '@/shared/api/types'

const unwrap = async <T>(request: Promise<AxiosResponse<ApiResponse<T>>>) => {
  const response = await request
  return response.data.data
}

export const authApi = {
  createCaptcha: (purpose: CaptchaPurpose) =>
    unwrap(apiClient.post<ApiResponse<CaptchaResponse>>('/api/v1/auth/captcha', { purpose })),
  sendRegisterEmailCode: (payload: { email: string; captchaId: string; captchaCode: string }) =>
    unwrap(apiClient.post<ApiResponse<RegisterEmailCodeResponse>>('/api/v1/auth/register/email-code', payload)),
  login: (payload: LoginRequest) => unwrap(apiClient.post<ApiResponse<AuthSession>>('/api/v1/auth/login', payload)),
  register: (payload: RegisterRequest) =>
    unwrap(apiClient.post<ApiResponse<AuthSession>>('/api/v1/auth/register', payload)),
  me: () => unwrap(apiClient.get<ApiResponse<UserInfo>>('/api/v1/auth/me')),
}

export const projectsApi = {
  list: () => unwrap(apiClient.get<ApiResponse<Project[]>>('/api/v1/projects')),
  get: (id: number) => unwrap(apiClient.get<ApiResponse<Project>>(`/api/v1/projects/${id}`)),
  create: (payload: ProjectPayload) => unwrap(apiClient.post<ApiResponse<Project>>('/api/v1/projects', payload)),
  update: (id: number, payload: ProjectPayload) =>
    unwrap(apiClient.put<ApiResponse<Project>>(`/api/v1/projects/${id}`, payload)),
  remove: (id: number) => unwrap(apiClient.delete<ApiResponse<boolean>>(`/api/v1/projects/${id}`)),
  applyWorldTemplate: (projectId: number, payload: ApplyWorldTemplatePayload) =>
    unwrap(apiClient.post<ApiResponse<Project>>(`/api/v1/projects/${projectId}/world-template/apply`, payload)),
  createWorldTemplate: (projectId: number, payload: CreateWorldTemplateFromProjectPayload) =>
    unwrap(apiClient.post<ApiResponse<WorldTemplate>>(`/api/v1/projects/${projectId}/world-template`, payload)),
}

export const worldSettingsApi = {
  list: (projectId: number) =>
    unwrap(apiClient.get<ApiResponse<WorldSetting[]>>(`/api/v1/projects/${projectId}/world-settings`)),
  create: (projectId: number, payload: WorldSettingPayload) =>
    unwrap(apiClient.post<ApiResponse<WorldSetting>>(`/api/v1/projects/${projectId}/world-settings`, payload)),
  update: (projectId: number, id: number, payload: WorldSettingPayload) =>
    unwrap(apiClient.put<ApiResponse<WorldSetting>>(`/api/v1/projects/${projectId}/world-settings/${id}`, payload)),
  remove: (projectId: number, id: number) =>
    unwrap(apiClient.delete<ApiResponse<boolean>>(`/api/v1/projects/${projectId}/world-settings/${id}`)),
}

export const charactersApi = {
  list: (projectId: number) =>
    unwrap(apiClient.get<ApiResponse<Character[]>>(`/api/v1/projects/${projectId}/characters`)),
  create: (projectId: number, payload: CharacterPayload) =>
    unwrap(apiClient.post<ApiResponse<Character>>(`/api/v1/projects/${projectId}/characters`, payload)),
  update: (projectId: number, id: number, payload: CharacterPayload) =>
    unwrap(apiClient.put<ApiResponse<Character>>(`/api/v1/projects/${projectId}/characters/${id}`, payload)),
  remove: (projectId: number, id: number) =>
    unwrap(apiClient.delete<ApiResponse<boolean>>(`/api/v1/projects/${projectId}/characters/${id}`)),
}

export const characterRelationsApi = {
  list: (projectId: number) =>
    unwrap(apiClient.get<ApiResponse<CharacterRelation[]>>(`/api/v1/projects/${projectId}/character-relations`)),
  create: (projectId: number, payload: CharacterRelationPayload) =>
    unwrap(apiClient.post<ApiResponse<CharacterRelation>>(`/api/v1/projects/${projectId}/character-relations`, payload)),
  update: (projectId: number, id: number, payload: CharacterRelationPayload) =>
    unwrap(
      apiClient.put<ApiResponse<CharacterRelation>>(`/api/v1/projects/${projectId}/character-relations/${id}`, payload),
    ),
  remove: (projectId: number, id: number) =>
    unwrap(apiClient.delete<ApiResponse<boolean>>(`/api/v1/projects/${projectId}/character-relations/${id}`)),
}

export const outlinesApi = {
  list: (projectId: number) => unwrap(apiClient.get<ApiResponse<PlotOutline[]>>(`/api/v1/projects/${projectId}/outlines`)),
  create: (projectId: number, payload: PlotOutlinePayload) =>
    unwrap(apiClient.post<ApiResponse<PlotOutline>>(`/api/v1/projects/${projectId}/outlines`, payload)),
  update: (projectId: number, id: number, payload: PlotOutlinePayload) =>
    unwrap(apiClient.put<ApiResponse<PlotOutline>>(`/api/v1/projects/${projectId}/outlines/${id}`, payload)),
  remove: (projectId: number, id: number) =>
    unwrap(apiClient.delete<ApiResponse<boolean>>(`/api/v1/projects/${projectId}/outlines/${id}`)),
}

export const chaptersApi = {
  list: (projectId: number) => unwrap(apiClient.get<ApiResponse<Chapter[]>>(`/api/v1/projects/${projectId}/chapters`)),
  get: (projectId: number, id: number) =>
    unwrap(apiClient.get<ApiResponse<Chapter>>(`/api/v1/projects/${projectId}/chapters/${id}`)),
  create: (projectId: number, payload: ChapterPayload) =>
    unwrap(apiClient.post<ApiResponse<Chapter>>(`/api/v1/projects/${projectId}/chapters`, payload)),
  update: (projectId: number, id: number, payload: ChapterPayload) =>
    unwrap(apiClient.put<ApiResponse<Chapter>>(`/api/v1/projects/${projectId}/chapters/${id}`, payload)),
  approve: (projectId: number, id: number) =>
    unwrap(apiClient.post<ApiResponse<Chapter>>(`/api/v1/projects/${projectId}/chapters/${id}/approve`)),
  versions: (projectId: number, id: number) =>
    unwrap(apiClient.get<ApiResponse<ChapterVersion[]>>(`/api/v1/projects/${projectId}/chapters/${id}/versions`)),
  remove: (projectId: number, id: number) =>
    unwrap(apiClient.delete<ApiResponse<boolean>>(`/api/v1/projects/${projectId}/chapters/${id}`)),
}

export const styleConstraintApi = {
  get: (projectId: number) =>
    unwrap(apiClient.get<ApiResponse<StyleConstraint>>(`/api/v1/projects/${projectId}/style-constraint`)),
  create: (projectId: number, payload: StyleConstraintPayload) =>
    unwrap(apiClient.post<ApiResponse<StyleConstraint>>(`/api/v1/projects/${projectId}/style-constraint`, payload)),
  update: (projectId: number, payload: StyleConstraintPayload) =>
    unwrap(apiClient.put<ApiResponse<StyleConstraint>>(`/api/v1/projects/${projectId}/style-constraint`, payload)),
  remove: (projectId: number) =>
    unwrap(apiClient.delete<ApiResponse<boolean>>(`/api/v1/projects/${projectId}/style-constraint`)),
}

export const worldTemplatesApi = {
  list: () => unwrap(apiClient.get<ApiResponse<WorldTemplate[]>>('/api/v1/world-templates')),
  get: (id: number) => unwrap(apiClient.get<ApiResponse<WorldTemplate>>(`/api/v1/world-templates/${id}`)),
  create: (payload: WorldTemplatePayload) =>
    unwrap(apiClient.post<ApiResponse<WorldTemplate>>('/api/v1/world-templates', payload)),
  update: (id: number, payload: WorldTemplatePayload) =>
    unwrap(apiClient.put<ApiResponse<WorldTemplate>>(`/api/v1/world-templates/${id}`, payload)),
  remove: (id: number) => unwrap(apiClient.delete<ApiResponse<boolean>>(`/api/v1/world-templates/${id}`)),
}

export const templateWorldSettingsApi = {
  list: (templateId: number) =>
    unwrap(apiClient.get<ApiResponse<WorldSetting[]>>(`/api/v1/world-templates/${templateId}/world-settings`)),
  create: (templateId: number, payload: WorldSettingPayload) =>
    unwrap(apiClient.post<ApiResponse<WorldSetting>>(`/api/v1/world-templates/${templateId}/world-settings`, payload)),
  update: (templateId: number, id: number, payload: WorldSettingPayload) =>
    unwrap(
      apiClient.put<ApiResponse<WorldSetting>>(`/api/v1/world-templates/${templateId}/world-settings/${id}`, payload),
    ),
  remove: (templateId: number, id: number) =>
    unwrap(apiClient.delete<ApiResponse<boolean>>(`/api/v1/world-templates/${templateId}/world-settings/${id}`)),
}
