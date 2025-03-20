import { ProjectsUpsertDialog } from '@/features/projects/components/projects-upsert-dialog.tsx'
import { useProjects } from '@/features/projects/context/projects-context.tsx'
import { ProjectsDeleteDialog } from './projects-delete-dialog.tsx'

export function ProjectDialogs() {
	const { open, setOpen, currentRow, setCurrentRow } = useProjects()
	return (
		<>
			<ProjectsUpsertDialog
				key='project-add'
				open={open === 'add'}
				onOpenChange={() => setOpen('add')}
			/>

			{currentRow && (
				<>
					<ProjectsUpsertDialog
						key={`project-edit-${currentRow.id_projects}`}
						open={open === 'edit'}
						onOpenChange={() => {
							setOpen('edit')
							setCurrentRow(null)
						}}
						currentRow={currentRow}
					/>
					<ProjectsDeleteDialog
						key={`project-delete-${currentRow.id_projects}`}
						open={open === 'delete'}
						onOpenChange={() => {
							setOpen('delete')
							setCurrentRow(null)
						}}
						currentRow={currentRow}
					/>
				</>
			)}
		</>
	)
}
