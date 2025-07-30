import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { parseAsString, useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { getAnalyticsForProject } from '@/api/services/analytics/options.ts'
import { getAllProjects } from '@/api/services/projects/options.ts'
import { ProjectType } from '@/api/services/projects/schema.ts'
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
import GeneralData from '@/features/analytics/(components)/general-data.tsx'
import QuestionsAndAnswers from '@/features/analytics/(components)/questions-and-answers.tsx'
import TotalData from '@/features/analytics/(components)/total-data.tsx'
import Zones from '@/features/analytics/(components)/zones.tsx'
import UserUpsertFormSkeleton from '@/features/user-crud/components/user-upsert-form-skeleton.tsx'

enum AnalyticsTabs {
	General = 'general',
	Total = 'total',
	Questions = 'questions',
	Zones = 'zones',
}

export default function Analytics() {
	const { t } = useTranslation()

	const [tabs, setTabs] = useQueryState(
		'tabs',
		parseAsString.withDefault(AnalyticsTabs.General)
	)
	const [selectedProject, setSelectedProject] = useState<string>('')

	// project select

	const projectsQuery = useQuery({
		...getAllProjects(ProjectType.PROJECT),
		refetchOnWindowFocus: false,
	})

	const analyticsQuery = useQuery({
		...getAnalyticsForProject({
			id_projects: selectedProject,
		}),
		enabled: selectedProject !== '',
		refetchOnWindowFocus: false,
	})

	if (analyticsQuery.isLoading || projectsQuery.isLoading) {
		return (
			<div>
				<Header className='border-b-0' />
				<Main fixed>
					<div className='mb-2 flex items-center justify-between space-y-2'>
						<h1 className='text-2xl font-bold tracking-tight'>
							{t('Analytics.title')}
						</h1>
					</div>
					<UserUpsertFormSkeleton />
				</Main>
			</div>
		)
	}

	return (
		<>
			<Header className='border-b-0' />
			<Main fixed className='max-w-screen-lg pb-6 pl-4'>
				<div className='mb-2 flex items-center justify-between space-y-2'>
					<h1 className='text-2xl font-bold tracking-tight'>
						{t('Analytics.title')}
					</h1>
				</div>
				<div className='mb-4 flex flex-col'>
					<Select value={selectedProject} onValueChange={setSelectedProject}>
						<SelectTrigger className='w-full max-w-xs'>
							<SelectValue placeholder={t('Input.placeholder.project')} />
						</SelectTrigger>
						<SelectContent>
							{projectsQuery.data?.map((item) => (
								<SelectItem
									key={item.id_projects}
									value={String(item.id_projects)}
								>
									<div className='flex gap-x-4 px-2 py-1'>
										<span className='text-md'>{item.name}</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className='mb-6 flex flex-col gap-4'>
					<Tabs value={tabs} onValueChange={setTabs} className='w-full'>
						<TabsList>
							<TabsTrigger
								disabled={!selectedProject}
								value={AnalyticsTabs.General}
							>
								{t('Analytics.tabs.general')}
							</TabsTrigger>
							<TabsTrigger
								disabled={!selectedProject}
								value={AnalyticsTabs.Total}
							>
								{t('Analytics.tabs.total')}
							</TabsTrigger>
							<TabsTrigger
								disabled={!selectedProject}
								value={AnalyticsTabs.Questions}
							>
								{t('Analytics.tabs.questions')}
							</TabsTrigger>
							<TabsTrigger
								disabled={!selectedProject}
								value={AnalyticsTabs.Zones}
							>
								{t('Analytics.tabs.zones')}
							</TabsTrigger>
						</TabsList>
						<TabsContent value={AnalyticsTabs.General}>
							{selectedProject && (
								<GeneralData data={analyticsQuery.data?.trackings} />
							)}
						</TabsContent>
						<TabsContent value={AnalyticsTabs.Total}>
							{selectedProject && (
								<TotalData data={analyticsQuery.data?.total_data} />
							)}
						</TabsContent>
						<TabsContent value={AnalyticsTabs.Questions}>
							{selectedProject && (
								<QuestionsAndAnswers
									data={analyticsQuery.data?.total_data?.questions_answers}
								/>
							)}
						</TabsContent>
						<TabsContent value={AnalyticsTabs.Zones}>
							{selectedProject && (
								<Zones data={analyticsQuery.data?.total_data?.zones} />
							)}
						</TabsContent>
					</Tabs>
				</div>
			</Main>
		</>
	)
}
