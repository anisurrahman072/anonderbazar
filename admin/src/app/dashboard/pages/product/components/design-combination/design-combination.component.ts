///<reference path="../../../../../services/design-images.service.ts"/>
import {AfterViewInit, Component, Input, OnInit, Output} from '@angular/core';

import {DesignImagesService} from "../../../../../services/design-images.service";

import {FileHolder, UploadMetadata} from "angular2-image-upload";
import {environment} from "../../../../../../environments/environment";


@Component({
    selector: 'app-design-combination',
    templateUrl: './design-combination.component.html',
    styleUrls: ['./design-combination.component.css']
})
export class DesignCombinationComponent implements OnInit, AfterViewInit {
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    @Input() productData: any;
    @Input() designCombinationData: any[];
    designImageCheck: any[] = [];
    currentDesignImage: any;
    _imageSpinner: boolean = false;
    ImageFile: any[] = [];
    ImageFileEdit: any[] = [];
    editMode: boolean = false;
    
    constructor(private designImagesService: DesignImagesService) {
    }
    
    ngOnInit(): void {
        this.currentDesignImage = {};
        this.designCombinationData.map((dcom) => {
            this.designImageCheck[dcom.part.name] = `${dcom.part.id}:${dcom.designs[0].id}`;
            
        });
        this.chngCombination({});
        
    }
    
    onRemoved(_file: FileHolder) {
        if (_file.src.includes('data:image/')) {
            this.ImageFileEdit.splice(this.ImageFileEdit.findIndex(e => e.name === _file.file.name), 1);
        } else {
            this.ImageFileEdit.splice(this.ImageFileEdit.indexOf(_file.src), 1);
        }
    }
    
    onBeforeUpload = (metadata: UploadMetadata) => {
        
        this.ImageFileEdit.push(metadata.file);
       
        return metadata;
    };
    
    ngAfterViewInit() {
        
        
    }
    
    ngOnDestroy() {
        
    }
    
    
    chngCombination($event) {
        this.editMode = false;
        this.ImageFile = [];
        this._imageSpinner = true;
        let dd = Object.assign({}, this.designImageCheck);
        this.currentDesignImage = {};
        this.designImagesService.getSingleImageByCombination(this.productData.id, JSON.stringify(dd))
            .subscribe((result: any) => {
                this.ImageFile = [];
                
                this._imageSpinner = false;
                if (result.data) {
                    this.currentDesignImage = result.data;
                    result.data.images.map((re) => {
                        this.ImageFile.push(this.IMAGE_ENDPOINT + re);
                    });
                }
            }, error => {
                this.ImageFile = [];
                
                this._imageSpinner = false;
            })
        
        
    }
    
    saveDesignImage() {
        this._imageSpinner = true;
        
        let dd = Object.assign({}, this.designImageCheck);
        let newImg = [];
        let oldImg = [];
        
        
        this.ImageFileEdit.map((img) => {
            if (typeof img == 'string') {
                let temp = img.split('/');
                oldImg.push(temp[temp.length - 1]);
            } else {
                newImg.push(img);
            }
        });
       
        
        const designImageData: FormData = new FormData();
        designImageData.append('combination', JSON.stringify(dd));
        designImageData.append('oldImages', JSON.stringify(oldImg));
        
        if (newImg.length) {
            designImageData.append('hasImage', 'true');
            
            designImageData.append('newImageCounter', newImg.length.toString());
            
            for (let i = 0; i < newImg.length; i++) {
                designImageData.append('image' + i, newImg[i], newImg[i].name);
            }
            
        } else {
            designImageData.append('hasImage', 'false');
            
        }
        
        this.designImagesService.updateByCombination(this.productData.id, designImageData)
            .subscribe((result: any) => {
                
                this.ImageFile = [];
                
                
                if (result.data) {
                    this.currentDesignImage = result.data;
                    result.data.images.map((re) => {
                        this.ImageFile.push(this.IMAGE_ENDPOINT + re);
                    });
                }
                setTimeout(() => {
                    this._imageSpinner = false;
                    this.editMode = false;
                }, 2000)
            }, error => {
                this.ImageFile = [];
                
                this._imageSpinner = false;
            })
        
        
    }
    
    editModeOn() {
        this.editMode = true;
        this.ImageFileEdit = this.ImageFile;
    }
}
