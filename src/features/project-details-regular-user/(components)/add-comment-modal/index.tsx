import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import CommentPad from '@/components/comment-pad.tsx'

interface CommentPadModalProps {
	title: string
	open: boolean
	onOpenChange: (open: boolean) => void
	onSave: (value: string) => void
	initialValue?: string
}

export function CommentPadModal({
	title,
	open,
	onOpenChange,
	onSave,
	initialValue = '',
}: CommentPadModalProps) {
	const { t } = useTranslation()
	const commentPadRef = useRef<SignatureCanvas>(null)
	const [commentValue, setCommentValue] = useState(initialValue)

	const handleChange = useCallback((value: string) => {
		setCommentValue(value)
	}, [])

	const handleSave = () => {
		onSave(commentValue)
		onOpenChange(false)
	}
	const handleOpenChange = useCallback(
		(isOpen: boolean) => {
			if (isOpen && initialValue && commentPadRef.current) {
				setCommentValue(initialValue)
			}
			onOpenChange(isOpen)
		},
		[initialValue, onOpenChange]
	)

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className='mx-auto w-[calc(100%-32px)] max-w-screen-xl border-0 p-0'>
				<DialogHeader className='p-4'>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className='flex w-full justify-center px-4'>
					<CommentPad
						showDeleteButton={false}
						ref={commentPadRef}
						value={open ? commentValue : ''}
						onChange={handleChange}
						className='w-full'
					/>
				</div>
				<Button
					variant='ghost'
					className='mt-6 h-20 rounded-none bg-green-700 text-2xl font-semibold text-white shadow-md hover:bg-green-800 hover:text-white'
					onClick={handleSave}
				>
					{t('Actions.submit')}
				</Button>
			</DialogContent>
		</Dialog>
	)
}
