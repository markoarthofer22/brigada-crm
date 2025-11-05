import { useMemo, useState } from 'react'
import { intervalToDuration } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { handleScreenshot } from '@/lib/utils.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import AnswersDetailsAccordions from '@/features/analytics/(components)/answers-details-accordions.tsx'

interface ZonesProps {
	projectName: string
	data: {
		per_zone?: any[]
		total?: any
	}
}

const pieChartColors = [
	'#0088FE',
	'#00C49F',
	'#FFBB28',
	'#FF8042',
	'#AF19FF',
	'#FF4560',
	'#00E396',
	'#775DD0',
]

const CustomTooltipContent = ({ active, payload, label }: any) => {
	if (!active || !payload) return null

	const formatSeconds = (seconds: number) => {
		const duration = intervalToDuration({ start: 0, end: seconds * 1000 })

		const hours = duration.hours || 0
		const minutes = duration.minutes || 0
		const secs = duration.seconds || 0

		if (hours > 0) {
			return `${hours}h ${minutes}m ${secs}s`
		}

		if (minutes > 0) {
			return `${minutes}m ${secs}s`
		}

		return `0m ${secs}s`
	}

	return (
		<div className='rounded-lg border bg-background p-2 shadow-sm'>
			<div className='grid gap-2'>
				<div className='font-medium'>{label}</div>
				{payload.map((entry: any, index: number) => {
					const value = entry.value
					const displayValue =
						entry.dataKey === 'duration' ? formatSeconds(value) : value

					return (
						<div key={index} className='flex items-center gap-2'>
							<div
								className='h-2.5 w-2.5 rounded-full'
								style={{ backgroundColor: entry.color }}
							/>
							<span className='text-sm text-muted-foreground'>
								{entry.name}:
							</span>
							<span className='font-medium'>{displayValue}</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default function Zones({ data, projectName }: ZonesProps) {
	const { t } = useTranslation()
	const { handleError } = useHandleGenericError()

	const [isZoneImageDownloading, setIsZoneImageDownloading] =
		useState<boolean>(false)

	const [viewStates, setViewStates] = useState<{
		[key: string]: 'table' | 'chart'
	}>({})

	const toggleView = (key: string) => {
		setViewStates((prev) => ({
			...prev,
			[key]: prev[key] === 'chart' ? 'table' : 'chart',
		}))
	}

	const handleScreenshotDownload = async (
		id: string,
		name: string,
		buttonId: string
	) => {
		setIsZoneImageDownloading(true)
		try {
			const translatedName = t('Analytics.downloadName', {
				projectName,
				name,
			})

			await handleScreenshot(
				document.getElementById(id),
				translatedName,
				buttonId
			)
		} catch (error: unknown) {
			console.error(error)
			handleError(error)
		} finally {
			setIsZoneImageDownloading(false)
		}
	}

	const numberOfAnsweredQuestions = useMemo(
		() =>
			data?.per_zone?.reduce(
				(sum: any, zone: any) => sum + (zone.questions_answers?.length || 0),
				0
			),
		[data]
	)

	const pastedTextData = data?.total?.data

	if (!data || !data.per_zone || data.per_zone.length === 0) {
		return (
			<Card className='mt-8'>
				<CardContent className='py-2'>
					<p className='text-center text-base font-medium text-black'>
						{t('Analytics.noDataAvailable')}
					</p>
				</CardContent>
			</Card>
		)
	}

	const pieColors = [
		'#2563eb', // blue
		'#ec4899', // pink
		'#10b981', // emerald green
		'#f59e0b', // amber
		'#8b5cf6', // violet
		'#ef4444', // red
	]

	return (
		<div className='mt-8 space-y-7'>
			{pastedTextData && (
				<Card className='border-2 border-primary bg-primary-foreground shadow-lg'>
					<CardHeader>
						<CardTitle className='text-2xl font-bold text-primary'>
							{t('Analytics.surveyOverview')}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
							<div className='grid grid-cols-2 gap-4'>
								<div className='flex flex-col items-center justify-center rounded-lg border border-primary bg-white p-4 text-center shadow-sm'>
									<div className='text-4xl font-bold text-orange-600'>
										{pastedTextData.broj_ljudi}
									</div>
									<div className='text-sm font-medium text-primary'>
										{t('Analytics.totalPeopleCount')}
									</div>
								</div>
								<div className='flex flex-col items-center justify-center rounded-lg border border-primary bg-white p-4 text-center shadow-sm'>
									<div className='text-3xl font-bold text-green-600'>
										{numberOfAnsweredQuestions || 0}
									</div>
									<div className='text-sm text-primary'>
										{t('Analytics.surveyQuestions')}
									</div>
								</div>
								<div className='grid grid-cols-2 gap-4'>
									{pastedTextData.gender.map((item: any, index: number) => (
										<div
											key={index}
											className='flex flex-col items-center justify-center rounded-lg border border-primary bg-white p-4 text-center shadow-sm'
										>
											<div className='text-sm text-primary'>{item.label}</div>
											<div className='text-3xl font-bold text-primary'>
												{item.count}
											</div>
											<div className='text-sm text-primary'>
												({item.percentage}%)
											</div>
										</div>
									))}
								</div>

								{/* <div className='flex flex-col items-center justify-center rounded-lg border border-primary bg-white p-4 text-center shadow-sm'>
									<div className='text-3xl font-bold text-primary'>
										d{pastedTextData.broj_muski}
									</div>
									<div className='text-sm text-primary'>
										{t('Analytics.malesCount')} (
										{pastedTextData.percentage_muski.toFixed(1)}%)
									</div>
								</div>
								<div className='flex flex-col items-center justify-center rounded-lg border border-primary bg-white p-4 text-center shadow-sm'>
									<div className='text-3xl font-bold text-pink-600'>
										{pastedTextData.broj_zenski}
									</div>
									<div className='text-sm text-primary'>
										{t('Analytics.femalesCount')} (
										{pastedTextData.percentage_zenski.toFixed(1)}%)
									</div>
								</div> */}
							</div>

							<div className='rounded-lg border border-primary bg-white p-4 shadow-sm'>
								<h4 className='mb-3 text-lg font-semibold text-blue-900'>
									{t('Analytics.genderBreakdown')}
								</h4>
								<ChartContainer
									config={{
										males: { label: t('Analytics.males'), color: '#2563eb' },
										females: {
											label: t('Analytics.females'),
											color: '#ec4899',
										},
									}}
									className='h-[250px]'
								>
									<PieChart>
										<Pie
											data={pastedTextData.gender.map(
												(item: any, index: number) => ({
													name: item.label,
													value: item.count,
													fill: pieColors[index % pieColors.length],
												})
											)}
											cx='50%'
											cy='50%'
											outerRadius={80}
											dataKey='value'
											label={({ name, value, percent }) =>
												`${name}: ${value} (${(percent * 100).toFixed(0)}%)`
											}
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
									</PieChart>
								</ChartContainer>
							</div>
						</div>

						{pastedTextData.dobna_skupina && (
							<div className='mt-6'>
								<h4 className='mb-3 text-lg font-semibold text-primary'>
									{t('Analytics.ageGroups')}
								</h4>
								<div className='grid grid-cols-2 gap-2 xl:grid-cols-6'>
									{pastedTextData.dobna_skupina.data.map((ageGroup: any) => (
										<div
											key={ageGroup.label}
											className='rounded-lg border border-destructive bg-white p-3 text-center shadow-sm'
										>
											<div className='text-lg font-bold text-destructive'>
												{ageGroup.count}
											</div>
											<div className='flex items-center justify-center gap-2'>
												<div className='text-sm font-medium text-primary'>
													{ageGroup.label}
												</div>
												<div className='text-sm text-primary'>
													({ageGroup.percentage}%)
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			<Card id='zone-activity-overview'>
				<CardHeader className='flex flex-row items-center justify-between'>
					<div>
						<CardTitle>{t('Analytics.zoneActivityOverview')}</CardTitle>
						<CardDescription>{t('Analytics.zoneActivityDesc')}</CardDescription>
					</div>
					<div id='zone-activity-overview-buttons'>
						<Button
							disabled={isZoneImageDownloading}
							onClick={async () => {
								await handleScreenshotDownload(
									'zone-activity-overview',
									t('Analytics.zoneActivityOverview'),
									'zone-activity-overview-buttons'
								)
							}}
							variant='default'
							id='zone-activity-overview-buttons'
						>
							{t('Analytics.downloadImage')}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<ChartContainer
						config={{
							people: { label: t('Analytics.people'), color: '#8884D8' },
							duration: {
								label: t('Analytics.durationSeconds'),
								color: '#82CA9D',
							},
						}}
						className='h-[400px]'
					>
						<BarChart
							data={data.per_zone.map((zone: any) => ({
								name: zone.name,
								people: zone.data.gender.broj_ljudi,
								duration: zone.lasted.seconds,
							}))}
						>
							<XAxis dataKey='name' />
							<YAxis />
							<ChartTooltip content={<CustomTooltipContent />} />
							<Bar dataKey='people' fill='#8884D8' />
							<Bar dataKey='duration' fill='#82CA9D' />
						</BarChart>
					</ChartContainer>
				</CardContent>
			</Card>

			{data.per_zone.map((zone: any) => (
				<Card key={zone.id_zones} id={`zone-${zone.id_zones}`}>
					<CardHeader className='flex flex-row items-center justify-between'>
						<div>
							<CardTitle>{zone.name}</CardTitle>
						</div>
						<div
							className='flex items-center gap-2'
							id={`zone-${zone.id_zones}-buttons`}
						>
							{viewStates[`zone-${zone.id_zones}`] === 'chart' && (
								<Button
									disabled={isZoneImageDownloading}
									onClick={async () => {
										await handleScreenshotDownload(
											`zone-${zone.id_zones}`,
											zone.name,
											`zone-${zone.id_zones}-buttons`
										)
									}}
									variant='default'
								>
									{t('Analytics.downloadImage')}
								</Button>
							)}
							<Button
								disabled={isZoneImageDownloading}
								variant='outline'
								onClick={() => toggleView(`zone-${zone.id_zones}`)}
							>
								{viewStates[`zone-${zone.id_zones}`] === 'chart'
									? t('Analytics.showTable')
									: t('Analytics.showGraphic')}
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-3'>
							<div className='text-center'>
								<div className='text-2xl font-bold'>
									{zone.data.gender.broj_ljudi}
								</div>
								<div className='text-sm text-muted-foreground'>
									{t('Analytics.totalPeopleCount')}
								</div>
							</div>
							<div className='text-center'>
								<div className='text-2xl font-bold'>
									{zone.lasted.formatted}
								</div>
								<div className='text-sm text-muted-foreground'>
									{t('Analytics.duration')}
								</div>
							</div>
							<div className='text-center'>
								<div className='text-2xl font-bold'>
									{zone.lasted.average.by_number_of_people}
								</div>
								<div className='text-sm text-muted-foreground'>
									{t('Analytics.avgPerPerson')}
								</div>
							</div>
						</div>

						{viewStates[`zone-${zone.id_zones}`] === 'chart' ? (
							<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
								<div className='relative'>
									<h3 className='absolute left-1/2 top-3 -translate-x-1/2 pl-2 text-lg font-semibold'>
										{t('Analytics.genderDistribution')}
									</h3>
									<ChartContainer
										config={{
											males: { label: t('Analytics.males'), color: '#0088FE' },
											females: {
												label: t('Analytics.females'),
												color: '#00C49F',
											},
										}}
										className='h-[300px] w-full'
									>
										<PieChart>
											<Pie
												data={zone.data.gender.data.map(
													(item: any, index: number) => ({
														name: item.label,
														value: item.count,
														fill: pieColors[index % pieColors.length],
													})
												)}
												cx='50%'
												cy='50%'
												outerRadius={80}
												dataKey='value'
												labelLine={true}
												label={({ name, percent }) =>
													`${name}: ${(percent * 100).toFixed(0)}%`
												}
											/>
											<ChartTooltip
												content={
													<ChartTooltipContent
														formatter={(value, name) =>
															`${name}: ${(((value as number) / zone.data?.gender?.broj_ljudi) * 100).toFixed(2)}% (${value})`
														}
													/>
												}
											/>
										</PieChart>
									</ChartContainer>
								</div>
								{zone.questions_answers?.map((q: any, i: number) => (
									<div key={i} className='relative'>
										<h3 className='absolute left-1/2 top-3 -translate-x-1/2 pl-2 text-lg font-semibold'>
											{t('Analytics.questions.question')} {q.label}
										</h3>
										<ChartContainer
											config={Object.entries(q?.count_percentage ?? {}).reduce(
												(acc: any, [label, _]: [string, any], i: number) => {
													acc[label] = {
														label,
														color: pieChartColors[i],
													}
													return acc
												},
												{}
											)}
											className='h-[300px] w-full'
										>
											<PieChart>
												<Pie
													data={Object.entries(q?.count_percentage ?? {}).map(
														([label, value]: [string, any], k: number) => ({
															name: label,
															value: value.count,
															percentage: value.percentage,
															fill: pieChartColors[k],
														})
													)}
													cx='50%'
													cy='50%'
													outerRadius={80}
													dataKey='value'
													label={({ name, payload }) =>
														`${name}: ${payload.payload.percentage}%`
													}
												/>
												<ChartTooltip
													content={
														<ChartTooltipContent
															formatter={(value, name, payload) =>
																`${name}: ${payload.payload.percentage}% (${value})`
															}
														/>
													}
												/>
											</PieChart>
										</ChartContainer>
									</div>
								))}
							</div>
						) : (
							<>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>{t('Analytics.metric')}</TableHead>
											<TableHead>{t('Analytics.value')}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{zone.data.gender.data.map((item: any, index: number) => (
											<TableRow key={index}>
												<TableCell>{item.label}</TableCell>
												<TableCell>{item.count}</TableCell>
											</TableRow>
										))}

										{/* <TableRow>
											<TableCell>{t('Analytics.males')}</TableCell>
											<TableCell>{zone.data.broj_muski}</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>{t('Analytics.females')}</TableCell>
											<TableCell>{zone.data.broj_zenski}</TableCell>
										</TableRow> */}
										<TableRow>
											<TableCell>{t('Analytics.totalDuration')}</TableCell>
											<TableCell>{zone.lasted.formatted}</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>{t('Analytics.avgPerPerson')}</TableCell>
											<TableCell>
												{Number.parseFloat(
													zone.lasted.average.by_number_of_people_seconds
												)?.toFixed(2)}{' '}
												{t('Analytics.seconds')}
											</TableCell>
										</TableRow>
									</TableBody>
								</Table>

								{zone?.questions_answers?.length > 0 && (
									<div className='mt-12 flex flex-col border-t border-t-primary/25 px-2 pt-6'>
										<div className='flex flex-col'>
											<CardTitle className='text-lg font-semibold'>
												{t('Analytics.questionsAnswersAnalysis')}
											</CardTitle>
											<CardDescription>
												{t('Analytics.questionsAnswersDesc')}
											</CardDescription>
										</div>
										<AnswersDetailsAccordions
											projectName={projectName}
											filterOutZones={false}
											data={zone}
										/>
									</div>
								)}
							</>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	)
}
