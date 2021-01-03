import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver/src/FileSaver';
@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }
  downloadFile(data: any, header: any) {
    
    
    const csv = this.ConvertToCSV(data, header);
    
    console.log(csv);
  
    const a = document.createElement('a');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
  
    a.href = url;
    a.download = 'myFile.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  ConvertToCSV(objArray, headerList) { 
    
    let array = 
        typeof objArray != 'object' ? JSON.parse(objArray) : objArray; 
    console.log(array);
    
    let str = ''; 
    let row = 'S.No, '; 
    for (let index in headerList) { 
        row += headerList[index] + ', '; 
    } 
    row = row.slice(0, -1); 
    str += row + '\r\n'; 
    for (let i = 0; i < array.length; i++) { 
        let line = (i + 1) + ''; 
        console.log('line'+ line);
        
        for (let index in headerList) { 
            let head = headerList[index]; 
            console.log('line'+ head);

            line += ',' + array[i][head]; 
            console.log('line'+ line);

        } 
        str += line + '\r\n'; 
    } 
    return str; 
} 
}
