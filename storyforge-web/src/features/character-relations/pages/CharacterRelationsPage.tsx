import { Suspense, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { RouteLoadingInline } from '@/app/router/RouteLoadingInline'
import { CharacterRelationsListingSection } from '@/features/character-relations/pages/lazy'
import { characterRelationsApi, charactersApi } from '@/shared/api/services'
import type { CharacterRelation, CharacterRelationPayload } from '@/shared/api/types'
import { queryKeys } from '@/shared/query/keys'
import { Button } from '@/shared/ui/primitives/Button'
import { Dialog } from '@/shared/ui/primitives/Dialog'
import { Input } from '@/shared/ui/primitives/Input'
import { Select } from '@/shared/ui/primitives/Select'
import { Textarea } from '@/shared/ui/primitives/Textarea'
import { EmptyState } from '@/shared/ui/patterns/EmptyState'
import { FormField } from '@/shared/ui/patterns/FormField'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { PageShell } from '@/shared/ui/patterns/PageShell'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { useAppMessage } from '@/shared/ui/useAppMessage'
import { getErrorMessage } from '@/shared/utils/error'
import { useRequiredNumberParam } from '@/shared/utils/router'

export function CharacterRelationsPage() {
  const projectId = useRequiredNumberParam('projectId')
  const queryClient = useQueryClient()
  const message = useAppMessage()
  const [editingRelation, setEditingRelation] = useState<CharacterRelation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [characterIdA, setCharacterIdA] = useState('')
  const [characterIdB, setCharacterIdB] = useState('')
  const [relationType, setRelationType] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{ characterIdA?: string; characterIdB?: string; relationType?: string }>({})

  const charactersQuery = useQuery({
    queryKey: queryKeys.characters(projectId),
    queryFn: () => charactersApi.list(projectId),
    retry: false,
  })

  const relationsQuery = useQuery({
    queryKey: queryKeys.characterRelations(projectId),
    queryFn: () => characterRelationsApi.list(projectId),
    retry: false,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.characterRelations(projectId) })
  }

  const createMutation = useMutation({
    mutationFn: (payload: CharacterRelationPayload) => characterRelationsApi.create(projectId, payload),
    onSuccess: async () => {
      message.success('角色关系已创建')
      setIsModalOpen(false)
      resetForm()
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CharacterRelationPayload }) =>
      characterRelationsApi.update(projectId, id, payload),
    onSuccess: async () => {
      message.success('角色关系已更新')
      setIsModalOpen(false)
      setEditingRelation(null)
      resetForm()
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => characterRelationsApi.remove(projectId, id),
    onSuccess: async () => {
      message.success('角色关系已删除')
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const characterMap = new Map((charactersQuery.data ?? []).map((character) => [character.id, character.name]))
  const characterOptions = useMemo(
    () => (charactersQuery.data ?? []).map((character) => ({ label: character.name, value: String(character.id) })),
    [charactersQuery.data],
  )

  const existingRelationKeys = useMemo(() => {
    return new Set(
      (relationsQuery.data ?? []).map((relation) => {
        const sortedIds = [relation.characterIdA, relation.characterIdB].sort((a, b) => a - b)
        return `${sortedIds[0]}-${sortedIds[1]}`
      }),
    )
  }, [relationsQuery.data])

  function resetForm() {
    setCharacterIdA('')
    setCharacterIdB('')
    setRelationType('')
    setDescription('')
    setErrors({})
  }

  function openCreateModal() {
    setEditingRelation(null)
    resetForm()
    setIsModalOpen(true)
  }

  function openEditModal(record: CharacterRelation) {
    setEditingRelation(record)
    setCharacterIdA(String(record.characterIdA))
    setCharacterIdB(String(record.characterIdB))
    setRelationType(record.relationType)
    setDescription(record.description ?? '')
    setErrors({})
    setIsModalOpen(true)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: { characterIdA?: string; characterIdB?: string; relationType?: string } = {}
    if (!characterIdA) {
      nextErrors.characterIdA = '请选择角色 A'
    }
    if (!characterIdB) {
      nextErrors.characterIdB = '请选择角色 B'
    }
    if (!relationType.trim()) {
      nextErrors.relationType = '请输入关系类型'
    }
    if (characterIdA && characterIdB && characterIdA === characterIdB) {
      nextErrors.characterIdB = '同一角色不能同时作为关系两端'
    }

    const relationKey = [characterIdA, characterIdB].filter(Boolean).sort().join('-')
    const editingKey = editingRelation
      ? [String(editingRelation.characterIdA), String(editingRelation.characterIdB)].sort().join('-')
      : null
    if (relationKey && relationKey !== editingKey && existingRelationKeys.has(relationKey)) {
      nextErrors.characterIdB = '该角色组合已存在，请直接编辑已有关系'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const payload: CharacterRelationPayload = {
      characterIdA: Number(characterIdA),
      characterIdB: Number(characterIdB),
      relationType: relationType.trim(),
      description: description.trim() || undefined,
    }

    if (editingRelation) {
      updateMutation.mutate({ id: editingRelation.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <PageShell>
      <SectionCard>
        <PageHeader
          actions={<Button onClick={openCreateModal}>新建关系</Button>}
          description="前端会提前拦截自关联和重复组合，后端继续作为最终约束。"
          eyebrow="Character relations"
          title="角色关系"
        />
      </SectionCard>

      {charactersQuery.isError ? (
        <EmptyState description={getErrorMessage(charactersQuery.error)} title="角色列表加载失败" />
      ) : relationsQuery.isError ? (
        <EmptyState description={getErrorMessage(relationsQuery.error)} title="角色关系列表加载失败" />
      ) : (
        <Suspense fallback={<RouteLoadingInline label="正在加载角色关系列表..." />}>
          <CharacterRelationsListingSection
            characterMap={characterMap}
            items={relationsQuery.data ?? []}
            loading={relationsQuery.isLoading}
            onDelete={(id) => deleteMutation.mutate(id)}
            onEdit={(record) => openEditModal(record)}
          />
        </Suspense>
      )}

      <Dialog
        description="选择两个角色并填写关系类型，前端会提前拦截自关联与重复组合。"
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <Button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} variant="secondary">
              取消
            </Button>
            <Button form="character-relations-form" loading={isSubmitting} type="submit">
              {editingRelation ? '保存关系' : '创建关系'}
            </Button>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        dismissible={!isSubmitting}
        title={editingRelation ? '编辑角色关系' : '新建角色关系'}
      >
        <form className="space-y-5" id="character-relations-form" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField error={errors.characterIdA} label="角色 A">
              <Select onChange={(event) => setCharacterIdA(event.target.value)} value={characterIdA}>
                <option value="">请选择角色 A</option>
                {characterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField error={errors.characterIdB} label="角色 B">
              <Select onChange={(event) => setCharacterIdB(event.target.value)} value={characterIdB}>
                <option value="">请选择角色 B</option>
                {characterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField error={errors.relationType} label="关系类型">
            <Input
              maxLength={50}
              onChange={(event) => setRelationType(event.target.value)}
              placeholder="例如：盟友 / 师徒 / 对手"
              value={relationType}
            />
          </FormField>

          <FormField label="描述">
            <Textarea
              className="min-h-28"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </FormField>
        </form>
      </Dialog>
    </PageShell>
  )
}
