import { Link } from '@tanstack/react-router'
import { ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Project } from '@/api/services/projects/schema.ts'
import { formatDate } from '@/lib/utils.ts'
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

	return (
		<Card className='col-span-2'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<CardTitle>Recent Projects</CardTitle>
					<Button variant='outline' size='sm' asChild>
						<Link to='/projects'>
							{t('Actions.viewAll')}
							<ChevronsUpDown className='!size-5' />
						</Link>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('Table.header.name')}</TableHead>
							<TableHead>{t('Table.header.status')}</TableHead>
							<TableHead>{t('Table.header.created_at')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{projects.map((project) => (
							<TableRow key={project.id_projects}>
								<TableCell>{project.name}</TableCell>
								<TableCell>
									<Badge>Active</Badge>
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
