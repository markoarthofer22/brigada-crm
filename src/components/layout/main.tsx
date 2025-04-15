import React from 'react'
import { cn } from '@/lib/utils'

interface MainProps extends React.HTMLAttributes<HTMLElement> {
	fixed?: boolean
	ref?: React.Ref<HTMLElement>
	className?: string
}

export const Main = ({ fixed, className, ...props }: MainProps) => {
	return (
		<main
			className={cn(
				'peer-[.header-fixed]/header:mt-16',
				'px-4 py-6',
				fixed && 'fixed-main flex flex-grow flex-col overflow-hidden',
				className
			)}
			{...props}
		/>
	)
}

Main.displayName = 'Main'
