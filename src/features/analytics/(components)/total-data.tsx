'use client'

import { useState } from 'react'
import { Clock, MapPin, TrendingUp, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TotalDataProps {
	data: any
}

export default function TotalData({ data }: TotalDataProps) {
	const { t } = useTranslation()
	const [viewStates, setViewStates] = useState<{
		[key: string]: 'table' | 'chart'
	}>({})

	const toggleView = (key: string) => {
		setViewStates((prev) => ({
			...prev,
			[key]: prev[key] === 'chart' ? 'table' : 'chart',
		}))
	}

	const formatKey = (key: string) => {
		return key
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ')
	}

	const formatSeconds = (sec: number) => {
		if (!isFinite(sec) || sec <= 0) return '-'

		const totalSeconds = Math.round(sec)
		const hours = Math.floor(totalSeconds / 3600)
		const minutes = Math.floor((totalSeconds % 3600) / 60)
		const seconds = totalSeconds % 60

		if (hours && minutes) return `${hours}h ${minutes} min`
		if (hours && !minutes) return `${hours}h`
		return `${minutes ? `${minutes} min` : ''} ${seconds} sec`.trim()
	}

	const prepareAnswersChartData = (countPercentage: any) => {
		return Object.entries(countPercentage).map(
			([answer, data]: [string, any]) => ({
				answer,
				count: data.count,
				percentage: data.percentage,
			})
		)
	}

	const prepareDemographicChartData = (peopleData: any[]) => {
		return peopleData.map((item: any) => ({
			label: item.label,
			count: item.count,
			percentage: item.percentage,
		}))
	}

	if (!data || Object.keys(data).length === 0) {
		return (
			<div className='p-4 text-center'>
				<p className='text-lg text-muted-foreground'>
					{t('Analytics.noDataAvailable')}
				</p>
			</div>
		)
	}

	return (
		<div className='mt-8 space-y-8'>
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							{t('Analytics.totalPeople')}
						</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{data.broj_ljudi}</div>
						<p className='text-xs text-muted-foreground'>
							{data.broj_muski} {t('Analytics.males')}, {data.broj_zenski}{' '}
							{t('Analytics.females')}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							{t('Analytics.totalTrackings')}
						</CardTitle>
						<TrendingUp className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{data.trackings?.count || 0}
						</div>
						<div className='mt-2 space-y-2'>
							<p className='text-xs text-muted-foreground'>
								{t('Analytics.avgPeoplePerTracking')}{' '}
								{data.trackings?.average_people?.per_tracking?.toFixed(1) ||
									'0'}
							</p>
							<div className='grid grid-cols-2 gap-2 text-xs'>
								<div className='rounded bg-blue-50 p-2'>
									<span className='font-medium text-blue-700'>
										{t('Analytics.males')}
									</span>
									<div className='font-semibold text-blue-900'>
										{data.trackings?.average_people?.per_tracking_males?.toFixed(
											3
										) || '0'}
									</div>
								</div>
								<div className='rounded bg-pink-50 p-2'>
									<span className='font-medium text-pink-700'>
										{t('Analytics.females')}
									</span>
									<div className='font-semibold text-pink-900'>
										{data.trackings?.average_people?.per_tracking_females?.toFixed(
											3
										) || '0'}
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							{t('Analytics.totalDuration')}
						</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{formatSeconds(data.trackings?.total_lasted)}
						</div>
						<div className='mt-2 space-y-2'>
							<p className='text-xs text-muted-foreground'>
								{t('Analytics.avgPerPerson')}{' '}
								{formatSeconds(data.trackings?.average_lasted?.per_people)}
							</p>
							<div className='grid grid-cols-2 gap-2 text-xs'>
								<div className='rounded bg-blue-50 p-2'>
									<span className='font-medium text-blue-700'>
										{t('Analytics.males')}
									</span>
									<div className='font-semibold text-blue-900'>
										{formatSeconds(data.trackings?.average_lasted?.per_males)}
									</div>
								</div>
								<div className='rounded bg-pink-50 p-2'>
									<span className='font-medium text-pink-700'>
										{t('Analytics.females')}
									</span>
									<div className='font-semibold text-pink-900'>
										{formatSeconds(data.trackings?.average_lasted?.per_females)}
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							{t('Analytics.activeZones')}
						</CardTitle>
						<MapPin className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{data.zones.per_zone.length}
						</div>
						<p className='text-xs text-muted-foreground'>
							{t('Analytics.monitoringAreas')}
						</p>
					</CardContent>
				</Card>
			</div>

			{data?.questions_answers && data?.questions_answers.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>{t('Analytics.questionsAnswersAnalysis')}</CardTitle>
						<CardDescription>
							{t('Analytics.questionsAnswersDesc')}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Accordion type='single' collapsible className='w-full'>
							{data?.questions_answers
								?.filter((question: any) => question.id_zones === null)
								.map((question: any, questionIndex: number) => (
									<AccordionItem
										className={
											questionIndex < data.questions_answers.length - 1
												? 'border-b'
												: '!border-none'
										}
										key={questionIndex}
										value={`question-${questionIndex}`}
									>
										<AccordionTrigger className='text-left'>
											<span className='text-lg font-semibold'>
												{question.label}
											</span>
										</AccordionTrigger>
										<AccordionContent>
											<div className='pt-4'>
												<Tabs defaultValue='answers' className='w-full'>
													<TabsList className='mb-6 grid h-auto w-full grid-cols-2 lg:h-9 lg:grid-cols-5'>
														<TabsTrigger
															value='answers'
															className='text-xs md:text-sm'
														>
															{t('Analytics.answerDistribution')}
														</TabsTrigger>
														<TabsTrigger
															value='demographics'
															className='text-xs md:text-sm'
														>
															{t('Analytics.demographics')}
														</TabsTrigger>
														<TabsTrigger
															value='age-breakdown'
															className='text-xs md:text-sm'
														>
															{t('Analytics.ageBreakdown')}
														</TabsTrigger>
														<TabsTrigger
															value='detailed'
															className='text-xs md:text-sm'
														>
															{t('Analytics.detailedView')}
														</TabsTrigger>

														<TabsTrigger
															value='profile'
															className='text-xs md:text-sm'
														>
															{t('Analytics.profileView')}
														</TabsTrigger>
													</TabsList>

													<TabsContent value='answers' className='space-y-4'>
														<div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
															<div className='w-full'>
																<h4 className='mb-4 text-lg font-medium'>
																	{t('Analytics.answerDistribution')}
																</h4>
																<div className='w-full overflow-hidden'>
																	<ChartContainer
																		config={{
																			count: {
																				label: t('Analytics.count'),
																				color: '#3b82f6',
																			},
																		}}
																		className='h-[250px] w-full md:h-[300px]'
																	>
																		<BarChart
																			data={prepareAnswersChartData(
																				question.count_percentage
																			)}
																			margin={{
																				bottom: 60,
																				left: 20,
																				right: 20,
																			}}
																		>
																			<XAxis
																				dataKey='answer'
																				angle={-45}
																				textAnchor='end'
																				height={80}
																				fontSize={10}
																				interval={0}
																			/>
																			<YAxis fontSize={12} />
																			<ChartTooltip
																				content={<ChartTooltipContent />}
																				formatter={(value) => [
																					`${value} (${prepareAnswersChartData(question.count_percentage).find((d) => d.count === value)?.percentage}%)`,
																					t('Analytics.responses'),
																				]}
																			/>
																			<Bar dataKey='count' fill='#3b82f6' />
																		</BarChart>
																	</ChartContainer>
																</div>
															</div>
															<div className='w-full'>
																<h4 className='mb-4 text-lg font-medium'>
																	{t('Analytics.responseSummary')}
																</h4>
																<div className='space-y-3'>
																	{Object.entries(
																		question.count_percentage
																	).map(([answer, data]: [string, any]) => (
																		<div
																			key={answer}
																			className='flex items-center justify-between rounded-lg bg-gray-50 p-3'
																		>
																			<span className='mr-2 truncate text-sm font-medium md:text-base'>
																				{answer}
																			</span>
																			<div className='flex-shrink-0 text-right'>
																				<div className='text-lg font-bold'>
																					{data.count}
																				</div>
																				<div className='text-sm text-gray-600'>
																					{data.percentage}%
																				</div>
																			</div>
																		</div>
																	))}
																</div>
															</div>
														</div>
													</TabsContent>

													<TabsContent
														value='demographics'
														className='space-y-4'
													>
														<div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
															<div className='w-full'>
																<h4 className='mb-4 text-lg font-medium'>
																	{t('Analytics.overallDemographics')}
																</h4>
																<div className='w-full overflow-hidden'>
																	<ChartContainer
																		config={{
																			count: {
																				label: t('Analytics.count'),
																				color: '#10b981',
																			},
																		}}
																		className='h-[250px] w-full md:h-[300px]'
																	>
																		<BarChart
																			data={prepareDemographicChartData(
																				question.count.for_question.people
																			)}
																			margin={{
																				bottom: 40,
																				left: 20,
																				right: 20,
																			}}
																		>
																			<XAxis dataKey='label' fontSize={12} />
																			<YAxis fontSize={12} />
																			<ChartTooltip
																				content={<ChartTooltipContent />}
																			/>
																			<Bar dataKey='count' fill='#10b981' />
																		</BarChart>
																	</ChartContainer>
																</div>
																<div className='mt-4 space-y-2'>
																	{question.count.for_question.people.map(
																		(item: any, index: number) => (
																			<div
																				key={index}
																				className='flex items-center justify-between rounded bg-green-50 p-2'
																			>
																				<span className='text-sm font-medium capitalize'>
																					{formatKey(item.label)}
																				</span>
																				<span className='text-sm font-bold'>
																					{item.count} ({item.percentage}%)
																				</span>
																			</div>
																		)
																	)}
																</div>
															</div>
															<div className='w-full'>
																<h4 className='mb-4 text-lg font-medium'>
																	{t('Analytics.ageDistribution')}
																</h4>
																<div className='w-full overflow-hidden'>
																	<ChartContainer
																		config={{
																			count: {
																				label: t('Analytics.count'),
																				color: '#f59e0b',
																			},
																		}}
																		className='h-[250px] w-full md:h-[300px]'
																	>
																		<BarChart
																			data={prepareDemographicChartData(
																				question.count.for_question
																					.dobna_skupina
																			)}
																			margin={{
																				bottom: 40,
																				left: 20,
																				right: 20,
																			}}
																		>
																			<XAxis dataKey='label' fontSize={12} />
																			<YAxis fontSize={12} />
																			<ChartTooltip
																				content={<ChartTooltipContent />}
																			/>
																			<Bar dataKey='count' fill='#f59e0b' />
																		</BarChart>
																	</ChartContainer>
																</div>
																<div className='mt-4 space-y-2'>
																	{question.count.for_question.dobna_skupina.map(
																		(item: any, index: number) => (
																			<div
																				key={index}
																				className='flex items-center justify-between rounded bg-amber-50 p-2'
																			>
																				<span className='text-sm font-medium'>
																					{item.label}
																				</span>
																				<span className='text-sm font-bold'>
																					{item.count} ({item.percentage}%)
																				</span>
																			</div>
																		)
																	)}
																</div>
															</div>
														</div>
													</TabsContent>

													<TabsContent
														value='age-breakdown'
														className='space-y-4'
													>
														<h4 className='mb-4 text-lg font-medium'>
															{t('Analytics.ageBreakdownByAnswer')}
														</h4>
														<div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
															{question.count.for_answers.dobna_skupina.map(
																(answerData: any, index: number) => (
																	<div
																		key={index}
																		className='rounded-lg border p-4'
																	>
																		<h5 className='mb-3 font-semibold'>
																			{answerData.label}
																		</h5>
																		<div className='w-full overflow-hidden'>
																			<ChartContainer
																				config={{
																					count: {
																						label: t('Analytics.count'),
																						color: '#8b5cf6',
																					},
																				}}
																				className='h-[200px] w-full'
																			>
																				<BarChart
																					data={prepareDemographicChartData(
																						answerData.dobna_skupina
																					)}
																					margin={{
																						bottom: 40,
																						left: 20,
																						right: 20,
																					}}
																				>
																					<XAxis
																						dataKey='label'
																						fontSize={10}
																					/>
																					<YAxis fontSize={10} />
																					<ChartTooltip
																						content={<ChartTooltipContent />}
																					/>
																					<Bar dataKey='count' fill='#8b5cf6' />
																				</BarChart>
																			</ChartContainer>
																		</div>
																		<div className='mt-3 space-y-1'>
																			{answerData.dobna_skupina.map(
																				(ageGroup: any, ageIndex: number) => (
																					<div
																						key={ageIndex}
																						className='flex items-center justify-between rounded bg-purple-50 p-1 text-xs'
																					>
																						<span className='font-medium'>
																							{ageGroup.label}
																						</span>
																						<span className='font-bold'>
																							{ageGroup.count} (
																							{ageGroup.percentage}%)
																						</span>
																					</div>
																				)
																			)}
																		</div>
																	</div>
																)
															)}
														</div>
													</TabsContent>

													<TabsContent value='detailed' className='space-y-4'>
														<div className='space-y-6'>
															<div>
																<h4 className='mb-4 text-lg font-medium'>
																	{t('Analytics.genderBreakdownByAnswer')}
																</h4>
																<div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
																	{question.count.for_answers.people.map(
																		(answerData: any, index: number) => (
																			<div
																				key={index}
																				className='rounded-lg border p-4'
																			>
																				<h5 className='mb-3 font-semibold'>
																					{answerData.label}
																				</h5>
																				<div className='space-y-2'>
																					{answerData.people.map(
																						(
																							demographic: any,
																							dIndex: number
																						) => (
																							<div
																								key={dIndex}
																								className='flex items-center justify-between rounded bg-gray-50 p-2'
																							>
																								<span className='text-sm capitalize'>
																									{formatKey(demographic.label)}
																								</span>
																								<span className='text-sm font-bold'>
																									{demographic.count} (
																									{demographic.percentage}%)
																								</span>
																							</div>
																						)
																					)}
																				</div>
																			</div>
																		)
																	)}
																</div>
															</div>
														</div>
													</TabsContent>

													<TabsContent value='profile' className='space-y-4'>
														<div className='space-y-6'>
															<div>
																<h4 className='mb-4 text-lg font-medium'>
																	{t('Analytics.genderBreakdownByAnswer')}
																</h4>
																<div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
																	{question.count.for_answers.profile.map(
																		(answerData: any, index: number) => (
																			<div
																				key={index}
																				className='rounded-lg border p-4'
																			>
																				<h5 className='mb-3 font-semibold'>
																					{answerData.label}
																				</h5>
																				<div className='space-y-2'>
																					{answerData.profile.map(
																						(
																							demographic: any,
																							dIndex: number
																						) => (
																							<div
																								key={dIndex}
																								className='flex items-center justify-between rounded bg-gray-50 p-2'
																							>
																								<span className='text-sm capitalize'>
																									{formatKey(demographic.label)}
																								</span>
																								<span className='text-sm font-bold'>
																									{demographic.count} (
																									{demographic.percentage}%)
																								</span>
																							</div>
																						)
																					)}
																				</div>
																			</div>
																		)
																	)}
																</div>
															</div>
														</div>
													</TabsContent>
												</Tabs>
											</div>
										</AccordionContent>
									</AccordionItem>
								))}
						</Accordion>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader className='flex flex-row items-center justify-between'>
					<div>
						<CardTitle>{t('Analytics.ageGroups')}</CardTitle>
						<CardDescription>{t('Analytics.ageGroupsDesc')}</CardDescription>
					</div>
					<Button variant='outline' onClick={() => toggleView('age-groups')}>
						{viewStates['age-groups'] === 'chart'
							? t('Analytics.showTable')
							: t('Analytics.showGraphic')}
					</Button>
				</CardHeader>
				<CardContent>
					{viewStates['age-groups'] === 'chart' ? (
						<ChartContainer
							config={{
								count: { label: t('Analytics.count'), color: '#8884D8' },
							}}
							className='h-[400px]'
						>
							<BarChart
								data={data.dobna_skupina.data}
								margin={{ bottom: 40, left: 20, right: 20 }}
							>
								<XAxis dataKey='label' />
								<YAxis />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Bar dataKey='count' fill='#8884D8' />
							</BarChart>
						</ChartContainer>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t('Analytics.ageGroup')}</TableHead>
									<TableHead>{t('Analytics.count')}</TableHead>
									<TableHead>{t('Analytics.percentage')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.dobna_skupina.data.map((item: any) => (
									<TableRow key={item.label}>
										<TableCell className='font-medium'>{item.label}</TableCell>
										<TableCell>{item.count}</TableCell>
										<TableCell>{item.percentage.toFixed(2)}%</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t('Analytics.trackingStatistics')}</CardTitle>
					<CardDescription>
						{t('Analytics.detailedTrackingBreakdown')}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
						<div className='space-y-4'>
							<h4 className='text-lg font-semibold text-gray-900'>
								{t('Analytics.averagePeoplePerTracking')}
							</h4>
							<div className='space-y-3'>
								<div className='rounded-lg bg-gray-50 p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium text-gray-700'>
											{t('Analytics.total')}
										</span>
										<span className='text-lg font-bold text-gray-900'>
											{data.trackings?.average_people?.per_tracking?.toFixed(
												2
											) || '0'}
										</span>
									</div>
								</div>
								<div className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium text-blue-700'>
											{t('Analytics.males')}
										</span>
										<span className='text-lg font-bold text-blue-900'>
											{data.trackings?.average_people?.per_tracking_males?.toFixed(
												2
											) || '0'}
										</span>
									</div>
								</div>
								<div className='rounded-lg border-l-4 border-pink-500 bg-pink-50 p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium text-pink-700'>
											{t('Analytics.females')}
										</span>
										<span className='text-lg font-bold text-pink-900'>
											{data.trackings?.average_people?.per_tracking_females?.toFixed(
												2
											) || '0'}
										</span>
									</div>
								</div>
							</div>
						</div>

						<div className='space-y-4'>
							<h4 className='text-lg font-semibold text-gray-900'>
								{t('Analytics.averageDurationPerPerson')}
							</h4>
							<div className='space-y-3'>
								<div className='rounded-lg bg-gray-50 p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium text-gray-700'>
											{t('Analytics.overall')}
										</span>
										<span className='text-lg font-bold text-gray-900'>
											{formatSeconds(
												data.trackings?.average_lasted?.per_people
											)}
										</span>
									</div>
								</div>
								<div className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium text-blue-700'>
											{t('Analytics.males')}
										</span>
										<span className='text-lg font-bold text-blue-900'>
											{formatSeconds(data.trackings?.average_lasted?.per_males)}
										</span>
									</div>
								</div>
								<div className='rounded-lg border-l-4 border-pink-500 bg-pink-50 p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium text-pink-700'>
											{t('Analytics.females')}
										</span>
										<span className='text-lg font-bold text-pink-900'>
											{formatSeconds(
												data.trackings?.average_lasted?.per_females
											)}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
