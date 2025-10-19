'use client'

import { useState } from 'react'
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

	const pastedTextData = data?.total?.data

	if (!data || !data.per_zone || data.per_zone.length === 0) {
		return (
			<div className='p-4 text-center'>
				<p className='text-lg text-muted-foreground'>
					{t('Analytics.noDataAvailable')}
				</p>
			</div>
		)
	}

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
										{pastedTextData.questions_answers?.length || 0}
									</div>
									<div className='text-sm text-primary'>
										{t('Analytics.surveyQuestions')}
									</div>
								</div>
								<div className='flex flex-col items-center justify-center rounded-lg border border-primary bg-white p-4 text-center shadow-sm'>
									<div className='text-3xl font-bold text-primary'>
										{pastedTextData.broj_muski}
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
								</div>
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
											data={[
												{
													name: t('Analytics.males'),
													value: pastedTextData.broj_muski,
													fill: '#2563eb',
												},
												{
													name: t('Analytics.females'),
													value: pastedTextData.broj_zenski,
													fill: '#ec4899',
												},
											]}
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

			<Card>
				<CardHeader>
					<CardTitle>{t('Analytics.zoneActivityOverview')}</CardTitle>
					<CardDescription>{t('Analytics.zoneActivityDesc')}</CardDescription>
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
								people: zone.data.broj_ljudi,
								duration: zone.lasted.seconds,
							}))}
						>
							<XAxis dataKey='name' />
							<YAxis />
							<ChartTooltip content={<ChartTooltipContent />} />
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
								<div className='text-2xl font-bold'>{zone.data.broj_ljudi}</div>
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
												data={[
													{
														name: t('Analytics.males'),
														value: zone.data.broj_muski,
														fill: '#0088FE',
													},
													{
														name: t('Analytics.females'),
														value: zone.data.broj_zenski,
														fill: '#00C49F',
													},
												]}
												cx='50%'
												cy='50%'
												outerRadius={80}
												dataKey='value'
												label={({ name, percent }) =>
													`${name}: ${(percent * 100).toFixed(0)}%`
												}
											/>
											<ChartTooltip
												content={
													<ChartTooltipContent
														formatter={(value, name) =>
															`${name}: ${(((value as number) / zone.data?.broj_ljudi) * 100).toFixed(2)}% (${value})`
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
											config={q?.possible_answers_count?.reduce(
												(acc: any, answer: any) => {
													acc[answer.label] = {
														label: answer.label,
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
													data={q?.possible_answers_count?.map(
														(answer: any, k: number) => ({
															name: answer.label,
															value: answer.count,
															percentage: answer.percentage,
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
										<TableRow>
											<TableCell>{t('Analytics.males')}</TableCell>
											<TableCell>{zone.data.broj_muski}</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>{t('Analytics.females')}</TableCell>
											<TableCell>{zone.data.broj_zenski}</TableCell>
										</TableRow>
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
									<div className='mt-6 space-y-4'>
										{zone.questions_answers?.map((q: any, i: number) => (
											<div className='space-y-2' key={i}>
												<h3 className='pl-2 text-lg font-semibold'>
													{t('Analytics.questions.question')} {q.label}
												</h3>
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>
																{t('Analytics.questions.answer')}
															</TableHead>
															<TableHead>
																{t('Analytics.questions.count')}
															</TableHead>
															<TableHead>
																{t('Analytics.questions.percentage')}
															</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{q?.possible_answers_count?.map((answer: any) => (
															<TableRow key={answer.label}>
																<TableCell>{answer.label}</TableCell>
																<TableCell>{answer.count}</TableCell>
																<TableCell>{answer.percentage}%</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										))}
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
