import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { IconX } from '@tabler/icons-react'
import { hr } from 'date-fns/locale/hr'
import { Download } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getAnalyticsForProject } from '@/api/services/analytics/options.ts'
import { getAllProjects } from '@/api/services/projects/options.ts'
import { ProjectType } from '@/api/services/projects/schema.ts'
import { formatDate } from '@/lib/utils.ts'
import { useLoader } from '@/context/loader-provider.tsx'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar.tsx'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
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
	const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)
	const { showLoader, hideLoader } = useLoader()

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
			xfrom: dateFrom ?? undefined,
			xto: dateTo ?? undefined,
			interval: interval ? Number(interval) : undefined,
			extraQuery: selectedFilters,
		}),
		enabled: !!project,
		refetchOnWindowFocus: false,
	})

	const resetDate = async () => {
		await setFilters({
			project,
			interval,
			tabs,
			dateFrom: '',
			dateTo: '',
		})
	}

	const setTab = async (value: string) => {
		await setFilters({
			project,
			tabs: value,
			interval,
			dateFrom,
			dateTo,
		})
	}

	const setDateToPastMonth = async () => {
		const d = new Date()
		const from = new Date(d.getFullYear(), d.getMonth() - 1, 1)
		const to = new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999)

		await setFilters({
			project,
			tabs,
			interval,
			dateFrom: from.toISOString(),
			dateTo: to.toISOString(),
		})
	}

	const setDateToActiveMonth = async () => {
		const now = new Date()
		const from = new Date(now.getFullYear(), now.getMonth(), 1)
		await setFilters({
			project,
			tabs,
			interval,
			dateFrom: from.toISOString(),
			dateTo: now.toISOString(),
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

	const setInterval = async (value: string) => {
		await setFilters({
			project,
			tabs,
			interval: value,
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
		setSelectedFilters(filters)
		await analyticsQuery.refetch()
	}

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
				<div className='mb-4 flex items-center gap-2'>
					<Select
						value={project ? String(project) : undefined}
						onValueChange={setProjectCallback}
					>
						<SelectTrigger className='w-full max-w-44'>
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
					<div className='relative w-full max-w-xs'>
						<Select
							value={interval ? String(interval) : undefined}
							onValueChange={setInterval}
						>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder={t('Input.placeholder.interval')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={String(15)}>
									15 {t('Analytics.min')}
								</SelectItem>
								<SelectItem value={String(30)}>
									30 {t('Analytics.min')}
								</SelectItem>
								<SelectItem value={String(60)}>
									60 {t('Analytics.min')}
								</SelectItem>
							</SelectContent>
						</Select>
						{interval && (
							<div
								className='absolute right-2 top-1/2 z-50 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md bg-destructive text-muted-foreground transition-colors duration-300 hover:bg-destructive/80'
								onClick={async (e) => {
									e.preventDefault()
									e.stopPropagation()
									await setInterval('')
								}}
							>
								<IconX className='size-4 text-white' />
							</div>
						)}
					</div>
					<div className='flex flex-col gap-y-2'>
						<Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									id='date'
									className='relative justify-between px-3 font-normal hover:bg-transparent hover:text-muted-foreground md:w-[220px]'
								>
									{dateFrom
										? formatDate(dateFrom, {
												day: '2-digit',
												month: '2-digit',
												year: 'numeric',
											})
										: t('Input.placeholder.selectDate')}{' '}
									{dateTo
										? `- ${formatDate(dateTo, {
												day: '2-digit',
												month: '2-digit',
												year: 'numeric',
											})}`
										: ''}
									{(dateTo || dateFrom) && (
										<span
											onClick={resetDate}
											className='absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md bg-destructive text-white'
										>
											<IconX />
										</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className='w-auto overflow-hidden p-0'
								align='start'
							>
								<div className='flex w-full flex-col items-center gap-2 px-2 py-1 sm:flex-row'>
									<Button
										className='flex-1 border-primary text-primary hover:text-accent-foreground dark:border-chart-5 dark:text-chart-5 max-sm:w-full'
										variant='outline'
										onClick={setDateToPastMonth}
									>
										{t('Input.placeholder.lastMonth')}
									</Button>
									<Button
										className='flex-1 border-primary text-primary hover:text-accent-foreground dark:border-chart-5 dark:text-chart-5 max-sm:w-full'
										variant='outline'
										onClick={setDateToActiveMonth}
									>
										{t('Input.placeholder.activeMonth')}
									</Button>
								</div>
								<Calendar
									formatters={{
										formatMonthDropdown: (month: Date) =>
											format(month, 'LLLL', { locale: hr }),
									}}
									locale={hr}
									mode='range'
									min={1}
									navLayout='after'
									numberOfMonths={2}
									className='rounded-lg border shadow-sm'
									showOutsideDays
									selected={{
										from: dateFrom ? new Date(dateFrom) : undefined,
										to: dateTo ? new Date(dateTo) : undefined,
									}}
									captionLayout='dropdown'
									onSelect={async (date) => {
										await setFilters({
											project,
											tabs,
											interval,
											dateFrom: date?.from ? date.from.toISOString() : '',
											dateTo: date?.to ? date.to.toISOString() : '',
										})
									}}
								/>
							</PopoverContent>
						</Popover>
					</div>
					<GlobalFilters
						filters={analyticsQuery?.data?.filters}
						value={selectedFilters}
						onFilterChange={handleFilterChange}
					/>
				</div>

				<div className='mb-6 flex flex-col gap-4'>
					<Tabs value={tabs} onValueChange={setTab} className='w-full'>
						<div className='flex flex-wrap items-center justify-between'>
							<TabsList>
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
									className='ml-auto flex items-center gap-2'
								>
									<Download size={16} />
									{t('Analytics.exportToExcel')}
								</Button>
							)}
						</div>
						<TabsContent value={AnalyticsTabs.General}>
							{project && (
								<GeneralData
									timespan={analyticsQuery.data?.timespan}
									data={analyticsQuery.data?.trackings}
								/>
							)}
						</TabsContent>
						<TabsContent value={AnalyticsTabs.Total}>
							{project && (
								<TotalData
									data={analyticsQuery.data?.total_data}
									projectName={analyticsQuery.data.name}
								/>
							)}
						</TabsContent>
						<TabsContent value={AnalyticsTabs.Zones}>
							{project && (
								<Zones
									projectName={analyticsQuery.data.name}
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
									/>
								)}
						</TabsContent>
					</Tabs>
				</div>
			</Main>
		</>
	)
}
