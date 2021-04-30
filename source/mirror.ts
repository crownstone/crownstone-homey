import { SlowCache } from './slowCache';
import { CrownstoneCloud } from 'crownstone-cloud';

/**
 * Mirrors from the cloud (syncs one-way from cloud to the cache).
 *
 * See https://github.com/crownstone/crownstone-lib-nodejs-cloud for how to interface with the crownstone-cloud lib.
 */
export class Mirror {
	cloud: CrownstoneCloud;
	slowCache: SlowCache;
	isLoggedIn: boolean;

	constructor(cloud: CrownstoneCloud, slowCache: SlowCache) {
		this.cloud = cloud;
		this.slowCache = slowCache;
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
	 * Obtains everything from the cloud (might be more than you need).
	 */
	async getAll() {
		await this.getSpheres();
		await this.getLocations();
		await this.getUsers();
		await this.getPresence();
		await this.getCrownstones();
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
		//if (this.slowCache.spheres) {
		//	console.log('Spheres already obtained');
		//	return;
		//}

		try {
			let spheres = await this.cloud.spheres();
			this.slowCache.spheres = Object.fromEntries(
				spheres.map(e => [e.id, e])
			)
		}
		catch(e) {
			console.log('Could not get spheres from the cloud', e);
		}
		
		for (const sphereId in this.slowCache.spheres) {
			console.log('Found sphere ' + sphereId);
		}

		if (!this.slowCache.spheres) {
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

		for (const sphereId in this.slowCache.spheres) {

			//if (this.slowCache.sphereStones[sphereId]) {
			//	console.log('Crownstones already obtained for sphere ' + sphereId);
			//	continue;
			//}

			try {
				const crownstones = await this.cloud.sphere(sphereId).crownstones();
				this.slowCache.sphereStones[sphereId] = crownstones;
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
		//if (this.slowCache.locations) {
		//	console.log('Locations already obtained');
		//	return;
		//}

		try {
			const locations = await this.cloud.locations();
			this.slowCache.locations = Object.fromEntries(
				locations.map(e => [e.id, e])
			)
		}
		catch(e) {
			console.log('Could not get locations from the cloud', e);
		}

		if (!this.slowCache.locations) {
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

		for (const sphereId in this.slowCache.spheres) {

			if (this.slowCache.sphereUsers && this.slowCache.sphereUsers[sphereId]) {
				console.log('Users already obtained for sphere ' + sphereId);
				continue;
			}

			try {
				const users = await this.cloud.sphere(sphereId).users();
				this.slowCache.sphereUsers[sphereId] = users;
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
		
		for (const sphereId in this.slowCache.spheres) {
			
			if (this.slowCache.spherePresence && this.slowCache.spherePresence[sphereId]) {
				console.log('Presence already obtained for sphere ' + sphereId);
				console.log('However, get it again');
			}

			try {
				const usersPresence = await this.cloud.sphere(sphereId).presentPeople();
				this.slowCache.spherePresence[sphereId] = usersPresence;
			}
			catch(e) {
				console.log('Could not get presence data for sphere: ' + sphereId, e);
			}
		}
	}

	/**
	 * If we already know which crownstone to obtain we can immediately use this.
	 */
	async getCrownstone(sphereId: string, crownstoneId: string) {

		let sphere = this.slowCache.spheres[sphereId];

		if (!sphere) {
			// TODO: this gets all spheres from the cloud (not just the one that needs updated)
			this.getSpheres();
			sphere = this.slowCache.spheres[sphereId];
			if (!sphere) {
				console.log("This sphere id is not present in the cloud");
				return;
			}
		}

		// TODO: there's no method to only get the data of a single Crownstone, we'll just get them all
		try {
			const crownstones = await this.cloud.sphere(sphereId).crownstones();
			this.slowCache.sphereStones[sphereId] = crownstones;
		} catch(e) {
			console.log('Could not get crownstones for sphere: ' + sphereId, e);
		}

	}
}
