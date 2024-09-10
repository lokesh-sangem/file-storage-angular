import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  uploadFile(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/files`);
  }

  downloadFiles(ids: number[]): Observable<Blob> {
    const url = `${this.apiUrl}/download?ids=${ids.join(',')}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
