import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    constructor() {
    }

    downloadFile(data: any, header: any, fileName?: any) {
        const csv = this.ConvertToCSV(data, header);

        const a = document.createElement('a');
        const blob = new Blob(["\ufeff", csv], {type: 'text/csv;charset=utf-8;'});
        const url = window.URL.createObjectURL(blob);

        a.href = url;
        if (fileName) {

        }
        if (fileName) {
            a.download = `${fileName}.csv`;
        } else {
            a.download = `myFile.csv`;
        }
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    ConvertToCSV(objArray, headerList) {

        let tmpHeaderList = [...headerList];

        let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

        let str = '';
        let row = 'S.No, ';
        for (let index in tmpHeaderList) {
            row += tmpHeaderList[index] + ', ';
        }
        row = row.slice(0, -1);
        str += row + '\r\n';
        for (let i = 0; i < array.length; i++) {
            let line = (i + 1) + '';

            for (let index in tmpHeaderList) {
                let head = tmpHeaderList[index];
                if (head === 'Transactions') {
                    let len = array[i][head].length;
                    if (len === 0) {
                        line += ', No transaction found'
                    } else {
                        if (len > 0) line += ', '

                        for (let ind = 0; ind < len; ind++) {
                            line += `[`;
                            for (let key in array[i][head][ind]) {
                                line += key + ':';
                                line += array[i][head][ind][key] + ' / ';
                            }
                            line = line.substr(0, line.split('').length - 3);
                            line += "]\, ";
                        }
                    }
                } else
                    line += ',' + array[i][head];
            }
            str += line + '\r\n';
        }
        return str;
    }
}
