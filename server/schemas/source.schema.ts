import { Schema } from 'mongoose';

export let sourceSchema: Schema = new Schema({
  name: String,
  url: String
});

sourceSchema.index({ '$**': 'text' });
