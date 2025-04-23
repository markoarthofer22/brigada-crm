'use client'

import { useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'

interface StopwatchProps {
	startDate: string
	className?: string
}

export default function Stopwatch({ startDate, className }: StopwatchProps) {
	const [elapsedSeconds, setElapsedSeconds] = useState(() =>
		differenceInSeconds(new Date(), new Date(startDate))
	)

	useEffect(() => {
		const interval = setInterval(() => {
			setElapsedSeconds(differenceInSeconds(new Date(), new Date(startDate)))
		}, 1000)

		return () => clearInterval(interval)
	}, [startDate])

	const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0')
	const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(
		2,
		'0'
	)
	const seconds = String(elapsedSeconds % 60).padStart(2, '0')

	return (
		<span className={className}>
			{hours}:{minutes}:{seconds}
		</span>
	)
}
