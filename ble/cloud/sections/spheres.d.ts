export declare const spheres: {
    updateSphere: (cloudSphereId: any, data: any, background?: boolean) => any;
    inviteUser: (email: any, permission?: string) => any;
    getPendingInvites: (background?: boolean) => any;
    resendInvite: (email: any, background?: boolean) => any;
    revokeInvite: (email: any, background?: boolean) => any;
    getSpheres: (background?: boolean) => any;
    getUsers: (background?: boolean) => any;
    getAdmins: (background?: boolean) => any;
    getMembers: (background?: boolean) => any;
    getGuests: (background?: boolean) => any;
    createSphere: (data: any, background?: boolean) => any;
    changeSphereName: (sphereName: any) => any;
    changeUserAccess: (email: any, accessLevel: any, background?: boolean) => any;
    deleteUserFromSphere: (userId: any) => any;
    deleteSphere: () => Promise<any>;
    _deleteSphere: (cloudSphereId: any) => any;
    leaveSphere: (cloudSphereId: any) => any;
};
