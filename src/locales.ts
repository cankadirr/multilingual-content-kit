export type LocaleConfig<L extends string> = {
  readonly locales: readonly L[];
  readonly defaultLocale: L;
  readonly fallbacks: Readonly<Partial<Record<L, readonly L[]>>>;
};

export function defineLocales<const L extends string>(config: LocaleConfig<L>): LocaleConfig<L> {
  if (!config.locales.includes(config.defaultLocale)) {
    throw new Error(`defaultLocale "${config.defaultLocale}" is not listed in locales`);
  }
  for (const [from, chain] of Object.entries(config.fallbacks) as [L, readonly L[] | undefined][]) {
    for (const target of chain ?? []) {
      if (!config.locales.includes(target)) {
        throw new Error(`fallback "${target}" for "${from}" is not listed in locales`);
      }
      if (target === from) {
        throw new Error(`locale "${from}" cannot fall back to itself`);
      }
    }
  }
  return config;
}

export function isLocale<L extends string>(config: LocaleConfig<L>, value: string): value is L {
  return (config.locales as readonly string[]).includes(value);
}

/** Requested locale first, then its explicit chain, then the default, without duplicates. */
export function fallbackChain<L extends string>(config: LocaleConfig<L>, requested: L): L[] {
  const chain = [requested, ...(config.fallbacks[requested] ?? []), config.defaultLocale];
  return [...new Set(chain)];
}
