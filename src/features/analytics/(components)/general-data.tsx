import React, { useMemo } from 'react'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import GeneralDataChart from '@/features/analytics/(components)/general-data-chart.tsx'

const ZONE_COLORS = [
	{
		bg: 'bg-blue-50',
		bgIntense: 'bg-blue-100',
		text: 'text-blue-800',
		border: 'border-blue-300',
	},
	{
		bg: 'bg-green-50',
		bgIntense: 'bg-green-100',
		text: 'text-green-800',
		border: 'border-green-300',
	},
	{
		bg: 'bg-purple-50',
		bgIntense: 'bg-purple-100',
		text: 'text-purple-800',
		border: 'border-purple-300',
	},
	{
		bg: 'bg-orange-50',
		bgIntense: 'bg-orange-100',
		text: 'text-orange-800',
		border: 'border-orange-300',
	},
	{
		bg: 'bg-indigo-50',
		bgIntense: 'bg-indigo-100',
		text: 'text-indigo-800',
		border: 'border-indigo-300',
	},
	{
		bg: 'bg-pink-50',
		bgIntense: 'bg-pink-100',
		text: 'text-pink-800',
		border: 'border-pink-300',
	},
	{
		bg: 'bg-teal-50',
		bgIntense: 'bg-teal-100',
		text: 'text-teal-800',
		border: 'border-teal-300',
	},
	{
		bg: 'bg-amber-50',
		bgIntense: 'bg-amber-100',
		text: 'text-amber-800',
		border: 'border-amber-300',
	},
	{
		bg: 'bg-cyan-50',
		bgIntense: 'bg-cyan-100',
		text: 'text-cyan-800',
		border: 'border-cyan-300',
	},
]

interface GeneralDataProps {
	data: any[]
	timespan?: {
		data: Array<{
			from: string
			to: string
			data: {
				trackings: any[]
			}
		}>
		interval: number
		lasted: { formatted: string; seconds: number }
		max: string
		min: string
	}
}

