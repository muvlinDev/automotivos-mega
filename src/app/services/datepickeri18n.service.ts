import { TranslationWidth } from '@angular/common';
import { Injectable } from '@angular/core';
import { NgbDatepickerI18n, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

const I18N_VALUES = {
  'es': {
    weekdays: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    weekLabel: 'sem'
  }
  // other languages you would support
};

@Injectable()
export class I18n {
  language = 'es';
}

@Injectable()
export class Datepickeri18nService extends NgbDatepickerI18n {
  
  constructor(private _i18n: I18n) { 
    super();
  }

  getWeekdayLabel(weekday: number): string {
		return I18N_VALUES['es'].weekdays[weekday - 1];
	}
	override getWeekLabel(): string {
		return I18N_VALUES['es'].weekLabel;
	}
	getMonthShortName(month: number): string {
		return I18N_VALUES['es'].months[month - 1];
	}
	getMonthFullName(month: number): string {
		return this.getMonthShortName(month);
	}
	getDayAriaLabel(date: NgbDateStruct): string {
		return `${date.day}-${date.month}-${date.year}`;
	}
}
