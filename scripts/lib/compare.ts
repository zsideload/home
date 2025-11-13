const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export const aNewerThanB = (a: string, b: string) => collator.compare(a, b) > 0;
