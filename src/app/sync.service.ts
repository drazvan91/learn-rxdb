import { createRxDatabase, RxDatabase, addRxPlugin, RxCollection } from 'rxdb';
import { Injectable } from '@angular/core';
import pouchdb from 'pouchdb-adapter-idb';
import todoSchema from '../schemas/todo.schema';
import { Observable } from 'rxjs';
import { TodosFacade, TodoItem, SyncStatus } from './todos.facade';

@Injectable()
export class SyncService {
  constructor(private todoFacade: TodosFacade) {}

  public async sync(): Promise<void> {
    console.log('Syncing');
    const updatedItems = await this.todoFacade.getUnsyncedItems();

    for (const item of updatedItems) {
      await this.todoFacade.changeSyncStatus(item.id, SyncStatus.Syncing);

      if (item.syncDate === undefined) {
        await this.create(item.id, item.title, item.isCompleted);
      } else {
        await this.update(item.id, item.title, item.isCompleted);
      }

      await this.todoFacade.changeSyncStatus(item.id, SyncStatus.Synced);
    }
  }

  private async create(id: string, title: string, isCompleted: boolean): Promise<TodoItem> {
    const url = `http://localhost:3000/add?id=${id}&title=${title}&isCompleted=${isCompleted}`;
    const request = await fetch(url);
    const response = await request.json();
    console.log(response);
    return response;
  }

  private async update(id: string, title: string, isCompleted: boolean) {
    const url = `http://localhost:3000/update?id=${id}&title=${title}&isCompleted=${isCompleted}`;
    await fetch(url);
  }
}
