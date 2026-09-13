export class ComponentFactory {
    constructor() {
        this.registries = new Map();
    }
    register(tab, creator) {
        this.registries.set(tab, creator);
    }
    create(tab) {
        const creator = this.registries.get(tab);
        if (!creator) {
            throw new Error(`Component for tab "${tab}" is not registered`);
        }
        return creator();
    }
}
//# sourceMappingURL=ComponentFactory.js.map