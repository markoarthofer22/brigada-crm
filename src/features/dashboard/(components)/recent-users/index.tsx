import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getGlobalSettings } from '@/api/services/globals/options.ts'
import { LastUsers } from '@/api/services/globals/schema.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { getInitials } from '@/lib/utils.ts'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Loader } from '@/components/loader.tsx'

export function RecentUsers() {
	const { t } = useTranslation()
	const authToken = useAuthStore((state) => state.auth.accessToken)

	const { data, isLoading } = useQuery({
		...getGlobalSettings(),
		enabled: !!authToken,
	})

	const { last10Users: users } = data || {}

	const getDaysAgo = (timeObj: LastUsers['time_since_last_log']) => {
		const daysAgo = timeObj.period

		if (timeObj.span === 'minutes') {
			return t('Global.time.minutes', { value: daysAgo })
		}

		if (daysAgo === 0) return t('Global.today')

		if (daysAgo === 1) return t('Global.yesterday')

		return t('Global.time.day', { value: daysAgo })
	}

	if (isLoading) return <Loader overlay size='md' />

	return (
		<Card className='h-fit'>
			<CardHeader>
				<CardTitle>{t('Dashboard.recentUsers')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='flex flex-col gap-y-4'>
					{users?.map((user) => (
						<Link to={'/admin/users/' + user.id_users} key={user.id_users}>
							<div className='flex items-center gap-4'>
								<Avatar>
									<AvatarFallback className='text-sm font-semibold uppercase'>
										{getInitials(user?.firstname ?? 'N', user?.lastname ?? 'N')}
									</AvatarFallback>
								</Avatar>
								<div className='flex-1 space-y-0.5'>
									<p className='text-sm font-medium'>
										{user.firstname} {user.lastname}
									</p>
								</div>
								<div className='text-xs text-muted-foreground'>
									{getDaysAgo(user.time_since_last_log)}
								</div>
							</div>
						</Link>
					))}
				</div>
			</CardContent>
			<CardFooter>
				<Button variant='outline' className='w-full' asChild>
					<Link to='/admin/users'>{t('Actions.viewAll')}</Link>
				</Button>
			</CardFooter>
		</Card>
	)
}
