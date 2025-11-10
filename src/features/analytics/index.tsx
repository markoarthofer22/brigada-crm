'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { hr } from 'date-fns/locale/hr'
import { Download } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getAnalyticsForProject } from '@/api/services/analytics/options.ts'
import { getAllProjects } from '@/api/services/projects/options.ts'
import { ProjectType } from '@/api/services/projects/schema.ts'
import { useLoader } from '@/context/loader-provider.tsx'
import { Button } from '@/components/ui/button'
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
import { DateTimePicker } from '@/components/date-time-picker'
import { Header } from '@/components/header.tsx'
import { Main } from '@/components/layout/main'
import CommentsList from '@/features/analytics/(components)/comments-list.tsx'
import GeneralData from '@/features/analytics/(components)/general-data.tsx'
import {
	type FilterSelection,
	GlobalFilters,
} from '@/features/analytics/(components)/global-filters.tsx'
import HeatmapWrapper from '@/features/analytics/(components)/heatmap-wrapper.tsx'
import TotalData from '@/features/analytics/(components)/total-data.tsx'
import Zones from '@/features/analytics/(components)/zones.tsx'
import { exportToExcel } from '@/features/analytics/services/export-to-excel.ts'
import UserUpsertFormSkeleton from '@/features/user-crud/components/user-upsert-form-skeleton.tsx'

enum AnalyticsTabs {
	General = 'general',
	Total = 'total',
	Questions = 'questions',
	Zones = 'zones',
	Comments = 'comments',
	Heatmap = 'heatmap',
}

