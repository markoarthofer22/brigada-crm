'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getProjectById } from '@/api/services/projects/options.ts'
import { getAllTrackings } from '@/api/services/trackings/options.ts'
import {
	addCommentToTracking,
	closeTrackingEvent,
	startNewTackingEvent,
} from '@/api/services/trackings/trackings'
import { cn } from '@/lib/utils.ts'
import { useLoader } from '@/context/loader-provider'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header.tsx'
import { Main } from '@/components/layout/main'
import SplitPanel from '@/components/split-panel'
import { CommentPadModal } from '@/features/project-details-regular-user/(components)/add-comment-modal'
import { TrackingExam } from '@/features/project-details-regular-user/(components)/tracking-exam'
import TrackingButtonList from '@/features/project-details-regular-user/(components)/trackings'
import ZonesLayoutRegularUser from '@/features/project-details-regular-user/(components)/zones-layout'

const INITIAL_SPLIT = 50

export default function ProjectDetailsForRegularUser() {
	const { t } = useTranslation()
	const { id } = useParams({ strict: false })
	const { handleError } = useHandleGenericError()
	const [isTrackingValid, setIsTrackingValid] = useState<boolean>(true)
	const [activeTrackingId, setActiveTrackingId] = useState<number | null>(null)
	const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
	const [isMinimized, setIsMinimized] = useState(false)

	const { showLoader, hideLoader } = useLoader()

	const projectQuery = useQuery({
		...getProjectById(Number(id)),
		enabled: !!id,
	})

	const trackingQuery = useQuery({
		...getAllTrackings(Number(id)),
		enabled: !!id,
	})

	const addCommentMutation = useMutation({
		mutationFn: (comment: string) => {
			return addCommentToTracking(activeTrackingId!, comment)
		},
		onSuccess: () => {
			toast.success(t('ProjectDetailsRegularUser.commentAdded'))
			setIsCommentModalOpen(false)
		},
		onError: (error: unknown) => {
			handleError(error)
		},
	})

	const startNewTrackingMutation = useMutation({
		mutationFn: () => {
			return startNewTackingEvent(Number(id))
		},
		onSuccess: (data) => {
			if (data) {
				toast.success(t('ProjectDetailsRegularUser.startTrackingSuccess'))
				trackingQuery.refetch()
			}
		},
		onError: (error: unknown) => {
			handleError(error)
		},
	})

	const endTrackingMutation = useMutation({
		mutationFn: (trackingId: number) => {
			return closeTrackingEvent(trackingId)
		},
		onSuccess: () => {
			toast.success(t('ProjectDetailsRegularUser.endTrackingSuccess'))
			trackingQuery.refetch()
		},
		onError: (error: unknown) => {
			handleError(error)
		},
	})

	useEffect(() => {
		if (projectQuery.isLoading || trackingQuery.isLoading) {
			showLoader()
			return
		}

		if (projectQuery.isFetched && trackingQuery.isFetched) {
			hideLoader()
		}
	}, [projectQuery.isFetched, trackingQuery.isFetched])

	useEffect(() => {
		if (trackingQuery.data && trackingQuery.data.length > 0) {
			const activeTrackings = trackingQuery.data.filter(
				(tracking) => tracking.ended_at === null
			)

			const lastActive = activeTrackings[activeTrackings.length - 1]

			if (lastActive) {
				setActiveTrackingId(lastActive.id_tracking)
			}
		}
	}, [trackingQuery.data])

	if (!projectQuery.isSuccess || !trackingQuery.isFetched) return null

	if (
		trackingQuery.error ||
		projectQuery.data.images?.length === 0 ||
		projectQuery.data.questions?.length === 0
	)
		return (
			<>
				<Header />

				<Main fixed className='items-center justify-center'>
					<div className='flex h-full w-full flex-col items-center justify-between gap-x-2 space-y-2'>
						<h2 className='w-fit text-2xl font-bold'>
							{t('ProjectDetails.title')} {projectQuery.data.name}
						</h2>
						<div className='max-w-lg text-center font-semibold text-red-500'>
							{t('ProjectDetails.error')}
						</div>
					</div>
				</Main>
			</>
		)

	if (trackingQuery.data?.length === 0 || !activeTrackingId) {
		return (
			<>
				<Header />

				<Main fixed className='items-center justify-center'>
					<div className='flex h-full w-full flex-col items-center justify-center space-y-4'>
						<h2 className='w-fit text-2xl font-bold'>
							{t('ProjectDetails.title')} {projectQuery.data.name}
						</h2>
						<Button size='lg' onClick={() => startNewTrackingMutation.mutate()}>
							{t('ProjectDetailsRegularUser.addTracking')}
						</Button>
						<Button variant='outline' size='lg' asChild>
							<Link to='/projects'>
								{t('ProjectDetailsRegularUser.backToList')}
							</Link>
						</Button>
					</div>
				</Main>
			</>
		)
	}

	return (
		<div className='flex h-screen flex-col'>
			<Header />

			<Main className='flex flex-1 flex-col overflow-hidden py-4'>
				<div
					className={cn(
						'mb-4 rounded-lg border-2 border-border bg-card shadow-lg transition-all duration-300',
						{
							'px-4 py-2': !isMinimized,
							'px-2 py-1': isMinimized,
						}
					)}
				>
					<div className='flex items-start gap-2'>
						<TrackingButtonList
							onCloseTracking={(trackingId) => {
								if (!isTrackingValid) {
									toast.error(
										t('ProjectDetailsRegularUser.trackingQuestionsNotValid')
									)
									return
								}

								endTrackingMutation.mutate(trackingId)
							}}
							addNewTrackingCallback={() => startNewTrackingMutation.mutate()}
							trackings={trackingQuery.data ?? []}
							activeTracking={activeTrackingId}
							onSelect={(id) => {
								setActiveTrackingId(id)
							}}
							isMinimized={isMinimized}
						/>
						<Button
							className={cn(
								'shrink-0 self-center transition-all duration-300',
								{
									'h-8': isMinimized,
									'h-24': !isMinimized,
								}
							)}
							onClick={() => setIsCommentModalOpen(true)}
						>
							{t('ProjectDetailsRegularUser.addComment')}
						</Button>
						<Button
							variant='outline'
							size='icon'
							onClick={() => setIsMinimized(!isMinimized)}
							className={cn(
								'shrink-0 self-center transition-all duration-300',
								{
									'h-8': isMinimized,
									'h-24 w-12': !isMinimized,
								}
							)}
							title={isMinimized ? 'Expand' : 'Minimize'}
						>
							{isMinimized ? (
								<IconChevronDown className='size-4' />
							) : (
								<IconChevronUp className='size-4' />
							)}
						</Button>
					</div>
				</div>
				<div className='min-h-0 flex-1 overflow-hidden'>
					<SplitPanel className='px-2' initialSplit={INITIAL_SPLIT}>
						<TrackingExam
							trackingId={activeTrackingId}
							projectId={projectQuery.data.id_projects}
							questions={projectQuery.data.questions}
							staticQuestions={projectQuery.data.static_questions}
							examName={`${t('ProjectDetails.title')} ${projectQuery.data.name}`}
							onValidityChange={(isValid) => {
								setIsTrackingValid(isValid)
							}}
						/>
						<div className='mt-3 flex flex-col gap-y-3'>
							<ZonesLayoutRegularUser
								trackingId={activeTrackingId}
								path={projectQuery.data!.path!}
								projectId={projectQuery.data.id_projects}
								zones={projectQuery.data.zones}
								allImages={projectQuery.data.images}
							/>
						</div>
					</SplitPanel>
				</div>
			</Main>
			{isCommentModalOpen && (
				<CommentPadModal
					title={t('ProjectDetailsRegularUser.addComment')}
					open={isCommentModalOpen}
					onOpenChange={setIsCommentModalOpen}
					onSave={(comment: string) => {
						addCommentMutation.mutate(comment)
					}}
					initialValue={''}
				/>
			)}
		</div>
	)
}
