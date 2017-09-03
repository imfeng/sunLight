import { Component, EventEmitter, Input, OnInit, Output, forwardRef ,OnChanges } from '@angular/core';
import { FormControl,NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
const noop = ()=>{};
export const USER_PROFILE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NumberPickerComponent),
  multi: true
};
@Component({
  selector: 'number-picker',
  templateUrl: 'number-picker.html',
  //styleUrls: ['number-picker.scss']
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NumberPickerComponent),
    multi: true,
  }   ]
})
export class NumberPickerComponent implements ControlValueAccessor, OnChanges,OnInit {
  //innerValue : number;
  @Input() description: string;
  @Input() width: string;
  @Input() min: number;
  @Input() max: number;
  @Input() step: number;
  @Input() precision: number;
  @Input() inputDisabled: boolean;
  @Input() customClick: Function;
  @Output() onChange: EventEmitter < number > = new EventEmitter();

  private numberPicker: FormControl;

  constructor() {}
    //The internal data model
  //private innerValue: any = '';

  //Placeholders for the callbacks which are later providesd
  //by the Control Value Accessor
  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = ()=>{};

  //get accessor
  get value(): any {
    return this.numberPicker.value;
  };

  //set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this.numberPicker.value) {
      this.numberPicker.setValue(v);
      this.onChangeCallback(v);
      this.onChange.emit(this.numberPicker.value);
    }
  }
  ngOnChanges(changes) {
    if (changes.counterRangeMin || changes.counterRangeMax) {
      this.onChange.emit(this.numberPicker.value);
      console.log('ngOnChanges');
    }
  }
  ngOnInit() {
    if (this.customClick == null) {
      this.customClick = function () {
        return console.log('GG!')
      };
    }
    if (this.description == null) {
      this.description = 'QTY';
    }
    if (this.width == null) {
      this.width = '2rem';
    }
    if (this.inputDisabled == null) {
      this.inputDisabled = false;
    }
    if (this.min == null) {
      this.min = 0;
    }
    if (this.max == null) {
      this.max = 100;
    }
    if (this.precision == null) {
      this.precision = 1;
    }
    if (this.step == null) {
      this.step = 1;
    }

    this.numberPicker = new FormControl({
      value: this.min,
      disabled: this.inputDisabled
    });
  }
  private inputOnChange():void{
    this.onChange.emit(this.numberPicker.value);
  }
  private increaseValue(): void {
    var currentValue = this.numberPicker.value;
    if (currentValue < this.max) {
      currentValue = currentValue + this.step;
      if (this.precision != null) {
        currentValue = this.round(currentValue, this.precision);
      }
      this.value = currentValue;
      //this.numberPicker.setValue(currentValue);
      //this.onChangeCallback(v);
    }
  }

  private decreaseValue(): void {
    var currentValue = this.numberPicker.value;
    if (currentValue > this.min) {
      currentValue = currentValue - this.step;
      if (this.precision != null) {
        currentValue = this.round(currentValue, this.precision);
      }
      //this.numberPicker.setValue(currentValue);
      this.value= currentValue;
    }
  }

  private round(value: number, precision: number): number {
    let multiplier: number = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  public getValue(): number {
    return this.numberPicker.value;
  }

  //Set touched on blur
  onBlur() {
    this.onTouchedCallback();
  }

  //From ControlValueAccessor interface
  public writeValue(value: any) {
    if (value !== this.numberPicker.value) {
      this.numberPicker.setValue(value);
    }
  }

  //From ControlValueAccessor interface
  public registerOnChange(fn: any) {
    this.onChangeCallback = fn;

  }

  //From ControlValueAccessor interface
  public registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
