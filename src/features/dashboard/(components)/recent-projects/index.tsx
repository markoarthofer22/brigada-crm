import { Link, useRouter } from '@tanstack/react-router'
import { IconLink } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { ActiveStatus, Project } from '@/api/services/projects/schema.ts'
import { cn, formatDate } from '@/lib/utils.ts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

interface RecentProjectsProps {
	projects: Project[]
}

export function RecentProjects({ projects }: RecentProjectsProps) {
	const { t } = useTranslation()

	const router = useRouter()

	return (
		<Card className='col-span-2'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<CardTitle>{t('Dashboard.recentProjects')}</CardTitle>
					<Button variant='outline' size='sm' asChild>
						<Link to='/admin/projects'>
							{t('Actions.viewAll')}
							<IconLink className='!size-5' />
						</Link>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow className='hover:bg-transparent'>
							<TableHead>{t('Table.header.name')}</TableHead>
							<TableHead>{t('Table.header.status')}</TableHead>
							<TableHead>{t('Table.header.created_at')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{projects.map((project) => (
							<TableRow
								key={project.id_projects}
								className='cursor-pointer hover:bg-gray-100'
								onClick={() =>
									router.navigate({
										to: '/admin/projects/' + project.id_projects,
									})
								}
							>
								<TableCell>{project.name}</TableCell>
								<TableCell>
									<Badge
										variant='outline'
										className={cn(
											'min-w-20 items-center justify-center rounded-lg py-1',
											{
												'bg-chart-2 text-white':
													project.active === ActiveStatus.ACTIVE,
												'bg-chart-5 text-white':
													project.active === ActiveStatus.INACTIVE,
											}
										)}
									>
										{t(`Dashboard.active.${project.active}`)}
									</Badge>
								</TableCell>
								<TableCell>
									{formatDate(project.created_at, {
										year: 'numeric',
										month: '2-digit',
										day: 'numeric',
									})}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}
