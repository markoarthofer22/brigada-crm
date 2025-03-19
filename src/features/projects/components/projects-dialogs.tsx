import { useProjects } from '@/features/projects/context/projects-context.tsx'
import { ProjectsDeleteDialog } from './projects-delete-dialog.tsx'

export function ProjectDialogs() {
	const { open, setOpen, currentRow, setCurrentRow } = useProjects()
	return (
		<>
			{currentRow && (
				<ProjectsDeleteDialog
					key={`user-delete-${currentRow.id_projects}`}
					open={open === 'delete'}
					onOpenChange={() => {
						setOpen('delete')
						setCurrentRow(null)
					}}
					currentRow={currentRow}
				/>
			)}
		</>
	)
}
