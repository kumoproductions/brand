import React from 'react';

const ASSETS = {
  'symbol':            { src: 'assets/svg/symbol-central.svg', ratio: 375.9 / 397.2 },
  'primary':           { src: 'assets/svg/logotype-primary.svg', ratio: 264.0 / 34.6 },
  'primary-tm':        { src: 'assets/svg/logotype-primary-tm.svg', ratio: 271.7 / 34.6 },
  'secondary':         { src: 'assets/svg/logotype-secondary.svg', ratio: 261.6 / 40.3 },
  'secondary-tm':      { src: 'assets/svg/logotype-secondary-tm.svg', ratio: 261.6 / 40.3 },
  'tertiary':          { src: 'assets/svg/logotype-tertiary.svg', ratio: 125.9 / 41.1 },
  'tertiary-tm':       { src: 'assets/svg/logotype-tertiary-tm.svg', ratio: 131.4 / 41.1 },
  'abbreviation':      { src: 'assets/svg/logotype-abbreviation.svg', ratio: 95.6 / 28.8 },
  'abbreviation-tm':   { src: 'assets/svg/logotype-abbreviation-tm.svg', ratio: 95.8 / 28.8 },
  'microspace':        { src: 'assets/svg/logotype-microspace.svg', ratio: 84.6 / 14.5 },
  'microspace-tm':     { src: 'assets/svg/logotype-microspace-tm.svg', ratio: 92.1 / 14.5 }
};

/** basePath: prefix to reach the project root from the consuming page (e.g. '../../'). */
export function KumoLogo({ variant = 'primary-tm', height = 20, inverse = false, basePath = '', style }) {
  const a = ASSETS[variant] || ASSETS['primary-tm'];
  return (
    <img
      src={basePath + a.src}
      alt={variant === 'symbol' ? 'kumo™ symbol' : 'kumo.productions™'}
      style={{ height, width: height * a.ratio, display: 'block', filter: inverse ? 'invert(1)' : 'none', ...style }}
    />
  );
}
