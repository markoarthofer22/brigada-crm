import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getProjectById } from '@/api/services/projects/options.ts'
import { upsertProject } from '@/api/services/projects/projects.ts'
import { useLoader } from '@/context/loader-provider'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select.tsx'
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
import UserUpsertFormSkeleton from '@/features/user-crud/components/user-upsert-form-skeleton.tsx'

enum TabsEnum {
	IMAGE = 'image',
	QUESTIONS = 'questions',
	ZONES = 'zones',
}

export default function ProjectDetails() {
	const { t } = useTranslation()
	const { id } = useParams({ strict: false })
	const { showLoader, hideLoader } = useLoader()
	const queryClient = useQueryClient()
	const { handleError } = useHandleGenericError()
	const [activeTab, setActiveTab] = useState<TabsEnum>(TabsEnum.IMAGE)
	const [selectedImage, setSelectedImage] = useState<number | null>(null)
	const [projectName, setProjectName] = useState<string>('')

	const handleNameChange = (e: React.FocusEvent<HTMLInputElement>) => {
		if (
			e.target.value === projectName ||
			!e.target.value ||
			e.target.value === projectQuery.data?.name
		)
			return

		showLoader()
		const name = e.target.value
		projectNameMutation.mutate(name)
	}

	const projectQuery = useQuery({
		...getProjectById(Number(id)),
		enabled: !!id,
	})

	const projectNameMutation = useMutation({
		mutationFn: (name: string) => {
			return upsertProject({
				id_projects: Number(id),
				name,
			})
		},
		onSuccess: async (res) => {
			await queryClient.invalidateQueries({
				queryKey: ['projects', id],
			})

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

	const activeImageLayout = useMemo(() => {
		if (!selectedImage) return undefined

		return projectQuery.data?.images?.find(
			(img) => img.id_images === selectedImage
		)
	}, [projectQuery.data?.images, selectedImage])

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
	}, [projectQuery.data?.name])

	useEffect(() => {
		if (
			projectQuery.data?.images?.length &&
			projectQuery.data?.images?.length > 0
		) {
			setSelectedImage(projectQuery.data.images[0].id_images)
		}
	}, [projectQuery.data?.images])

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
					<div className='mb-4 space-y-2'>
						<div className='flex flex-row gap-x-3'>
							<h2 className='w-fit text-2xl font-bold'>
								{t('ProjectDetails.title')}
							</h2>
							<Input
								type='text'
								defaultValue={projectName}
								onBlur={handleNameChange}
							/>
						</div>
					</div>
				</div>
				<div className='mt-4'>
					<p className='mb-2 text-muted-foreground'>
						{t('ProjectDetails.description')}
					</p>
					<Tabs
						defaultValue={activeTab}
						onValueChange={(value) => setActiveTab(value as TabsEnum)}
					>
						<TabsList>
							{Object.values(TabsEnum).map((tab: TabsEnum) => (
								<TabsTrigger value={tab} key={tab}>
									{t(`ProjectDetails.tabs.${tab}`)}
								</TabsTrigger>
							))}
						</TabsList>
						<TabsContent value={TabsEnum.IMAGE}>
							<div className='mb-2 mt-6 flex flex-col items-start space-y-2'>
								<p className='text-sm font-medium'>
									{t('ProjectDetails.selectImage')}
								</p>
								<div className='flex flex-row items-center gap-x-2'>
									<Select
										disabled={projectQuery.data?.images?.length === 0}
										value={selectedImage?.toString() ?? undefined}
										onValueChange={(value) => setSelectedImage(Number(value))}
									>
										<SelectTrigger className='w-80'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent side='bottom'>
											{projectQuery.data?.images?.map((image, index) => (
												<SelectItem
													key={image.id_images}
													value={`${image.id_images}`}
												>
													{/*{image.name} */}
													{t('ProjectDetails.image', {
														value: index + 1,
													})}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<Button
										disabled={projectQuery.data.images?.length === 0}
										onClick={() => {
											setSelectedImage(null)
										}}
									>
										{t('ProjectDetails.addImage')}
									</Button>
								</div>
							</div>
							<ImageUploader
								path={projectQuery.data.path!}
								projectId={projectQuery.data?.id_projects}
								image={activeImageLayout}
							/>
						</TabsContent>
						<TabsContent value={TabsEnum.QUESTIONS}>
							<QuestionLayout
								questions={projectQuery.data.questions}
								projectId={projectQuery.data.id_projects}
							/>
						</TabsContent>
						<TabsContent value={TabsEnum.ZONES}>Coming soon</TabsContent>
					</Tabs>
				</div>
			</Main>
		</>
	)
}
