'use client';

import * as React from 'react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider as DefaultCacheProvider } from '@emotion/react';
import type { EmotionCache, Options as EmotionCacheOptions } from '@emotion/cache';

// This initialized Emotion's cache, and all related configuration, for the
// Next.js App Router.
// See https://mui.com/material-ui/guides/nextjs-app-router/#emotion-cache
export default function NextAppDirEmotionCacheProvider(props: {
  options: EmotionCacheOptions;
  children: React.ReactNode;
}) {
  const { options, children } = props;

  const [Registry] = React.useState(() => {
    const cache = createCache(options);
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return function EmotionRegistry({ children }: { children: React.ReactNode }) {
      useServerInsertedHTML(() => {
        const names = flush();
        if (names.length === 0) {
          return null;
        }
        let styles = '';
        for (const name of names) {
          styles += cache.inserted[name];
        }
        return (
          <style
            data-emotion={`${cache.key} ${names.join(' ')}`}
            dangerouslySetInnerHTML={{
              __html: styles,
            }}
          />
        );
      });

      return <DefaultCacheProvider value={cache}>{children}</DefaultCacheProvider>;
    };
  });

  return <Registry>{children}</Registry>;
}