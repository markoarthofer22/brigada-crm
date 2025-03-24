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
		return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('Dashboard.recentUsers')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{users.map((user) => (
						<div key={user.id_users} className='flex items-center gap-4'>
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
									<p className='text-xs text-muted-foreground'>{user.email}</p>
									<p className='text-xs text-muted-foreground'>
										{t(`Users.admin.${user.admin}`)}
									</p>
								</span>
							</div>
							<div className='text-xs text-muted-foreground'>
								{getDaysAgo(user.created_at)}
							</div>
						</div>
					))}
				</div>
			</CardContent>
			<CardFooter>
				<Button variant='outline' className='w-full' asChild>
					<Link to='/users'>{t('Actions.viewAll')}</Link>
				</Button>
			</CardFooter>
		</Card>
	)
}
