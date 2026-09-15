export class Config {
    static getConfig() {
        const currentHost = window.location.hostname;
        const currentPort = window.location.port || '9093';
        return {
            baseUrl: `http://${currentHost}:${currentPort}`,
        };
    }
}
//# sourceMappingURL=Config.js.map