export default function Analytics() {
	const { t } = useTranslation()
	const [pendingStartDate, setPendingStartDate] = useState<Date | undefined>()
	const [pendingEndDate, setPendingEndDate] = useState<Date | undefined>()
	const { showLoader, hideLoader } = useLoader()

	const [tempSelectedFilters, setTempSelectedFilters] =
		useState<FilterSelection | null>(null)

	const [selectedFilters, setSelectedFilters] =
		useState<FilterSelection | null>(null)

	const [{ tabs, project, interval, dateFrom, dateTo }, setFilters] =
		useQueryStates({
			tabs: parseAsString
				.withDefault(AnalyticsTabs.General ?? '')
				.withOptions({ clearOnDefault: false }),
			project: parseAsInteger.withOptions({ clearOnDefault: false }),
			interval: parseAsString.withOptions({ clearOnDefault: false }),
			dateFrom: parseAsString.withOptions({ clearOnDefault: false }),
			dateTo: parseAsString.withOptions({ clearOnDefault: false }),
		})

	const projectsQuery = useQuery({
		...getAllProjects(ProjectType.PROJECT),
		refetchOnWindowFocus: false,
	})

	const analyticsQuery = useQuery({
		...getAnalyticsForProject({
			id_projects: project!,
			from: dateFrom ?? undefined,
			to: dateTo ?? undefined,
			interval: interval ? Number(interval) : undefined,
			extraQuery: selectedFilters,
		}),
		enabled: !!project,
		refetchOnWindowFocus: false,
	})

	const setTab = async (value: string) => {
		await setFilters({
			project,
			tabs: value,
			interval,
			dateFrom,
			dateTo,
		})
	}

	const setProjectCallback = async (value: string) => {
		const projectId = Number.parseInt(value, 10)
		await setFilters({
			project: projectId,
			tabs,
			interval,
			dateFrom,
			dateTo,
		})
	}

	const handleExportToExcel = async () => {
		showLoader()
		try {
			await exportToExcel({
				name: `${analyticsQuery.data?.name} #${analyticsQuery.data?.id_projects}`,
				data: analyticsQuery.data?.trackings,
				timespan: analyticsQuery.data?.timespan,
				t,
			})
		} catch (error) {
			console.error('Export failed:', error)
			toast.error(t('Analytics.exportError'))
		} finally {
			hideLoader()
		}
	}

	const handleFilterChange = async (filters: FilterSelection | null) => {
		setTempSelectedFilters(filters)
		// await analyticsQuery.refetch()
	}

	const handleApplyDateRange = async () => {
		setSelectedFilters(tempSelectedFilters)
		await setFilters({
			project,
			tabs,
			interval,
			dateFrom: pendingStartDate ? pendingStartDate?.toISOString() : null,
			dateTo: pendingEndDate ? pendingEndDate?.toISOString() : null,
		})
	}

	useEffect(() => {
		if (dateFrom) setPendingStartDate(new Date(dateFrom))
		if (dateTo) {
			setPendingEndDate(new Date(dateTo))
		}
	}, [dateFrom, dateTo])

	const activeProject = useMemo(() => {
		return projectsQuery.data?.find((p) => p.id_projects === project)
	}, [projectsQuery.data, project])

	const lastAddedFloorPlan = useMemo(() => {
		if (!activeProject?.images?.length || !activeProject) return null

		return {
			url: `${activeProject?.path}/${activeProject?.images[activeProject.images.length - 1]?.name}`,
			name: activeProject?.images[activeProject.images.length - 1]?.name,
			width:
				activeProject?.images[activeProject.images.length - 1]?.data?.width,
			height:
				activeProject?.images[activeProject.images.length - 1]?.data?.height,
		}
	}, [activeProject])

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
			<Main fixed className='pb-6 pl-4'>
				<div className='mb-2 flex items-center justify-between space-y-2'>
					<h1 className='text-2xl font-bold tracking-tight'>
						{t('Analytics.title')}
					</h1>
				</div>
				<div className='mb-4 flex flex-wrap items-center gap-2'>
					<Select
						value={project ? String(project) : undefined}
						onValueChange={setProjectCallback}
					>
						<SelectTrigger className='w-full md:max-w-44'>
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
					<div className='flex flex-col gap-y-2 max-sm:w-full md:flex-row md:gap-x-2'>
						<DateTimePicker
							placeholder={t('Analytics.dateFrom')}
							date={pendingStartDate}
							onDateChange={setPendingStartDate}
						/>
						<DateTimePicker
							placeholder={t('Analytics.dateTo')}
							date={pendingEndDate}
							onDateChange={setPendingEndDate}
						/>
					</div>
					{project && (
						<GlobalFilters
							className='max-md:w-full'
							filters={analyticsQuery?.data?.filters}
							value={tempSelectedFilters}
							onFilterChange={handleFilterChange}
						/>
					)}
					<div className='flex gap-2'>
						<Button onClick={handleApplyDateRange}>{t('Actions.apply')}</Button>
					</div>
				</div>

				<div className='mb-6 flex flex-col gap-4'>
					<Tabs
						value={tabs}
						onValueChange={setTab}
						className='w-full max-sm:overflow-x-auto'
					>
						<div className='flex flex-wrap items-center justify-between'>
							<TabsList className='flex h-auto flex-wrap items-center justify-start'>
								<TabsTrigger disabled={!project} value={AnalyticsTabs.General}>
									{t('Analytics.tabs.general')}
								</TabsTrigger>
								<TabsTrigger disabled={!project} value={AnalyticsTabs.Total}>
									{t('Analytics.tabs.total')}
								</TabsTrigger>
								<TabsTrigger disabled={!project} value={AnalyticsTabs.Zones}>
									{t('Analytics.tabs.zones')}
								</TabsTrigger>

								<TabsTrigger disabled={!project} value={AnalyticsTabs.Comments}>
									{t('Analytics.tabs.comments')}
								</TabsTrigger>

								<TabsTrigger disabled={!project} value={AnalyticsTabs.Heatmap}>
									{t('Analytics.tabs.heatmap')}
								</TabsTrigger>
							</TabsList>

							{tabs === AnalyticsTabs.General && (
								<Button
									disabled={
										!project ||
										analyticsQuery.isLoading ||
										!analyticsQuery.data ||
										!analyticsQuery.data.trackings?.length
									}
									onClick={handleExportToExcel}
									className='flex items-center gap-2 max-sm:mt-4 md:ml-auto'
								>
									<Download size={16} />
									{t('Analytics.exportToExcel')}
								</Button>
							)}
						</div>
						<TabsContent value={AnalyticsTabs.General}>
							{project && (
								<GeneralData
									projectName={analyticsQuery.data?.name}
									timespan={analyticsQuery.data?.timespan}
									data={analyticsQuery.data?.trackings}
									invalidData={analyticsQuery.data?.trackings_not_valid}
								/>
							)}
						</TabsContent>
						<TabsContent value={AnalyticsTabs.Total}>
							{project && (
								<TotalData
									data={analyticsQuery.data?.total_data}
									projectName={analyticsQuery.data?.name}
								/>
							)}
						</TabsContent>
						<TabsContent value={AnalyticsTabs.Zones}>
							{project && (
								<Zones
									projectName={analyticsQuery.data?.name}
									data={analyticsQuery.data?.total_data?.zones}
								/>
							)}
						</TabsContent>
						<TabsContent value={AnalyticsTabs.Comments}>
							{project && (
								<CommentsList trackingItems={analyticsQuery?.data?.trackings} />
							)}
						</TabsContent>
						<TabsContent value={AnalyticsTabs.Heatmap}>
							{project &&
								analyticsQuery?.data?.zones_heatmap &&
								lastAddedFloorPlan && (
									<HeatmapWrapper
										exportName={`Heatmap_Projekt_${activeProject?.name}_${format(
											new Date(),
											'd. MMMM yyyy',
											{
												locale: hr,
											}
										)}.png`}
										trackings={analyticsQuery?.data?.trackings}
										zones={activeProject!.zones}
										heatmaps={analyticsQuery?.data?.zones_heatmap}
										backgroundImage={lastAddedFloorPlan.url}
										width={lastAddedFloorPlan.width}
										height={lastAddedFloorPlan.height}
										radius={150}
										blur={0.85}
										flowData={analyticsQuery.data.zones_paths}
										zonesPathsInDepthD3={
											analyticsQuery.data.zones_paths_in_depth_D3
										}
									/>
								)}
						</TabsContent>
					</Tabs>
				</div>
			</Main>
		</>
	)
}
