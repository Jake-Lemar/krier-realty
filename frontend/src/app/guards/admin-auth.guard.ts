import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const adminAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.session$.pipe(
    filter(session => session !== undefined),  // wait until getSession() has resolved
    take(1),
    map(session => {
      if (session) return true;
      return router.createUrlTree(['/admin/login']);
    })
  );
};