export default function GeneralData({ data, timespan }: GeneralDataProps) {
	const { t } = useTranslation()

	const tableData = useMemo(() => {
		if (!timespan || !timespan.data || timespan.data.length === 0) {
			return data
		}

		return timespan.data
			.map((data: any) => {
				const trackings = data.data.trackings
				const fromDate = new Date(data.from)
				const toDate = new Date(data.to)

				return trackings?.map((tracking: any) => ({
					...tracking,
					fromDate,
					toDate,
				}))
			})
			.flat()
	}, [data, timespan])

	const getAgeGroups = () => {
		if (data.length === 0) return []
		return data[0].data.dobna_skupina.data.map((age: any) => age.label)
	}

	const getMainQuestions = () => {
		if (data.length === 0) return []
		return data[0].data.questions_answers.map((q: any) => q.label)
	}

	const getZones = () => {
		if (data.length === 0) return []
		return data[0].zones.map((zone: any) => zone.name)
	}

	const getZoneQuestions = (zoneName: string) => {
		if (data.length === 0) return []
		const zone = data[0].zones.find((z: any) => z.name === zoneName)
		return zone ? zone.questions_answers.map((q: any) => q.label) : []
	}

	const getZoneColor = (index: number) => {
		return ZONE_COLORS[index % ZONE_COLORS.length]
	}

	const formatDateTime = (dateString: string) => {
		try {
			const date = new Date(dateString)
			return format(date, 'dd.MM.yyyy HH:mm:ss', { locale: hr })
		} catch (_error) {
			return dateString
		}
	}

	const getQuestionAnswerData = (questions: any[], questionLabel: string) => {
		const question = questions.find((q: any) => q.label === questionLabel)
		if (!question) {
			return { answerRows: [] }
		}

		const possibleAnswers = question.possible_answers
			? Object.values(question.possible_answers)
			: []

		const answerRows = possibleAnswers.map((answer: any) => {
			const answerData =
				question.count_percentage && question.count_percentage[answer]
			return {
				answer,
				count: answerData ? answerData.count : 0,
				percentage: answerData ? answerData.percentage : 0,
			}
		})

		return { answerRows }
	}

	const getAgeGroupCount = (ageData: any[], ageLabel: string) => {
		const ageGroup = ageData.find((age: any) => age.label === ageLabel)
		return ageGroup ? ageGroup.count : 0
	}

	const getZoneAnswer = (
		zones: any[],
		zoneName: string,
		questionLabel: string
	) => {
		const zone = zones.find((z: any) => z.name === zoneName)
		if (!zone) return '-'

		const question = zone.questions_answers.find(
			(q: any) => q.label === questionLabel
		)
		return question ? question.answer || '-' : '-'
	}

	const getZoneDuration = (zones: any[], zoneName: string) => {
		const zone = zones.find((z: any) => z.name === zoneName)
		return zone ? zone.lasted.formatted : '-'
	}

	const ageGroups = getAgeGroups()
	const mainQuestions = getMainQuestions()
	const zones = getZones()

	const basicInfoCols = 1
	const timeCols = 3
	const demographicsCols = 5
	const ageGroupsCols = ageGroups.length
	const questionsCols = mainQuestions.length
	const totalZoneCols = zones.reduce((total: number, zoneName: any) => {
		return total + 1 + getZoneQuestions(zoneName).length
	}, 0)

	if (!tableData || tableData.length === 0) {
		return (
			<div className='p-4 text-center'>
				<p className='text-lg text-muted-foreground'>
					{t('Analytics.noDataAvailable')}
				</p>
			</div>
		)
	}

	return (
		<div className='w-full'>
			<GeneralDataChart data={data} />
			<div className='rounded-lg border bg-card shadow-sm'>
				<div className='overflow-auto'>
					<Table>
						<TableHeader>
							<TableRow className='border-b-2 bg-slate-100'>
								{timespan && (
									<TableHead className='border-r-2 text-center font-semibold text-black'>
										{t('Analytics.timeRange')}
									</TableHead>
								)}
								<TableHead
									className='border-r-2 text-center font-semibold text-black'
									colSpan={basicInfoCols}
								>
									{t('Analytics.basic')}
								</TableHead>
								<TableHead
									className='border-r-2 text-center font-semibold text-black'
									colSpan={timeCols}
								>
									{t('Analytics.time')}
								</TableHead>
								<TableHead
									className='border-r-2 text-center font-semibold text-black'
									colSpan={demographicsCols}
								>
									{t('Analytics.demographics')}
								</TableHead>
								<TableHead
									className='border-r-2 text-center font-semibold text-black'
									colSpan={ageGroupsCols}
								>
									{t('Analytics.years')}
								</TableHead>
								<TableHead
									className='border-r-2 text-center font-semibold text-black'
									colSpan={questionsCols}
								>
									{t('Analytics.tabs.questions')}
								</TableHead>
								<TableHead
									className='text-center font-semibold text-black'
									colSpan={totalZoneCols}
								>
									{t('Analytics.tabs.zones')}
								</TableHead>
							</TableRow>

							<TableRow className='bg-slate-75 border-b'>
								{timespan && <TableHead className='border-r'></TableHead>}
								<TableHead
									className='border-r text-center font-semibold text-slate-600'
									colSpan={basicInfoCols}
								></TableHead>
								<TableHead
									className='border-r text-center font-semibold text-purple-600'
									colSpan={timeCols}
								></TableHead>
								<TableHead
									className='border-r text-center font-semibold text-blue-600'
									colSpan={demographicsCols}
								></TableHead>
								<TableHead
									className='border-r text-center font-semibold text-green-600'
									colSpan={ageGroupsCols}
								></TableHead>
								<TableHead
									className='border-r text-center font-semibold text-yellow-600'
									colSpan={questionsCols}
								></TableHead>
								{zones.map((zoneName: any, index: number) => {
									const zoneQuestionCount = getZoneQuestions(zoneName).length
									const isLast = index === zones.length - 1
									const zoneColor = getZoneColor(index)
									return (
										<TableHead
											key={zoneName}
											className={`text-center font-semibold text-orange-600 ${!isLast ? 'border-r' : ''} ${zoneColor.bgIntense}`}
											colSpan={1 + zoneQuestionCount}
										>
											{zoneName}
										</TableHead>
									)
								})}
							</TableRow>

							<TableRow className='bg-slate-50'>
								{timespan && <TableHead className='border-r'></TableHead>}
								<TableHead className='whitespace-nowrap border-r text-center text-xs font-semibold'>
									ID
								</TableHead>
								<TableHead className='whitespace-nowrap border-r bg-purple-50 text-center text-xs font-semibold'>
									{t('Analytics.duration')}
								</TableHead>
								<TableHead className='whitespace-nowrap border-r bg-purple-50 text-center text-xs font-semibold'>
									{t('Analytics.start')}
								</TableHead>
								<TableHead className='whitespace-nowrap border-r bg-purple-50 text-center text-xs font-semibold'>
									{t('Analytics.end')}
								</TableHead>

								<TableHead className='whitespace-nowrap border-r bg-blue-50 text-center text-xs font-semibold'>
									{t('Analytics.totalPeople')}
								</TableHead>
								<TableHead className='whitespace-nowrap border-r bg-blue-50 text-center text-xs font-semibold'>
									{t('Analytics.males')}
								</TableHead>
								<TableHead className='whitespace-nowrap border-r bg-blue-50 text-center text-xs font-semibold'>
									%
								</TableHead>
								<TableHead className='whitespace-nowrap border-r bg-blue-50 text-center text-xs font-semibold'>
									{t('Analytics.females')}
								</TableHead>
								<TableHead className='whitespace-nowrap border-r bg-blue-50 text-center text-xs font-semibold'>
									%
								</TableHead>

								{ageGroups.map((ageLabel: any, index: number) => (
									<TableHead
										key={ageLabel}
										className={`text-center text-xs font-semibold ${index < ageGroups.length - 1 ? 'border-r' : 'border-r'} whitespace-nowrap bg-green-50`}
									>
										{ageLabel}
									</TableHead>
								))}

								{mainQuestions.map((questionLabel: any, index: number) => {
									return (
										<TableCell
											key={questionLabel}
											className={`text-center ${index < mainQuestions.length - 1 ? 'border-r' : 'border-r'} whitespace-nowrap bg-yellow-50/30 p-0`}
										>
											{/* Placeholder for question data */}
										</TableCell>
									)
								})}

								{zones.map((zoneName: any, zoneIndex: number) => {
									const zoneQuestions = getZoneQuestions(zoneName)
									const zoneColor = getZoneColor(zoneIndex)

									return (
										<React.Fragment key={zoneName}>
											<TableHead
												className={`whitespace-nowrap border-r text-center text-xs font-semibold ${zoneColor.bg}`}
											>
												{t('Analytics.duration')}
											</TableHead>

											{zoneQuestions.map(
												(questionLabel: any, qIndex: number) => {
													const isLastQuestion =
														qIndex === zoneQuestions.length - 1
													const isLastZone = zoneIndex === zones.length - 1
													const shouldHaveBorder =
														!isLastQuestion || !isLastZone

													return (
														<TableHead
															key={`${zoneName}-${questionLabel}`}
															className={`text-center text-xs font-semibold ${shouldHaveBorder ? 'border-r' : ''} whitespace-nowrap ${zoneColor.bg}`}
														>
															{questionLabel}
														</TableHead>
													)
												}
											)}
										</React.Fragment>
									)
								})}
							</TableRow>
						</TableHeader>
						<TableBody>
							{tableData.map((record: any) => (
								<TableRow
									key={record.id_tracking}
									className='hover:bg-muted/30'
								>
									{timespan && (
										<TableCell className='whitespace-nowrap border-r text-center font-medium'>
											{format(record.fromDate, 'dd.MM.yyyy HH:mm', {
												locale: hr,
											})}{' '}
											-{' '}
											{format(record.toDate, 'HH:mm', {
												locale: hr,
											})}
										</TableCell>
									)}

									<TableCell className='whitespace-nowrap border-r text-center font-medium'>
										{record.id_tracking}
									</TableCell>

									<TableCell className='whitespace-nowrap border-r bg-purple-50/30 text-center'>
										<Badge
											variant='outline'
											className='border-purple-300 bg-purple-100 text-xs text-purple-800'
										>
											{record.lasted.formatted}
										</Badge>
									</TableCell>
									<TableCell className='whitespace-nowrap border-r bg-purple-50/30 text-center'>
										<div className='text-xs text-muted-foreground'>
											{formatDateTime(record.started_at)}
										</div>
									</TableCell>
									<TableCell className='whitespace-nowrap border-r bg-purple-50/30 text-center'>
										<div className='text-xs text-muted-foreground'>
											{formatDateTime(record.ended_at)}
										</div>
									</TableCell>

									<TableCell className='whitespace-nowrap border-r bg-blue-50/30 text-center'>
										<Badge
											variant='secondary'
											className='bg-blue-100 text-xs text-blue-800'
										>
											{record.data.broj_ljudi}
										</Badge>
									</TableCell>
									<TableCell className='whitespace-nowrap border-r bg-blue-50/30 text-center'>
										<div className='text-sm font-medium text-blue-700'>
											{record.data.broj_muski}
										</div>
									</TableCell>
									<TableCell className='whitespace-nowrap border-r bg-blue-50/30 text-center'>
										<div className='text-xs text-blue-600'>
											{record.data.broj_muski_percentage}%
										</div>
									</TableCell>
									<TableCell className='whitespace-nowrap border-r bg-blue-50/30 text-center'>
										<div className='text-sm font-medium text-pink-700'>
											{record.data.broj_zenski}
										</div>
									</TableCell>
									<TableCell className='whitespace-nowrap border-r bg-blue-50/30 text-center'>
										<div className='text-xs text-pink-600'>
											{record.data.broj_zenski_percentage}%
										</div>
									</TableCell>

									{ageGroups.map((ageLabel: any, index: number) => (
										<TableCell
											key={ageLabel}
											className={`text-center ${index < ageGroups.length - 1 ? 'border-r' : 'border-r'} whitespace-nowrap bg-green-50/30`}
										>
											<Badge
												variant={
													getAgeGroupCount(
														record.data.dobna_skupina.data,
														ageLabel
													) > 0
														? 'default'
														: 'outline'
												}
												className='text-xs'
											>
												{getAgeGroupCount(
													record.data.dobna_skupina.data,
													ageLabel
												)}
											</Badge>
										</TableCell>
									))}

									{mainQuestions.map((questionLabel: any, index: number) => {
										const questionData = getQuestionAnswerData(
											record.data.questions_answers,
											questionLabel
										)

										return (
											<TableCell
												key={questionLabel}
												className={`text-center ${index < mainQuestions.length - 1 ? 'border-r' : 'border-r'} whitespace-nowrap bg-yellow-50/30 p-0`}
											>
												<table className='h-full w-full'>
													<thead>
														<tr>
															{questionData.answerRows.map(
																(row: any, rowIndex: number) => (
																	<th
																		key={`answer-${rowIndex}`}
																		className={`min-w-28 px-1 py-1 text-xs font-medium text-gray-800 ${rowIndex < questionData.answerRows.length - 1 ? 'border-r border-gray-200' : ''}`}
																	>
																		{row.answer}
																	</th>
																)
															)}
														</tr>
													</thead>
													<tbody>
														<tr className='border-t border-gray-300'>
															{questionData.answerRows.map(
																(row: any, rowIndex: number) => (
																	<td
																		key={`stats-${rowIndex}`}
																		className={`p-0 ${rowIndex < questionData.answerRows.length - 1 ? 'border-r border-gray-200' : ''}`}
																	>
																		<div className='grid grid-cols-2 border-t'>
																			<span className='border-r p-1 text-xs text-blue-600'>
																				{row.count}
																			</span>
																			<span className='p-1 text-xs text-green-600'>
																				{row.percentage}%
																			</span>
																		</div>
																	</td>
																)
															)}
														</tr>
													</tbody>
												</table>
											</TableCell>
										)
									})}

									{zones.map((zoneName: any, zoneIndex: number) => {
										const zoneQuestions = getZoneQuestions(zoneName)
										const zoneColor = getZoneColor(zoneIndex)

										return (
											<React.Fragment key={zoneName}>
												<TableCell
													className={`border-r text-center ${zoneColor.bg}/30 whitespace-nowrap`}
												>
													<Badge
														variant='secondary'
														className={`${zoneColor.bgIntense} ${zoneColor.text} text-xs`}
													>
														{getZoneDuration(record.zones, zoneName)}
													</Badge>
												</TableCell>

												{zoneQuestions.map(
													(questionLabel: any, qIndex: number) => {
														const isLastQuestion =
															qIndex === zoneQuestions.length - 1
														const isLastZone = zoneIndex === zones.length - 1
														const shouldHaveBorder =
															!isLastQuestion || !isLastZone

														return (
															<TableCell
																key={`${zoneName}-${questionLabel}`}
																className={`text-center ${shouldHaveBorder ? 'border-r' : ''} ${zoneColor.bg}/30 whitespace-nowrap`}
															>
																<Badge
																	variant={
																		getZoneAnswer(
																			record.zones,
																			zoneName,
																			questionLabel
																		) === 'DA'
																			? 'default'
																			: 'outline'
																	}
																	className='text-xs'
																>
																	{getZoneAnswer(
																		record.zones,
																		zoneName,
																		questionLabel
																	)}
																</Badge>
															</TableCell>
														)
													}
												)}
											</React.Fragment>
										)
									})}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	)
}
