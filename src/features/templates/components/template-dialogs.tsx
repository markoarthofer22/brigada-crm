import { TemplateUpsertDialog } from '@/features/templates/components/template-upsert-dialog.tsx'
import { useTemplates } from '@/features/templates/context/templates-context.tsx'
import { TemplateDeleteDialog } from './template-delete-dialog.tsx'

export function TemplatesDialogs() {
	const { open, setOpen, currentRow, setCurrentRow } = useTemplates()
	return (
		<>
			<TemplateUpsertDialog
				key='template-add'
				open={open === 'add'}
				onOpenChange={() => setOpen('add')}
			/>

			{currentRow && (
				<>
					<TemplateUpsertDialog
						key={`template-edit-${currentRow.id_projects}`}
						open={open === 'edit'}
						onOpenChange={() => {
							setOpen('edit')
							setCurrentRow(null)
						}}
						currentRow={currentRow}
					/>
					<TemplateDeleteDialog
						key={`template-delete-${currentRow.id_projects}`}
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
