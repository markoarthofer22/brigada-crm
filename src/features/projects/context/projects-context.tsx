import React, { useState } from 'react'
import { Project } from '@/api/services/projects/schema.ts'
import useDialogState from '@/hooks/use-dialog-state'

type ProjectsDialogType = 'add' | 'edit' | 'delete'

interface ProjectsContextType {
	open: ProjectsDialogType | null
	setOpen: (str: ProjectsDialogType | null) => void
	currentRow: Project | null
	setCurrentRow: React.Dispatch<React.SetStateAction<Project | null>>
}

const ProjectsContext = React.createContext<ProjectsContextType | null>(null)

interface Props {
	children: React.ReactNode
}

export default function ProjectsProvider({ children }: Props) {
	const [open, setOpen] = useDialogState<ProjectsDialogType>(null)
	const [currentRow, setCurrentRow] = useState<Project | null>(null)

	return (
		<ProjectsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
			{children}
		</ProjectsContext>
	)
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProjects = () => {
	const usersContext = React.useContext(ProjectsContext)

	if (!usersContext) {
		throw new Error('useProjects has to be used within <ProjectsContext>')
	}

	return usersContext
}
