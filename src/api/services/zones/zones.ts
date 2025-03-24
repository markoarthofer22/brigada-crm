import axios from '@/api/axios.ts'
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

	const { id_zones, ...rest } = parsedData

	const response = id_zones
		? await axios.put(`/zones/${id_zones}`, rest)
		: await axios.post('/zones', rest)

	if (!id_zones) {
		return UpsertZoneResponseSchema.parse(response.data)
	} else {
		return parsedData
	}
}
