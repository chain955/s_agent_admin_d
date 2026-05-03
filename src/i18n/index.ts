import { ru, type RuKey } from "./ru";

export function t(key: RuKey): string {
  return ru[key];
}

export function useT() {
  return t;
}
