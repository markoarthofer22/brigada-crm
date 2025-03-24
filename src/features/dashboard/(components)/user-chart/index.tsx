import { useTranslation } from 'react-i18next'
import { Label, Pie, PieChart } from 'recharts'
import { User, UserType } from '@/api/services/user/schema'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart'

interface UserChartProps {
	users: User[]
}

export function UserDistribution({ users }: UserChartProps) {
	const { t } = useTranslation()
	const totalUsers = users.length

	const adminUsers = users.filter((user) => user.admin === UserType.ADMIN)
	const regularUsers = users.filter((user) => user.admin === UserType.REGULAR)

	const adminUsersInPercent = ((adminUsers.length / totalUsers) * 100).toFixed(
		2
	)
	const regularUsersInPercent = (
		(regularUsers.length / totalUsers) *
		100
	).toFixed(2)

	const chartConfig = {
		admin: {
			label: t('Users.admin.1'),
			color: 'hsl(var(--chart-1))',
		},
		regular: {
			label: t('Users.admin.0'),
			color: 'hsl(var(--chart-2))',
		},
	} satisfies ChartConfig

	const chartData = [
		{
			user: t('Users.admin.1'),
			count: adminUsers.length,
			fill: 'hsl(var(--chart-1))',
		},
		{
			user: t('Users.admin.0'),
			count: regularUsers.length,
			fill: 'hsl(var(--chart-2))',
		},
	]

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('Dashboard.userTitle')}</CardTitle>
				<CardDescription>{t('Dashboard.userDescription')}</CardDescription>
			</CardHeader>
			<CardContent className='flex flex-col items-center justify-center'>
				<ChartContainer
					config={chartConfig}
					className='mx-auto aspect-square w-full'
				>
					<PieChart>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Pie
							data={chartData}
							dataKey='count'
							nameKey='user'
							innerRadius={90}
							strokeWidth={4}
						>
							<Label
								content={({ viewBox }) => {
									if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
										return (
											<text
												x={viewBox.cx}
												y={viewBox.cy}
												textAnchor='middle'
												dominantBaseline='middle'
											>
												<tspan
													x={viewBox.cx}
													y={viewBox.cy}
													className='fill-foreground text-3xl font-bold'
												>
													{users.length.toLocaleString()}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 24}
													className='fill-muted-foreground'
												>
													{t('Dashboard.users')}
												</tspan>
											</text>
										)
									}
								}}
							/>
						</Pie>
					</PieChart>
				</ChartContainer>

				<div className='mt-6 grid grid-cols-2 gap-4 text-center'>
					<div className='space-y-1'>
						<div className='flex items-center justify-center gap-2'>
							<div className='h-3 w-3 rounded-full bg-primary'></div>
							<span className='text-sm font-medium'>{t('Users.admin.1')}</span>
						</div>
						<p className='text-2xl font-bold'>{adminUsers.length}</p>
						<p className='text-xs text-muted-foreground'>
							{adminUsersInPercent}%
						</p>
					</div>
					<div className='space-y-1'>
						<div className='flex items-center justify-center gap-2'>
							<div className='h-3 w-3 rounded-full bg-muted'></div>
							<span className='text-sm font-medium'>{t('Users.admin.0')}</span>
						</div>
						<p className='text-2xl font-bold'>{regularUsers.length}</p>
						<p className='text-xs text-muted-foreground'>
							{regularUsersInPercent}%
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
