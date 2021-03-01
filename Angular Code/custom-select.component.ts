import {
  AfterViewInit,
  Attribute,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'df-custom-select',
  templateUrl: './custom-select.component.html',
  styles: [':host { display: block }'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: CustomSelectComponent, multi: true},
  ],
})

export class CustomSelectComponent implements ControlValueAccessor, AfterViewInit, OnInit, OnDestroy {
  @Input() items: any[];
  @Input() translateLabels: boolean = false;
  @Input() bindLabel: string = 'label';
  @Input() bindValue: string = 'value';
  @Input() formControl?: FormControl;
  @Input() selectFirst?: boolean;
  @Input() placeholder?: string;
  @Input() notFoundText?: string;
  @Input() selectStyles?: any;
  @Input() disabled?: boolean;
  @Input() searchable: boolean = false;
  @Input() clearable: boolean = false;
  @Input() multiple: boolean = false;
  @Input() showMultiple: boolean = false;
  @Input() closeOnSelect: boolean = true;
  @Input() hideSelected: boolean = false;
  @Input() isAppendTo: boolean = true;
  @Input() dropdownName?: string;
  @Input() optionTemplate?: TemplateRef<any>;
  @Input() labelTemplate?: TemplateRef<any>;
  @Output() selectChange: EventEmitter<any> = new EventEmitter();
  @Output() selectClose: EventEmitter<any> = new EventEmitter();
  private _value: any = null;
  @ViewChild('ngSelect') NgSelect: NgSelectComponent;
  public appendTo = null;
  constructor(
    @Attribute('class') public classes: string,
    private cd: ChangeDetectorRef,
  ) {}

  public ngAfterViewInit() {
    if (this.isAppendTo === false) {
      this.appendTo = 'body';
    } else {
      this.appendTo = null;
    }
    if (this.items != null && this.selectFirst && this.items.length > 0) {
      this.NgSelect.select(this.NgSelect.itemsList.items[0]);
    }
    if (this.classes) { // pass styles to ng-select-panel
      this.NgSelect.classes += ` ${this.classes}`;
    }
    this.cd.detectChanges();
  }

  private onScroll = (event: any) => {
      if (this.NgSelect && this.NgSelect.isOpen && this.dropdownName && this.dropdownName === 'invite-people') {
          const isScrollingInScrollHost = (event.target.className as string).indexOf('ng-dropdown-panel-items') > -1;
          if (isScrollingInScrollHost) { return; }
          this.NgSelect.close();
      }
  };

  ngOnInit() {
      window.addEventListener('scroll', this.onScroll, true);
  }

  ngOnDestroy() {
      window.removeEventListener('scroll', this.onScroll, true);
  }

  get value(): any { return this._value; }

  set value(v: any) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);
    }
  }

  @HostListener('focus')
  public onHostFocus(): void {
    this.NgSelect.focus();
  }

  public onSelectChange(event) {
    this.selectChange.next(event);
  }

  public onSelectClose($event) {
    this.selectClose.next($event);
  }

  public writeValue(value: any) {
    if (value === null) {
      this.select(value);
    }
    this._value = value;
    this.onChange(value);
  }

  public open(): void {
    this.NgSelect.open();
  }

  onChange = (_) => {};
  onTouched = () => {};

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }

  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  private select(newOption): void {
    if (this.NgSelect && this.NgSelect.itemsList) {
      const item = this.NgSelect.itemsList.findItem(newOption);
      if (item) {
        setTimeout(() => { // hack to run select after ng-select clear item
          this.NgSelect.select(this.NgSelect.itemsList.items[item.index]);
        }, 0);
      }

    }
  }

}
