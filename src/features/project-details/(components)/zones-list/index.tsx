import { useEffect, useState } from 'react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { IconEdit, IconProgressHelp, IconTrash } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { UpsertZone } from '@/api/services/zones/schema'
import { cn } from '@/lib/utils.ts'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog.tsx'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table.tsx'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip.tsx'
import QuestionLayout from '@/features/project-details/(components)/question-layout'
import { ZoneDialog } from '@/features/project-details/(components)/zones-action-dialog'

interface ZoneListProps {
	zones: UpsertZone[]
	onEdit: (zone: UpsertZone) => void
	onDelete: (zoneId: number) => void
	id_projects?: number
	id_images?: number
	className?: string
	isLoading?: boolean
}

export function ZoneList({
	zones,
	onEdit,
	onDelete,
	id_projects,
	id_images,
	className,
	isLoading,
}: ZoneListProps) {
	const { t } = useTranslation()
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
	const [zoneToDelete, setZoneToDelete] = useState<number | undefined>(
		undefined
	)
	const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false)
	const [additionalQuestionsDialogOpen, setAdditionalQuestionsDialogOpen] =
		useState<boolean>(false)
	const [zoneToEdit, setZoneToEdit] = useState<UpsertZone | null>(null)

	const handleDeleteClick = (zoneId?: number) => {
		setZoneToDelete(zoneId)
		setDeleteDialogOpen(true)
	}

	const handleDeleteConfirm = () => {
		if (zoneToDelete !== undefined) {
			onDelete(zoneToDelete)
			setDeleteDialogOpen(false)
			setZoneToDelete(undefined)
		}
	}

	const handleEditClick = (zone: UpsertZone) => {
		setZoneToEdit(zone)
		setEditDialogOpen(true)
	}

	const handleEditSubmit = (updatedZone: UpsertZone) => {
		onEdit(updatedZone)
		setEditDialogOpen(false)
		setZoneToEdit(null)
	}

	const handleDialogOpenChange = (zone: UpsertZone) => {
		setZoneToEdit(zone)
		setAdditionalQuestionsDialogOpen(true)
	}

	useEffect(() => {
		if (zones && zones.length > 0 && zoneToEdit?.id_zones) {
			const updatedZone = zones.find((i) => i.id_zones === zoneToEdit.id_zones)

			if (updatedZone) {
				setZoneToEdit(updatedZone)
			}
		}
	}, [zones, zoneToEdit])

	return (
		<div className={cn('space-y-4', className)}>
			{zones.length === 0 ? (
				<Card>
					<CardContent className='p-6 text-center text-muted-foreground'>
						{t('ProjectDetails.zones.table.empty')}
					</CardContent>
				</Card>
			) : (
				<div className='rounded-md border'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='w-[80px]'>
									{t('Input.label.color')}
								</TableHead>
								<TableHead>{t('Input.label.zoneName')}</TableHead>
								<TableHead>{t('Input.label.coordName')}</TableHead>
								<TableHead className='w-[100px]'>
									{t('Input.label.points')}
								</TableHead>

								<TableHead className='w-[100px]'>
									{t('Input.label.questions')}
								</TableHead>
								<TableHead className='w-[120px] text-center'>
									{t('Actions.actions')}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{zones.map((zone, index) => (
								<TableRow key={index}>
									<TableCell>
										<div
											className='h-6 w-6 rounded-full border'
											style={{ backgroundColor: zone.coordinates.color }}
										/>
									</TableCell>
									<TableCell className='font-medium'>{zone.name}</TableCell>
									<TableCell>{zone.coordinates.name}</TableCell>
									<TableCell>{zone.coordinates.points.length}</TableCell>
									<TableCell>
										<div className='flex items-center justify-center gap-x-1'>
											<span className='font-medium'>
												{zone?.questions?.length ?? 0}
											</span>
											<TooltipProvider>
												<Tooltip delayDuration={0}>
													<TooltipTrigger asChild>
														<Button
															variant='ghost'
															size='icon'
															className='!size-6'
															disabled={isLoading}
															onClick={() => handleDialogOpenChange(zone)}
														>
															<IconProgressHelp className='!size-5' />
														</Button>
													</TooltipTrigger>
													<TooltipContent side='left'>
														{t('ProjectDetails.zones.table.editTooltip')}
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
									</TableCell>
									<TableCell className='text-center'>
										<div className='flex justify-center gap-2'>
											<Button
												variant='ghost'
												size='icon'
												disabled={isLoading}
												onClick={() => handleEditClick(zone)}
											>
												<IconEdit className='!size-5' />
											</Button>
											<Button
												variant='ghost'
												size='icon'
												disabled={isLoading}
												onClick={() => handleDeleteClick(zone.id_zones)}
											>
												<IconTrash className='!size-5 text-destructive' />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t('Global.warning')}</AlertDialogTitle>
						<AlertDialogDescription>
							{t('Global.deleteWarning')}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t('Actions.cancel')}</AlertDialogCancel>
						<AlertDialogAction
							disabled={isLoading}
							onClick={handleDeleteConfirm}
							className='bg-destructive text-destructive-foreground'
						>
							{t('Actions.delete')}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{zoneToEdit && (
				<>
					<ZoneDialog
						isLoading={isLoading}
						open={editDialogOpen}
						onOpenChange={setEditDialogOpen}
						onSubmit={handleEditSubmit}
						defaultValues={zoneToEdit}
						points={zoneToEdit.coordinates.points}
						id_projects={id_projects}
						id_images={id_images}
						isEditing={true}
					/>

					<Dialog
						open={additionalQuestionsDialogOpen}
						onOpenChange={setAdditionalQuestionsDialogOpen}
					>
						<DialogContent className='sm:max-w-2xl'>
							<DialogHeader>
								<DialogTitle>
									{t('ProjectDetails.zones.table.questionTitle', {
										value: zoneToEdit?.name,
									})}
								</DialogTitle>
								<DialogDescription>
									{t('ProjectDetails.zones.table.questionDescription', {
										value: zoneToEdit?.name,
									})}
								</DialogDescription>
							</DialogHeader>

							<QuestionLayout
								questions={zoneToEdit?.questions ?? []}
								projectId={id_projects!}
								zoneId={zoneToEdit?.id_zones}
							/>
						</DialogContent>
					</Dialog>
				</>
			)}
		</div>
	)
}
