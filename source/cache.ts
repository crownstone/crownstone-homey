/*
 * An in-memory database.
 */

type sphere_id = string;
type stone_id = string;
type location_id = string;
type user_id = string;

type cloud_Spheres = Record<sphere_id, cloud_Sphere>;
type cloud_SphereUsers = Record<sphere_id, cloud_sphereUserDataSet>;
type cloud_SphereStones = Record<sphere_id, cloud_Stone[]>;
type cloud_Locations = Record<location_id, cloud_Location>;
type cloud_Users = Record<user_id, cloud_User>;
type cloud_SpherePresence = Record<sphere_id, SpherePresentPeople[]>;

export class Cache {

	spheres:        cloud_Spheres = {};
	sphereUsers:    cloud_SphereUsers = {};
	sphereStones:   cloud_SphereStones = {}
	spherePresence: cloud_SpherePresence = {};
	locations:      cloud_Locations = {};
	users:          cloud_Users = {};

	locationsAvailable() {
		return (this.locations && Object.keys(this.locations).length > 0);
	}
	
	spheresAvailable() {
		return (this.spheres && Object.keys(this.spheres).length > 0);
	}

}

