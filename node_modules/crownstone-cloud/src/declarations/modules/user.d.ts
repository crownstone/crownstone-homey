interface user_cloudModule {
    /**
     *
     * @param options
     * @returns {Promise}
     */
    registerUser: (options: any) => Promise<any>;
    /**
     *
     * @param options
     * {
     *   email: string,
     *   password: string,
     *   onUnverified: callback,
     *   onInvalidCredentials: callback,
     * }
     *
     * resolves with the parsed data, rejects with {status: httpStatus, data: data}
     */
    login: (options: any) => Promise<any>;
    /**
     *
     * @param file {String} --> full path string.
     */
    setEarlyAccess: (level: any) => Promise<any>;
    removeProfileImage: (options?: any) => Promise<any>;
    /**
     *
     * @returns {*}
     */
    getUserData: () => Promise<any>;
    getUserId:   () => Promise<string>;
    /**
     *
     * @returns {*}
     */
    getPendingInvites: () => Promise<any>;
    /**
     *
     * @param data

     * @returns {Promise}
     */
    updateUserData: (data: any) => Promise<any>;
    /**
     *
     * @param options
     */
    requestVerificationEmail: (options?: any) => Promise<any>;
    /**
     *
     * @param options
     */
    requestPasswordResetEmail: (options?: any) => Promise<any>;
    getKeys: (cloudSphereId?: any, cloudStoneId?: any) => Promise<any>;
}
