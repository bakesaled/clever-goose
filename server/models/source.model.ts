import { Document } from 'mongoose';
import { Source } from '../interfaces/source';

export interface SourceModel extends Source, Document {}
