// Decoupling shim between the API client middleware and the router.
// App.tsx registers a callback after the router is created; the middleware
// fires it on 401 to redirect the user to /login without coupling the
// API layer to TanStack Router internals.

type UnauthorizedHandler = () => void;

let handler: UnauthorizedHandler = () => {};

export function setOnUnauthorized(next: UnauthorizedHandler): void {
  handler = next;
}

export function notifyUnauthorized(): void {
  handler();
}
