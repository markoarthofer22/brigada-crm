import { ReactNode, useRef, useState } from 'react'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

type SplitPanelProps = {
	children: [ReactNode, ReactNode]
	initialSplit?: number
	min?: number
	max?: number
	className?: string
}

export default function SplitPanel({
	children,
	initialSplit = 66,
	min = 10,
	max = 90,
	className,
}: SplitPanelProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [dividerPos, setDividerPos] = useState(initialSplit)

	const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
		const startY = 'touches' in e ? e.touches[0].clientY : e.clientY
		const containerHeight = containerRef.current?.offsetHeight || 1

		const onMove = (moveEvent: MouseEvent | TouchEvent) => {
			const currentY =
				'touches' in moveEvent
					? moveEvent.touches[0].clientY
					: (moveEvent as MouseEvent).clientY

			const delta = currentY - startY
			const newHeight =
				((dividerPos / 100) * containerHeight + delta) / containerHeight

			setDividerPos(Math.min(max, Math.max(min, newHeight * 100)))
		}

		const stopDrag = () => {
			window.removeEventListener('mousemove', onMove)
			window.removeEventListener('mouseup', stopDrag)
			window.removeEventListener('touchmove', onMove)
			window.removeEventListener('touchend', stopDrag)
		}

		window.addEventListener('mousemove', onMove)
		window.addEventListener('mouseup', stopDrag)
		window.addEventListener('touchmove', onMove)
		window.addEventListener('touchend', stopDrag)
	}

	return (
		<div
			ref={containerRef}
			className={cn('relative h-full w-full overflow-hidden', className)}
		>
			<div
				className='absolute left-0 right-0 overflow-auto'
				style={{ height: `${dividerPos}%` }}
			>
				{children[0]}
			</div>
			<div
				className='absolute left-0 right-0 z-10 h-2 cursor-row-resize touch-none'
				style={{ top: `calc(${dividerPos}% - 1px)` }}
				onMouseDown={startDrag}
				onTouchStart={startDrag}
			>
				<div className='absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 bg-gray-200' />
				<div className='relative z-10 flex h-full items-center justify-center'>
					<div className='rounded-md bg-muted px-2 py-0.5 shadow-sm'>
						<GripVertical className='size-5 text-muted-foreground' />
					</div>
				</div>
			</div>
			<div
				className='absolute bottom-0 left-0 right-0 overflow-auto'
				style={{ top: `${dividerPos + 0.5}%` }}
			>
				{children[1]}
			</div>
		</div>
	)
}
