/**
 * Debounce utility to prevent spamming server or UI re-renders on rapid input events
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}

/**
 * Throttle utility to ensure a function is called at most once in a given window
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limitMs: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  };
}

/**
 * Lightweight Toast Notification helper
 */
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgClass =
    type === 'success'
      ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
      : type === 'error'
      ? 'bg-red-950 border-red-500/50 text-red-300'
      : 'bg-obsidian-700 border-amber-400/50 text-amber-300';

  const icon =
    type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';

  toast.className = `flex items-center space-x-3 px-4 py-3 rounded-2xl border shadow-resin backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto ${bgClass}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-xl flex-shrink-0">${icon}</span>
    <span class="text-sm font-medium leading-tight">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}
