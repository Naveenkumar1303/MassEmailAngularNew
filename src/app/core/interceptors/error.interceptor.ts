import {
  HttpInterceptorFn, HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message =
        typeof err.error === 'string' ? err.error :
        err.error?.title ?? err.error?.message ?? err.message ??
        `HTTP ${err.status} error`;

      notify.error(message);
      return throwError(() => err);
    })
  );
};
