﻿import { Component, OnInit, Input, Output, EventEmitter, ViewChild, Renderer } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent implements OnInit {
    @Input() options: any[];
    @Input() hasMoreOptions: boolean;
    @Input() key: string;
    @Input() placeholder: string = "Select";
    @Input() showNum: number;
    @Output() onScroll = new EventEmitter<any>();
    @Output() onSearch = new EventEmitter<string>();
    @Output() optionSelected = new EventEmitter<any>();

    @ViewChild('dropdownEl') dropdown;
    @ViewChild('dropdownMenuEl') dropdownMenu;
    @ViewChild('dropdownItemEl') dropdownItem;
    @ViewChild('scrollEl') scroll;
    @ViewChild('mainButton') mainButton;
    @ViewChild('searchInputEl') searchInput;

    public search = new Subject<string>();

    topPosition: number;
    bottomPosition: number;
    rowHeight: number;
    page: number = 1;
    filter: string = "";
    selectOpened: boolean = false;
    optionIndex: number = 0;

    constructor(private renderer: Renderer) {
        const observable = this.search
            .debounceTime(400)
            .distinctUntilChanged()
            .subscribe((data) => {
                this.onSearch.emit(data);
            });
    }

    ngOnInit() {
        if (!this.showNum) {
            this.showNum = this.options.length;
        }
    }

    onClickSelect() {
        if (!this.selectOpened) {
            this.selectOpened = true;
            this.renderer.setElementClass(this.dropdown.nativeElement, 'show', true);
            this.renderer.setElementClass(this.dropdownMenu.nativeElement, 'show', true);

            this.rowHeight = this.scroll.nativeElement.children[0].getBoundingClientRect().height;

            this.renderer.setElementStyle(this.scroll.nativeElement, 'height', (this.rowHeight * this.showNum).toString() + 'px');

            let rect = this.scroll.nativeElement.getBoundingClientRect();
            this.topPosition = rect.top;
            this.bottomPosition = rect.bottom;

            this.renderer.setElementClass(this.dropdownMenu.nativeElement.children[1].children[this.optionIndex],
                'dropdown-item-highlighted', true);
            this.searchInput.nativeElement.focus();
        }
        else {
            this.selectOpened = false;
            this.renderer.setElementClass(this.dropdown.nativeElement, 'show', false);
            this.renderer.setElementClass(this.dropdownMenu.nativeElement, 'show', false);
            this.mainButton.nativeElement.focus();
        }
    }

    onKeyDown(value: any) {
        this.renderer.setElementClass(this.dropdownMenu.nativeElement.children[1].children[this.optionIndex],
            'dropdown-item-highlighted', false);
        console.log(value.key);
        if (value.key == "ArrowDown") {
            console.log(this.options.length);
            console.log(this.optionIndex);
            if (this.hasMoreOptions || (this.optionIndex + 1) < this.options.length) {

                this.optionIndex++;

                if (this.optionIndex == this.showNum * this.page) {
                    this.onScrollDown();
                }

                let curElement = this.scroll.nativeElement.children[this.optionIndex].getBoundingClientRect();
                console.log(curElement.bottom, this.bottomPosition);
                if (curElement.bottom > this.bottomPosition) {
                    this.scroll.nativeElement.children[this.optionIndex].scrollIntoView(false);
                }
            }
        }
        else if (value.key == "ArrowUp") {
            if (this.optionIndex != 0) {

                this.optionIndex--;

                let curElement = this.scroll.nativeElement.children[this.optionIndex].getBoundingClientRect();
                console.log(curElement.top, this.topPosition);
                if (curElement.top < this.topPosition) {
                    this.scroll.nativeElement.children[this.optionIndex].scrollIntoView(true);
                }
            }
        }
        else if (value.key == "Enter") {
            this.optionSelected.emit(this.options[this.optionIndex]);
        }
        else if (value.key == "Escape") {
            this.onClickSelect();
        }
        this.renderer.setElementClass(this.dropdownMenu.nativeElement.children[1].children[this.optionIndex], 'dropdown-item-highlighted', true);
    }

    onScrollDown() {
        this.page++;
        if (this.hasMoreOptions) {
            this.onScroll.emit({ page: this.page, filter: this.filter });
        }       
    }

    onOptionSelect(option: any) {
        this.optionSelected.emit(option);
    }

    filterItem(value: any) {
        this.filter = value;
        this.onSearch.emit(value);
    }

    getOptionLabel(option: any): string {
        if (this.key) {
            if (option[this.key]) {
                return option[this.key];
            }
        }
        return option;
    }
}
