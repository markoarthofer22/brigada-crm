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

interface ZonesProps {
	data: any
}

export default function Zones({ data }: ZonesProps) {
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

			{/* Individual Zone Details */}
			{data.per_zone.map((zone: any) => (
				<Card key={zone.id_zones}>
					<CardHeader className='flex flex-row items-center justify-between'>
						<div>
							<CardTitle>{zone.name}</CardTitle>
							<CardDescription>
								{t('Analytics.zoneId')}: {zone.id_zones}
							</CardDescription>
						</div>
						<Button
							variant='outline'
							onClick={() => toggleView(`zone-${zone.id_zones}`)}
						>
							{viewStates[`zone-${zone.id_zones}`] === 'chart'
								? t('Analytics.showTable')
								: t('Analytics.showGraphic')}
						</Button>
					</CardHeader>
					<CardContent>
						<div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-3'>
							<div className='text-center'>
								<div className='text-2xl font-bold'>{zone.data.broj_ljudi}</div>
								<div className='text-sm text-muted-foreground'>
									{t('Analytics.totalPeople')}
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
							<ChartContainer
								config={{
									males: { label: t('Analytics.males'), color: '#0088FE' },
									females: { label: t('Analytics.females'), color: '#00C49F' },
								}}
								className='h-[300px]'
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
										outerRadius={100}
										dataKey='value'
										label={({ name, value }) => `${name}: ${value}`}
									/>
									<ChartTooltip content={<ChartTooltipContent />} />
								</PieChart>
							</ChartContainer>
						) : (
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
											{parseFloat(
												zone.lasted.average.by_number_of_people_seconds
											)?.toFixed(2)}{' '}
											{t('Analytics.seconds')}
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	)
}
