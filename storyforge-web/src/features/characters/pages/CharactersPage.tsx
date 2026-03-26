import { Suspense, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { RouteLoadingInline } from '@/app/router/RouteLoadingInline'
import { CharactersListingSection } from '@/features/characters/pages/lazy'
import { charactersApi } from '@/shared/api/services'
import type { Character, CharacterPayload } from '@/shared/api/types'
import { queryKeys } from '@/shared/query/keys'
import { Button } from '@/shared/ui/primitives/Button'
import { Dialog } from '@/shared/ui/primitives/Dialog'
import { Input } from '@/shared/ui/primitives/Input'
import { Textarea } from '@/shared/ui/primitives/Textarea'
import { EmptyState } from '@/shared/ui/patterns/EmptyState'
import { FormField } from '@/shared/ui/patterns/FormField'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { PageShell } from '@/shared/ui/patterns/PageShell'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { useAppMessage } from '@/shared/ui/useAppMessage'
import { getErrorMessage } from '@/shared/utils/error'
import { safeParseJson } from '@/shared/utils/json'
import { useRequiredNumberParam } from '@/shared/utils/router'

interface CharacterFormValues {
  name: string
  roleType: string
  backstory: string
  motivation: string
  avatarUrl: string
  sortOrder: string
  basicInfoText: string
}

const defaultValues: CharacterFormValues = {
  name: '',
  roleType: '',
  backstory: '',
  motivation: '',
  avatarUrl: '',
  sortOrder: '0',
  basicInfoText: '{}',
}

function getInitialValues(character: Character | null): CharacterFormValues {
  if (!character) {
    return defaultValues
  }

  return {
    name: character.name,
    roleType: character.roleType ?? '',
    backstory: character.backstory ?? '',
    motivation: character.motivation ?? '',
    avatarUrl: character.avatarUrl ?? '',
    sortOrder: String(character.sortOrder ?? 0),
    basicInfoText: JSON.stringify(character.basicInfo ?? {}, null, 2),
  }
}

export function CharactersPage() {
  const projectId = useRequiredNumberParam('projectId')
  const queryClient = useQueryClient()
  const message = useAppMessage()
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [basicInfoError, setBasicInfoError] = useState<string | null>(null)

  const charactersQuery = useQuery({
    queryKey: queryKeys.characters(projectId),
    queryFn: () => charactersApi.list(projectId),
    retry: false,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.characters(projectId) })
  }

  const createMutation = useMutation({
    mutationFn: (payload: CharacterPayload) => charactersApi.create(projectId, payload),
    onSuccess: async () => {
      message.success('角色已创建')
      setIsModalOpen(false)
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CharacterPayload }) =>
      charactersApi.update(projectId, id, payload),
    onSuccess: async () => {
      message.success('角色已更新')
      setIsModalOpen(false)
      setEditingCharacter(null)
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => charactersApi.remove(projectId, id),
    onSuccess: async () => {
      message.success('角色已删除')
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  function openCreateModal() {
    setEditingCharacter(null)
    setBasicInfoError(null)
    setIsModalOpen(true)
  }

  function openEditModal(record: Character) {
    setEditingCharacter(record)
    setBasicInfoError(null)
    setIsModalOpen(true)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const basicInfoText = String(formData.get('basicInfoText') ?? '').trim()

    if (!name || !basicInfoText) {
      return
    }

    const parsed = safeParseJson(basicInfoText)
    if (!parsed.success) {
      setBasicInfoError('基础信息必须是合法 JSON')
      message.error('基础信息必须是合法 JSON')
      return
    }

    setBasicInfoError(null)

    const roleType = String(formData.get('roleType') ?? '').trim()
    const backstory = String(formData.get('backstory') ?? '').trim()
    const motivation = String(formData.get('motivation') ?? '').trim()
    const avatarUrl = String(formData.get('avatarUrl') ?? '').trim()
    const sortOrderValue = String(formData.get('sortOrder') ?? '').trim()
    const sortOrder = sortOrderValue === '' ? undefined : Number(sortOrderValue)

    const payload: CharacterPayload = {
      name,
      roleType: roleType || undefined,
      backstory: backstory || undefined,
      motivation: motivation || undefined,
      avatarUrl: avatarUrl || undefined,
      sortOrder: sortOrder !== undefined && Number.isFinite(sortOrder) ? Math.max(0, sortOrder) : undefined,
      basicInfo: parsed.data,
    }

    if (editingCharacter) {
      updateMutation.mutate({ id: editingCharacter.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const initialValues = getInitialValues(editingCharacter)

  return (
    <PageShell>
      <SectionCard>
        <PageHeader
          actions={<Button onClick={openCreateModal}>新建角色</Button>}
          description="基础信息使用 JSON 文本，方便承接后端 basicInfo 动态字段。"
          eyebrow="Characters"
          title="角色管理"
        />
      </SectionCard>

      {charactersQuery.isError ? (
        <EmptyState description={getErrorMessage(charactersQuery.error)} title="角色列表加载失败" />
      ) : (
        <Suspense fallback={<RouteLoadingInline label="正在加载角色列表..." />}>
          <CharactersListingSection
            items={charactersQuery.data ?? []}
            loading={charactersQuery.isLoading}
            onDelete={(id) => deleteMutation.mutate(id)}
            onEdit={(record) => openEditModal(record)}
          />
        </Suspense>
      )}

      <Dialog
        description="维护角色基础信息，basicInfo 继续使用 JSON 文本承接动态字段。"
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <Button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} variant="secondary">
              取消
            </Button>
            <Button form="characters-form" loading={isSubmitting} type="submit">
              {editingCharacter ? '保存角色' : '创建角色'}
            </Button>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        dismissible={!isSubmitting}
        title={editingCharacter ? '编辑角色' : '新建角色'}
      >
        <form className="space-y-5" id="characters-form" key={editingCharacter?.id ?? 'new'} onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="角色名">
              <Input defaultValue={initialValues.name} maxLength={100} name="name" required />
            </FormField>

            <FormField label="定位">
              <Input defaultValue={initialValues.roleType} maxLength={20} name="roleType" />
            </FormField>
          </div>

          <FormField label="背景">
            <Textarea className="min-h-28" defaultValue={initialValues.backstory} name="backstory" />
          </FormField>

          <FormField label="动机">
            <Textarea className="min-h-24" defaultValue={initialValues.motivation} name="motivation" />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="头像 URL">
              <Input defaultValue={initialValues.avatarUrl} maxLength={500} name="avatarUrl" />
            </FormField>

            <FormField label="排序">
              <Input defaultValue={initialValues.sortOrder} min={0} name="sortOrder" type="number" />
            </FormField>
          </div>

          <FormField error={basicInfoError} label="基础信息 JSON">
            <Textarea
              className="min-h-72 font-mono"
              defaultValue={initialValues.basicInfoText}
              name="basicInfoText"
              required
              spellCheck={false}
            />
          </FormField>
        </form>
      </Dialog>
    </PageShell>
  )
}
