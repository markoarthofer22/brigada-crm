import { IconLayoutGridAdd } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import CreateProjectFromTemplate from '@/features/projects/components/create-project-from-template.tsx'
import { useProjects } from '@/features/projects/context/projects-context.tsx'

export function ProjectsPrimaryButtons() {
	const { t } = useTranslation()
	const { setOpen } = useProjects()
	return (
		<div className='flex gap-3'>
			<CreateProjectFromTemplate />
			<Button className='space-x-1' onClick={() => setOpen('add')}>
				{t('Projects.add')} <IconLayoutGridAdd size={18} />
			</Button>
		</div>
	)
}
