import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getProjectById } from '@/api/services/projects/options.ts'
import { upsertProject } from '@/api/services/projects/projects.ts'
import { ActiveStatus, ProjectType } from '@/api/services/projects/schema'
import { useLoader } from '@/context/loader-provider'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Header } from '@/components/header.tsx'
import { Main } from '@/components/layout/main'
import QuestionLayout from '@/features/project-details/(components)/question-layout'
import UserUpsertFormSkeleton from '@/features/user-crud/components/user-upsert-form-skeleton.tsx'

export default function TemplateDetails() {
	const { t } = useTranslation()
	const { id } = useParams({ strict: false })

	const { showLoader, hideLoader } = useLoader()
	const { handleError } = useHandleGenericError()

	const [projectName, setProjectName] = useState<string>('')

	const handleNameChange = () => {
		if (projectName === '') return

		showLoader()

		projectNameMutation.mutate({
			name: projectName,
			active: ActiveStatus.ACTIVE,
		})
	}

	const projectQuery = useQuery({
		...getProjectById(Number(id)),
		enabled: !!id,
	})

	const projectNameMutation = useMutation({
		mutationFn: ({ name }: { name: string; active: ActiveStatus }) => {
			return upsertProject({
				id_projects: Number(id),
				active: ActiveStatus.ACTIVE,
				name,
				type: ProjectType.TEMPLATE,
			})
		},
		onSuccess: async (res) => {
			toast.success(
				t('Templates.updateSuccess', {
					value: res.name,
				})
			)

			setProjectName(res.name)
			hideLoader()
		},
		onError: (error: unknown) => {
			handleError(error)
			if (projectQuery.data?.name) {
				setProjectName(projectQuery.data.name)
			}
			hideLoader()
		},
	})

	useEffect(() => {
		if (projectQuery.data?.name) {
			setProjectName(projectQuery.data.name)
		}
	}, [projectQuery.data])

	if (projectQuery.isLoading)
		return (
			<>
				<Header />
				<Main>
					<div className='space-y-2'>
						<div className='mb-4 space-y-2'>
							<UserUpsertFormSkeleton />
						</div>
					</div>
				</Main>
			</>
		)

	if (!projectQuery.data?.id_projects) return null

	return (
		<>
			<Header />

			<Main>
				<div className='flex flex-wrap items-center justify-between space-y-2'>
					<div className='mb-4 space-y-4'>
						<div className='flex flex-row gap-x-3'>
							<h2 className='w-fit text-2xl font-bold'>
								{t('ProjectDetails.title')}
							</h2>
							<Input
								type='text'
								onChange={(e) => setProjectName(e.currentTarget.value)}
								value={projectName}
							/>
							<Button onClick={handleNameChange}>{t('Actions.submit')}</Button>
						</div>
					</div>
				</div>
				<div className='mt-4'>
					<p className='mb-2 text-muted-foreground'>
						{t('ProjectDetails.description')}
					</p>
					<QuestionLayout
						questions={projectQuery.data.questions}
						projectId={projectQuery.data.id_projects}
					/>
				</div>
			</Main>
		</>
	)
}
