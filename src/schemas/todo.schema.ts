import { RxJsonSchema } from 'rxdb';

const schema: RxJsonSchema = {
  title: 'todo schema',
  description: 'todo items',
  version: 0,
  keyCompression: false,
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true,
    },
    title: {
      type: 'string',
      default: 'default title',
    },
    isCompleted: {
      type: 'boolean',
      default: 'false',
    },
    syncStatus: {
      type: 'number',
    },
    syncDate: {
      type: 'number',
    },
    serverModified: {
      type: 'number',
    },
  },
};
export default schema;
