import {TuiAlertService, TuiButton, TuiLoader, TuiRoot, TuiTextfieldOptionsDirective} from "@taiga-ui/core";
import {Component, OnInit} from '@angular/core';
import {DbService} from './services/db.service';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {TuiInputModule} from '@taiga-ui/legacy';
import {SyncDbService} from './services/sync-db.service';

@Component({
  selector: 'app-root',
  imports: [TuiRoot, TuiButton, ReactiveFormsModule, TuiInputModule, TuiTextfieldOptionsDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  todos: any[] = [];
  isSyncing: boolean = false;
  formControl = new FormControl('', Validators.required);

  constructor(
    private dbService: DbService,
    private syncDbService: SyncDbService,
    private alertService: TuiAlertService,
  ) {}

  ngOnInit() {
    this.loadTodos();
  }

  addTodo(): void{
    if(this.formControl.value !== ''){
      if(navigator.onLine){
        console.log('added data to remote db, status: online');
        this.dbService.addTodoRemote(this.formControl.value!).then(() => this.loadTodos());
      }else{
        console.log('added data to local db, status: offline');
        this.dbService.addTodo(this.formControl.value!).then(() => this.loadTodos());
      }
      this.formControl.reset();
    }
  }

  syncTodos(): void{
    this.isSyncing = true;
    this.alertService.open('Syncing is in progress...', { appearance: 'primary' }).subscribe();
    this.syncDbService.syncRemoteDB().then(() => {
      this.isSyncing = false;
      this.alertService.open('Sync completed successfully!', { appearance: 'positive' }).subscribe();
    }).catch(e => {
      this.isSyncing = false;
      this.alertService.open(`Error syncing data: ${e.message}`, { appearance: 'negative' }).subscribe();
    });
  }

  loadTodos(): void{
    if(navigator.onLine){
      this.dbService.getTodosRemote().then((data) => {
        this.todos = data;
        console.log('REMOTE DATA', data);
      });
    }else{
      this.dbService.getTodos().then((data) => {
        this.todos = data;
        console.log('OFFLINE DATA', data);
      });
    }
  }
}
