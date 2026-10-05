import { Injectable, Inject, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { Task, TaskStatus } from "../models/task.model";

@Injectable({
    providedIn: 'root'
})

export class TaskService {
    private http = inject(HttpClient)
    private url = 'http://localhost:3000/tasks';

    getTasks(status: string, search: string): Observable<Task[]> {
        let params = new HttpParams();

        if (status !== 'all') {
            params = params.set('status', status);
        }

        if (search.trim()) {
            params = params.set('title_like', search.trim());
        }

        return this.http.get<Task[]>(this.url, { params }).pipe(
            map(tasks =>
                tasks.sort((a, b) => {
                    return new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime();
                })
            )
        );
    }

    updateTaskStatus(id: number, status: string): Observable<Task> {
        return this.http.patch<Task>(
            `${this.url}/${id}`,
            { status }
        );
    }

    createTask(title: string, description: string): Observable<Task> {
        const task = {
            id: Math.floor(1000 + Math.random() * 9000),
            title: title.trim(),
            description: description.trim(),
            status: 'new' as TaskStatus,
            createdAt: new Date().toISOString()
        };

        return this.http.post<Task>(this.url, task);
    }
}