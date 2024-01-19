export enum Theme {
  Light = 'Light',
  Dark = 'Dark',
  System = 'System'
}

export function str2theme(name: string): Theme {
  switch (name) {
    case 'Light':
      return Theme.Light;
    case 'Dark':
      return Theme.Dark;
    default:
      return Theme.System;
  }
}
