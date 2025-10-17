import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import SignatureCanvas from 'react-signature-canvas'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button.tsx'

export interface CommentPadProps {
	value?: string
	onChange: (value: string) => void
	className?: string
	showDeleteButton?: boolean
}

const CommentPad = forwardRef<SignatureCanvas, CommentPadProps>(
	({ value = '', onChange, className, showDeleteButton = true }, ref) => {
		const { t } = useTranslation()
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
				{showDeleteButton && (
					<div className='absolute right-2 top-2 z-20 flex items-center gap-x-2'>
						<Button
							variant='destructive'
							onClick={handleClear}
							className='h-10 bg-green-700 p-0 px-6 font-semibold text-white shadow-md hover:bg-green-800 hover:text-white'
						>
							{t('Actions.resetComment')}
						</Button>
					</div>
				)}
			</div>
		)
	}
)

CommentPad.displayName = 'CommentPad'

export default CommentPad
