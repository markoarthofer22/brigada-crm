import * as React from 'react'
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { Column } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/command.tsx'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover.tsx'
import { Separator } from '@/components/ui/separator.tsx'

interface DataTableFacetedFilterProps<TData, TValue> {
	column?: Column<TData, TValue>
	title?: string
	parseAsNumber?: boolean
	options: {
		label: string
		value: string
		icon?: React.ComponentType<{ className?: string }>
	}[]
}

export function DataTableFacetedFilter<TData, TValue>({
	column,
	title,
	options,
	parseAsNumber = false,
}: DataTableFacetedFilterProps<TData, TValue>) {
	const { t } = useTranslation()
	const facets = column?.getFacetedUniqueValues()

	// Use the generic type TValue so that selectedValues holds the proper type.
	const selectedValues = new Set<TValue>(
		(column?.getFilterValue() as TValue[]) ?? []
	)

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant='outline' size='sm' className='h-8 border-dashed'>
					<PlusCircledIcon className='h-4 w-4' />
					{title}
					{selectedValues.size > 0 && (
						<>
							<Separator orientation='vertical' className='mx-2 h-4' />
							<Badge
								variant='secondary'
								className='rounded-sm px-1 font-normal lg:hidden'
							>
								{selectedValues.size}
							</Badge>
							<div className='hidden space-x-1 lg:flex'>
								{selectedValues.size > 2 ? (
									<Badge
										variant='secondary'
										className='rounded-sm px-1 font-normal'
									>
										{t('Table.facetedFilter.selectedBadge', {
											count: selectedValues.size,
										})}
									</Badge>
								) : (
									options
										.filter((option) => {
											// Convert to the correct type when comparing.
											const optionValue = parseAsNumber
												? (Number(option.value) as unknown as TValue)
												: (option.value as unknown as TValue)
											return selectedValues.has(optionValue)
										})
										.map((option) => (
											<Badge
												variant='secondary'
												key={option.value}
												className='rounded-sm px-1 font-normal'
											>
												{option.label}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-[200px] p-0' align='start'>
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>
							{t('Table.facetedFilter.noResultsFound')}
						</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								// Convert the option value to the correct type based on the flag.
								const optionValue = parseAsNumber
									? (Number(option.value) as unknown as TValue)
									: (option.value as unknown as TValue)
								const isSelected = selectedValues.has(optionValue)

								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											if (isSelected) {
												selectedValues.delete(optionValue)
											} else {
												selectedValues.add(optionValue)
											}
											const filterValues = Array.from(selectedValues)
											column?.setFilterValue(
												filterValues.length ? filterValues : undefined
											)
										}}
									>
										<div
											className={cn(
												'flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
												isSelected
													? 'bg-primary text-primary-foreground'
													: 'opacity-50 [&_svg]:invisible'
											)}
										>
											<CheckIcon className='h-4 w-4' />
										</div>
										{option.icon && (
											<option.icon className='h-4 w-4 text-muted-foreground' />
										)}
										<span>{option.label}</span>
										{facets?.get(option.value) && (
											<span className='ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs'>
												{facets.get(option.value)}
											</span>
										)}
									</CommandItem>
								)
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => column?.setFilterValue(undefined)}
										className='justify-center text-center'
									>
										{t('Table.facetedFilter.clearFilters')}
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
