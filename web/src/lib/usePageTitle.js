import { useEffect } from 'react';

const BRAND = 'Siembra';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND}` : `${BRAND} · El campo cruceño, abierto al mundo`;
  }, [title]);
}
