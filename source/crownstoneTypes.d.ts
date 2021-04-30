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

type user_in_room = Record<user_id, location_id>;

interface crownstone_Device extends Device {
}

interface crownstone_Driver extends Driver {
}

interface crownstone_App extends App {
	slowCache: SlowCache;
	fastCache: FastCache;
	cloud: CrownstoneCloud;
	sse: CrownstoneSSE;
	deviceManager: DeviceManager;
	mirror: Mirror;
	mapper: Mapper;
	handler: Handler;
	loggedIn: boolean;

	runLocationTrigger;
}
