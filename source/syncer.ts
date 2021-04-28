import { Cache } from './cache';
import { CrownstoneCloud } from 'crownstone-cloud';

/**
 * Syncs from the cloud
 */
export class Syncer {
	cloud: CrownstoneCloud;
	cache: Cache;
	isLoggedIn: boolean;

	constructor(cloud: CrownstoneCloud, cache: Cache) {
		this.cloud = cloud;
		this.cache = cache;
		this.isLoggedIn = false;
	}

	/**
	 * Log in to the Crownstone cloud server
	 */
	async login(email: string, password: string) {
		try {
			await this.cloud.loginHashed(email, password);
			this.isLoggedIn = true;
		}
		catch(e) {
			console.log('There was a problem making a connection to the cloud:', e);
		}
	}

	/**
	 * Get spheres object filled.
	 */
	async getSpheres() {
		if (!this.isLoggedIn) {
			console.log("Not logged in");
			return;
		}

		console.log('Get spheres');
		//if (this.cache.spheres) {
		//	console.log('Spheres already obtained');
		//	return;
		//}

		try {
			let spheres = await this.cloud.spheres();
			this.cache.spheres = Object.fromEntries(
				spheres.map(e => [e.id, e])
			)
		}
		catch(e) {
			console.log('Could not get spheres from the cloud', e);
		}
		
		for (const sphereId in this.cache.spheres) {
			console.log('Found sphere ' + sphereId);
		}

		if (!this.cache.spheres) {
			console.log('Unable to find spheres');
		}
	}

	/**
	 * Get all crownstones from the cloud.
	 */
	async getCrownstones() {
		if (!this.isLoggedIn) {
			console.log("Not logged in");
			return;
		}
		console.log('Get Crownstone devices');

		for (const sphereId in this.cache.spheres) {

			if (this.cache.sphereStones[sphereId]) {
				console.log('Crownstones already obtained for sphere ' + sphereId);
				continue;
			}

			try {
				const crownstones = await this.cloud.sphere(sphereId).crownstones();
				this.cache.sphereStones[sphereId] = crownstones;
			} catch(e) {
				console.log('Could not get crownstones for sphere: ' + sphereId, e);
			}
		}
	}

	/**
	 * Get all possible locations. This can be done at once for all spheres.
	 */
	async getLocations() {
		if (!this.isLoggedIn) {
			console.log("Not logged in");
			return;
		}

		console.log('Get locations');
		//if (this.cache.locations) {
		//	console.log('Locations already obtained');
		//	return;
		//}

		try {
			const locations = await this.cloud.locations();
			this.cache.locations = Object.fromEntries(
				locations.map(e => [e.id, e])
			)
		}
		catch(e) {
			console.log('Could not get locations from the cloud', e);
		}

		if (!this.cache.locations) {
			console.log('Unable to find locations');
		}
	}

	/**
	 * Get all the users per sphere. Add them to the already existing array of spheres.
	 */
	async getUsers() {
		if (!this.isLoggedIn) {
			console.log("Not logged in");
			return;
		}
		console.log('Get users');

		for (const sphereId in this.cache.spheres) {

			if (this.cache.sphereUsers && this.cache.sphereUsers[sphereId]) {
				console.log('Users already obtained for sphere ' + sphereId);
				continue;
			}

			try {
				const users = await this.cloud.sphere(sphereId).users();
				this.cache.sphereUsers[sphereId] = users;
			}
			catch(e) {
				console.log('Could not get users for sphere: ' + sphereId, e);
			}
		}
	}

	/**
	 * Get all the present users per sphere.
	 * The cloud returns an array with type SpherePresentPeople[], which contains [ { "userId", "locations[]" } ].
	 * Each user can be represented by multiple devices.
	 */
	async getPresence() {
		if (!this.isLoggedIn) {
			console.log("Not logged in");
			return;
		}
		console.log("Get presence");
		
		for (const sphereId in this.cache.spheres) {
			
			if (this.cache.spherePresence && this.cache.spherePresence[sphereId]) {
				console.log('Presence already obtained for sphere ' + sphereId);
				console.log('However, get it again');
			}

			try {
				const usersPresence = await this.cloud.sphere(sphereId).presentPeople();
				this.cache.spherePresence[sphereId] = usersPresence;
			}
			catch(e) {
				console.log('Could not get presence data for sphere: ' + sphereId, e);
			}
		}
	}

}
