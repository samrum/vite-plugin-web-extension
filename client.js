export async function addViteStyleTarget(element) {
  const { addStyleTarget } = await import("/@vite/client");

  addStyleTarget(element);
}
