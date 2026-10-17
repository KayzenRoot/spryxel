'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@spryxel/ui';

export function CommandPalette() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        dialogRef.current?.showModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        aria-haspopup="dialog"
        aria-label="Search or open commands"
        onClick={() => dialogRef.current?.showModal()}
      >
        Search / commands <kbd>Ctrl K</kbd>
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby="command-palette-title"
        className="m-auto w-[min(92vw,34rem)] rounded-workspace border border-border bg-overlay p-0 text-text-primary shadow-[var(--elevation-modal)] backdrop:bg-black/60"
      >
        <div className="border-b border-border p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 id="command-palette-title" className="text-lg font-semibold">
              Go to a workspace
            </h2>
            <form method="dialog">
              <Button type="submit" variant="secondary" aria-label="Close commands">
                Close
              </Button>
            </form>
          </div>
          <p className="mt-2 text-sm text-text-secondary">Choose an available destination.</p>
        </div>
        <nav aria-label="Quick navigation" className="grid gap-2 p-4">
          <Link className="rounded-control px-4 py-3 hover:bg-hover focus-visible:outline" href="/">
            Home
          </Link>
          <Link
            className="rounded-control px-4 py-3 hover:bg-hover focus-visible:outline"
            href="/projects"
          >
            Projects
          </Link>
          <Link
            className="rounded-control px-4 py-3 hover:bg-hover focus-visible:outline"
            href="/account"
          >
            Account and sessions
          </Link>
        </nav>
      </dialog>
    </>
  );
}
