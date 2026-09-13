import { Component } from './Component.js';

export type TabType = 'video' | 'audio' | 'settings';

export class ComponentFactory {
  private readonly registries = new Map<TabType, () => Component>();

  public register(tab: TabType, creator: () => Component): void {
    this.registries.set(tab, creator);
  }

  public create(tab: TabType): Component {
    const creator = this.registries.get(tab);
    if (!creator) {
      throw new Error(`Component for tab "${tab}" is not registered`);
    }
    return creator();
  }
}
