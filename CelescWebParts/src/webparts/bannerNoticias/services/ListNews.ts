import { ListItem } from "./ListItem";
import { IListServce } from "./IListService";
import {
    SPHttpClient, SPHttpClientResponse
  } from '@microsoft/sp-http';

export class ListNews implements IListServce {

    private httpCliente: SPHttpClient;
    private siteUrl: string;
    constructor(_httpCliente: SPHttpClient, _siteUrl:string) {
        this.httpCliente = _httpCliente;
        this.siteUrl = _siteUrl;
    }
    
    public getAll(): Promise<ListItem[]> {
        return new Promise<Array<ListItem>>((resolve:any) => {           
            return this.httpCliente.get(this.siteUrl +`/_api/web/lists/GetByTitle('BannerNoticias')/items?$select=Title, urlImagem, linkNoticias, Ativo&$filter=Ativo eq 1`, SPHttpClient.configurations.v1).then((response: SPHttpClientResponse) => {
                return response.json();
            }).then((data) => {
                if (data) {
                    let values: any[] = data.value;                    
                    var items: Array<ListItem> = values.map((list: any) => {
                        return {
                          title: list["Title"],
                          imageUrl: list["urlImagem"],
                          linkNoticias: list["linkNoticias"]
                        };
                      });
                    resolve(items);
                }
            });
        });
    }

}