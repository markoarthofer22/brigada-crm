import { CheckSquare, Layers, Map, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card.tsx'

interface StatCardsProps {
	totalProjects?: number
	activeUsers?: number
	activeQuestions?: number
	lastProjectAdded?: string
	activeZones?: number
	usersInLastMonth?: number
}

export function StatCards({
	totalProjects,
	activeQuestions,
	activeZones,
	activeUsers,
	usersInLastMonth,
	lastProjectAdded,
}: StatCardsProps) {
	const { t } = useTranslation()

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>
						{t('Dashboard.totalProjects')}
					</CardTitle>
					<Layers className='h-4 w-4 text-muted-foreground' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{totalProjects ?? 'N/A'}</div>
					{lastProjectAdded && (
						<p className='text-xs text-muted-foreground'>
							{t('Dashboard.lastAdded', {
								value: lastProjectAdded,
							})}
						</p>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>
						{t('Dashboard.users')}
					</CardTitle>
					<Users className='h-4 w-4 text-muted-foreground' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{activeUsers ?? 'N/A'}</div>
					{usersInLastMonth && (
						<p className='text-xs text-muted-foreground'>
							{t('Dashboard.lastMonth', {
								value: usersInLastMonth,
							})}
						</p>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>
						{t('Dashboard.questions')}
					</CardTitle>
					<CheckSquare className='h-4 w-4 text-muted-foreground' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{activeQuestions ?? 'N/A'}</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>
						{t('Dashboard.zones')}
					</CardTitle>
					<Map className='h-4 w-4 text-muted-foreground' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{activeZones ?? 'N/A'}</div>
				</CardContent>
			</Card>
		</div>
	)
}
