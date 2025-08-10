import { format } from 'date-fns'
import { DialogTitle } from '@radix-ui/react-dialog'
import { hr } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog.tsx'

interface Props {
	tracking: any
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

const CommentsModal = ({ tracking, isOpen, onOpenChange }: Props) => {
	const { t } = useTranslation()

	const formatDateTime = (dateString: string) => {
		try {
			const date = new Date(dateString)
			return format(date, 'dd.MM.yyyy HH:mm:ss', { locale: hr })
		} catch (_error) {
			return dateString
		}
	}

	const getCommentsInfo = (comments: any) => {
		if (!comments || Object.keys(comments).length === 0) {
			return { type: 'empty', count: 0, display: '-' }
		}

		if (comments.comments && Array.isArray(comments.comments)) {
			return {
				type: 'images',
				count: comments.comments.length,
				display: comments.comments.length,
			}
		}

		const keys = Object.keys(comments)
		if (keys.length > 0) {
			return {
				type: 'keyvalue',
				count: keys.length,
				display: `${keys.length} ${t('Analytics.comments')}`,
			}
		}

		return { type: 'empty', count: 0, display: '-' }
	}

	const commentsInfo = getCommentsInfo(tracking?.comments)

	const renderCommentContent = () => {
		if (commentsInfo.type === 'empty') {
			return <p className='text-gray-500'>{t('Analytics.noComments')}</p>
		}

		if (commentsInfo.type === 'images') {
			const imageComments = tracking.comments.comments
			return (
				<div className='space-y-4'>
					<h3 className='flex items-center gap-2 text-lg font-semibold'>
						<span>📷</span>
						{t('Analytics.comments')} ({imageComments.length})
					</h3>
					<div className='space-y-3'>
						{imageComments.map((comment: any, index: number) => (
							<div key={index} className='rounded-lg border bg-gray-50 p-3'>
								<div className='mb-2 flex items-start justify-between'>
									<span className='text-sm font-medium text-gray-700'>
										{t('Analytics.image', {
											value: index + 1,
										})}
									</span>
									<span className='text-xs text-gray-500'>
										{formatDateTime(comment.date)}
									</span>
								</div>
								{comment.comment && (
									<img
										src={comment.comment}
										alt={t('Analytics.image', {
											value: index + 1,
										})}
									/>
								)}
							</div>
						))}
					</div>
				</div>
			)
		}

		if (commentsInfo.type === 'keyvalue') {
			const keyValueData = tracking.comments
			return (
				<div className='space-y-4'>
					<h3 className='flex items-center gap-2 text-lg font-semibold'>
						<span>📋</span>
						{t('Analytics.comments')} ({Object.keys(keyValueData).length})
					</h3>
					<div className='space-y-2'>
						{Object.entries(keyValueData).map(([key, value], index) => (
							<div
								key={index}
								className='flex items-center justify-between rounded-lg border bg-gray-50 p-3'
							>
								<span className='font-medium capitalize text-gray-700'>
									{key}:
								</span>
								<span className='text-gray-600'>{String(value)}</span>
							</div>
						))}
					</div>
				</div>
			)
		}

		return null
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>
						{t('Analytics.commentsFor', {
							value: `#${tracking?.id_tracking}`,
						})}
					</DialogTitle>
				</DialogHeader>
				<div className='mt-4'>{renderCommentContent()}</div>
			</DialogContent>
		</Dialog>
	)
}

export default CommentsModal
