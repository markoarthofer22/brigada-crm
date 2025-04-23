import type React from 'react'
import { IconLoader3 } from '@tabler/icons-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const loaderVariants = cva(
	'fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-200',
	{
		variants: {
			visible: {
				true: 'opacity-100',
				false: 'opacity-0 pointer-events-none',
			},
		},
		defaultVariants: {
			visible: false,
		},
	}
)

const spinnerVariants = cva('animate-spin text-black', {
	variants: {
		size: {
			sm: 'h-6 w-6',
			md: 'h-8 w-8',
			lg: 'h-12 w-12',
			xl: 'h-16 w-16',
		},
	},
	defaultVariants: {
		size: 'lg',
	},
})

export interface GlobalLoaderProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof loaderVariants>,
		VariantProps<typeof spinnerVariants> {
	message?: string
}

export function GlobalLoader({
	className,
	visible,
	size,
	message,
	...props
}: GlobalLoaderProps) {
	return (
		<div
			className={cn(loaderVariants({ visible }), className)}
			role='alert'
			aria-live='assertive'
			{...props}
		>
			<div className='flex flex-col items-center gap-4'>
				<IconLoader3 className={cn(spinnerVariants({ size }))} />
				{message && (
					<p className='text-center text-muted-foreground'>{message}</p>
				)}
			</div>
		</div>
	)
}
