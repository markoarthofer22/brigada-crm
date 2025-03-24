import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getAllProjects } from '@/api/services/projects/options.ts'
import { getAllQuestions } from '@/api/services/questions/options.ts'
import { getAllUsers } from '@/api/services/user/options.ts'
import { getAllZones } from '@/api/services/zones/options.ts'
import { formatDate } from '@/lib/utils.ts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/header.tsx'
import { Main } from '@/components/layout/main'
import { StatCards } from '@/features/dashboard/components/stat-cards.tsx'
import UserUpsertFormSkeleton from '@/features/user-crud/components/user-upsert-form-skeleton.tsx'

export default function Dashboard() {
	const { t } = useTranslation()

	const usersQuery = useQuery({
		...getAllUsers(),
	})

	const projectsQuery = useQuery({
		...getAllProjects(),
	})

	const questionsQuery = useQuery({
		...getAllQuestions(),
	})

	const zonesQuery = useQuery({
		...getAllZones(),
	})

	const usersInLastMonth = usersQuery.data?.filter((user) => {
		const lastMonth = new Date()
		lastMonth.setMonth(lastMonth.getMonth() - 1)
		return new Date(user.created_at!) > lastMonth
	})?.length

	const lastProjectAdded =
		projectsQuery.data?.[projectsQuery.data.length - 1].created_at

	if (
		projectsQuery.isLoading ||
		questionsQuery.isLoading ||
		usersQuery.isLoading ||
		zonesQuery.isLoading
	) {
		return (
			<div>
				<Header className='border-b-0' />
				<Main fixed>
					<div className='mb-2 flex items-center justify-between space-y-2'>
						<h1 className='text-2xl font-bold tracking-tight'>
							{t('Dashboard.title')}
						</h1>
					</div>
					<UserUpsertFormSkeleton />
				</Main>
			</div>
		)
	}

	return (
		<>
			<Header className='border-b-0' />
			<Main fixed className='max-w-screen-lg pl-4'>
				<div className='mb-2 flex items-center justify-between space-y-2'>
					<h1 className='text-2xl font-bold tracking-tight'>
						{t('Dashboard.title')}
					</h1>
				</div>
				<Tabs
					orientation='vertical'
					defaultValue='overview'
					className='space-y-4'
				>
					<div className='w-full overflow-x-auto pb-2'>
						<TabsList>
							<TabsTrigger value='overview'>
								{t('Dashboard.overview')}
							</TabsTrigger>
							<TabsTrigger disabled value='analytics'>
								{t('Dashboard.analytics')}
							</TabsTrigger>
						</TabsList>
					</div>
					<TabsContent value='overview' className='space-y-4'>
						<StatCards
							totalProjects={projectsQuery.data?.length}
							lastProjectAdded={formatDate(lastProjectAdded ?? '', {
								year: 'numeric',
								month: '2-digit',
								day: 'numeric',
							})}
							activeUsers={usersQuery.data?.length}
							activeQuestions={questionsQuery.data?.length}
							activeZones={zonesQuery.data?.length}
							usersInLastMonth={usersInLastMonth}
						/>
					</TabsContent>
				</Tabs>
			</Main>
		</>
	)
}
