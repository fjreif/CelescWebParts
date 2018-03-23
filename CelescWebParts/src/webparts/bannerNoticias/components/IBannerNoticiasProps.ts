import { IListServce } from "../services/IListService";
import { IBannerNoticiasProps } from "../BannerNoticiasWebPart";

export interface IReactSlideSwiperProps {
  listService: IListServce;
  swiperOptions: IBannerNoticiasProps;
}
