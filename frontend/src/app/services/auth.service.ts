import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;
  private _session = new BehaviorSubject<Session | null | undefined>(undefined);

  // undefined = not yet initialized; null = initialized but no session
  session$ = this._session.asObservable();
  user$ = this.session$.pipe(map(s => s?.user ?? null));

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);

    // Initialize session — emits the real value (Session or null) once resolved
    this.supabase.auth.getSession().then(({ data }) => {
      this._session.next(data.session);
    });

    // Listen for auth changes (handles OAuth redirect callback)
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.next(session);
    });
  }

  get currentSession(): Session | null {
    return this._session.value ?? null;
  }

  get currentUser(): User | null {
    return this._session.value?.user ?? null;
  }

  signInWithGoogle() {
    return this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin` },
    });
  }

  signInWithEmail(email: string) {
    return this.supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  getAccessToken(): string | null {
    return this._session.value?.access_token ?? null;
  }
}
