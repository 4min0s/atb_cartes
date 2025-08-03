
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonComponent } from '../button/button.component';


@Component({
  selector: 'app-message',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
  @Input() message: string = '';
  @Output() ok = new EventEmitter<void>();

  closeMessage() {
    this.ok.emit();
  }
}
