import { Mapper } from './mapper';

/**
 * Handles incoming Homey events and updates Homey the other way around as well.
 *
 * This class stores a list of users with their locations in "user_in_room".
 */
export class Handler {
	homey: any;
	mapper: Mapper;
	presenceTrigger: any;
	presenceCondition: any;
	
	presence: user_in_room = {};

	constructor(homey: any, mapper: Mapper) {
		this.homey = homey;
		this.mapper = mapper;
	}

	onInit() {
		this.presenceTrigger = this.homey.flow.getTriggerCard('user_enters_room');
		this.presenceCondition = this.homey.flow.getConditionCard('user_presence');

		/**
		 * This code runs when a trigger has been fired. If the room id and user id are equal, the flow will run.
		 */
		this.presenceTrigger.registerRunListener(async (
			args: {
				rooms: { id: string; };
				users: { id: string; };
			},
			state: { locationId: string; userId: string; }
		) => {
			return (
				args.rooms.id === state.locationId &&
				args.users.id === state.userId ||
				args.users.id === 'default'
			)
		});

		/**
		 * This code runs after a trigger has been fired and a condition-card is configured in the flow.
		 * If the room id and user id are equal to the name and id from the room the user is currently in, the flow
		 * will run.
		 */
		this.presenceCondition.registerRunListener(async (
			args: {
				users: { id: string; };
				rooms: { id: string; };
			}
		) => {
			let userId = args.users.id;
			let roomId = args.rooms.id;

			// run the flow if the room exists (and no specific user has been specified)
			if (userId === 'default') {
				return this.mapper.roomExists(roomId);
			}

			return (this.presence[userId] === roomId);
		});

		/**
		 * This code runs when a flow is being constructed for a trigger-card, and a room should be selected.
		 * This code returns a list of rooms in a sphere which is shown to the user.
		 */
		this.presenceTrigger.getArgument('rooms').registerAutocompleteListener(() => {
			console.log('Extract rooms for presence trigger');
			return this.mapper.extractRooms();
		});

		/**
		 * This code runs when a flow is being constructed for a trigger-card, and a user should be selected.
		 * This code returns a list of users in a sphere.
		 */
		this.presenceTrigger.getArgument('users').registerAutocompleteListener(() => {
			console.log('Extract users for presence trigger');
			return this.mapper.extractUsers();
		});

		/**
		 * This code runs when a flow is being constructed for a condition-card, and a room should be selected.
		 * This code returns a list of rooms in a sphere.
		 */
		this.presenceCondition.getArgument('rooms').registerAutocompleteListener(() => {
			console.log('Extract rooms for presence condition');
			return this.mapper.extractRooms();
		});

		/**
		 * This code runs when a flow is being constructed for a condition-card, and a user should be selected.
		 * This code returns a list of users in a sphere.
		 */
		this.presenceCondition.getArgument('users').registerAutocompleteListener(() => {
			console.log('Extract users for presence condition');
			return this.mapper.extractUsers();
		});

	}

	/**
	 * Moves a user from room to another.
	 */
	async moveUser(user: homey_User, room: homey_Room) {
		let roomId = this.presence[user.id];
		let changed = (roomId !== room.id);
		
		const state = {userId: user.id, locationId: room.id};
		if (changed) {
			try {
				await this.presenceTrigger.trigger(null, state);
			}
			catch(e) {
				console.log('Cannot update presence of ' + state.userId + ' to ' + state.locationId, e);
				return;
			};
			this.presence[user.id] = room.id;
			console.log('User ' + user.name + ' now at location ' + room.name);
		}
	}

	/**
	 * Sets presence (room) to undefined. Be careful with exit events. They almost always are received after an
	 * "enter" event. Do not just casually call removeUser(userId) on an exit event.
	 */
	removeUser(userId: string) {
		delete this.presence[userId];
	}

}
