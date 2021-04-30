interface homey_Room {
	id: string;
	name: string;
	icon: string;
}

interface homey_User {
	id: string;
	name: string;
}

interface homey_Device {
	name: string;
	data: {
		id: string;
	}
	icon: string;
	store: {
		address: string;
		locked: boolean;
		dimmerEnabled: boolean;
		activeConnection: boolean;
		deleted: boolean;
		sphereId: string;
	}
}

