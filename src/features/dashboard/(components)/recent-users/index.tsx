import { differenceInDays } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { User } from '@/api/services/user/schema'
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

interface RecentUsersProps {
	users: User[]
}

export function RecentUsers({ users }: RecentUsersProps) {
	const { t } = useTranslation()

	const getDaysAgo = (date: string) => {
		const daysAgo = differenceInDays(new Date(), date)

		if (daysAgo === 0) return t('Global.today')

		if (daysAgo === 1) return t('Global.yesterday')

		return t('Global.time.day', { value: daysAgo })
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('Dashboard.recentUsers')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='flex flex-col gap-y-4'>
					{users.map((user) => (
						<Link to={'/admin/users/' + user.id_users} key={user.id_users}>
							<div className='flex items-center gap-4'>
								<Avatar>
									<AvatarFallback className='text-sm font-semibold uppercase'>
										{getInitials(user.firstname, user.lastname)}
									</AvatarFallback>
								</Avatar>
								<div className='flex-1 space-y-0.5'>
									<p className='text-sm font-medium'>
										{user.firstname} {user.lastname}
									</p>
									<span className='flex flex-col'>
										<p className='text-xs text-muted-foreground'>
											{user.email}
										</p>
										<p className='text-xs text-muted-foreground'>
											{t(`Users.admin.${user.admin}`)}
										</p>
									</span>
								</div>
								<div className='text-xs text-muted-foreground'>
									{getDaysAgo(user.created_at)}
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
