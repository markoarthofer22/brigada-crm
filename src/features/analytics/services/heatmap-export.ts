import { format } from 'date-fns'
import { hr } from 'date-fns/locale'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { HeatmapData } from '@/features/analytics/(components)/heatmap.tsx'

interface ExportOptions {
	data: HeatmapData[]
	t: (key: string, options?: Record<string, unknown>) => string
	filename?: string
	title?: string
}

const calculateDuration = (
	start: Date | string,
	end: Date | string
): string => {
	const startDate = typeof start === 'string' ? new Date(start) : start
	const endDate = typeof end === 'string' ? new Date(end) : end

	const totalSeconds = Math.ceil(
		(endDate.getTime() - startDate.getTime()) / 1000
	)

	if (totalSeconds < 0) return '0 h 0 min 0 sec'

	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	return `${hours} h ${minutes} min ${seconds} sec`
}

export const exportHeatmapToExcel = async ({
	data,
	filename = 'heatmap-export.xlsx',
	title = 'Heatmap Data',
	t,
}: ExportOptions) => {
	if (!data || data.length === 0) {
		console.warn('No data to export')
		return
	}

	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet(title)

	// Define headers
	const headers = [
		t('Table.header.id_tracking'),
		t('Table.header.zoneName') || 'Zone Name',
		t('Table.header.started_at'),
		t('Table.header.ended_at'),
		t('Table.header.duration'),
		t('Table.header.heat_value'),
	]

	// Add header row
	const headerRow = worksheet.addRow(headers)

	// Style header row
	headerRow.eachCell((cell) => {
		cell.style = {
			font: { bold: true, color: { argb: 'FFFFFF' } },
			fill: {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: '4B5563' }, // gray-600
			},
			alignment: { horizontal: 'center', vertical: 'middle' },
			border: {
				top: { style: 'thin' },
				bottom: { style: 'thin' },
				left: { style: 'thin' },
				right: { style: 'thin' },
			},
		}
	})

	// Add data rows
	data.forEach((record, index) => {
		const row = worksheet.addRow([
			record.id_tracking,
			record.name,
			format(record.started_at, 'dd.MM.yyyy HH:mm:ss', { locale: hr }),
			format(record.ended_at, 'dd.MM.yyyy HH:mm:ss', { locale: hr }),
			calculateDuration(record.started_at, record.ended_at),
			Number.parseFloat(String(record.heat.value)).toFixed(4),
		])

		// Style data rows with alternating colors
		row.eachCell((cell) => {
			cell.style = {
				alignment: { horizontal: 'center', vertical: 'middle' },
				border: {
					top: { style: 'thin' },
					bottom: { style: 'thin' },
					left: { style: 'thin' },
					right: { style: 'thin' },
				},
				fill: {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: index % 2 === 0 ? 'F9FAFB' : 'FFFFFF' }, // gray-50 alternating with white
				},
			}
		})
	})

	worksheet.columns.forEach((column) => {
		column.width = 25
	})

	const buffer = await workbook.xlsx.writeBuffer()
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	})
	saveAs(blob, filename)
}
