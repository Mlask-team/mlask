import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TodoList } from '@mlsk/todo/models';
import { TodoFacade } from '@mlsk/todo/state';
import { ChecklistData } from '@mlsk/ui';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'mlsk-todolist-editor',
  templateUrl: './todolist-editor.component.html',
  styleUrls: ['./todolist-editor.component.scss']
})
export class TodoListEditorComponent implements OnInit, OnDestroy {
  _todoList: TodoList;
  @Input() set todoList(todoList: TodoList) {
    this._todoList = todoList;
    this.todoName.setValue(todoList.title);
  }
  get todoList() {
    return this._todoList;
  }

  onChangeSubject = new BehaviorSubject<ChecklistData[]>([]);

  destroyed = new Subject<boolean>();
  todoName = new FormControl('');

  constructor(private todos: TodoFacade) { }

  ngOnInit(): void {
    combineLatest([
      this.todoName.valueChanges.pipe(distinctUntilChanged()),
      this.onChangeSubject,
    ])
    .pipe(
      takeUntil(this.destroyed),
      debounceTime(2000),
    ).subscribe(([name, data]) => {
      this.dispatchUpdate(name, data);
    });
  }

  dispatchUpdate(title: string, data: ChecklistData[]) {
    this.todos.update({
      ...this.todoList,
      title,
      items: data.map((row, index) => ({
        order: index,
        title: row.text,
        completed: row.checked,
      })),
    });
  }

  onDataChange(data: ChecklistData[]) {
    this.onChangeSubject.next(data)
  }

  ngOnDestroy() {
    this.destroyed.next(true);
  }
}
