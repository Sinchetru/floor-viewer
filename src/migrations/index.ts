import * as migration_20260415_192300 from './20260415_192300';

export const migrations = [
  {
    up: migration_20260415_192300.up,
    down: migration_20260415_192300.down,
    name: '20260415_192300'
  },
];
