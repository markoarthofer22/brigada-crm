import axios from '@/api/axios.ts'
import { TOLERANCE } from '@/api/services/zones/const.ts'
import {
	UpsertZone,
	UpsertZoneResponseSchema,
	UpsertZoneSchema,
} from '@/api/services/zones/schema.ts'

export async function deleteZoneForProject(zoneId: number) {
	await axios.delete(`/zones/${zoneId}`)
}

export async function updateZoneForProject(model: UpsertZone) {
	const parsedData = UpsertZoneSchema.parse(model)

	const mergedPoints: { x: number; y: number }[] = []
	for (const point of parsedData.coordinates.points) {
		const exists = mergedPoints.some(
			(p) =>
				Math.abs(p.x - point.x) <= TOLERANCE &&
				Math.abs(p.y - point.y) <= TOLERANCE
		)
		if (!exists) {
			mergedPoints.push(point)
		}
	}

	const newData: UpsertZone = {
		...parsedData,
		coordinates: {
			...parsedData.coordinates,
			points: mergedPoints,
		},
	}

	const { id_zones, ...rest } = newData

	const response = id_zones
		? await axios.put(`/zones/${id_zones}`, rest)
		: await axios.post('/zones', rest)

	if (!id_zones) {
		return UpsertZoneResponseSchema.parse(response.data)
	} else {
		return newData
	}
}
