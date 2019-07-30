import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { environment } from '../environments/environment';
import { ConnectionService } from './connection.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  captureCollectionRef: AngularFirestoreCollection<any>;
  online: boolean = true;

  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private db: AngularFirestore,
    private connection: ConnectionService,
    private router: Router) { }

  ngOnInit() {
    this.connection.start();
    this.captureCollectionRef = this.db.collection<any>('captures');
    this.connection.behaviorSubjectObservable$.subscribe(online => {
      this.online = online;
      if (!this.online) {
        this.snackBar.open('You are offline!', 'OK', { duration: 5000 });
      } else {
        this.snackBar.dismiss();
        // upload from LocalStorage
        const items = { ...localStorage };
        const keys = Object.keys(items);
        const uploadKeys = keys.filter(key => key.includes('capture@'));
        // console.log(uploadKeys);
        uploadKeys.forEach(uploadKey => {
          this.snackBar.open(`Uploading photo taken at ${formatDate(uploadKey.split('@')[1], 'yyyy-MM-dd hh:mm:ss', 'en-GB')}`, 'OK', { duration: 5000 });
          const photoToUpload = localStorage.getItem(uploadKey);
          return this.http.post(`https://api.cloudinary.com/v1_1/${environment.cloudName}/image/upload`, {
            file: photoToUpload,
            upload_preset: environment.uploadPreset
          }).subscribe((response: any) => {
            if (response) {
              localStorage.removeItem(uploadKey);
              return this.captureCollectionRef.add({
                public_id: response.public_id,
                uploaded: new Date().getTime()
              }).then(() => {
                this.router.navigateByUrl('/');
              });
            }
          });
        });
      }
    });
  }
}