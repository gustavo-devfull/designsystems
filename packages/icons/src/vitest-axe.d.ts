import "vitest";

// vitest-axe's own typings target the legacy `Vi` namespace; Vitest 3 needs module augmentation.
declare module "vitest" {
  // Type parameter must mirror Vitest's own declaration for the interfaces to merge.
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
  interface Assertion<T = any> {
    toHaveNoViolations: () => void;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
  interface AsymmetricMatchersContaining {
    toHaveNoViolations: () => void;
  }
}
