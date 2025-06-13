import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { IconX } from '@tabler/icons-react'
import SignatureCanvas from 'react-signature-canvas'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button.tsx'

export interface CommentPadProps {
	value?: string
	onChange: (value: string) => void
	className?: string
}

const CommentPad = forwardRef<SignatureCanvas, CommentPadProps>(
	({ value = '', onChange, className }, ref) => {
		const sigRef = useRef<SignatureCanvas>(null)

		// expose methods
		useImperativeHandle(ref, () => sigRef.current!)

		useEffect(() => {
			if (value && sigRef.current) {
				if (sigRef.current.isEmpty()) {
					const img = new Image()
					img.src = value
					img.crossOrigin = 'anonymous'
					img.onload = () => {
						const canvas = sigRef.current?.getCanvas()
						if (canvas) {
							const ctx = canvas.getContext('2d')
							if (ctx) {
								const originalWidth = canvas.width
								const originalHeight = canvas.height

								ctx.clearRect(0, 0, originalWidth, originalHeight)

								ctx.drawImage(img, 0, 0)
							}
						}
					}
				}
			}
		}, [value])

		const handleEnd = () => {
			if (sigRef.current) {
				const canvas = sigRef.current.getCanvas()
				const dataUrl = canvas.toDataURL('image/png') || ''
				onChange(dataUrl)
			}
		}

		const handleClear = () => {
			if (sigRef.current) {
				sigRef.current.clear()
				onChange('')
			}
		}

		return (
			<div className={cn('relative w-fit', className)}>
				<SignatureCanvas
					ref={sigRef}
					penColor='black'
					canvasProps={{
						className:
							'border border-border rounded bg-[#F2F1F1]  h-[600px] w-full ',
					}}
					onEnd={handleEnd}
				/>
				<Button
					variant='ghost'
					size='icon'
					onClick={handleClear}
					className='absolute right-1 top-1 z-10 size-6 bg-red-500 p-0 text-white shadow-md hover:bg-red-600'
				>
					<IconX className='size-4 text-white' />
				</Button>
			</div>
		)
	}
)

CommentPad.displayName = 'CommentPad'

export default CommentPad
