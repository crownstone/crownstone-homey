/**
 * A slow cache (an in-memory database) that stores cloud objects directly without optimizing for access or optimizing
 * for entities as used by smart hubs.
 */
export class SlowCache {

	spheres:        cloud_Spheres = {};
	sphereUsers:    cloud_SphereUsers = {};
	sphereStones:   cloud_SphereStones = {}
	spherePresence: cloud_SpherePresence = {};
	locations:      cloud_Locations = {};
	users:          cloud_Users = {};

	locationsAvailable(): boolean {
		return (this.locations && Object.keys(this.locations).length > 0);
	}
	
	spheresAvailable(): boolean {
		return (this.spheres && Object.keys(this.spheres).length > 0);
	}

	/**
	 * A sphere can be easily be obtained by "id", namely through spheres[id], but the event server does only know
	 * the "uid", so we have to iterate the array for that.
	 */
	sphereByUid(uid: number): cloud_Sphere | undefined {
		for (const sphereId in this.spheres) {
			if (this.spheres[sphereId].uid = uid) {
				return this.spheres[sphereId];
			}
		}
		return undefined;
	}

	sphereUidToId(uid: number): string | undefined {
		for (const sphereId in this.spheres) {
			if (this.spheres[sphereId].uid = uid) {
				return sphereId;
			}
		}
		return undefined;
	}
}

