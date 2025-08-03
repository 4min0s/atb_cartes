import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  get displayValue(): string {
    if (this.type_input === 'num-carte') {
      if (!this.value) return '';
      return this.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    }
    return this.value ?? '';
  }
  @Input() type_input: string = 'text';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value;
    if (this.type_input === 'num-carte') {
      const raw = val.replace(/\D/g, '');
      this.valueChange.emit(raw); 
      this.value = raw;
      input.value = raw.replace(/(.{4})/g, '$1 ').trim();
    } else {
      this.value = val;
      this.valueChange.emit(this.value);
    }
  }
}
