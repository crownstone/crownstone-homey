interface homey_Room {
	id: string,
	name: string,
	icon: string,
}

interface homey_User {
	id: string;
	name: string;
}

type user_in_room = Record<user_id, location_id>;

interface Crownstone_Device extends Device {

}
