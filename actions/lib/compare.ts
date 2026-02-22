const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export const aNewerThanB = (a: string, b: string) => {
  a = a.replace(".ipa", "");
  b = b.replace(".ipa", "");
  return collator.compare(a, b) > 0;
};

export const sortAsc = (a: string, b: string) => collator.compare(a, b);
export const sortDesc = (a: string, b: string) => collator.compare(b, a);
