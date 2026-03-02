import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiserviceService {

  private baseUrl = 'http://localhost:8000/api';
  constructor(private http: HttpClient) { }
  fewShotGenerate(input: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/few-shot/generate`, { input });
  }
  tokensContext(input: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/tokens-context`, { input });
  }
  jsonSchema(input: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/json-schema/generate`, { input });
  }
  temperature(input: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/temperature/compare`, { input });
  }
  //call health endpoint
  health(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }
}
