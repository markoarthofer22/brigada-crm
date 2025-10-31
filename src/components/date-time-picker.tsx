'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'

interface DateTimePickerProps {
	label?: string
	date?: Date
	onDateChange: (date: Date | undefined) => void
	isOpen?: boolean
	onOpenChange?: (open: boolean) => void
	placeholder?: string
}

export function DateTimePicker({
	label,
	date,
	onDateChange,
	isOpen,
	onOpenChange,
	placeholder,
}: DateTimePickerProps) {
	const { t } = useTranslation()
	const [internalOpen, setInternalOpen] = useState(false)
	const [hours, setHours] = useState(date?.getHours() || 0)
	const [minutes, setMinutes] = useState(date?.getMinutes() || 0)

	const open = isOpen !== undefined ? isOpen : internalOpen
	const setOpen = onOpenChange || setInternalOpen

	useEffect(() => {
		if (date) {
			setHours(date.getHours())
			setMinutes(date.getMinutes())
		}
	}, [date])

	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			const newDate = new Date(selectedDate)
			newDate.setHours(hours)
			newDate.setMinutes(minutes)
			onDateChange(newDate)
		} else {
			onDateChange(undefined)
		}
	}

	const handleTimeChange = (newHours: number, newMinutes: number) => {
		setHours(newHours)
		setMinutes(newMinutes)

		if (date) {
			const newDate = new Date(date)
			newDate.setHours(newHours)
			newDate.setMinutes(newMinutes)
			onDateChange(newDate)
		}
	}

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation()
		onDateChange(undefined)
		setHours(0)
		setMinutes(0)
	}

	return (
		<div className='flex flex-col gap-2'>
			{label && <Label>{label}</Label>}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						className={cn(
							'relative justify-start px-3 font-normal',
							!date && 'text-muted-foreground',
							date && 'pr-10'
						)}
					>
						<CalendarIcon className='size-4' />
						{date ? (
							format(date, 'dd.MM.yyyy HH:mm')
						) : (
							<span>{placeholder ?? 'dd.mm.yyyy'}</span>
						)}
						{date && (
							<span
								onClick={handleClear}
								className='absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md bg-destructive text-white hover:bg-destructive/90'
							>
								<X className='size-3' />
							</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-auto p-0' align='start'>
					<Calendar
						mode='single'
						selected={date}
						onSelect={handleDateSelect}
						initialFocus
						className='rounded-lg border-0'
					/>
					<div className='border-t bg-background p-3'>
						{/*<Label className='mb-2 block text-sm font-medium'>Time</Label>*/}
						<div className='flex items-center gap-2'>
							<div className='flex-1'>
								<Label htmlFor='hours' className='sr-only'>
									{t('Global.time.hours')}
								</Label>
								<Input
									id='hours'
									type='number'
									min='0'
									max='23'
									value={hours.toString().padStart(2, '0')}
									onChange={(e) => {
										const val = Number.parseInt(e.target.value) || 0
										const clampedVal = Math.max(0, Math.min(23, val))
										handleTimeChange(clampedVal, minutes)
									}}
									className='text-center'
									placeholder='hh'
								/>
							</div>
							<span className='text-xl font-semibold'>:</span>
							<div className='flex-1'>
								<Label htmlFor='minutes' className='sr-only'>
									{t('Global.time.min')}
								</Label>
								<Input
									id='minutes'
									type='number'
									min='0'
									max='59'
									value={minutes.toString().padStart(2, '0')}
									onChange={(e) => {
										const val = Number.parseInt(e.target.value) || 0
										const clampedVal = Math.max(0, Math.min(59, val))
										handleTimeChange(hours, clampedVal)
									}}
									className='text-center'
									placeholder='mm'
								/>
							</div>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
