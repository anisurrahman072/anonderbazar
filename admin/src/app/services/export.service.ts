import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }
  downloadFile(data: any, header: any, fileName?: any) {
    const csv = this.ConvertToCSV(data, header);

    const a = document.createElement('a');
    const blob = new Blob(["\ufeff", csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    if(fileName){

    }
    if(fileName){
        a.download = `${fileName}.csv`;
    }
    else{
        a.download = `myFile.csv`;
    }
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  ConvertToCSV(objArray, headerList) {

    let array =
        typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

    let str = '';
    let row = 'S.No, ';
    for (let index in headerList) {
        row += headerList[index] + ', ';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
        let line = (i + 1) + '';

        for (let index in headerList) {
            let head = headerList[index];
            line += ',' + array[i][head];
        }
        str += line + '\r\n';
    }
    return str;
}
}
