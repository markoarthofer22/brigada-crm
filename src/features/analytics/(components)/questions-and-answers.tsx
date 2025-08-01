import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis } from 'recharts'
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

interface QuestionsAnswersProps {
	data: any[]
}

const COLORS = [
	'#0088FE',
	'#00C49F',
	'#FFBB28',
	'#FF8042',
	'#8884D8',
	'#82CA9D',
]

export default function QuestionsAndAnswers({ data }: QuestionsAnswersProps) {
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

	const shouldUsePieChart = (questionData: any) => {
		const totalAnswers = Object.keys(questionData.count_percentage).length
		return totalAnswers <= 4 // Use pie chart for 4 or fewer options
	}

	if (!data || data.length === 0) {
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
			{data.map((question, index) => (
				<Card key={index}>
					<CardHeader className='flex flex-row items-center justify-between'>
						<div>
							<CardTitle>{question.label}</CardTitle>
							<CardDescription>
								{t('Analytics.responseDistribution')}
							</CardDescription>
						</div>
						<Button
							variant='outline'
							onClick={() => toggleView(`question-${index}`)}
						>
							{viewStates[`question-${index}`] === 'chart'
								? t('Analytics.showTable')
								: t('Analytics.showGraphic')}
						</Button>
					</CardHeader>
					<CardContent>
						{viewStates[`question-${index}`] === 'chart' ? (
							<ChartContainer
								config={{
									count: { label: t('Analytics.count'), color: '#0088FE' },
								}}
								className='h-[400px]'
							>
								{shouldUsePieChart(question) ? (
									<PieChart>
										<Pie
											data={Object.entries(question.count_percentage).map(
												([key, value]: [string, any], idx) => ({
													name: key,
													value: value.count,
													fill: COLORS[idx % COLORS.length],
												})
											)}
											cx='50%'
											cy='50%'
											outerRadius={120}
											dataKey='value'
											label={({ name, value, percent }) =>
												`${name}: ${value} (${(percent * 100).toFixed(0)}%)`
											}
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
									</PieChart>
								) : (
									<BarChart
										data={Object.entries(question.count_percentage).map(
											([key, value]: [string, any]) => ({
												name: key,
												count: value.count,
												percentage: value.percentage,
											})
										)}
									>
										<XAxis dataKey='name' />
										<YAxis />
										<ChartTooltip content={<ChartTooltipContent />} />
										<Bar dataKey='count' fill='#0088FE' />
									</BarChart>
								)}
							</ChartContainer>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t('Analytics.answer')}</TableHead>
										<TableHead>{t('Analytics.count')}</TableHead>
										<TableHead>{t('Analytics.percentage')}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{Object.entries(question.count_percentage).map(
										([key, value]: [string, any]) => (
											<TableRow key={key}>
												<TableCell className='font-medium'>{key}</TableCell>
												<TableCell>{value.count}</TableCell>
												<TableCell>{value.percentage}%</TableCell>
											</TableRow>
										)
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	)
}
