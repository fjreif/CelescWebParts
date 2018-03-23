import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  PropertyPaneCheckbox,
  PropertyPaneDropdown,
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
} from '@microsoft/sp-webpart-base';

import {
  SPHttpClient, ISPHttpClientOptions, SPHttpClientResponse
} from '@microsoft/sp-http';

import * as strings from 'BannerNoticiasWebPartStrings';
import ReactSlideSwiper from './components/BannerNoticias';
import { IReactSlideSwiperProps } from './components/IBannerNoticiasProps';
import { IListServce } from './services/IListService';
import { ListMock } from './services/ListMock';

export interface IBannerNoticiasProps {
  enableNavigation: boolean;
  enablePagination: boolean;
  enableAutoplay: boolean;
  delayAutoplay: number;
  disableAutoplayOnInteraction: boolean;
  slidesPerView: string;
  slidesPerGroup: string;
  spaceBetweenSlides: string;
  enableGrabCursor: boolean;
  enableLoop: boolean;
  enableTitle:string;
  enableLista:string
}

export interface ISPLists {
  value: ISPList[];
}

export interface ISPList {
  Title: string;
  Id: string;
}

export default class ReactSlideSwiperWebPart extends BaseClientSideWebPart<IBannerNoticiasProps> {

  public render(): void {
    const element: React.ReactElement<IReactSlideSwiperProps> = React.createElement(
      ReactSlideSwiper,
      {
        listService: new ListMock(),
        swiperOptions: this.properties
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'Opções'
          },
          displayGroupsAsAccordion: true,
          groups: [
            {
              groupName: "Geral",
              groupFields: [
                PropertyPaneToggle('enableNavigation', {
                  label: strings.EnableNavigation
                }),
                PropertyPaneToggle('enablePagination', {
                  label: strings.EnablePagination,
                  checked: true
                }),
                PropertyPaneTextField('slidesPerView', {
                  label: strings.SlidesPerWiew,
                  value: '3'
                })
              ]
            },
            {
              groupName: "Reprodução Automática",
              groupFields: [
                PropertyPaneToggle('enableAutoplay', {
                  label: strings.EnableAutoplay
                }),
                PropertyPaneTextField('delayAutoplay', {
                  label: strings.DelayAutoplay,
                  description: strings.Miliseconds,
                  value: '2500',
                  disabled: !this.properties.enableAutoplay
                }),
                PropertyPaneToggle('disableAutoplayOnInteraction', {
                  label: strings.DisableAutoplayOnInteraction,
                  disabled: !this.properties.enableAutoplay
                })
              ],
              isCollapsed: true
            },
            {
              groupName: "Avançado",
              groupFields: [
                PropertyPaneTextField('slidesPerGroup', {
                  label: strings.SlidesPerGroup,
                  value: '3'
                }),
                PropertyPaneTextField('spaceBetweenSlides', {
                  label: strings.SpaceBetweenSlides,
                  description: strings.InPixels,
                  value: '5'
                }),
                PropertyPaneToggle('enableGrabCursor', {
                  label: strings.EnableGrabCursor
                }),
                PropertyPaneToggle('enableLoop', {
                  label: strings.EnableLoop
                })
              ],
              isCollapsed: true
            },
            {
              groupName: "Noticias",
              groupFields: [
                PropertyPaneDropdown('enableLista', {
                  label: 'Lista',options: [
                    { key: '1', text: 'A convergent value empowers the standard-setters'},
                    { key: '2', text: 'The Digital Marketers empower a digitized correlation' },
                    { key: '3', text: 'The market thinker strategically standardizes a competitive success' },
                    { key: '4', text: 'We are going to secure our cross-pollinations'}
                  ],
                  selectedKey: '1',
                }),
                PropertyPaneDropdown('enableTitle', {
                  label: 'Titulo',options: [
                    { key: '1', text: 'A convergent value empowers the standard-setters'},
                    { key: '2', text: 'The Digital Marketers empower a digitized correlation' },
                    { key: '3', text: 'The market thinker strategically standardizes a competitive success' },
                    { key: '4', text: 'We are going to secure our cross-pollinations'}
                  ],
                  selectedKey: '1',
                }),
                PropertyPaneTextField('UrlImagem', {
                  label: "URL da Imagem",
                  value: "https://blog.velingeorgiev.com/static/images/POWERSHELL.png",
                  disabled: true
                }),
              ],
              isCollapsed: true
            },
          ]
        }
      ]
    };
  }
  
  private _getSiteRootWeb(): Promise<ISPLists> {
    return this.context.spHttpClient.get(this.context.pageContext.web.absoluteUrl + `/_api/Site/RootWeb?$select=Title,Url`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _getSites(rootWebUrl: string): Promise<ISPLists> {
    return this.context.spHttpClient.get(rootWebUrl + `/_api/web/webs?$select=Title,Url`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _getListTitles(site: string): Promise<ISPLists> {
    return this.context.spHttpClient.get(site + `/_api/web/lists?$filter=Hidden eq false and BaseType eq 0`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _getListColumns(listNameColumns: string, listsite: string): Promise<any> {
    return this.context.spHttpClient.get(listsite + `/_api/web/lists/GetByTitle('${listNameColumns}')/Fields?$filter=Hidden eq false and ReadOnlyField eq false`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }
}
