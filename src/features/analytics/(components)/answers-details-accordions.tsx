import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { cn, handleScreenshot } from '@/lib/utils.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion.tsx'
import { buttonVariants } from '@/components/ui/button.tsx'
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart.tsx'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui/tabs.tsx'

interface Props {
	data: any
	filterOutZones?: boolean
	className?: string
	projectName: string
}

const AnswersDetailsAccordions = ({
	data,
	filterOutZones = true,
	className,
	projectName,
}: Props) => {
	const { t } = useTranslation()
	const { handleError } = useHandleGenericError()
	const activeTabNameRef = useRef<string | null>(null)

	const [isZoneImageDownloading, setIsZoneImageDownloading] =
		useState<boolean>(false)

	const formatKey = (key: string) => {
		return key
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ')
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

	const handleScreenshotDownload = async (
		id: string,
		name: string,
		buttonId: string
	) => {
		setIsZoneImageDownloading(true)
		try {
			const tabName = t(`Analytics.${activeTabNameRef.current}`)

			const translatedName = `${projectName} ${name} ${tabName}`.replaceAll(
				' ',
				'_'
			)

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

	return (
		<Accordion type='single' collapsible className={cn('w-full', className)}>
			{data?.questions_answers
				?.filter((question: any) =>
					filterOutZones ? question.id_zones === null : true
				)
				.map((question: any, questionIndex: number) => (
					<AccordionItem
						className={cn('group', {
							'border-b': questionIndex !== data.questions_answers.length - 1,
							'!border-none':
								questionIndex === data.questions_answers.length - 1,
						})}
						key={questionIndex}
						value={`question-${questionIndex}`}
						id={`question-${question.label}-${questionIndex}`}
					>
						<AccordionTrigger
							hideChevron
							className='flex items-center justify-between'
						>
							<span className='text-lg font-semibold'>{question.label}</span>
							<div
								className={cn('flex items-center gap-x-4', {
									'pointer-events-none opacity-50': isZoneImageDownloading,
								})}
								id={`question-btn-${question.label}-${questionIndex}`}
							>
								<span
									className={cn(
										'group-data-[state=closed]:hidden',
										buttonVariants({ variant: 'default' })
									)}
									onClick={async (e) => {
										e.preventDefault()
										e.stopPropagation()
										await handleScreenshotDownload(
											`question-${question.label}-${questionIndex}`,
											question.label,
											`question-btn-${question.label}-${questionIndex}`
										)
									}}
								>
									{t('Analytics.downloadImage')}
								</span>
								<ChevronDown className='h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200' />
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<div className='pt-4'>
								<Tabs
									onValueChange={(value) => {
										activeTabNameRef.current = value
									}}
									defaultValue='answerDistribution'
									className='w-full'
								>
									<TabsList className='mb-6 grid h-auto w-full grid-cols-2 lg:h-9 lg:grid-cols-5'>
										<TabsTrigger
											value='answerDistribution'
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
											value='ageBreakdown'
											className='text-xs md:text-sm'
										>
											{t('Analytics.ageBreakdown')}
										</TabsTrigger>
										<TabsTrigger
											value='detailedView'
											className='text-xs md:text-sm'
										>
											{t('Analytics.detailedView')}
										</TabsTrigger>

										<TabsTrigger
											value='profileView'
											className='text-xs md:text-sm'
										>
											{t('Analytics.profileView')}
										</TabsTrigger>
									</TabsList>

									<TabsContent value='answerDistribution' className='space-y-4'>
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
													{Object.entries(question.count_percentage).map(
														([answer, data]: [string, any]) => (
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
														)
													)}
												</div>
											</div>
										</div>
									</TabsContent>

									<TabsContent value='demographics' className='space-y-4'>
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
															<ChartTooltip content={<ChartTooltipContent />} />
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
																question.count.for_question.dobna_skupina
															)}
															margin={{
																bottom: 40,
																left: 20,
																right: 20,
															}}
														>
															<XAxis dataKey='label' fontSize={12} />
															<YAxis fontSize={12} />
															<ChartTooltip content={<ChartTooltipContent />} />
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

									<TabsContent value='ageBreakdown' className='space-y-4'>
										<h4 className='mb-4 text-lg font-medium'>
											{t('Analytics.ageBreakdownByAnswer')}
										</h4>
										<div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
											{question.count.for_answers.dobna_skupina.map(
												(answerData: any, index: number) => (
													<div key={index} className='rounded-lg border p-4'>
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
																	<XAxis dataKey='label' fontSize={10} />
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
																			{ageGroup.count} ({ageGroup.percentage}%)
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

									<TabsContent value='detailedView' className='space-y-4'>
										<div className='space-y-6'>
											<div>
												<h4 className='mb-4 text-lg font-medium'>
													{t('Analytics.genderBreakdownByAnswer')}
												</h4>
												<div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2'>
													{question.count.for_answers.people.map(
														(answerData: any, index: number) => (
															<div
																key={index}
																className='rounded-lg border p-4'
															>
																<h5 className='mb-4 font-semibold'>
																	{answerData.label}
																</h5>
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
																				answerData.people
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
																<div className='space-y-2'>
																	{answerData.people.map(
																		(demographic: any, dIndex: number) => (
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

									<TabsContent value='profileView' className='space-y-4'>
										<div className='space-y-6'>
											<div>
												<h4 className='mb-4 text-lg font-medium'>
													{t('Analytics.profileBreakdownByAnswer')}
												</h4>
												<div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2'>
													{question.count.for_answers.profile.map(
														(answerData: any, index: number) => (
															<div
																key={index}
																className='rounded-lg border p-4'
															>
																<h5 className='mb-4 font-semibold'>
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
																		className='h-[250px] w-full md:h-[300px]'
																	>
																		<BarChart
																			data={prepareDemographicChartData(
																				answerData.profile
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
																			<Bar dataKey='count' fill='#8b5cf6' />
																		</BarChart>
																	</ChartContainer>
																</div>
																<div className='space-y-2'>
																	{answerData.profile.map(
																		(demographic: any, dIndex: number) => (
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
	)
}

export default AnswersDetailsAccordions
