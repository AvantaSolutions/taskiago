import { Component, inject } from '@angular/core';
import { IonIcon, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { add, checkboxOutline, cog, pricetagsOutline } from 'ionicons/icons';

import { SharedService } from '../shared/_data-access/shared.service';


@Component({
    selector: 'app-home',
    template: `
    <ion-tabs>
        <ion-tab-bar slot="bottom">
            <ion-tab-button tab="todo">
                <ion-icon name="checkbox-outline"></ion-icon>
                Checklist
            </ion-tab-button>
            <ion-tab-button tab="tags">
                <ion-icon name="pricetags-outline"></ion-icon>
                Tag
            </ion-tab-button>
            <ion-tab-button tab="settings">
                <ion-icon name="cog"></ion-icon>
                Settings
            </ion-tab-button>
        </ion-tab-bar>
    </ion-tabs>
    `,
    styles: `
    #container {
        text-align: center;
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
    }

    #container strong {
        font-size: 20px;
        line-height: 26px;
    }

    #container p {
        font-size: 16px;
        line-height: 22px;

        color: #8c8c8c;

        margin: 0;
    }

    #container a {
        text-decoration: none;
    }
    `,
    standalone: true,
    imports: [ IonTabs, IonTabButton, IonTabBar, IonIcon],
})
export default class HomePage {
    sharedService = inject(SharedService);

    constructor() {
        addIcons({ add, checkboxOutline, cog, pricetagsOutline})
    }
}
