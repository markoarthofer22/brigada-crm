import { differenceInDays } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { IconDrone, IconLayout } from '@tabler/icons-react'
import { BarChart3, Calendar, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Project } from '@/api/services/projects/schema.ts'
import { formatDate } from '@/lib/utils.ts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

interface ProjectListProps {
	projects?: Project[]
}

export function ProjectList({ projects = [] }: ProjectListProps) {
	const { t } = useTranslation()

	const getDaysAgo = (date: string) => {
		const daysAgo = differenceInDays(new Date(), date)

		if (daysAgo === 0) return t('Global.today')

		if (daysAgo === 1) return t('Global.yesterday')

		return t('Global.time.day', { value: daysAgo })
	}

	return (
		<div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
			{projects.map((project) => {
				return (
					<Link
						to={'/projects/' + project.id_projects}
						key={project.id_projects}
						className='block transition-transform hover:scale-[1.02]'
					>
						<Card className='h-full overflow-hidden'>
							<div className='h-1.5' />
							<CardHeader className='pb-2'>
								<div className='flex items-start justify-between'>
									<h3 className='line-clamp-2 text-lg font-semibold'>
										{project.name}
									</h3>
									<Badge
										variant={project.active ? 'default' : 'outline'}
										className='ml-2 whitespace-nowrap'
									>
										{t(`Dashboard.active.${project.active}`)}
									</Badge>
								</div>
							</CardHeader>

							<CardContent className='space-y-4 pb-2'>
								<div className='grid grid-cols-3 gap-2 pt-2'>
									<div className='flex flex-col items-center rounded-md bg-muted/50 p-2'>
										<IconLayout className='mb-1 h-4 w-4 text-primary' />
										<span className='text-xs font-medium'>4</span>
										<span className='text-[10px] text-muted-foreground'>
											{t('Dashboard.layouts')}
										</span>
									</div>

									<div className='flex flex-col items-center rounded-md bg-muted/50 p-2'>
										<BarChart3 className='mb-1 h-4 w-4 text-primary' />
										<span className='text-xs font-medium'>5</span>
										<span className='text-[10px] text-muted-foreground'>
											{t('Dashboard.questions')}
										</span>
									</div>

									<div className='flex flex-col items-center rounded-md bg-muted/50 p-2'>
										<IconDrone className='mb-1 h-4 w-4 text-primary' />
										<span className='text-xs font-medium'>5</span>
										<span className='text-[10px] text-muted-foreground'>
											{t('Dashboard.zones')}
										</span>
									</div>
								</div>
							</CardContent>

							<CardFooter className='mt-2 flex justify-between border-t pt-2 text-xs text-muted-foreground'>
								<div className='flex items-center'>
									<Calendar className='mr-1.5 h-3.5 w-3.5' />
									{formatDate(project.created_at, {
										year: 'numeric',
										month: '2-digit',
										day: 'numeric',
									})}
								</div>
								<div className='flex items-center'>
									<Clock className='mr-1.5 h-3.5 w-3.5' />
									{t('Projects.created', {
										value: getDaysAgo(project.created_at),
									})}
								</div>
							</CardFooter>
						</Card>
					</Link>
				)
			})}
		</div>
	)
}
