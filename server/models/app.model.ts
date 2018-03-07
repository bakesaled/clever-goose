import { Model } from 'mongoose';
import { SourceModel } from './source.model';
import { CategoryModel } from './category.model';

export interface AppModel {
  source: Model<SourceModel>;
  category: Model<CategoryModel>;
}
