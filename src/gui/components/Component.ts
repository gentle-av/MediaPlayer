export interface Component {
  render(targetElement: HTMLElement | null): Promise<HTMLElement | null>;
  onActivate?(): void | Promise<void>;
  dispose(): void;
}
