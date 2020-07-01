import { createRxDatabase, RxDatabase, addRxPlugin, RxCollection } from 'rxdb';
import { Injectable } from '@angular/core';
import pouchdb from 'pouchdb-adapter-idb';
import todoSchema from '../schemas/todo.schema';
import { Observable } from 'rxjs';

export enum SyncStatus {
  Synced = 1,
  Syncing,
  NeedsSync,
}

export interface TodoItem {
  title: string;
  id: string;
  isCompleted: boolean;
  syncDate?: number;
  serverModified?: number;
  syncStatus: SyncStatus;
}

@Injectable()
export class TodosFacade {
  todoCollection: RxCollection<TodoItem>;

  constructor() {}

  public async ensureDatabaseIsCreated() {
    if (this.todoCollection) {
      return;
    }

    addRxPlugin(pouchdb);

    console.log('creating database');
    const db = await createRxDatabase({
      name: 'todosdb4', // <- name
      adapter: 'idb', // <- storage-adapter

      // password: 'myPassword', // <- password (optional)
      // multiInstance: true, // <- multiInstance (optional, default: true)
      // eventReduce: false, // <- eventReduce (optional, default: true)
    });
    // console.dir(db);
    this.todoCollection = await db.collection<TodoItem>({
      name: 'todo',
      schema: todoSchema,
    });
  }

  public getTodoItems(): Observable<TodoItem[]> {
    return this.todoCollection.find().$;
  }

  public getItemById(id: string): Observable<TodoItem> {
    return this.todoCollection.findOne(id).$;
  }

  public getDoneTodoItems(): Observable<TodoItem[]> {
    return this.todoCollection.find().where('isCompleted').eq(true).$;
  }

  public async getUnsyncedItems(): Promise<TodoItem[]> {
    const items = await this.todoCollection.find().where('syncStatus').eq(SyncStatus.NeedsSync).exec();
    return items;
  }

  public async changeSyncStatus(id: string, newStatus: SyncStatus): Promise<void> {
    const query = this.todoCollection.find().where('id').eq(id);
    const newValues = { syncStatus: newStatus } as any;

    if (newStatus === SyncStatus.Synced) {
      newValues.syncDate = new Date().getTime();
    }

    await query.update({ $set: newValues });
  }

  public async changeId(oldId: string, newId: string): Promise<void> {
    const query = this.todoCollection.find().where('id').eq(oldId);
    const newValues = { id: newId };
    await query.update({ $set: newValues });
  }

  public async createTodoItem(title: string): Promise<void> {
    const todoItem: TodoItem = {
      title,
      id: new Date().getTime().toString(),
      isCompleted: false,
      syncStatus: SyncStatus.NeedsSync,
    };

    this.todoCollection.insert(todoItem);
  }

  public async updateTodoStatus(todoId: string, newStatus: boolean): Promise<void> {
    const query = this.todoCollection.find().where('id').eq(todoId);
    const newValues = { isCompleted: newStatus, syncStatus: SyncStatus.NeedsSync };
    await query.update({ $set: newValues });
  }
}
