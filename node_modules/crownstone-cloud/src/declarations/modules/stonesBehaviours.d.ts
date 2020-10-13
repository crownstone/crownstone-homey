interface stonesBehaviours_cloudModule {
    createBehaviour: (data: any) => Promise<any>;
    updateBehaviour: (cloudBehaviourId: string, data: any) => Promise<any>;
    deleteBehaviour: (cloudBehaviourId: string) => Promise<any>;
    deleteAllBehaviours: () => Promise<any>;
    getBehaviours: () => Promise<any>;
}
