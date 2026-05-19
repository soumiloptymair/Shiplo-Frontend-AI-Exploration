import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConnectFormValue {
  accountName: string;
  domainUrl: string;
  authKey: string;
  customerKey: string;
  customerSecret: string;
}

@Component({
  selector: 'app-connect-integration-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connect-integration-modal.component.html',
})
export class ConnectIntegrationModalComponent implements AfterViewInit {
  @Input() brand = '';
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<ConnectFormValue>();
  @ViewChild('firstField') firstField?: ElementRef<HTMLInputElement>;

  ngAfterViewInit() {
    queueMicrotask(() => this.firstField?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.cancel.emit(); }

  readonly accountName = signal('');
  readonly domainUrl = signal('');
  readonly authKey = signal('');
  readonly customerKey = signal('');
  readonly customerSecret = signal('');

  readonly canSubmit = computed(() =>
    !!this.accountName().trim() &&
    !!this.domainUrl().trim() &&
    !!this.authKey().trim() &&
    !!this.customerKey().trim() &&
    !!this.customerSecret().trim());

  get domainLabel(): string {
    return this.brand ? `${this.brand} Domain URL` : 'Domain URL';
  }

  set(field: 'accountName' | 'domainUrl' | 'authKey' | 'customerKey' | 'customerSecret', ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this[field].set(value);
  }

  submit() {
    if (!this.canSubmit()) return;
    this.confirm.emit({
      accountName: this.accountName(),
      domainUrl: this.domainUrl(),
      authKey: this.authKey(),
      customerKey: this.customerKey(),
      customerSecret: this.customerSecret(),
    });
  }
}
