export async function addViteStyleTarget(element) {
  const { addStyleTarget } = await import(/* @vite-ignore */ "/@vite/client");

  addStyleTarget(element);
}
