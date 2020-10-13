interface spheres_cloudModule {
    updateSphere: (cloudSphereId: string, data: any) => any;
    inviteUser: (email: any, permission?: string) => any;
    getPendingSphereInvites: () => any;
    resendInvite: (email: any) => any;
    revokeInvite: (email: any) => any;
    /**
     *
     * @returns {*}
     */
    getSpheres: () => any;
    getUsers: () => any;
    getAdmins: () => any;
    getMembers: () => any;
    getGuests: () => any;
    getToons: () => any;
    getPresentPeople: (ignoreDeviceId: string) => any;
    createSphere: (data: any) => any;
    changeSphereName: (sphereName: any) => any;
    changeUserAccess: (email: any, accessLevel: any) => any;
    updateFloatingLocationPosition: (data: any) => any;
    deleteUserFromSphere: (userId: string) => any;
    deleteSphere: () => Promise<any>;
    _deleteSphere: (cloudSphereId: string) => any;
    leaveSphere: (cloudSphereId: string) => any;
    acceptInvitation: () => any;
    declineInvitation: () => any;
    getSphereAuthorizationTokens: (sphereId?: string) => any;
}
