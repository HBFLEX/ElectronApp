import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class DbService {

  // add todo to DB
  addTodo(name: string): Promise<any>{
    return (window as any).api.addTodo(name);
  }

  // add todos to remote db
  addTodoRemote(name: string): Promise<any>{
    return (window as any).api.addTodoRemote(name);
  }

  // get all todos from local DB
  getTodos(): Promise<any[]>{
    return (window as any).api.getTodos();
  }

  // get all todos from remote db
  getTodosRemote(): Promise<any[]>{
    return (window as any).api.getTodosRemote();
  }
  constructor() { }
}
