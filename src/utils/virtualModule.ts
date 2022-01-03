const virtualModules = new Map<string, string>();

export function setVirtualModule(id: string, source: string) {
  virtualModules.set(`\0${id}`, source);
}

export function getVirtualModule(id: string): string | null {
  return virtualModules.get(`\0${id}`) ?? null;
}
