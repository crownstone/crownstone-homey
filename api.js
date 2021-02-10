'use strict';

const Homey = require('homey');

module.exports = [
    {
        method: 'PUT',
        path: '/',
        fn: async function(args, callback){
            const result = await Homey.app.setSettings(args.body.email, args.body.password);
            callback(null, result);
        }
    },
    // {
    //     method: 'PUT',
    //     path: '/logout',
    //     fn: {
    //
    //     } //function
    // },
]