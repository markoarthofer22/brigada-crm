'use client'

import { useCallback, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { IconSearch } from '@tabler/icons-react'
import { hr } from 'date-fns/locale/hr'
import { Calendar, ZoomIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getAllUsers } from '@/api/services/user/options.ts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input.tsx'

interface TrackingItem {
	id_tracking: number
	id_users: number
	comments: {
		comments: {
			date: string
			comment: string
		}[]
	}
}

interface CommentsListProps {
	trackingItems: TrackingItem[]
}

const CommentsList = ({ trackingItems }: CommentsListProps) => {
	const { t } = useTranslation()
	const [selectedImage, setSelectedImage] = useState<string | null>(null)
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [search, setSearch] = useState<string>('')

	const usersQuery = useQuery({
		...getAllUsers(),
	})

	const nonEmptyItems = trackingItems.filter(
		(item) => item.comments && item.comments?.comments?.length > 0
	)

	const getUserFullNameById = useCallback(
		(id: number) => {
			const user = usersQuery.data?.find((user) => user.id_users === id)
			return user ? `${user.firstname} ${user.lastname}` : 'Unknown User'
		},
		[usersQuery.data]
	)

	const filteredItems = useMemo(
		() =>
			nonEmptyItems.filter((item) => {
				if (!search) return true

				const userFullName = getUserFullNameById(item.id_users).toLowerCase()
				const trackingId = item.id_tracking.toString()
				const searchLower = search.toLowerCase()

				return (
					userFullName.includes(searchLower) || trackingId.includes(searchLower)
				)
			}),
		[nonEmptyItems, search, getUserFullNameById]
	)

	if (nonEmptyItems.length === 0) {
		return (
			<Card className='mt-8'>
				<CardContent className='py-2'>
					<p className='text-center text-base font-medium text-black'>
						{t('Analytics.commentsList.noComments')}
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<>
			<div className='mt-8 space-y-7'>
				<div className='relative max-w-lg'>
					<IconSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						type='text'
						placeholder={t('Analytics.commentsList.searchUserOrId')}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='pl-9'
					/>
				</div>

				{filteredItems.length === 0 ? (
					<Card>
						<CardContent className='py-8'>
							<p className='text-center text-base font-medium text-black'>
								{t('Analytics.commentsList.noResult')}
							</p>
						</CardContent>
					</Card>
				) : (
					filteredItems.map((item) => (
						<Card key={item.id_tracking} className='overflow-hidden'>
							<CardHeader className='bg-muted/50'>
								<CardTitle className='text-lg'>
									{t('Analytics.commentsList.title', {
										trackingId: item.id_tracking,
										user: getUserFullNameById(item.id_users),
									})}
								</CardTitle>
							</CardHeader>
							<CardContent className='pt-6'>
								{item.comments?.comments?.length === 0 ||
								!item.comments?.comments ? (
									<p className='text-sm text-muted-foreground'>
										{t('Analytics.commentsList.noCommentsForThis')}
									</p>
								) : (
									<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
										{item?.comments?.comments?.map((comment, index) => (
											<div
												key={index}
												className='group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md'
											>
												<div className='relative aspect-video bg-muted'>
													<img
														src={comment.comment || '/placeholder.svg'}
														alt={`Comment from ${format(
															comment.date,
															"d. MMMM yyyy. 'u' HH:mm",
															{
																locale: hr,
															}
														)}`}
														className='h-full w-full object-cover'
													/>
													<Button
														size='icon'
														variant='secondary'
														className='absolute right-2 top-2 border border-primary opacity-0 transition-opacity group-hover:opacity-100'
														onClick={() => {
															setSelectedImage(comment.comment)
															setSelectedDate(comment.date)
														}}
													>
														<ZoomIn className='h-4 w-4' />
														<span className='sr-only'>Zoom image</span>
													</Button>
												</div>
												<div className='flex items-center gap-2 p-3 text-xs text-muted-foreground'>
													<Calendar className='h-3 w-3' />

													<span>
														{format(comment.date, "d. MMMM yyyy. 'u' HH:mm", {
															locale: hr,
														})}
													</span>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					))
				)}
			</div>

			<Dialog
				open={!!selectedImage}
				onOpenChange={() => setSelectedImage(null)}
			>
				<DialogContent className='max-h-[90vh] max-w-4xl overflow-auto'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<Calendar className='h-4 w-4' />
							{selectedDate &&
								format(selectedDate, "d. MMMM yyyy. 'u' HH:mm", {
									locale: hr,
								})}
						</DialogTitle>
					</DialogHeader>
					<div className='mt-4'>
						{selectedImage && (
							<img
								src={selectedImage || '/placeholder.svg'}
								alt='Zoomed comment'
								className='h-auto w-full rounded-lg'
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default CommentsList
