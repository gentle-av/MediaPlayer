export class Config {
    static getConfig() {
        const currentHost = window.location.hostname;
        return {
            baseUrl: `http://${currentHost}:9093`,
        };
    }
}
//# sourceMappingURL=Config.js.map