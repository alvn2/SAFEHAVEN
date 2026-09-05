import '@vitest/expect';

declare module '@vitest/expect' {
  interface Matchers<T = any> {
    toBeInTheDocument(): void;
    toBeDisabled(): void;
    toBeEnabled(): void;
    toBeVisible(): void;
    toBeEmptyDOMElement(): void;
    toHaveTextContent(text: string | RegExp): void;
    toHaveValue(value: string | string[] | number): void;
    toHaveClass(...classNames: string[]): void;
  }
}
