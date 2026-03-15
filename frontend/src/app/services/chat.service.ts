import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Property } from '../models/property.model';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  properties?: Property[];
  showLeadCTA?: boolean;
  leadPrompt?: string;
}

interface ChatApiResponse {
  message: string;
  properties: Property[];
  showLeadCTA: boolean;
  leadPrompt: string | null;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private _messages = signal<ChatMessage[]>([]);
  private _loading = signal(false);
  private _open = signal(false);

  readonly messages = this._messages.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly open = this._open.asReadonly();

  constructor(private http: HttpClient) {}

  toggle() { this._open.update(v => !v); }
  close()  { this._open.set(false); }

  send(content: string): Observable<ChatApiResponse> {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };
    this._messages.update(msgs => [...msgs, userMsg]);
    this._loading.set(true);

    const apiMessages = this._messages().map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      content: m.content,
    }));

    return this.http
      .post<ChatApiResponse>(`${environment.apiBaseUrl}/api/chat`, { messages: apiMessages })
      .pipe(
        tap(res => {
          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: res.message,
            properties: res.properties,
            showLeadCTA: res.showLeadCTA,
            leadPrompt: res.leadPrompt ?? undefined,
          };
          this._messages.update(msgs => [...msgs, assistantMsg]);
          this._loading.set(false);
        }),
        catchError(err => {
          this._loading.set(false);
          return throwError(() => err);
        })
      );
  }

  clear() {
    this._messages.set([]);
  }
}
