import { useUsers } from '../context/users-context'
import { UsersDeleteDialog } from './users-delete-dialog'

export function UsersDialogs() {
	const { open, setOpen, currentRow, setCurrentRow } = useUsers()
	return (
		currentRow && (
			<UsersDeleteDialog
				key={`user-delete-${currentRow.id_users}`}
				open={open === 'delete'}
				onOpenChange={() => {
					setOpen('delete')
					setCurrentRow(null)
				}}
				currentRow={currentRow}
			/>
		)
	)
}
