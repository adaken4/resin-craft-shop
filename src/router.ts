import { store } from './state';

type RouteHandler = (route: string) => void;

class ClientRouter {
  private routeHandlers: Set<RouteHandler> = new Set();

  constructor() {
    window.addEventListener('popstate', () => this.handleLocationChange());
    window.addEventListener('hashchange', () => this.handleLocationChange());

    // Intercept client-side link clicks for zero reload
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('a[data-link]') as HTMLAnchorElement | null;
      if (target) {
        e.preventDefault();
        const href = target.getAttribute('href') || '/';
        this.navigate(href);
      }
    });
  }

  public getNormalizedRoute(): string {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && (hash.startsWith('/') || hash === 'admin')) {
      return hash.startsWith('/') ? hash : `/${hash}`;
    }

    const pathname = window.location.pathname;
    if (pathname.includes('admin')) {
      return '/admin';
    }
    return pathname === '' ? '/' : pathname;
  }

  public init(): void {
    this.handleLocationChange();
  }

  public onRoute(handler: RouteHandler): () => void {
    this.routeHandlers.add(handler);
    return () => this.routeHandlers.delete(handler);
  }

  public navigate(path: string): void {
    const normalized = path.startsWith('#') ? path.replace(/^#/, '') : path;
    const finalPath = normalized.startsWith('/') ? normalized : `/${normalized}`;

    if (window.location.pathname !== finalPath && window.location.hash !== `#${finalPath}`) {
      window.history.pushState({}, '', finalPath);
    }
    this.handleLocationChange();
  }

  private handleLocationChange(): void {
    const route = this.getNormalizedRoute();
    store.setCurrentRoute(route);

    for (const handler of this.routeHandlers) {
      handler(route);
    }

    // Scroll to top on route transition
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export const router = new ClientRouter();
