import { ReactiveEffect } from './effect'

export type Dep = Set<ReactiveEffect> & TrackedMarkers

type TrackedMarkers = {
  w: number,
  n: number
}