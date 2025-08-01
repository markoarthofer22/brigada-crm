import * as ExcelJS from 'exceljs'
import { toast } from 'sonner'

interface ExportData {
	data: any[]
	t: (key: string) => string
}

export const exportToExcel = async ({ data, t }: ExportData) => {
	if (!data || data.length === 0) {
		toast.info(t('Analytics.noData'))
		return
	}

	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('Tracking Data Analysis')

	// Helper functions
	const getAgeGroups = () =>
		data[0].data.dobna_skupina.data.map((age: any) => age.label)
	const getMainQuestions = () =>
		data[0].data.questions_answers.map((q: any) => q.label)
	const getZones = () => data[0].zones.map((zone: any) => zone.name)
	const getZoneQuestions = (zoneName: string) => {
		const zone = data[0].zones.find((z: any) => z.name === zoneName)
		return zone ? zone.questions_answers.map((q: any) => q.label) : []
	}

	const ageGroups = getAgeGroups()
	const mainQuestions = getMainQuestions()
	const zones = getZones()

	// Calculate column spans
	const basicInfoCols = 1
	const timeCols = 3
	const demographicsCols = 5
	const ageGroupsCols = ageGroups.length
	const questionsCols = mainQuestions.length
	const totalZoneCols = zones.reduce((total: number, zoneName: any) => {
		return total + 1 + getZoneQuestions(zoneName).length
	}, 0)

	const totalCols =
		basicInfoCols +
		timeCols +
		demographicsCols +
		ageGroupsCols +
		questionsCols +
		totalZoneCols

	// Define colors
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

	// Row 1: Main headers
	let currentCol = 1

	// Basic header
	worksheet.mergeCells(1, currentCol, 1, currentCol + basicInfoCols - 1)
	const basicCell = worksheet.getCell(1, currentCol)
	basicCell.value = t('Analytics.basic')
	basicCell.style = {
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
	currentCol += basicInfoCols

	// Time header
	worksheet.mergeCells(1, currentCol, 1, currentCol + timeCols - 1)
	const timeCell = worksheet.getCell(1, currentCol)
	timeCell.value = t('Analytics.time')
	timeCell.style = {
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
	currentCol += timeCols

	// Demographics header
	worksheet.mergeCells(1, currentCol, 1, currentCol + demographicsCols - 1)
	const demoCell = worksheet.getCell(1, currentCol)
	demoCell.value = t('Analytics.demographics')
	demoCell.style = {
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
	currentCol += demographicsCols

	// Age Groups header
	worksheet.mergeCells(1, currentCol, 1, currentCol + ageGroupsCols - 1)
	const ageCell = worksheet.getCell(1, currentCol)
	ageCell.value = t('Analytics.years')
	ageCell.style = {
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
	currentCol += ageGroupsCols

	// Questions header
	worksheet.mergeCells(1, currentCol, 1, currentCol + questionsCols - 1)
	const questionsCell = worksheet.getCell(1, currentCol)
	questionsCell.value = t('Analytics.tabs.questions')
	questionsCell.style = {
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
	currentCol += questionsCols

	// Zones header
	worksheet.mergeCells(1, currentCol, 1, currentCol + totalZoneCols - 1)
	const zonesCell = worksheet.getCell(1, currentCol)
	zonesCell.value = t('Analytics.tabs.zones')
	zonesCell.style = {
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

	// Row 2: Zone sub-headers
	currentCol =
		basicInfoCols +
		timeCols +
		demographicsCols +
		ageGroupsCols +
		questionsCols +
		1
	zones.forEach((zoneName: any, index: number) => {
		const zoneQuestionCount = getZoneQuestions(zoneName).length
		worksheet.mergeCells(2, currentCol, 2, currentCol + zoneQuestionCount)
		const zoneCell = worksheet.getCell(2, currentCol)
		zoneCell.value = zoneName
		zoneCell.style = {
			font: { bold: true, color: { argb: 'EA580C' } }, // orange-600
			fill: {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: colors.zoneColors[index % colors.zoneColors.length] },
			},
			alignment: { horizontal: 'center', vertical: 'middle' },
			border: {
				top: { style: 'medium' },
				bottom: { style: 'medium' },
				left: { style: 'medium' },
				right: { style: 'medium' },
			},
		}
		currentCol += 1 + zoneQuestionCount
	})

	// Row 3: Column headers
	const headers = [
		'ID',
		t('Analytics.duration'),
		t('Analytics.start'),
		t('Analytics.end'),
		t('Analytics.totalPeople'),
		t('Analytics.males'),
		'%',
		t('Analytics.females'),
		'%',
		...ageGroups,
		...mainQuestions,
	]

	// Add zone headers
	zones.forEach((zoneName: any) => {
		headers.push('Trajanje')
		const zoneQuestions = getZoneQuestions(zoneName)
		headers.push(...zoneQuestions)
	})

	// Set column headers
	headers.forEach((header, index) => {
		const cell = worksheet.getCell(3, index + 1)
		cell.value = header
		cell.style = {
			font: { bold: true, size: 10 },
			fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } }, // slate-100
			alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
			border: {
				top: { style: 'thin' },
				bottom: { style: 'thin' },
				left: { style: 'thin' },
				right: { style: 'thin' },
			},
		}
	})

	// Helper functions for data extraction
	const formatDateTime = (dateString: string) => {
		try {
			const date = new Date(dateString)
			return (
				date.toLocaleDateString('hr-HR') +
				' ' +
				date.toLocaleTimeString('hr-HR')
			)
		} catch {
			return dateString
		}
	}

	const getQuestionAnswerData = (questions: any[], questionLabel: string) => {
		const question = questions.find((q: any) => q.label === questionLabel)
		if (!question) return { answerRows: [] }

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

	// Add data rows
	data.forEach((record: any, recordIndex: number) => {
		const rowIndex = recordIndex + 4 // Start from row 4

		let colIndex = 1

		// Basic info
		worksheet.getCell(rowIndex, colIndex++).value = record.id_tracking

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

		// Main questions - simplified for Excel
		mainQuestions.forEach((questionLabel: any) => {
			const questionData = getQuestionAnswerData(
				record.data.questions_answers,
				questionLabel
			)
			const answers = questionData.answerRows
				.filter((row) => row.count > 0)
				.map((row) => `${row.answer}: ${row.count} (${row.percentage}%)`)
				.join('; ')
			worksheet.getCell(rowIndex, colIndex++).value = answers || '-'
		})

		// Zones
		zones.forEach((zoneName: any) => {
			worksheet.getCell(rowIndex, colIndex++).value = getZoneDuration(
				record.zones,
				zoneName
			)
			const zoneQuestions = getZoneQuestions(zoneName)
			zoneQuestions.forEach((questionLabel: any) => {
				worksheet.getCell(rowIndex, colIndex++).value = getZoneAnswer(
					record.zones,
					zoneName,
					questionLabel
				)
			})
		})

		// Style data rows
		for (let col = 1; col <= totalCols; col++) {
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

			// Apply background colors based on column
			if (col <= basicInfoCols) {
				cell.style.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: colors.basicBg },
				}
			} else if (col <= basicInfoCols + timeCols) {
				cell.style.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: colors.timeBg },
				}
			} else if (col <= basicInfoCols + timeCols + demographicsCols) {
				cell.style.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: colors.demographicsBg },
				}
			} else if (
				col <=
				basicInfoCols + timeCols + demographicsCols + ageGroupsCols
			) {
				cell.style.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: colors.ageBg },
				}
			} else if (
				col <=
				basicInfoCols +
					timeCols +
					demographicsCols +
					ageGroupsCols +
					questionsCols
			) {
				cell.style.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: colors.questionsBg },
				}
			} else {
				// Zone colors
				const zoneIndex = Math.floor(
					(col -
						basicInfoCols -
						timeCols -
						demographicsCols -
						ageGroupsCols -
						questionsCols -
						1) /
						2
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

	// Set column widths
	const columnWidths = [
		8, // ID
		12, // Duration
		18, // Start
		18, // End
		10, // Total People
		8, // Males
		5, // %
		8, // Females
		5, // %
		...ageGroups.map(() => 8), // Age groups
		...mainQuestions.map(() => 25), // Questions (wider for answers)
	]

	// Add zone column widths
	zones.forEach(() => {
		columnWidths.push(12) // Duration
		const zoneQuestions = getZoneQuestions(zones[0]) // Use first zone as reference
		zoneQuestions.forEach(() => columnWidths.push(15)) // Zone questions
	})

	columnWidths.forEach((width, index) => {
		worksheet.getColumn(index + 1).width = width
	})

	// Set row heights
	worksheet.getRow(1).height = 25
	worksheet.getRow(2).height = 20
	worksheet.getRow(3).height = 30

	// Generate and download file
	const buffer = await workbook.xlsx.writeBuffer()
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	})
	const fileName = `tracking-data-analysis-${new Date().toISOString().split('T')[0]}.xlsx`

	// Use default import for file-saver
	const FileSaver = await import('file-saver')
	FileSaver.default.saveAs(blob, fileName)
}
