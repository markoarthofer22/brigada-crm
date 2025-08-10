import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'

interface ExportData {
	data: any[]
	name: string
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
	t: (key: string, other?: any) => string
}

const colors = {
	headerBg: 'E2E8F0', // slate-100
	basicBg: 'F8FAFC', // slate-50
	timeBg: 'FAF5FF', // purple-50
	demographicsBg: 'EFF6FF', // blue-50
	ageBg: 'F0FDF4', // green-50
	questionsBg: 'FFFBEB', // yellow-50
	zoneColors: [
		'EFF6FF', // blue-50
		'F0FDF4', // green-50
		'FAF5FF', // purple-50
		'FFF7ED', // orange-50
		'EEF2FF', // indigo-50
		'FDF2F8', // pink-50
		'F0FDFA', // teal-50
		'FFFBEB', // amber-50
		'ECFEFF', // cyan-50
	],
}

const formatDateTime = (dateString: string) => {
	const date = new Date(dateString)
	return `${date.toLocaleDateString('hr-HR')} ${date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}`
}

const getAgeGroupCount = (ageGroupsData: any[], ageLabel: string) => {
	const ageGroup = ageGroupsData.find((age: any) => age.label === ageLabel)
	return ageGroup ? ageGroup.count : 0
}

export const exportToExcel = async ({
	data,
	timespan,
	t,
	name,
}: ExportData) => {
	// Process data similar to React component
	const tableData = (() => {
		if (!timespan || !timespan.data || timespan.data.length === 0) {
			return data
		}

		return timespan.data.flatMap((timespanItem: any) => {
			const trackings = timespanItem.data.trackings
			const fromDate = new Date(timespanItem.from)
			const toDate = new Date(timespanItem.to)

			// If trackings is empty, create placeholder row
			if (!trackings || trackings.length === 0) {
				return [
					{
						id_tracking: '-',
						fromDate,
						toDate,
						lasted: { formatted: '-' },
						started_at: timespanItem.from,
						ended_at: timespanItem.to,
						data: {
							broj_ljudi: 0,
							broj_muski: 0,
							broj_muski_percentage: 0,
							broj_zenski: 0,
							broj_zenski_percentage: 0,
							dobna_skupina: { data: [] },
							questions_answers: [],
						},
						zones: [],
						comments: [],
						isEmpty: true,
					},
				]
			}

			return trackings.map((tracking: any) => ({
				...tracking,
				fromDate,
				toDate,
				isEmpty: false,
			}))
		})
	})()

	if (!tableData || tableData.length === 0) {
		toast.info(t('Analytics.noData'))
		return
	}

	// Helper functions - use original data for structure, not tableData
	const getAgeGroups = () => {
		if (data.length === 0) return []
		const allAgeGroups = new Set<string>()
		data.forEach((tracking: any) => {
			if (tracking.data?.dobna_skupina?.data) {
				tracking.data.dobna_skupina.data.forEach((age: any) => {
					if (age.label) {
						allAgeGroups.add(age.label)
					}
				})
			}
		})
		return Array.from(allAgeGroups)
	}

	const getMainQuestions = () => {
		if (data.length === 0) return []
		const allQuestions = new Set<string>()
		data.forEach((tracking: any) => {
			if (tracking.data?.questions_answers) {
				tracking.data.questions_answers.forEach((q: any) => {
					if (q.label) {
						allQuestions.add(q.label)
					}
				})
			}
		})
		return Array.from(allQuestions)
	}

	const getZones = () => {
		if (data.length === 0) return []
		const allZones = new Set<string>()
		data.forEach((tracking: any) => {
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
		if (data.length === 0) return []
		const allZoneQuestions = new Set<string>()
		data.forEach((tracking: any) => {
			if (tracking.zones) {
				const zone = tracking.zones.find((z: any) => z.name === zoneName)
				if (zone?.questions_answers) {
					zone.questions_answers.forEach((q: any) => {
						if (q.label) {
							allZoneQuestions.add(q.label)
						}
					})
				}
			}
		})
		return Array.from(allZoneQuestions)
	}

	const ageGroups = getAgeGroups()
	const mainQuestions = getMainQuestions()
	const zones = getZones()

	const questionsCols = mainQuestions.reduce(
		(total: number, questionLabel: string) => {
			const sampleQuestion = data
				.find((tracking) =>
					tracking.data?.questions_answers?.find(
						(q: any) => q.label === questionLabel
					)
				)
				?.data?.questions_answers?.find((q: any) => q.label === questionLabel)

			const possibleAnswers = sampleQuestion?.possible_answers
				? Object.values(sampleQuestion.possible_answers)
				: []
			return total + possibleAnswers.length
		},
		0
	)

	const zoneQuestionsCols = zones.reduce((total: number, zoneName: string) => {
		return total + getZoneQuestions(zoneName).length
	}, 0)

	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet(t('Analytics.analytics'))

	// Row 1: Main headers
	let currentCol = 1

	// Add timespan header if exists
	if (timespan) {
		const timespanCell = worksheet.getCell(1, currentCol)
		timespanCell.value = t('Analytics.timeRange')
		timespanCell.style = {
			font: { bold: true, color: { argb: '000000' } },
			fill: {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: colors.headerBg },
			},
			alignment: { horizontal: 'center', vertical: 'middle' },
			border: {
				top: { style: 'thick' },
				bottom: { style: 'thick' },
				left: { style: 'thick' },
				right: { style: 'thick' },
			},
		}
		currentCol += 1
	}

	// Basic info (2 columns: ID, Comments)
	const basicInfoCols = 2
	if (basicInfoCols > 1) {
		worksheet.mergeCells(1, currentCol, 1, currentCol + basicInfoCols - 1)
	}
	const basicInfo = worksheet.getCell(1, currentCol)
	basicInfo.value = t('Analytics.basic')
	basicInfo.style = {
		font: { bold: true, color: { argb: '000000' } },
		fill: {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: colors.basicBg },
		},
		alignment: { horizontal: 'center', vertical: 'middle' },
		border: {
			top: { style: 'thick' },
			bottom: { style: 'thick' },
			left: { style: 'thick' },
			right: { style: 'thick' },
		},
	}
	currentCol += basicInfoCols

	// Time info (3 columns: Duration, Start, End)
	const timeCols = 3
	if (timeCols > 1) {
		worksheet.mergeCells(1, currentCol, 1, currentCol + timeCols - 1)
	}
	const timeInfo = worksheet.getCell(1, currentCol)
	timeInfo.value = t('Analytics.time')
	timeInfo.style = {
		font: { bold: true, color: { argb: '7C3AED' } }, // purple-600
		fill: {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: colors.timeBg },
		},
		alignment: { horizontal: 'center', vertical: 'middle' },
		border: {
			top: { style: 'thick' },
			bottom: { style: 'thick' },
			left: { style: 'thick' },
			right: { style: 'thick' },
		},
	}
	currentCol += timeCols

	// Demographics (5 columns: Total, Males, %, Females, %)
	const demographicsCols = 5
	if (demographicsCols > 1) {
		worksheet.mergeCells(1, currentCol, 1, currentCol + demographicsCols - 1)
	}
	const demographics = worksheet.getCell(1, currentCol)
	demographics.value = t('Analytics.demographics')
	demographics.style = {
		font: { bold: true, color: { argb: '2563EB' } }, // blue-600
		fill: {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: colors.demographicsBg },
		},
		alignment: { horizontal: 'center', vertical: 'middle' },
		border: {
			top: { style: 'thick' },
			bottom: { style: 'thick' },
			left: { style: 'thick' },
			right: { style: 'thick' },
		},
	}
	currentCol += demographicsCols

	// Age groups
	if (ageGroups.length > 1) {
		worksheet.mergeCells(1, currentCol, 1, currentCol + ageGroups.length - 1)
	}
	const ageGroupsHeader = worksheet.getCell(1, currentCol)
	ageGroupsHeader.value = t('Analytics.years')
	ageGroupsHeader.style = {
		font: { bold: true, color: { argb: '16A34A' } }, // green-600
		fill: {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: colors.ageBg },
		},
		alignment: { horizontal: 'center', vertical: 'middle' },
		border: {
			top: { style: 'thick' },
			bottom: { style: 'thick' },
			left: { style: 'thick' },
			right: { style: 'thick' },
		},
	}
	currentCol += ageGroups.length

	// Questions
	if (questionsCols > 1) {
		worksheet.mergeCells(1, currentCol, 1, currentCol + questionsCols - 1)
	}
	const questionsHeader = worksheet.getCell(1, currentCol)
	questionsHeader.value = t('Analytics.tabs.questions')
	questionsHeader.style = {
		font: { bold: true, color: { argb: 'D97706' } }, // yellow-600
		fill: {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: colors.questionsBg },
		},
		alignment: { horizontal: 'center', vertical: 'middle' },
		border: {
			top: { style: 'thick' },
			bottom: { style: 'thick' },
			left: { style: 'thick' },
			right: { style: 'thick' },
		},
	}
	currentCol += questionsCols

	// Zones
	zones.forEach((zoneName: string, index: number) => {
		const zoneQuestions = getZoneQuestions(zoneName)
		const zoneColSpan = zoneQuestions.length + 1 // +1 for duration column

		if (zoneColSpan > 1) {
			worksheet.mergeCells(1, currentCol, 1, currentCol + zoneColSpan - 1)
		}

		const zoneHeader = worksheet.getCell(1, currentCol)
		zoneHeader.value = zoneName
		zoneHeader.style = {
			font: { bold: true, color: { argb: 'EA580C' } }, // orange-600
			fill: {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: colors.zoneColors[index % colors.zoneColors.length] },
			},
			alignment: { horizontal: 'center', vertical: 'middle' },
			border: {
				top: { style: 'thick' },
				bottom: { style: 'thick' },
				left: { style: 'thick' },
				right: { style: 'thick' },
			},
		}
		currentCol += zoneColSpan
	})

	// Row 2: Sub headers
	const headers = []

	if (timespan) {
		headers.push(t('Analytics.timeRange'))
	}

	headers.push(
		'ID',
		t('Analytics.comments'),
		t('Analytics.duration'),
		t('Analytics.start'),
		t('Analytics.end'),
		t('Analytics.totalPeople'),
		t('Analytics.males'),
		'%',
		t('Analytics.females'),
		'%',
		...ageGroups
	)

	// Add question headers with individual answer columns
	mainQuestions.forEach((questionLabel: any) => {
		const sampleQuestion = data
			.find((tracking) =>
				tracking.data?.questions_answers?.find(
					(q: any) => q.label === questionLabel
				)
			)
			?.data?.questions_answers?.find((q: any) => q.label === questionLabel)

		const possibleAnswers = sampleQuestion?.possible_answers
			? Object.values(sampleQuestion.possible_answers)
			: []
		possibleAnswers.forEach((answer: any) => {
			headers.push(`${questionLabel}: ${answer}`)
		})
	})

	zones.forEach((zoneName: string) => {
		headers.push(`${zoneName}: ${t('Analytics.duration')}`) // Add duration column
		const zoneQuestions = getZoneQuestions(zoneName)
		zoneQuestions.forEach((question: any) => {
			headers.push(`${zoneName}: ${question}`)
		})
	})

	worksheet.addRow(headers)

	// Row 3: Style headers
	for (let i = 1; i <= headers.length; i++) {
		worksheet.getCell(2, i).style = {
			font: { bold: true, color: { argb: '000000' } },
			fill: {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: colors.headerBg },
			},
			alignment: { horizontal: 'center', vertical: 'middle' },
			border: {
				top: { style: 'thin' },
				bottom: { style: 'thin' },
				left: { style: 'thin' },
				right: { style: 'thin' },
			},
		}
	}

	// Add data rows
	tableData.forEach((record: any, recordIndex: number) => {
		const rowIndex = recordIndex + 4 // Start from row 4
		let colIndex = 1

		// Add timespan column if exists
		if (timespan) {
			const timespanValue = `${record.fromDate.toLocaleDateString('hr-HR')} ${record.fromDate.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })} - ${record.toDate.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}`
			worksheet.getCell(rowIndex, colIndex++).value = timespanValue
		}

		// Basic info
		worksheet.getCell(rowIndex, colIndex++).value = record.id_tracking
		worksheet.getCell(rowIndex, colIndex++).value = record.comments?.length || 0

		// Time info
		worksheet.getCell(rowIndex, colIndex++).value = record.lasted.formatted
		worksheet.getCell(rowIndex, colIndex++).value = formatDateTime(
			record.started_at
		)
		worksheet.getCell(rowIndex, colIndex++).value = formatDateTime(
			record.ended_at
		)

		// Demographics
		worksheet.getCell(rowIndex, colIndex++).value = record.data.broj_ljudi
		worksheet.getCell(rowIndex, colIndex++).value = record.data.broj_muski
		worksheet.getCell(rowIndex, colIndex++).value =
			record.data.broj_muski_percentage + '%'
		worksheet.getCell(rowIndex, colIndex++).value = record.data.broj_zenski
		worksheet.getCell(rowIndex, colIndex++).value =
			record.data.broj_zenski_percentage + '%'

		// Age groups
		ageGroups.forEach((ageLabel: any) => {
			worksheet.getCell(rowIndex, colIndex++).value = getAgeGroupCount(
				record.data.dobna_skupina.data,
				ageLabel
			)
		})

		// Questions - individual answer columns
		mainQuestions.forEach((questionLabel: any) => {
			const sampleQuestion = data
				.find((tracking) =>
					tracking.data?.questions_answers?.find(
						(q: any) => q.label === questionLabel
					)
				)
				?.data?.questions_answers?.find((q: any) => q.label === questionLabel)

			const possibleAnswers = sampleQuestion?.possible_answers
				? Object.values(sampleQuestion.possible_answers)
				: []

			possibleAnswers.forEach((answer: any) => {
				const recordQuestion = record.data.questions_answers?.find(
					(q: any) => q.label === questionLabel
				)
				const answerData = recordQuestion?.count_percentage?.[answer]
				const count = answerData?.count || 0
				const percentage = answerData?.percentage || 0
				worksheet.getCell(rowIndex, colIndex++).value =
					`${count} (${percentage}%)`
			})
		})

		// Zones
		zones.forEach((zoneName: string) => {
			// Add duration first
			const zone = record.zones?.find((z: any) => z.name === zoneName)
			const duration = zone?.lasted?.formatted || '-'
			worksheet.getCell(rowIndex, colIndex++).value = duration

			// Then add zone questions
			const zoneQuestions = getZoneQuestions(zoneName)
			zoneQuestions.forEach((questionLabel: string) => {
				const question = zone?.questions_answers?.find(
					(q: any) => q.label === questionLabel
				)
				const answer = question?.answer || '-'
				worksheet.getCell(rowIndex, colIndex++).value = answer
			})
		})

		// Style data rows with background colors
		for (let col = 1; col <= headers.length; col++) {
			const cell = worksheet.getCell(rowIndex, col)
			cell.style = {
				alignment: { horizontal: 'center', vertical: 'middle' },
				border: {
					top: { style: 'thin' },
					bottom: { style: 'thin' },
					left: { style: 'thin' },
					right: { style: 'thin' },
				},
			}

			// Apply background colors based on column position
			let currentColCheck = 1

			// Timespan column
			if (timespan) {
				if (col === currentColCheck) {
					cell.style.fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: colors.headerBg },
					}
				}
				currentColCheck += 1
			}

			// Basic info columns
			if (col >= currentColCheck && col < currentColCheck + basicInfoCols) {
				cell.style.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: colors.basicBg },
				}
			}
			currentColCheck += basicInfoCols

			// Time columns
			if (col >= currentColCheck && col < currentColCheck + timeCols) {
				cell.style.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: colors.timeBg },
				}
			}
			currentColCheck += timeCols

			// Demographics columns
			if (col >= currentColCheck && col < currentColCheck + demographicsCols) {
				cell.style.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: colors.demographicsBg },
				}
			}
			currentColCheck += demographicsCols

			// Age groups columns
			if (col >= currentColCheck && col < currentColCheck + ageGroups.length) {
				cell.style.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: colors.ageBg },
				}
			}
			currentColCheck += ageGroups.length

			// Questions columns
			if (col >= currentColCheck && col < currentColCheck + questionsCols) {
				cell.style.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: colors.questionsBg },
				}
			}
			currentColCheck += questionsCols

			// Zone columns
			if (col >= currentColCheck) {
				const zoneIndex = Math.floor(
					(col - currentColCheck) / (zoneQuestionsCols / zones.length + 1)
				)
				cell.style.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: colors.zoneColors[zoneIndex % colors.zoneColors.length],
					},
				}
			}
		}
	})

	worksheet.columns.forEach((column: any) => {
		column.width = 15
	})
	// Save the Excel file
	const buffer = await workbook.xlsx.writeBuffer()
	const fileType =
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
	const fileExtension = '.xlsx'
	const blob = new Blob([buffer], { type: fileType })
	saveAs(
		blob,
		t('Analytics.analyticsTitle', {
			value: name,
		}) + fileExtension
	)
}
