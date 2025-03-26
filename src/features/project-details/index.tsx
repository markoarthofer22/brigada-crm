import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getProjectById } from '@/api/services/projects/options.ts'
import { upsertProject } from '@/api/services/projects/projects.ts'
import { ActiveStatus, TabsEnum } from '@/api/services/projects/schema'
import { useLoader } from '@/context/loader-provider'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui/tabs.tsx'
import { Header } from '@/components/header.tsx'
import { Main } from '@/components/layout/main'
import ImageUploader from '@/features/project-details/(components)/image-uploader'
import QuestionLayout from '@/features/project-details/(components)/question-layout'
import ZoneLayout from '@/features/project-details/(components)/zones-layout'
import UserUpsertFormSkeleton from '@/features/user-crud/components/user-upsert-form-skeleton.tsx'

export default function ProjectDetails() {
	const { t } = useTranslation()
	const { id } = useParams({ strict: false })

	const { showLoader, hideLoader } = useLoader()
	const { handleError } = useHandleGenericError()
	const [activeTabQuery, setActiveTabQuery] = useQueryState('tab', {
		defaultValue: TabsEnum.IMAGE,
	})

	const [projectName, setProjectName] = useState<string>('')
	const [isProjectActive, setIsProjectActive] = useState<ActiveStatus | null>(
		null
	)

	const handleNameChange = () => {
		if (projectName === '') return

		showLoader()

		projectNameMutation.mutate({ name: projectName, active: isProjectActive! })
	}

	const handleActiveChange = (status: ActiveStatus) => {
		if (status === projectQuery.data?.active) return
		setIsProjectActive(status)
		showLoader()

		projectNameMutation.mutate({ name: projectName, active: status })
	}

	const handleHasNoActiveLayoutCallback = () => {
		void setActiveTabQuery(TabsEnum.IMAGE)
	}

	const projectQuery = useQuery({
		...getProjectById(Number(id)),
		enabled: !!id,
	})

	const projectNameMutation = useMutation({
		mutationFn: ({ name, active }: { name: string; active: ActiveStatus }) => {
			return upsertProject({
				id_projects: Number(id),
				active,
				name,
			})
		},
		onSuccess: async (res) => {
			toast.success(
				t('Projects.updateSuccess', {
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
		if (projectQuery.isLoading) {
			showLoader()
		} else {
			hideLoader()
		}
	}, [projectQuery.isLoading])

	useEffect(() => {
		if (projectQuery.data?.name) {
			setProjectName(projectQuery.data.name)
		}

		if (projectQuery.data?.active) {
			setIsProjectActive(projectQuery.data.active)
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
						<div className='flex flex-row items-center gap-x-4 p-2'>
							<Checkbox
								className='size-5'
								checked={isProjectActive === ActiveStatus.ACTIVE}
								onCheckedChange={(checked) => {
									handleActiveChange(
										checked ? ActiveStatus.ACTIVE : ActiveStatus.INACTIVE
									)
								}}
							/>
							<Label>
								<div className='cursor-pointer space-y-2 leading-4'>
									{t('Input.label.active')}
									<p>{t('Input.description.active')}</p>
								</div>
							</Label>
						</div>
					</div>
				</div>
				<div className='mt-4'>
					<p className='mb-2 text-muted-foreground'>
						{t('ProjectDetails.description')}
					</p>
					<Tabs
						value={activeTabQuery}
						onValueChange={(value) => setActiveTabQuery(value as TabsEnum)}
					>
						<TabsList>
							{Object.values(TabsEnum).map((tab: TabsEnum) => (
								<TabsTrigger value={tab} key={tab}>
									{t(`ProjectDetails.tabs.${tab}`)}
								</TabsTrigger>
							))}
						</TabsList>
						<TabsContent value={TabsEnum.IMAGE}>
							<ImageUploader
								path={projectQuery.data.path!}
								projectId={projectQuery.data?.id_projects}
								allImages={projectQuery.data?.images}
								selectDisabled={projectQuery.data?.images?.length === 0}
							/>
						</TabsContent>
						<TabsContent value={TabsEnum.QUESTIONS}>
							<QuestionLayout
								questions={projectQuery.data.questions}
								projectId={projectQuery.data.id_projects}
							/>
						</TabsContent>
						<TabsContent value={TabsEnum.ZONES}>
							<ZoneLayout
								hasNoActiveLayoutCallback={handleHasNoActiveLayoutCallback}
								hasNoActiveLayout={projectQuery.data?.images?.length === 0}
								zones={projectQuery.data.zones}
								projectId={projectQuery.data?.id_projects}
								allImages={projectQuery.data?.images}
								path={projectQuery.data.path!}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</Main>
		</>
	)
}
