import { Injectable } from '@angular/core';
import { Timestamp } from "@firebase/firestore";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  getTodayString(): string {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
  }

  getTodayTimestamp() {
    return Timestamp.fromDate(new Date());
  }

  getDateFromTimestamp (timestamp: any): string {
    var date = timestamp.toDate();
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yy = date.getFullYear();
    let hh = date.getHours();
    let mi = date.getMinutes();
    let ss = date.getSeconds();

    if(mi < 10) {
      mi = `0${mi}`;
    }
    if(ss < 10) {
      ss = `0${ss}`;
    }
      
    if(mm < 10){
      return `${dd}/0${mm}/${yy} ${hh}:${mi}:${ss}`;
    } else{
      return `${dd}/${mm}/${yy} ${hh}:${mi}:${ss}`;
    }
  }

  getDateFromString(str: string): Date {
    const [dateValues, timeValues] = str.split(' ');
    const [day, month, year] = dateValues.split('/');
    const [hours, minutes, seconds] = timeValues.split(':');
    const date = new Date(+year, +month - 1, +day, +hours, +minutes, +seconds);
    return date;
  }
}
