'use client'

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
	data: {
		per_zone?: any[]
		total?: any
	}
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

	const pastedTextData = data?.total?.data

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
			{pastedTextData && (
				<Card className='border-2 border-primary bg-primary-foreground shadow-lg'>
					<CardHeader>
						<CardTitle className='text-2xl font-bold text-primary'>
							{t('Analytics.surveyOverview')}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
							<div className='grid grid-cols-2 gap-4'>
								<div className='flex flex-col items-center justify-center rounded-lg border border-primary bg-white p-4 text-center shadow-sm'>
									<div className='text-4xl font-bold text-orange-600'>
										{pastedTextData.broj_ljudi}
									</div>
									<div className='text-sm font-medium text-primary'>
										{t('Analytics.totalPeopleCount')}
									</div>
								</div>
								<div className='flex flex-col items-center justify-center rounded-lg border border-primary bg-white p-4 text-center shadow-sm'>
									<div className='text-3xl font-bold text-green-600'>
										{pastedTextData.questions_answers?.length || 0}
									</div>
									<div className='text-sm text-primary'>
										{t('Analytics.surveyQuestions')}
									</div>
								</div>
								<div className='flex flex-col items-center justify-center rounded-lg border border-primary bg-white p-4 text-center shadow-sm'>
									<div className='text-3xl font-bold text-primary'>
										{pastedTextData.broj_muski}
									</div>
									<div className='text-sm text-primary'>
										{t('Analytics.malesCount')} (
										{pastedTextData.percentage_muski.toFixed(1)}%)
									</div>
								</div>
								<div className='flex flex-col items-center justify-center rounded-lg border border-primary bg-white p-4 text-center shadow-sm'>
									<div className='text-3xl font-bold text-pink-600'>
										{pastedTextData.broj_zenski}
									</div>
									<div className='text-sm text-primary'>
										{t('Analytics.femalesCount')} (
										{pastedTextData.percentage_zenski.toFixed(1)}%)
									</div>
								</div>
							</div>

							<div className='rounded-lg border border-primary bg-white p-4 shadow-sm'>
								<h4 className='mb-3 text-lg font-semibold text-blue-900'>
									{t('Analytics.genderBreakdown')}
								</h4>
								<ChartContainer
									config={{
										males: { label: t('Analytics.males'), color: '#2563eb' },
										females: {
											label: t('Analytics.females'),
											color: '#ec4899',
										},
									}}
									className='h-[250px]'
								>
									<PieChart>
										<Pie
											data={[
												{
													name: t('Analytics.males'),
													value: pastedTextData.broj_muski,
													fill: '#2563eb',
												},
												{
													name: t('Analytics.females'),
													value: pastedTextData.broj_zenski,
													fill: '#ec4899',
												},
											]}
											cx='50%'
											cy='50%'
											outerRadius={80}
											dataKey='value'
											label={({ name, value, percent }) =>
												`${name}: ${value} (${(percent * 100).toFixed(0)}%)`
											}
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
									</PieChart>
								</ChartContainer>
							</div>
						</div>

						{pastedTextData.dobna_skupina && (
							<div className='mt-6'>
								<h4 className='mb-3 text-lg font-semibold text-primary'>
									{t('Analytics.ageGroups')}
								</h4>
								<div className='grid grid-cols-2 gap-2 xl:grid-cols-6'>
									{pastedTextData.dobna_skupina.data.map((ageGroup: any) => (
										<div
											key={ageGroup.label}
											className='rounded-lg border border-destructive bg-white p-3 text-center shadow-sm'
										>
											<div className='text-lg font-bold text-destructive'>
												{ageGroup.count}
											</div>
											<div className='flex items-center justify-center gap-2'>
												<div className='text-sm font-medium text-primary'>
													{ageGroup.label}
												</div>
												<div className='text-sm text-primary'>
													({ageGroup.percentage}%)
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

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
									{t('Analytics.totalPeopleCount')}
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
											{Number.parseFloat(
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
