import React, { useState } from 'react'
import { Project } from '@/api/services/projects/schema.ts'
import useDialogState from '@/hooks/use-dialog-state'

type TemplatesDialogType = 'add' | 'edit' | 'delete'

interface TemplatesContextType {
	open: TemplatesDialogType | null
	setOpen: (str: TemplatesDialogType | null) => void
	currentRow: Project | null
	setCurrentRow: React.Dispatch<React.SetStateAction<Project | null>>
}

const TemplatesContext = React.createContext<TemplatesContextType | null>(null)

interface Props {
	children: React.ReactNode
}

export default function TemplatesProvider({ children }: Props) {
	const [open, setOpen] = useDialogState<TemplatesDialogType>(null)
	const [currentRow, setCurrentRow] = useState<Project | null>(null)

	return (
		<TemplatesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
			{children}
		</TemplatesContext>
	)
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTemplates = () => {
	const usersContext = React.useContext(TemplatesContext)

	if (!usersContext) {
		throw new Error('useTemplates has to be used within <TemplatesContext>')
	}

	return usersContext
}
