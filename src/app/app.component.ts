import { Component, OnInit } from '@angular/core';
import { TodoItem, TodosFacade } from './todos.facade';
import { Observable } from 'rxjs';
import { SyncService } from './sync.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'web-app';
  public newTodo = 'new item';
  todoItems$: Observable<TodoItem[]>;
  completedItems$: Observable<TodoItem[]>;
  byIdItem$: Observable<TodoItem>;

  constructor(private todosFacade: TodosFacade, private syncService: SyncService) {}

  async ngOnInit(): Promise<void> {
    await this.todosFacade.ensureDatabaseIsCreated();

    this.todoItems$ = this.todosFacade.getTodoItems();
    this.completedItems$ = this.todosFacade.getDoneTodoItems();

    this.todosFacade.getTodoItems().subscribe((data) => {
      console.log(data);
    });

    this.byIdItem$ = this.todosFacade.getItemById('1592692804187').pipe(
      tap((item) => {
        console.log('new item ', item);
      })
    );
  }

  public async addNewTodo() {
    console.log('adding ');
    await this.todosFacade.createTodoItem(this.newTodo);
    this.newTodo = '';
  }

  public async toggleStatus(item: TodoItem) {
    console.log(item);
    await this.todosFacade.updateTodoStatus(item.id, !item.isCompleted);
  }

  public async sync() {
    await this.syncService.sync();
  }
}
