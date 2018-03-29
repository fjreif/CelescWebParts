import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  PropertyPaneCheckbox,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption,
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneButton,
  PropertyPaneButtonType  
} from '@microsoft/sp-webpart-base';

import {
  SPHttpClient, ISPHttpClientOptions, SPHttpClientResponse
} from '@microsoft/sp-http';

import * as strings from 'BannerNoticiasWebPartStrings';
import ReactSlideSwiper from './components/BannerNoticias';
import { IReactSlideSwiperProps } from './components/IBannerNoticiasProps';
import { IListServce } from './services/IListService';
import { ListMock } from './services/ListMock';
import { ListNews } from './services/ListNews';

import { SPComponentLoader } from '@microsoft/sp-loader';

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
  enableLista:string;
  enableSite:string;
  other: boolean;
  listTitle: string;
  siteOther: string;
  libraryUrl: string;
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
    console.log('Versão: ' + this.dataVersion);
    if(this.properties.libraryUrl){
      SPComponentLoader.loadCss(this.properties.libraryUrl.concat("/js/bannerTemplate/banner.css"));
    }
    const element: React.ReactElement<IReactSlideSwiperProps> = React.createElement(
      ReactSlideSwiper,
      {
        listService: new ListNews(this.context.spHttpClient, this.properties.enableSite),
        swiperOptions: this.properties
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0.0.0');
  }

  protected onPropertyPaneConfigurationStart(): void {
    if (this.properties.enableSite) {
      this.context.statusRenderer.displayLoadingIndicator(this.domElement, 'Configuration');
      this._getSiteRootWeb()
        .then((response0) => {
          this._getSites(response0['Url'])
            .then((response) => {
              var sites: IPropertyPaneDropdownOption[] = [];
              sites.push({ key: this.context.pageContext.web.absoluteUrl, text: 'This Site' });
              for (var _key in response.value){
                if (this.context.pageContext.web.absoluteUrl != response.value[_key]['Url']) {
                  sites.push({ key: response.value[_key]['Url'], text: response.value[_key]['Title'] });
                }
              }
              
              this._siteOptions = sites;
              if (this.properties.enableSite) {
                this._getListTitles(this.properties.enableSite)
                  .then((response2) => {
                    this. _listaOptions = response2.value.map((list: ISPList) => {
                      return {
                        key: list.Title,
                        text: list.Title
                      };
                    });
                    this._getListColumns(this.properties.listTitle, this.properties.enableSite)
                      .then((response3) => {
                        var col: IPropertyPaneDropdownOption[] = [];
                        for (var _key in response3.value) {
                          col.push({ key: response3.value[_key]['InternalName'], text: response3.value[_key]['Title'] });
                        }
                        this._columnOptions = col;
                        this.context.propertyPane.refresh();
                        this.context.statusRenderer.clearLoadingIndicator(this.domElement);
                        this.render();
                      })
                  });
              }
            })
          })
    }//if
    else{
      this._getSitesAsync();
    }
  }
  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    
    this.context.statusRenderer.displayLoadingIndicator(this.domElement, 'Configuration');
    if (propertyPath === 'enableSite' && newValue) {
      
      var siteUrl = newValue;
      if (this.properties.enableSite && this.properties.enableSite.length > 25) {
        this._getListTitles(siteUrl)
          .then((response) => {
            this._listaOptions = response.value.map((list: ISPList) => {
              return {
                key: list.Title,
                text: list.Title
              };
            });
            
            this.context.propertyPane.refresh();
            this.context.statusRenderer.clearLoadingIndicator(this.domElement);
            this.render();
          });
      }
    } else if (propertyPath === 'listTitle' && newValue) {
      var siteUrl = newValue;
      if (this.properties.other) { 
        siteUrl = this.properties.siteOther; 
      } else {
        if (this.properties.enableSite) {
          siteUrl = this.properties.enableSite;
        }
      }

      this._getListColumns(newValue, siteUrl)
        .then((response) => {
          var col: IPropertyPaneDropdownOption[] = [];
          for (var _key in response.value) {
            col.push({ key: response.value[_key]['InternalName'], text: response.value[_key]['Title'] });
          }
          this._columnOptions = col;
          this.context.propertyPane.refresh();
          this.context.statusRenderer.clearLoadingIndicator(this.domElement);
          this.render();
        });

    }else if (propertyPath === 'libraryUrl' && newValue) {
      this.loadLibrary(newValue);
    } else{
      //Handle other fields here
      this.render();
    }
  }
  private loadLibrary(url: string): void {
    if (url) {
      let rootUrl = url.concat("/js/bannerTemplate");
      SPComponentLoader.loadCss(rootUrl.concat('/banner.css'));
    }
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
                  label: 'Ativar navegação'
                }),
                PropertyPaneToggle('enablePagination', {
                  label: 'Ativar paginação',
                  checked: true
                }),
                PropertyPaneTextField('slidesPerView', {
                  label: 'Slides por visualização',
                  value: '3',
                  disabled: true
                })
              ],
              isCollapsed: true
            },
            {
              groupName: "Reprodução Automática",
              groupFields: [
                PropertyPaneToggle('enableAutoplay', {
                  label: 'Ativar'
                }),
                PropertyPaneTextField('delayAutoplay', {
                  label: 'Duração',
                  description: 'Miliseconds',
                  value: '2500',
                  disabled: !this.properties.enableAutoplay
                }),
                PropertyPaneToggle('disableAutoplayOnInteraction', {
                  label: 'Desativar durante a interação',
                  disabled: !this.properties.enableAutoplay
                })
              ],
              isCollapsed: true
            },
            {
              groupName: "Avançado",
              groupFields: [
                PropertyPaneTextField('slidesPerGroup', {
                  label: 'Slides por grupo',
                  value: '3'
                }),
                PropertyPaneTextField('spaceBetweenSlides', {
                  label: 'Espaço entre os slides',
                  description: strings.InPixels,
                  value: '5'
                }),
                PropertyPaneToggle('enableGrabCursor', {
                  label: 'Ativar cursor de captura'
                }),
                PropertyPaneToggle('enableLoop', {
                  label: 'Ativar loop'
                })
              ],
              isCollapsed: true
            },
            {
              groupName: "Noticias",
              groupFields: [
                PropertyPaneDropdown('enableSite', {
                  label: 'Site',
                  options: this._siteOptions
                }),
                PropertyPaneDropdown('enableLista', {
                  label: 'Lista',
                  options: this._listaOptions
                }),
                PropertyPaneTextField('libraryUrl', {
                  label: 'Local obter bibliotecas JS'
                }),
                PropertyPaneButton('atualizar', {
                  text: 'Atualizar',
                  buttonType: PropertyPaneButtonType.Normal,
                  onClick: this.refreshPage.bind(this)
                })
              ]
            },
            
          ],
        },
      ],     

    };
  }
  protected refreshPage(): void {
    this.render();
}

  private _siteOptions: IPropertyPaneDropdownOption[] = [];
  private _listaOptions: IPropertyPaneDropdownOption[] = [];
  private _columnOptions: IPropertyPaneDropdownOption[] = [];
  
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
  private _getSitesAsync(): void {
    this._getSiteRootWeb()
      .then((response) => {
        this._getSites(response['Url'])
          .then((response1) => {
            var sites: IPropertyPaneDropdownOption[] = [];
            sites.push({ key: this.context.pageContext.web.absoluteUrl, text: 'This Site' });
            for (var _key in response1.value) {
              sites.push({ key: response1.value[_key]['Url'], text: response1.value[_key]['Title'] });
            }
            this._siteOptions = sites;
            this.context.propertyPane.refresh();
            var siteUrl = this.properties.enableSite;
            if (this.properties.other) { siteUrl = this.properties.siteOther; }
            this._getListTitles(siteUrl)
              .then((response2) => {
                this._listaOptions = response2.value.map((list: ISPList) => {
                  return {
                    key: list.Title,
                    text: list.Title
                  };
                });
                this.context.propertyPane.refresh();
                if (this.properties.listTitle) {
                  this._getListColumns(this.properties.listTitle, this.properties.enableSite)
                    .then((response3) => {
                      var col: IPropertyPaneDropdownOption[] = [];
                      for (var _key in response3.value) {
                        col.push({ key: response3.value[_key]['InternalName'], text: response3.value[_key]['Title'] });
                      }
                      this.context.propertyPane.refresh();
                      this.context.statusRenderer.clearLoadingIndicator(this.domElement);
                      this.render();
                    })
                }
              });
          })
      });
  }
}
