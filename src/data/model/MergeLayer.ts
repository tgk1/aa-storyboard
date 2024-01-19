export enum MergeLayer {
  Mode0 = 0,
  Mode1 = 1,
  Mode2 = 2,
  Mode3 = 3,
  Mode4 = 4
}

export const MergeLayerArray = [
  MergeLayer.Mode2,
  MergeLayer.Mode1,
  MergeLayer.Mode0,
  MergeLayer.Mode3,
  MergeLayer.Mode4
];

export function localeMLMode(ml: MergeLayer) {
  return 'MLmode' + ml;
}
