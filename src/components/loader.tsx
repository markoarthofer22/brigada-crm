import { Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
	size?: 'sm' | 'md' | 'lg'
	className?: string
	text?: string
}

const Spinner = ({ size = 'md', className, text }: SpinnerProps) => {
	const sizeClasses = {
		sm: 'h-4 w-4 border-2',
		md: 'h-8 w-8 border-3',
		lg: 'h-12 w-12 border-4',
	}

	return (
		<div
			className={cn(
				'flex h-full w-full flex-col items-center justify-center',
				className
			)}
		>
			<Loader2Icon
				className={cn(
					'animate-spin rounded-full border-solid border-primary border-t-transparent',
					sizeClasses[size],
					className
				)}
			/>
			{text && <p className='mt-2 text-sm text-muted-foreground'>{text}</p>}
		</div>
	)
}

interface LoaderProps {
	overlay?: boolean
	size?: 'sm' | 'md' | 'lg'
	className?: string
	text?: string
	position?: 'absolute' | 'fixed' | 'flex'
}

const Loader = ({
	overlay = false,
	size = 'md',
	className,
	text,
	position = 'flex',
}: LoaderProps) => {
	if (overlay) {
		return (
			<div
				className={cn(
					'h-full w-full items-center justify-center self-stretch bg-background/80 backdrop-blur-sm',
					position
				)}
			>
				<Spinner className={className} text={text} size={size} />
			</div>
		)
	}

	return <Spinner className={className} text={text} size={size} />
}

export { Loader, Spinner }
