import { useEffect, useMemo, useState } from 'react'
// import { Filter, X } from 'lucide-react'
import { Filter } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'

export interface FilterConfig {
	label: string
	possible_answers: string[]
	selection?: {
		[key: string]: string[]
	}
}

export interface FilterSelection {
	[key: string]: string[]
}

interface GlobalFiltersProps {
	filters?: FilterConfig[]
	value: FilterSelection | null
	onFilterChange?: (filters: FilterSelection | null) => void
	className?: string
}

export const GlobalFilters = ({
	filters,
	value,
	onFilterChange,
	className,
}: GlobalFiltersProps) => {
	const { t } = useTranslation()

	const initialSelection = useMemo(() => {
		if (value) return value

		const selection: FilterSelection = {}
		filters?.forEach((filter) => {
			selection[filter.label] = [...filter.possible_answers]
		})
		return selection
	}, [filters, value])

	const [tempFilters, setTempFilters] =
		useState<FilterSelection>(initialSelection)
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		setTempFilters(initialSelection)
	}, [initialSelection])

	const selectedFilters = value || initialSelection

	const isAllSelected = useMemo(() => {
		return filters?.every(
			(filter) =>
				selectedFilters[filter.label]?.length === filter.possible_answers.length
		)
	}, [selectedFilters, filters])

	const selectedCount = useMemo(() => {
		return Object.values(selectedFilters).reduce(
			(acc, arr) => acc + arr.length,
			0
		)
	}, [selectedFilters])

	const totalCount = useMemo(() => {
		return filters?.reduce(
			(acc, filter) => acc + filter.possible_answers.length,
			0
		)
	}, [filters])

	const toggleOption = (filterLabel: string, option: string) => {
		setTempFilters((prev) => {
			const current = prev[filterLabel] || []
			const isSelected = current.includes(option)

			if (isSelected && current.length === 1) {
				return prev
			}

			if (isSelected) {
				return {
					...prev,
					[filterLabel]: current.filter((item) => item !== option),
				}
			} else {
				return {
					...prev,
					[filterLabel]: [...current, option],
				}
			}
		})
	}

	useEffect(() => {
		handleApply()
	}, [tempFilters])
	const handleApply = () => {
		const allSelected = filters?.every(
			(filter) =>
				tempFilters[filter.label]?.length === filter.possible_answers.length
		)

		onFilterChange?.(allSelected ? null : tempFilters)
		// setIsOpen(false)
	}

	const handleReset = () => {
		const resetSelection: FilterSelection = {}
		filters?.forEach((filter) => {
			resetSelection[filter.label] = [...filter.possible_answers]
		})
		setTempFilters(resetSelection)
		onFilterChange?.(resetSelection)
	}

	const handleOpenChange = (open: boolean) => {
		if (open) {
			setTempFilters(selectedFilters)
		}
		setIsOpen(open)
	}

	if (!filters || filters.length === 0) {
		return null
	}

	return (
		<Popover open={isOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button variant='outline' className={cn(className)}>
					<Filter className='h-4 w-4' />
					<span className='font-medium'>{t('Analytics.globalFilters')}</span>
					{!isAllSelected && (
						<Badge
							variant='secondary'
							className='ml-1 h-5 min-w-5 rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground'
						>
							{selectedCount}/{totalCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-[400px] p-0' align='start' sideOffset={8}>
				<div className='flex flex-col'>
					<div className='flex items-center justify-between border-b border-border/60 px-4 py-3'>
						<div className='flex items-center gap-2'>
							<Filter className='h-4 w-4 text-muted-foreground' />
							<h3 className='text-sm font-semibold'>
								{t('Analytics.globalFilters')}
							</h3>
						</div>
						<Button
							variant='ghost'
							size='sm'
							onClick={handleReset}
							className='h-7 px-2 text-xs text-muted-foreground hover:text-foreground'
						>
							{t('Actions.resetFilters')}
						</Button>
					</div>

					<div className='max-h-[400px] overflow-y-auto p-4'>
						<div className='space-y-6'>
							{filters?.map((filter) => (
								<div key={filter.label} className='space-y-3'>
									<div className='flex items-center justify-between'>
										<h4 className='text-sm font-medium capitalize'>
											{filter.label.replace(/^f_/, '').replace(/_/g, ' ')}
										</h4>
										<span className='text-xs text-muted-foreground'>
											{tempFilters[filter.label]?.length || 0}/
											{filter.possible_answers.length}
										</span>
									</div>
									<div className='flex flex-wrap gap-2'>
										{filter.possible_answers.map((option) => {
											const isSelected =
												tempFilters[filter.label]?.includes(option)
											const isLastSelected =
												isSelected && tempFilters[filter.label]?.length === 1

											return (
												<Button
													key={option}
													variant={isSelected ? 'default' : 'outline'}
													size='sm'
													onClick={() => toggleOption(filter.label, option)}
													disabled={isLastSelected}
													className={cn(
														'h-8 rounded-full !border !border-border px-3 text-xs font-medium transition-all',
														isSelected
															? 'bg-primary text-primary-foreground hover:bg-primary/90'
															: 'border-border/60 bg-background hover:bg-accent/50',
														isLastSelected && 'cursor-not-allowed opacity-60'
													)}
												>
													{option}
													{/* {isSelected && <X className='ml-1.5 h-3 w-3' />} */}
												</Button>
											)
										})}
									</div>
								</div>
							))}
						</div>
					</div>

					{/*<div className='flex items-center gap-2 border-t border-border/60 p-4'>*/}
					{/*	<Button*/}
					{/*		variant='outline'*/}
					{/*		size='sm'*/}
					{/*		onClick={() => setIsOpen(false)}*/}
					{/*		className='flex-1'*/}
					{/*	>*/}
					{/*		{t('Actions.cancel')}*/}
					{/*	</Button>*/}
					{/*	<Button*/}
					{/*		size='sm'*/}
					{/*		onClick={handleApply}*/}
					{/*		className='flex-1 bg-primary text-primary-foreground hover:bg-primary/90'*/}
					{/*	>*/}
					{/*		{t('Actions.applyFilters')}*/}
					{/*	</Button>*/}
					{/*</div>*/}
				</div>
			</PopoverContent>
		</Popover>
	)
}
