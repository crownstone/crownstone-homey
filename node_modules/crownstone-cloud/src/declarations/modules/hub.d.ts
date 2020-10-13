interface hub_cloudModule {
    hubLogin:    (hubId: string, hubToken: any) => Promise<any>;
    updateHubIP: (ips: string) => Promise<void>;
}
