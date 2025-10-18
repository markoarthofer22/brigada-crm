import { ProjectCopyDialog } from '@/features/projects/components/projects-copy-dialog.tsx'
import { ProjectsDeleteDialog } from '@/features/projects/components/projects-delete-dialog.tsx'
import { ProjectsUpsertDialog } from '@/features/projects/components/projects-upsert-dialog.tsx'
import { useProjects } from '@/features/projects/context/projects-context.tsx'

export function ProjectDialogs() {
	const { open, setOpen, currentRow, setCurrentRow } = useProjects()
	return (
		<>
			{open === 'add' && (
				<ProjectsUpsertDialog
					key='project-add'
					open={open === 'add'}
					onOpenChange={() => setOpen('add')}
				/>
			)}

			{currentRow && open === 'edit' && (
				<ProjectsUpsertDialog
					key={`project-edit-${currentRow.id_projects}`}
					open={open === 'edit'}
					onOpenChange={() => {
						setOpen('edit')
						setCurrentRow(null)
					}}
					currentRow={currentRow}
				/>
			)}

			{currentRow && open === 'copy' && (
				<ProjectCopyDialog
					key={`project-copy-${currentRow.id_projects}`}
					open={open === 'copy'}
					onOpenChange={() => {
						setOpen('copy')
						setCurrentRow(null)
					}}
					currentRow={currentRow}
				/>
			)}

			{currentRow && open === 'delete' && (
				<ProjectsDeleteDialog
					key={`project-delete-${currentRow.id_projects}`}
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
