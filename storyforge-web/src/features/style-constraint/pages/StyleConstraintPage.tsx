import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'

import { styleConstraintApi } from '@/shared/api/services'
import type { StyleConstraintPayload } from '@/shared/api/types'
import { queryKeys } from '@/shared/query/keys'
import { JsonPreview } from '@/shared/ui/JsonPreview'
import { Button } from '@/shared/ui/primitives/Button'
import { Input } from '@/shared/ui/primitives/Input'
import { Textarea } from '@/shared/ui/primitives/Textarea'
import { ConfirmDialog } from '@/shared/ui/patterns/ConfirmDialog'
import { EmptyState } from '@/shared/ui/patterns/EmptyState'
import { FormField } from '@/shared/ui/patterns/FormField'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { PageShell } from '@/shared/ui/patterns/PageShell'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { useAppMessage } from '@/shared/ui/useAppMessage'
import { getErrorMessage } from '@/shared/utils/error'
import { parseLines, stringifyLines } from '@/shared/utils/form'
import { safeParseJson } from '@/shared/utils/json'
import { useRequiredNumberParam } from '@/shared/utils/router'

interface StyleConstraintFormValues {
  narrativeVoice?: string
  writingStyle?: string
  tone?: string
  taboosText?: string
  customRulesText?: string
  referenceText?: string
}

export function StyleConstraintPage() {
  const projectId = useRequiredNumberParam('projectId')
  const queryClient = useQueryClient()
  const message = useAppMessage()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [customRulesError, setCustomRulesError] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { isSubmitting },
  } = useForm<StyleConstraintFormValues>({
    defaultValues: {
      customRulesText: '{}',
    },
  })

  const customRulesText = useWatch({ control, name: 'customRulesText' })

  const styleConstraintQuery = useQuery({
    queryKey: queryKeys.styleConstraint(projectId),
    queryFn: () => styleConstraintApi.get(projectId),
    retry: false,
  })

  useEffect(() => {
    if (!styleConstraintQuery.data) {
      return
    }

    reset(
      {
        narrativeVoice: styleConstraintQuery.data.narrativeVoice,
        writingStyle: styleConstraintQuery.data.writingStyle,
        tone: styleConstraintQuery.data.tone,
        taboosText: stringifyLines(styleConstraintQuery.data.taboos),
        customRulesText: JSON.stringify(styleConstraintQuery.data.customRules ?? {}, null, 2),
        referenceText: styleConstraintQuery.data.referenceText,
      },
      { keepDirtyValues: true },
    )
  }, [reset, styleConstraintQuery.data])

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.styleConstraint(projectId) })
  }

  const createMutation = useMutation({
    mutationFn: (payload: StyleConstraintPayload) => styleConstraintApi.create(projectId, payload),
    onSuccess: async () => {
      message.success('风格约束已创建')
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: StyleConstraintPayload) => styleConstraintApi.update(projectId, payload),
    onSuccess: async () => {
      message.success('风格约束已更新')
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => styleConstraintApi.remove(projectId),
    onSuccess: async () => {
      message.success('风格约束已删除')
      setIsDeleteDialogOpen(false)
      reset({ customRulesText: '{}' })
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const onSubmit = (values: StyleConstraintFormValues) => {
    const parsed = safeParseJson(values.customRulesText || '{}')
    if (!parsed.success) {
      setCustomRulesError('自定义规则必须是合法 JSON')
      message.error('自定义规则必须是合法 JSON')
      return
    }

    setCustomRulesError(null)

    const payload: StyleConstraintPayload = {
      narrativeVoice: values.narrativeVoice,
      writingStyle: values.writingStyle,
      tone: values.tone,
      taboos: parseLines(values.taboosText || ''),
      customRules: parsed.data,
      referenceText: values.referenceText,
    }

    if (styleConstraintQuery.data) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending
  const customRulesPreview = safeParseJson(customRulesText || '{}')

  if (styleConstraintQuery.isError && (styleConstraintQuery.error as { status?: number } | undefined)?.status !== 404) {
    return (
      <EmptyState
        description={getErrorMessage(styleConstraintQuery.error)}
        title="风格约束加载失败"
      />
    )
  }

  return (
    <PageShell>
      <SectionCard>
        <PageHeader
          description="该接口是项目级单例资源，未创建时 GET 会返回 404。当前页面支持创建、更新与删除。"
          eyebrow="Style constraints"
          title="风格约束"
        />
      </SectionCard>

      <SectionCard>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 sm:grid-cols-3">
            <FormField label="叙事视角">
              <Input {...register('narrativeVoice')} placeholder="例如：第一人称 / 全知视角" />
            </FormField>
            <FormField label="文风">
              <Input {...register('writingStyle')} placeholder="例如：冷峻克制 / 轻快冒险" />
            </FormField>
            <FormField label="基调">
              <Input {...register('tone')} placeholder="例如：悬疑、热血、治愈" />
            </FormField>
          </div>

          <FormField label="禁忌项">
            <Textarea {...register('taboosText')} className="min-h-28" placeholder="禁忌项，每行一条" />
          </FormField>

          <FormField error={customRulesError} label="自定义规则 JSON">
            <Textarea
              {...register('customRulesText')}
              className="min-h-64 font-mono"
              placeholder="自定义规则 JSON"
              spellCheck={false}
            />
          </FormField>

          <FormField label="参考文本">
            <Textarea {...register('referenceText')} className="min-h-32" placeholder="参考文本" />
          </FormField>

          <div className="flex flex-wrap gap-3">
            <Button loading={isSaving} type="submit">
              {styleConstraintQuery.data ? '保存修改' : '创建约束'}
            </Button>
            {styleConstraintQuery.data ? (
              <Button
                loading={deleteMutation.isPending}
                onClick={() => setIsDeleteDialogOpen(true)}
                type="button"
                variant="danger"
              >
                删除约束
              </Button>
            ) : null}
          </div>
        </form>
      </SectionCard>

      {styleConstraintQuery.data ? (
        <SectionCard>
          <JsonPreview title="当前 customRules" value={styleConstraintQuery.data.customRules} />
        </SectionCard>
      ) : styleConstraintQuery.isLoading ? null : (
        <SectionCard>
          <PageHeader description="填写上方表单后即可创建项目级风格约束。" title="当前暂无风格约束" />
        </SectionCard>
      )}

      <ConfirmDialog
        confirmLabel="删除约束"
        confirming={deleteMutation.isPending}
        description="确认删除当前风格约束吗？"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        open={isDeleteDialogOpen}
        title="确认删除当前风格约束吗？"
      />

      {customRulesText ? (
        <SectionCard>
          <JsonPreview
            title="表单中的 customRules 预览"
            value={customRulesPreview.success ? customRulesPreview.data : { invalidJson: true }}
          />
        </SectionCard>
      ) : null}
    </PageShell>
  )
}
