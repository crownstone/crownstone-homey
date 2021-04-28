'use strict';

const Homey = require('homey');
const crypto = require('crypto');

/**
 * The driver is called to list the devices when a user starts to use the app for the first time. It will query
 * the cloud for a list of Crownstone devices. For that it will get a particular sphere (indicated by the location
 * of the user's smartphone).
 */
class CrownstoneDriver extends Homey.Driver {

	/**
	 * This method is called when the Driver is initialized.
	 */
	onInit() {
		console.log('Crownstone driver has been initialized');
	}

	/**
	 * This method will control the views which are shown to the user.
	 * The session property passed in onPair can control the front-end programmatically.
	 */
	async onPair(session) {

		/**
		 * We call Homey.showView from the confirmation view. If a user clicks the 'next' button we want to navigate to
		 * 'list_devices'. If a user clicks the 'logout' button, we navigate to 'login_credentials'.
		 *
		 * Note that for a lot of views there is already a default Homey view defined.
		 */
		session.setHandler('showView', async (viewId) => {
			if (viewId === 'loading') {
				console.log('Loading');
				if (this.homey.app.loginState) {
					console.log('Show view confirmation');
					try {
						await session.showView('confirmation');
					}
					catch(e) {
						console.log('Error in showing confirmation view');
						this.error(e);
						throw e;
					}
				}
				else {
					console.log('Show view login credentials');
					try {
						await session.showView('login_credentials');
					}
					catch(e) {
						console.log('Error in showing login view');
						this.error(e);
						throw e;
					}
				}
			}
			if (viewId === 'login') {
				console.log('Login or logged in');
			}
			if (viewId === 'login_credentials') {
				console.log('Set fields for login form');
				this.homey.settings.set('email', '');
				this.homey.settings.set('password', '');
				this.homey.app.loginState = false;
			}
			if (viewId === 'list_devices') {
				console.log('List devices (view shown as template)');
			}
			if (viewId === 'add_devices') {
				console.log('Add devices (view shown as template)');
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
				loggedIn = await this.homey.app.setSettings(username, passwordHash);
			}
			catch(e) {
				console.log('Error in logging in');
				this.error(e);
				throw e;
			}

			if (!loggedIn) {
				console.log('Failure logging in');
				let e = new Error('Failure logging in');
				this.error(e);
				throw e;
			}

			return loggedIn;
		});

		/**
		 * This view should appear after the user has been logged in. After this 'add_devices' and 'done' are
		 * templates from Homey and should automatically guide the user further.
		 */
		session.setHandler('list_devices', async (data) => {
			let deviceList = [];

			if (!this.homey.app.loggedIn) {
				console.log('Not logged in');
				return deviceList;
			}
			
			// emit when devices are still being searched
			session.emit('list_devices', deviceList);

			// get sphere required before getting Crownstones
			console.log('Get spheres');
			try {
				await this.homey.app.syncer.getSpheres();
			}
			catch(e) {
				this.error(e);
				throw e;
			}
			
			console.log('Get Crownstones from cloud..');
			try {
				await this.homey.app.syncer.getCrownstones();
			}
			catch(e) {
				this.error(e);
				throw e;
			}

			console.log('Extract devices');
			deviceList = this.homey.app.mapper.extractDevices();
			console.log('Return devices');
			return deviceList;
		});
	}
}

module.exports = CrownstoneDriver;
