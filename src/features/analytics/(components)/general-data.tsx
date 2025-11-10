import React, { useMemo, useState } from 'react'
import { format } from 'date-fns'
// import { debug } from 'console'
import { hr } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import CommentsModal from '@/features/analytics/(components)/comments-modal'
import GeneralDataChart from '@/features/analytics/(components)/general-data-chart'

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
	invalidData: {
		started_at: string
		ended_at: string
		id_tracking: number
		email: string
	}[]
	data: any[]
	projectName: string
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

export default function GeneralData({
	data,
	timespan,
	projectName,
	invalidData,
}: GeneralDataProps) {
	const { t } = useTranslation()

	const [showInvalidData, setShowInvalidData] = useState(false)

	const [commentOptions, setCommentOptions] = useState<{
		tracking: any | null
		isOpen: boolean
	}>({
		tracking: null,
		isOpen: false,
	})

	const tableData = useMemo(() => {
		if (!timespan || !timespan.data || timespan.data?.length === 0) {
			return data
		}

		return timespan.data.flatMap((data: any) => {
			const trackings = data.data.trackings
			const fromDate = new Date(data.from)
			const toDate = new Date(data.to)

			if (!trackings || trackings.length === 0) {
				return [
					{
						comments: [],
						id_tracking: `-`,
						fromDate,
						toDate,
						lasted: { formatted: '-' },
						started_at: data.from,
						ended_at: data.to,
						data: {
							broj_ljudi: 0,
							broj_muski: 0,
							broj_muski_percentage: 0,
							broj_zenski: 0,
							broj_zenski_percentage: 0,
							dobna_skupina: { data: [] },
							profile: { data: [] },
							questions_answers: [],
						},
						zones: [],
						isEmpty: true,
					},
				]
			}

			return trackings?.map((tracking: any) => ({
				...tracking,
				fromDate,
				toDate,
				isEmpty: false,
			}))
		})
	}, [data, timespan])

	const getAgeGroups = () => {
		if (data?.length === 0) return []

		const allAgeGroups = new Set<string>()
		data?.forEach((tracking: any) => {
			if (tracking.data?.dobna_skupina?.data) {
				tracking.data.dobna_skupina.data?.forEach((age: any) => {
					if (age.label) {
						allAgeGroups.add(age.label)
					}
				})
			}
		})

		return Array.from(allAgeGroups)
	}

	const getGenderGroups = () => {
		if (data?.length === 0) return []

		const allGenderGroups = new Set<string>()
		data?.forEach((tracking: any) => {
			if (tracking.data?.gender?.data) {
				tracking.data.gender.data?.forEach((gender: any) => {
					if (gender.label) {
						allGenderGroups.add(gender.label)
					}
				})
			}
		})

		return Array.from(allGenderGroups)
	}

	const getProfileOptions = () => {
		if (data?.length === 0) return []

		const allProfiles = new Set<string>()
		data?.forEach((tracking: any) => {
			if (tracking.data?.profile?.data) {
				tracking.data.profile.data?.forEach((profile: any) => {
					if (profile.label) {
						allProfiles.add(profile.label)
					}
				})
			}
		})

		return Array.from(allProfiles)
	}

	const getMainQuestions = () => {
		if (!data || data.length === 0) return []

		const seenIds = new Set()
		const allQuestions: string[] = []

		data.forEach((tracking: any) => {
			if (tracking.data?.questions_answers) {
				tracking.data.questions_answers.forEach((q: any) => {
					if (q.label && q.id_zones === null && !seenIds.has(q.id_questions)) {
						seenIds.add(q.id_questions)
						allQuestions.push(q.label)
					}
				})
			}
		})

		return allQuestions
	}

	const getZones = () => {
		if (data?.length === 0) return []

		const allZones = new Set<string>()
		data?.forEach((tracking: any) => {
			if (tracking.zones) {
				tracking.zones.forEach((zone: any) => {
					if (zone.name) {
						allZones.add(zone.name)
					}
				})
			}
		})

		return Array.from(allZones)
	}

	const getZoneQuestions = (zoneName: string) => {
		if (data?.length === 0) return []

		const allZoneQuestions = new Set<string>()
		data?.forEach((tracking: any) => {
			if (tracking.zones) {
				const zone = tracking.zones.find((z: any) => z.name === zoneName)
				if (zone?.questions_answers_raw) {
					zone.questions_answers_raw.forEach((q: any) => {
						if (q?.question?.label) {
							allZoneQuestions.add(q?.question?.label)
						}
					})
				}
			}
		})

		return Array.from(allZoneQuestions)
	}

	const getCommentsInfo = (comments: any) => {
		if (!comments || Object.keys(comments).length === 0) {
			return { type: 'empty', count: 0, display: '-' }
		}

		if (comments.comments && Array.isArray(comments.comments)) {
			return {
				type: 'images',
				count: comments.comments.length,
				display: comments.comments.length,
			}
		}

		const keys = Object.keys(comments)
		if (keys.length > 0) {
			return {
				type: 'keyvalue',
				count: keys.length,
				display: `${keys.length} ${t('Analytics.comments')}`,
			}
		}

		return { type: 'empty', count: 0, display: '-' }
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

	const getAgeGroupCount = (ageData: any[], ageLabel: string) => {
		const ageGroup = ageData.find((age: any) => age.label === ageLabel)
		return ageGroup ? ageGroup.count : 0
	}

	const getProfileData = (profileData: any[], profileLabel: string) => {
		const profile = profileData?.find((p: any) => p.label === profileLabel)
		return profile
			? { count: profile.count, percentage: profile.percentage }
			: { count: 0, percentage: 0 }
	}

	const getPossibleAnswersForQuestion = (questionLabel: string) => {
		const allAnswers = new Set<string>()

		for (const tracking of data) {
			const question = tracking.data?.questions_answers?.find(
				(q: any) => q.label === questionLabel
			)
			if (question?.count_percentage) {
				// Add all answer keys from this tracking's count_percentage
				Object.keys(question.count_percentage).forEach((answer) =>
					allAnswers.add(answer)
				)
			}
		}

		return Array.from(allAnswers)
	}

	const getPossibleAnswersForZoneQuestion = (
		zoneName: string,
		questionLabel: string
	) => {
		const allAnswers = new Set<string>()

		for (const tracking of data) {
			if (tracking.zones) {
				const zone = tracking.zones.find((z: any) => z.name === zoneName)
				if (zone?.questions_answers_raw) {
					const question = zone.questions_answers_raw.find(
						(q: any) => q?.question?.label === questionLabel
					)

					if (question?.question?.possible_answers) {
						question?.question?.possible_answers.forEach((answer: any) =>
							allAnswers.add(answer)
						)
					}
				}
			}
		}

		return Array.from(allAnswers)
	}

	const getZoneDuration = (zones: any[], zoneName: string) => {
		const zone = zones.find((z: any) => z.name === zoneName)
		return zone ? zone.lasted.formatted : '-'
	}

	const ageGroups = getAgeGroups()
	const genderGroups = getGenderGroups()
	const profileOptions = getProfileOptions() // Get profile options
	const mainQuestions = getMainQuestions()
	const zones = getZones()

	const basicInfoCols = 3
	const timeCols = 3
	const demographicsCols = genderGroups.length * 2 + 1
	const ageGroupsCols = ageGroups.length
	const profileCols = profileOptions.length // Calculate profile columns

	const questionsCols = mainQuestions.reduce(
		(total: number, questionLabel: string) => {
			const possibleAnswers = getPossibleAnswersForQuestion(questionLabel)
			return total + possibleAnswers.length
		},
		0
	)

	const totalZoneCols = zones.reduce((total: number, zoneName: any) => {
		const zoneQuestions = getZoneQuestions(zoneName)
		const zoneQuestionCols = zoneQuestions.reduce(
			(sum: number, questionLabel: string) => {
				const possibleAnswers = getPossibleAnswersForZoneQuestion(
					zoneName,
					questionLabel
				)
				return sum + possibleAnswers.length
			},
			0
		)
		return total + 1 + zoneQuestionCols
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
			<GeneralDataChart projectName={projectName} data={data} />

			{invalidData && invalidData.length > 0 && (
				<div className='my-4 flex w-fit items-center gap-2 rounded-lg bg-card p-4'>
					<Checkbox
						id='show-invalid-data'
						checked={showInvalidData}
						onCheckedChange={(checked) =>
							setShowInvalidData(checked as boolean)
						}
					/>
					<label
						htmlFor='show-invalid-data'
						className='cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
					>
						{t('Analytics.showInvalidData')}
						<span className='ml-2 text-xs text-muted-foreground'>
							(
							{t('Analytics.records', {
								value: invalidData.length,
							})}
							)
						</span>
					</label>
				</div>
			)}

			<div className='border bg-card shadow-sm'>
				<div className='overflow-auto'>
					{showInvalidData ? (
						<Table>
							<TableHeader>
								<TableRow className='border-b-2 bg-slate-100'>
									<TableHead className='whitespace-nowrap text-center font-semibold text-black'>
										ID
									</TableHead>
									<TableHead className='whitespace-nowrap text-center font-semibold text-black'>
										{t('Analytics.email')}
									</TableHead>
									<TableHead className='whitespace-nowrap text-center font-semibold text-black'>
										{t('Analytics.start')}
									</TableHead>
									<TableHead className='whitespace-nowrap text-center font-semibold text-black'>
										{t('Analytics.end')}
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invalidData.map((record: any, index: number) => (
									<TableRow key={index} className='hover:bg-muted/30'>
										<TableCell className='whitespace-nowrap text-center font-medium'>
											{record.id_tracking}
										</TableCell>
										<TableCell className='whitespace-nowrap text-center'>
											<div className='text-xs text-muted-foreground'>
												{formatDateTime(record.email)}
											</div>
										</TableCell>
										<TableCell className='whitespace-nowrap text-center'>
											<div className='text-xs text-muted-foreground'>
												{formatDateTime(record.started_at)}
											</div>
										</TableCell>
										<TableCell className='whitespace-nowrap text-center'>
											<div className='text-xs text-muted-foreground'>
												{formatDateTime(record.ended_at)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
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
										className='border-r-2 text-center font-semibold text-green-600'
										colSpan={ageGroupsCols}
									>
										{t('Analytics.years')}
									</TableHead>
									<TableHead
										className='border-r-2 text-center font-semibold text-indigo-600'
										colSpan={profileCols}
									>
										Profil kupca
									</TableHead>
									<TableHead
										className='border-r text-center font-semibold text-yellow-600'
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
										className='border-r text-center font-semibold text-indigo-600'
										colSpan={profileCols}
									></TableHead>
									<TableHead
										className='border-r text-center font-semibold text-yellow-600'
										colSpan={questionsCols}
									></TableHead>

									{zones.map((zoneName: any, index: number) => {
										const zoneQuestions = getZoneQuestions(zoneName)
										const zoneQuestionCols = zoneQuestions.reduce(
											(sum: number, questionLabel: string) => {
												const possibleAnswers =
													getPossibleAnswersForZoneQuestion(
														zoneName,
														questionLabel
													)
												return sum + possibleAnswers.length
											},
											0
										)
										const isLast = index === zones.length - 1
										const zoneColor = getZoneColor(index)
										return (
											<TableHead
												key={zoneName}
												className={`text-center font-semibold text-orange-600 ${!isLast ? 'border-r' : ''} ${zoneColor.bgIntense}`}
												colSpan={1 + zoneQuestionCols}
											>
												{zoneName}
											</TableHead>
										)
									})}
								</TableRow>

								<TableRow className='bg-slate-25'>
									{timespan && <TableHead className='border-r'></TableHead>}
									<TableHead className='border-r'></TableHead>
									<TableHead className='border-r'></TableHead>
									<TableHead className='border-r'></TableHead>
									<TableHead className='border-r bg-purple-50'></TableHead>
									<TableHead className='border-r bg-purple-50'></TableHead>
									<TableHead className='border-r bg-purple-50'></TableHead>

									{Array.from({ length: demographicsCols }).map((_, index) => (
										<TableHead
											key={index}
											className='border-r bg-blue-50'
										></TableHead>
									))}

									{ageGroups.map((ageLabel: any) => (
										<TableHead
											key={ageLabel}
											className={`border-r bg-green-50`}
										></TableHead>
									))}

									{profileOptions.map((profileLabel: any) => (
										<TableHead
											key={profileLabel}
											className={`border-r bg-indigo-50`}
										></TableHead>
									))}

									{mainQuestions.map((questionLabel: any, index: number) => {
										const possibleAnswers =
											getPossibleAnswersForQuestion(questionLabel)

										return (
											<TableHead
												key={questionLabel}
												className={`text-center ${index < mainQuestions.length - 1 ? 'border-r' : 'border-r'} whitespace-nowrap bg-yellow-50 p-1`}
												colSpan={possibleAnswers.length}
											>
												<div className='text-xs font-semibold text-yellow-800'>
													{questionLabel}
												</div>
											</TableHead>
										)
									})}

									{zones.map((zoneName: any, zoneIndex: number) => {
										const zoneQuestions = getZoneQuestions(zoneName)
										const zoneColor = getZoneColor(zoneIndex)

										return (
											<React.Fragment key={zoneName}>
												<TableHead
													className={`border-r ${zoneColor.bg}`}
												></TableHead>
												{zoneQuestions.map(
													(questionLabel: any, qIndex: number) => {
														const possibleAnswers =
															getPossibleAnswersForZoneQuestion(
																zoneName,
																questionLabel
															)
														const isLastQuestion =
															qIndex === zoneQuestions.length - 1
														const isLastZone = zoneIndex === zones.length - 1
														const shouldHaveBorder =
															!isLastQuestion || !isLastZone

														return (
															<TableHead
																key={`${zoneName}-${questionLabel}`}
																className={`text-center ${shouldHaveBorder ? 'border-r' : ''} whitespace-nowrap bg-yellow-50 p-1 ${zoneColor.bg}`}
																colSpan={possibleAnswers.length}
															>
																<div className='text-xs font-semibold text-yellow-800'>
																	{questionLabel}
																</div>
															</TableHead>
														)
													}
												)}
											</React.Fragment>
										)
									})}
								</TableRow>

								<TableRow className='bg-slate-50'>
									{timespan && <TableHead className='border-r'></TableHead>}
									<TableHead className='whitespace-nowrap border-r text-center text-xs font-semibold'>
										ID
									</TableHead>
									<TableHead className='whitespace-nowrap border-r text-center text-xs font-semibold'>
										{t('Analytics.comments')}
									</TableHead>
									<TableHead className='whitespace-nowrap border-r text-center text-xs font-semibold'>
										{t('Analytics.email')}
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
									{genderGroups.map((genderLabel: any, index: number) => (
										<>
											<TableHead
												key={genderLabel}
												className={`text-center text-xs font-semibold ${index < genderGroups.length - 1 ? 'border-r' : 'border-r'} whitespace-nowrap bg-blue-50`}
											>
												{genderLabel}
											</TableHead>
											<TableHead className='whitespace-nowrap border-r bg-blue-50 text-center text-xs font-semibold'>
												%
											</TableHead>
										</>
									))}

									{ageGroups.map((ageLabel: any, index: number) => (
										<TableHead
											key={ageLabel}
											className={`text-center text-xs font-semibold ${index < ageGroups.length - 1 ? 'border-r' : 'border-r'} whitespace-nowrap bg-green-50`}
										>
											{ageLabel}
										</TableHead>
									))}

									{profileOptions.map((profileLabel: any, index: number) => (
										<TableHead
											key={profileLabel}
											className={`text-center text-xs font-semibold ${index < profileOptions.length - 1 ? 'border-r' : 'border-r'} whitespace-nowrap bg-indigo-50`}
										>
											{profileLabel}
										</TableHead>
									))}

									{mainQuestions.map((questionLabel: any) => {
										const possibleAnswers =
											getPossibleAnswersForQuestion(questionLabel)

										return possibleAnswers.map((answer: any) => (
											<TableHead
												key={`${questionLabel}-${answer}`}
												className={`whitespace-nowrap border-r bg-yellow-50/50 p-1 text-center text-xs font-medium`}
											>
												<div className='text-yellow-700'>{answer}</div>
											</TableHead>
										))
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

												{zoneQuestions.map((questionLabel: any) => {
													const possibleAnswers =
														getPossibleAnswersForZoneQuestion(
															zoneName,
															questionLabel
														)

													return (
														<TableHead
															colSpan={possibleAnswers.length ?? 1}
															key={`${zoneName}-${questionLabel}`}
															className={`border-r ${zoneColor.bg}`}
														></TableHead>
													)
												})}
											</React.Fragment>
										)
									})}
								</TableRow>
							</TableHeader>
							<TableBody>
								{tableData.map((record: any, index: number) => (
									<TableRow key={index} className='hover:bg-muted/30'>
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

										<TableCell
											className='cursor-pointer whitespace-nowrap border-r text-center font-medium hover:bg-gray-100'
											onClick={() => {
												const commentsInfo = getCommentsInfo(record?.comments)
												if (commentsInfo.count > 0) {
													setCommentOptions({ tracking: record, isOpen: true })
												}
											}}
										>
											{(() => {
												const commentsInfo = getCommentsInfo(record?.comments)

												if (commentsInfo.type === 'empty') {
													return <span className='text-gray-400'>-</span>
												}

												if (commentsInfo.type === 'images') {
													return (
														<div className='flex items-center justify-center gap-1'>
															<span className='text-blue-600'>📷</span>
															<span>{commentsInfo.count}</span>
														</div>
													)
												}

												if (commentsInfo.type === 'keyvalue') {
													return (
														<div className='flex items-center justify-center gap-1'>
															<span className='text-green-600'>📋</span>
															<span className='text-xs'>
																{commentsInfo.count}
															</span>
														</div>
													)
												}

												return commentsInfo.display
											})()}
										</TableCell>

										<TableCell className='whitespace-nowrap border-r text-center'>
											<div className='text-xs text-muted-foreground'>
												{record.email}
											</div>
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
												{record?.data?.gender?.broj_ljudi}
											</Badge>
										</TableCell>

										{record.data.gender.data.map(
											(gender: any, index: number) => (
												<React.Fragment key={index}>
													<TableCell className='whitespace-nowrap border-r bg-blue-50/30 text-center'>
														<div className='text-sm font-medium text-blue-700'>
															{gender.count}
														</div>
													</TableCell>
													<TableCell className='whitespace-nowrap border-r bg-blue-50/30 text-center'>
														<div className='text-xs text-blue-600'>
															{gender.percentage}%
														</div>
													</TableCell>
												</React.Fragment>
											)
										)}

										{/* <TableCell className='whitespace-nowrap border-r bg-blue-50/30 text-center'>
											<Badge
												variant='secondary'
												className='bg-blue-100 text-xs text-blue-800'
											>
												{record.data.broj_ljudi}
											</Badge>
										</TableCell> */}
										{/* <TableCell className='whitespace-nowrap border-r bg-blue-50/30 text-center'>
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
										</TableCell> */}

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

										{profileOptions.map((profileLabel: any, index: number) => {
											const profileData = getProfileData(
												record.data.profile?.data,
												profileLabel
											)
											return (
												<TableCell
													key={profileLabel}
													className={`text-center ${index < profileOptions.length - 1 ? 'border-r' : 'border-r'} whitespace-nowrap bg-indigo-50/30 p-2`}
												>
													<div className='flex flex-row items-center justify-start gap-2'>
														<span className='basis-1/2 items-center justify-center text-xs font-medium text-black'>
															{profileData.count}
														</span>
														<span className='basis-1/2 items-center justify-center text-xs text-indigo-600'>
															({profileData.percentage}%)
														</span>
													</div>
												</TableCell>
											)
										})}

										{mainQuestions.map((questionLabel: any) => {
											const possibleAnswers =
												getPossibleAnswersForQuestion(questionLabel)

											return possibleAnswers.map((answer: any) => {
												const recordQuestion =
													record.data.questions_answers?.find(
														(q: any) => q.label === questionLabel
													)

												// Get count and percentage for this specific answer from count_percentage
												const answerData =
													recordQuestion?.count_percentage?.[answer]
												const count = answerData?.count || 0
												const percentage = answerData?.percentage || 0

												return (
													<TableCell
														key={`${questionLabel}-${answer}`}
														className={`whitespace-nowrap border-r bg-yellow-50/30 p-2 text-center`}
													>
														<div className='flex flex-row items-center justify-start gap-2'>
															<span className='basis-1/2 items-center justify-center text-xs font-medium text-black'>
																{count}
															</span>
															<span className='basis-1/2 items-center justify-center text-xs text-green-600'>
																({percentage}%)
															</span>
														</div>
													</TableCell>
												)
											})
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

													{zoneQuestions.map((questionLabel: any) => {
														const possibleAnswers =
															getPossibleAnswersForZoneQuestion(
																zoneName,
																questionLabel
															)
														const zone = record.zones?.find(
															(z: any) => z.name === zoneName
														)

														const zoneQuestion =
															zone?.questions_answers_raw?.find(
																(q: any) => q?.question?.label === questionLabel
															)

														return (
															<TableCell
																colSpan={possibleAnswers?.length ?? 1}
																key={`${zoneName}-${questionLabel}}`}
																className={`border-r text-center ${zoneColor.bg}/30 whitespace-nowrap p-2`}
															>
																<Badge
																	variant={
																		zoneQuestion?.answer?.answer
																			? 'default'
																			: 'outline'
																	}
																>
																	{zoneQuestion?.answer?.answer
																		? zoneQuestion?.answer?.answer
																		: '-'}
																</Badge>
															</TableCell>
														)
													})}
												</React.Fragment>
											)
										})}
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>
			</div>
			<CommentsModal
				isOpen={commentOptions.isOpen}
				tracking={commentOptions.tracking}
				onOpenChange={() => {
					setCommentOptions({ tracking: null, isOpen: false })
				}}
			/>
		</div>
	)
}
