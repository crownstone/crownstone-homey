import { CrownstoneSSE } from 'crownstone-sse';

/**
 * Should handle events from the Crownstone event server as e.g. described on
 *   https://github.com/crownstone/crownstone-lib-nodejs-sse.
 */
export class ServerEvents {

	app: crownstone_App;
	sse: CrownstoneSSE;

	constructor(app: crownstone_App, sse: CrownstoneSSE ) {
		this.app = app;
		this.sse = sse;
	}

	/**
	 * This function will stop the code that listens to SSE events from the SSE server, authenticate and start
	 * listening again.
	 */
	async login(email: string, password: string) {
		await this.sse.stop();
		await this.sse.loginHashed(email, password);
		await this.sse.start(this.sseEventHandler);
	}
	
	/**
	 * The sseEventHandler receives events from the sse-server and fires the runLocationTrigger-function
	 * when a user enters or leaves a room.
	 * todo: when the state of a Crownstone changes outside of the app, update the capabilityValue.
	 *
	 * Incoming events from the event server are of form (exit event example):
	 *   {
	 *     type: 'presence',
	 *     subType: 'exitLocation',
	 *     sphere: { id: '$sphereId', name: '$sphereName', uid: 1 },
	 *     location: { id: '$locationId', name: '$locationName' },
	 *     user: { id: '$userId', name: '$userName' }
	 *   }
	 */
	sseEventHandler = (data: any) => {
		//console.log(data);
		switch(data.type) {
		// e.g. stream starting
		case 'system':
			break;
		// anything w.r.t. presence of people
		case 'presence':
			switch(data.subType) {
			case 'enterLocation':
				this.app.runLocationTrigger(data, true);
				break;
			case 'exitLocation':
				this.app.runLocationTrigger(data, false);
				break;
			}
			break;
		case 'dataChange':
			switch(data.subType) {
			// deletion and addition of Crownstones
			case 'stones':
				switch(data.operation) {
				case 'create': {
					console.log('Create Crownstone event');
					console.log(data);
					let deviceId = data.changedItem.id;
					// we get the new item from the cloud
					let sphereUid = data.sphere.uid;
					let sphereId = this.app.slowCache.sphereByUid(data.sphere.uid);
					if (sphereId) {
						this.app.mirror.getCrownstone(sphereId, deviceId);
					} else {
						// just get all spheres and devices
						this.app.mirror.getSpheres();
						this.app.mirror.getDevices();
					}
					this.app.mapper
					//this.app.deviceManager.addDevice(deviceId);
					break;
				}
				case 'update': {
					console.log('Update Crownstone event');
					let deviceId = data.changedItem.id;
					this.app.deviceManager.updateCrownstoneCapabilities(deviceId);
					break;
				}
				case 'delete': {
					console.log('Delete Crownstone event');
					let deviceId = data.changedItem.id;
					this.app.deviceManager.deleteDevice(deviceId);
					break;
				}
				}
				break;
			}
			break;
		case 'abilityChange':
			switch(data.subType) {
			case 'dimming':
				console.log('Ability change event');
				let deviceId = data.stone.id;
				let dimAbilityState = data.ability.enabled;
				this.app.deviceManager.setDimmingAbilityState(deviceId, dimAbilityState);
				break;
			}
			break;
		case 'switchStateUpdate':
			switch(data.subType) {
			case 'stone':
				console.log('Update status of Crownstone');
				let deviceId = data.crownstone.id;
				let device = this.app.deviceManager.getDevice(deviceId);
				if (device) {
					// @ts-ignore
					device.changeOnOffStatus(data.crownstone.percentage);
				}
				break;
			}
			break;
		case 'command':
			switch(data.subType) {
			case 'multiSwitch':
				// this is only a "command" we have to react to a "switchStateUpdate", not a "command"
				break;
			}
			break;
		}
	};

}
