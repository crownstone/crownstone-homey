import Homey, { PairSession } from 'homey';
import crypto from 'crypto';

/**
 * The driver is called to list the devices when a user starts to use the app for the first time. It will query
 * the cloud for a list of Crownstone devices. For that it will get a particular sphere (indicated by the location
 * of the user's smartphone).
 */
class CrownstoneDriver extends Homey.Driver implements crownstone_Driver {

	app: crownstone_App;

	/**
	 * This method is called when the Driver is initialized.
	 */
	async onInit() {
		console.log('Crownstone driver has been initialized');

		// @ts-ignore
		this.app = this.homey.app;
	}

	/**
	 * Get the message for the user as defined in locales/(lang}.json given an identifier.
	 */
	getInternationalizedMessage(messageId: string) {
		// @ts-ignore
		return this.homey.__(messageId);
	}

	/**
	 * This method will control the views which are shown to the user.
	 * The session property passed in onPair can control the front-end programmatically.
	 */
	async onPair(session: PairSession) {
		
		console.log('Crownstone driver pairing session');

		/**
		 * We call Homey.showView from the confirmation view. If a user clicks the 'next' button we want to navigate to
		 * 'list_devices'. If a user clicks the 'logout' button, we navigate to 'login_credentials'.
		 *
		 * Note that for a lot of views there is already a default Homey view defined.
		 */
		session.setHandler('showView', async (viewId) => {
			console.log('Show view: ' + viewId);
			if (viewId === 'starting') {
				if (this.app.loggedIn) {
					console.log('Logged in, show view to confirm');
					try {
						// @ts-ignore
						await session.showView('confirmation');
					}
					catch(e) {
						// The error we get, we pass through to the user (unchanged).
						console.log('Error in showing confirmation view');
						this.error(e);
						throw e;
					}
				}
				else {
					console.log('Not logged in, show view to login');
					try {
						// @ts-ignore
						await session.showView('login_credentials');
					}
					catch(e) {
						// The error we get, we pass through to the user (unchanged).
						console.log('Error in showing login view');
						this.error(e);
						throw e;
					}
				}
			}
			if (viewId === 'confirmation') {
				// will show confirmation dialog
			}
			if (viewId === 'login') {
				console.log('Login or logged in');
			}
			if (viewId === 'login_credentials') {
				console.log('Set fields for login form');
				this.homey.settings.set('email', '');
				this.homey.settings.set('password', '');
				this.app.loggedIn = false;
			}
			if (viewId === 'list_devices') {
				console.log('List devices (view shown as template)');
			}
			if (viewId === 'loading') {
				console.log('Loading the rest of cloud data');
				await this.app.mirror.getLocations();
				await this.app.mirror.getUsers();
				await this.app.mirror.getPresence();
				this.app.mapper.mapRooms();
				this.app.mapper.mapUsers();
				// @ts-ignore
				await session.nextView();
			}
			if (viewId === 'add_devices') {
				console.log('Add devices (view shown as template)');
				// @ts-ignore
				await session.nextView();
			}
			if (viewId === 'done') {
				console.log('Done');
			}
		});

		/**
		 * This view will appear when the user is not yet logged in.
		 */
		session.setHandler('login', async (data) => {
			console.log('Log in as ' + data.username);

			let username = data.username;
			let shasum = crypto.createHash('sha1');
			shasum.update(String(data.password));
			let passwordHash = shasum.digest('hex');
			let loggedIn = false;
			try {
				// @ts-ignore
				loggedIn = await this.app.setSettings(username, passwordHash);
			}
			catch(e) {
				// The error we get, we pass through to the user (unchanged).
				console.log('Error in logging in');
				this.error(e);
				throw e;
			}

			if (!loggedIn) {
				console.log('Failure logging in');
				this.getInternationalizedMessage('failureLoggingIn');
				let e = new Error('Failure logging in. Please, try again.');
				throw e;
			}

			return loggedIn;
		});

		/**
		 * This view should appear after the user has been logged in. After this 'add_devices' and 'done' are
		 * templates from Homey and should automatically guide the user further.
		 */
		session.setHandler('list_devices', async (data) => {
			let deviceList = this.app.fastCache.deviceList;

			if (!this.app.loggedIn) {
				console.log('Not logged in');
				return deviceList;
			}
			
			// emit when devices are still being searched
			// @ts-ignore
			session.emit('list_devices', deviceList);

			// get spheres and Crownstones (not needed to get everything, will delay GUI a lot)
			console.log('Get spheres and Crownstones');
			try {
				await this.app.mirror.getSpheres();
				await this.app.mirror.getCrownstones();
			}
			catch(e) {
				this.error(e);
				throw e;
				return deviceList;
			}
			
			console.log('Map devices to proper struct');
			this.app.mapper.mapDevices();
			
			// Return list of devices
			deviceList = this.app.fastCache.deviceList;
			console.log('Return devices');
			return deviceList;
		});
	}
}

module.exports = CrownstoneDriver;
