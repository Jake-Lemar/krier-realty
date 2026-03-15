import { Component, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './chat-window.component.html',
})
export class ChatWindowComponent implements AfterViewChecked {
  protected chat = inject(ChatService);
  protected input = '';
  protected error = '';

  @ViewChild('messageList') private messageList!: ElementRef<HTMLDivElement>;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      const el = this.messageList?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  protected send() {
    const text = this.input.trim();
    if (!text || this.chat.loading()) return;
    this.input = '';
    this.error = '';

    this.chat.send(text).subscribe({
      error: () => {
        this.error = 'Something went wrong. Please try again.';
      },
    });
  }

  protected onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  protected formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  }
}
