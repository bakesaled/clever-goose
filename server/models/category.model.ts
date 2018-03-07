import { Category } from '../interfaces/category';
import { Document } from 'mongoose';

export interface CategoryModel extends Category, Document {}
