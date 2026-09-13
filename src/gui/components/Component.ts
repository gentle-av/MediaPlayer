export interface Component {
  render(
    targetElement: HTMLElement | null,
    filterTerm?: string,
  ): Promise<HTMLElement | null>;

  dispose(): void;
}
