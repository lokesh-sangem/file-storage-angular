import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class MyService {

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/files`);
  }

  upload(data: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/upload`, data);
  }

  download(ids: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download?ids=${ids}`, { responseType: 'blob' });
  }
}




