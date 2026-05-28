import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DEFAULT_VARIANT_NOTES, VariantNote } from '../../core/models/inventory.model';

@Component({
  selector: 'app-notes-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notes-tab.component.html',
})
export class NotesTabComponent implements OnChanges {
  /** Seed list used both initially and as the reset baseline when `resetKey` changes. */
  @Input() seed: VariantNote[] = DEFAULT_VARIANT_NOTES;
  /** When this value changes, the composer draft is cleared and the list is reseeded. */
  @Input() resetKey: string | number | null = null;

  readonly notes = signal<VariantNote[]>([...DEFAULT_VARIANT_NOTES]);
  readonly draft = signal('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seed'] && !changes['seed'].firstChange) {
      this.notes.set([...this.seed]);
    } else if (changes['seed'] && changes['seed'].firstChange) {
      this.notes.set([...this.seed]);
    }
    if (changes['resetKey'] && !changes['resetKey'].firstChange) {
      this.draft.set('');
      this.notes.set([...this.seed]);
    }
  }

  onInput(e: Event) {
    this.draft.set((e.target as HTMLInputElement).value);
  }

  add() {
    const body = this.draft().trim();
    if (!body) return;
    this.notes.update(list => [
      { id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, author: 'Admin 01', initials: 'A1', timestamp: 'just now', body },
      ...list,
    ]);
    this.draft.set('');
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.add();
    }
  }
}
