import { ListItem } from "./ListItem";
import { IListServce } from "./IListService";

export class ListMock implements IListServce {
    
    public getAll(): Promise<Array<ListItem>> {
      return new Promise<Array<ListItem>>((resolve:any) => {

        const fakeData: Array<ListItem> = [

            {
                title: 'A convergent value empowers the standard-setters',
                //description: 'The General Head of IT Strategy benchmarks business-for-business agilities',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/OFFICE365.png',
                linkNoticias: ""
                
            },
            {
                title: 'The Digital Marketers empower a digitized correlation',
                //description: 'Whereas synchronized brand values promote strategy formulations Whereas synchronized brand values promote strategy formulations. Whereas synchronized brand values promote strategy formulations',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/POWERSHELL.png',
                linkNoticias: ""
            },
            {
                title: 'The market thinker strategically standardizes a competitive success',
                //description: 'The thinkers/planners benchmark a disciplined growth momentum',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/PYTHON.png',
                linkNoticias: ""
            },
            {
                title: 'We are going to secure our cross-pollinations',
                //description: 'We are working hard to reintermediate a competitive advantage, while the gatekeeper straightforwardly identifies barriers to success',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/SP.png',
                linkNoticias: ""
            },
            {
                title: 'A convergent value empowers the standard-setters',
                //description: 'The General Head of IT Strategy benchmarks business-for-business agilities',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/JAVASCRIPT.png',
                linkNoticias: ""
            },
            {
                title: 'The Digital Marketers empower a digitized correlation',
                //description: 'Whereas synchronized brand values promote strategy formulations',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/POWERSHELL.png',
                linkNoticias: ""
            },
            {
                title: 'The market thinker strategically standardizes a competitive success',
                //description: 'The thinkers/planners benchmark a disciplined growth momentum',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/PYTHON.png',
                linkNoticias: ""
            },
            {
                title: 'We are going to secure our cross-pollinations',
                //description: 'We are working hard to reintermediate a competitive advantage, while the gatekeeper straightforwardly identifies barriers to success',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/SP.png',
                linkNoticias: ""
            },
            {
                title: 'A convergent value empowers the standard-setters',
                //description: 'The General Head of IT Strategy benchmarks business-for-business agilities',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/OFFICE365.png',
                linkNoticias: ""
            },
            {
                title: 'The Digital Marketers empower a digitized correlation',
                //description: 'Whereas synchronized brand values promote strategy formulations',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/JAVASCRIPT.png',
                linkNoticias: ""
            },
            {
                title: 'The market thinker strategically standardizes a competitive success',
                //description: 'The thinkers/planners benchmark a disciplined growth momentum',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/PYTHON.png',
                linkNoticias: ""
            },
            {
                title: 'We are going to secure our cross-pollinations',
                //description: 'We are working hard to reintermediate a competitive advantage, while the gatekeeper straightforwardly identifies barriers to success',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/SP.png',
                linkNoticias: ""
            },
            {
                title: 'A convergent value empowers the standard-setters',
                //description: 'The General Head of IT Strategy benchmarks business-for-business agilities',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/OFFICE365.png',
                linkNoticias: ""
            },
            {
                title: 'The Digital Marketers empower a digitized correlation',
                //description: 'Whereas synchronized brand values promote strategy formulations',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/POWERSHELL.png',
                linkNoticias: ""
            },
            {
                title: 'The market thinker strategically standardizes a competitive success',
                //description: 'The thinkers/planners benchmark a disciplined growth momentum',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/JAVASCRIPT.png',
                linkNoticias: ""
            },
            {
                title: 'We are going to secure our cross-pollinations',
                //description: 'We are working hard to reintermediate a competitive advantage, while the gatekeeper straightforwardly identifies barriers to success',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/SP.png',
                linkNoticias: ""
            },
            {
                title: 'A convergent value empowers the standard-setters',
                //description: 'The General Head of IT Strategy benchmarks business-for-business agilities',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/OFFICE365.png',
                linkNoticias: ""
            },
            {
                title: 'The Digital Marketers empower a digitized correlation',
                //description: 'Whereas synchronized brand values promote strategy formulations',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/POWERSHELL.png',
                linkNoticias: ""
            },
            {
                title: 'The market thinker strategically standardizes a competitive success',
                //description: 'The thinkers/planners benchmark a disciplined growth momentum',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/PYTHON.png',
                linkNoticias: ""
            },
            {
                title: 'We are going to secure our cross-pollinations',
                //description: 'We are working hard to reintermediate a competitive advantage, while the gatekeeper straightforwardly identifies barriers to success',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/JAVASCRIPT.png',
                linkNoticias: ""
            },
            {
                title: 'A convergent value empowers the standard-setters',
                //description: 'The General Head of IT Strategy benchmarks business-for-business agilities',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/OFFICE365.png',
                linkNoticias: ""
            },
            {
                title: 'The Digital Marketers empower a digitized correlation',
                //description: 'Whereas synchronized brand values promote strategy formulations',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/POWERSHELL.png',
                linkNoticias: ""
            },
            {
                title: 'The market thinker strategically standardizes a competitive success',
                //description: 'The thinkers/planners benchmark a disciplined growth momentum',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/PYTHON.png',
                linkNoticias: ""
            },
            {
                title: 'We are going to secure our cross-pollinations',
                //description: 'We are working hard to reintermediate a competitive advantage, while the gatekeeper straightforwardly identifies barriers to success',
                imageUrl: 'https://blog.velingeorgiev.com/static/images/SP.png',
                linkNoticias: ""
            }
        ];

        resolve(fakeData);
      });
    }
    
    /*
    public getAllDados(): Promise<Array<ListItem>> {
        return new Promise<Array<ListItem>>((resolve:any) => {
          const Dados: Array<ListItem> = [
              {
                  title: '',
                  imageUrl: ''
              }
          ];
          resolve(Dados);
        });
      }
      */
}