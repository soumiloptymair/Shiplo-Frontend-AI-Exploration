import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';

/** Response from `/api/usps/city-state?zip=`. */
export interface UspsCityState {
  city: string;
  state: string;
  zip: string;
}

/** Response from `/api/usps/validate`. */
export interface UspsValidatedAddress {
  valid: boolean;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  zipPlus4: string;
}

export interface UspsValidatePayload {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
}

/** One row in the address typeahead dropdown. */
export interface AddressSuggestion {
  street1: string;
  city: string;
  state: string;
  zip: string;
  displayLabel: string;
}

/**
 * Thin client for the USPS address proxy that the Express server in
 * `server/index.mjs` exposes under `/api/usps/*`. The browser
 * never sees USPS OAuth credentials — they live server-side.
 */
@Injectable({ providedIn: 'root' })
export class UspsService {
  private readonly http = inject(HttpClient);

  cityStateFromZip(zip: string): Observable<UspsCityState> {
    return this.http
      .get<UspsCityState>('/api/usps/city-state', { params: { zip } })
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => err)));
  }

  validate(payload: UspsValidatePayload): Observable<UspsValidatedAddress> {
    return this.http
      .post<UspsValidatedAddress>('/api/usps/validate', payload)
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => err)));
  }

  /** Convenience wrapper that swallows errors and returns null on failure. */
  safeCityState(zip: string): Observable<UspsCityState | null> {
    return this.cityStateFromZip(zip).pipe(catchError(() => of(null)));
  }

  /**
   * Typeahead. Returns a small ranked list of address suggestions for `q`.
   * Resolves to `[]` on any error or when the query is too short.
   */
  autocomplete(q: string): Observable<AddressSuggestion[]> {
    return this.http
      .get<{ suggestions: AddressSuggestion[] }>('/api/usps/autocomplete', {
        params: { q },
      })
      .pipe(
        map((r) => r.suggestions ?? []),
        catchError(() => of([] as AddressSuggestion[])),
      );
  }
}
