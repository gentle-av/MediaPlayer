export interface Component {
  render(targetElement: HTMLElement | null): Promise<HTMLElement | null>;
  dispose(): void;
}
