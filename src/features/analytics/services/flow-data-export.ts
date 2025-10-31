import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { FlowData } from '@/features/analytics/(components)/heatmap.tsx'

interface ExportOptions {
	data: FlowData[]
	t: (key: string, options?: Record<string, unknown>) => string
	filename?: string
	title?: string
}

export const exportFlowDataToExcel = async ({
	data,
	filename = 'flow-data-export.xlsx',
	title = 'Flow Data',
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
		t('Table.header.pathString'),
		t('Table.header.pathLength'),
		t('Table.header.count'),
		t('Table.header.percentage'),
		t('Table.header.totalPeople'),
		t('Table.header.totalVisits'),
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
			record.pathstring,
			record.path.length,
			record.count,
			`${Number.parseFloat(String(record.percentage)).toFixed(2)}%`,
			record.total_people,
			record.total_visits,
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

	worksheet.columns.forEach((column, index) => {
		let maxLength = 0

		// Check header length
		const header = headers[index]
		if (header) {
			maxLength = header.length
		}

		// Check all cell values in this column
		column.eachCell?.({ includeEmpty: false }, (cell) => {
			const cellValue = cell.value?.toString() || ''
			maxLength = Math.max(maxLength, cellValue.length)
		})

		// Set width with some padding (add 2 for padding, minimum 10)
		column.width = Math.max(10, maxLength + 2)
	})

	const buffer = await workbook.xlsx.writeBuffer()
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	})
	saveAs(blob, filename)
}
