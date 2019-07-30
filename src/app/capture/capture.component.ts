import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConnectionService } from '../connection.service';
import { MatSnackBar } from '@angular/material';

import 'webrtc-adapter';

@Component({
  selector: 'app-capture',
  templateUrl: './capture.component.html',
  styleUrls: ['./capture.component.css']
})
export class CaptureComponent implements OnInit, OnDestroy {
  @ViewChild('video')
  video: ElementRef;
  @ViewChild('canvas')
  canvas: ElementRef;

  private constraints = {
    video: true,
  };
  displayStream: boolean;
  captureCollectionRef: AngularFirestoreCollection<any>;
  width: number;
  height: number;

  online: boolean = true;
  actions: boolean = false;
  subscription: Subscription;

  constructor(
    private http: HttpClient,
    private db: AngularFirestore,
    private router: Router,
    private snackBar: MatSnackBar,
    private connection: ConnectionService) {
      this.displayStream = true;
      this.captureCollectionRef = this.db.collection<any>('captures');
  }
  
  ngOnInit() {
    this.connection.start();
    this.subscription = this.connection.behaviorSubjectObservable$.subscribe(online => {
      this.online = online;
    });
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(this.constraints).then(stream => {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();
        this.video.nativeElement.addEventListener('playing', () => {
          const { offsetWidth, offsetHeight } = this.video.nativeElement;
          this.width = offsetWidth;
          this.height = offsetHeight;
          this.actions = true;
        });
      });
    }
  }

  public capture() {
    this.displayStream = false;
    this.canvas.nativeElement.getContext('2d').drawImage(this.video.nativeElement, 0, 0, this.width, this.height);
    this.video.nativeElement.srcObject.getVideoTracks().forEach(track => track.stop());
  }

  public retakePhoto() {
    this.displayStream = true;
    this.actions = false;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(this.constraints).then(stream => {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();
        this.video.nativeElement.addEventListener('playing', () => {
          const { offsetWidth, offsetHeight } = this.video.nativeElement;
          this.width = offsetWidth;
          this.height = offsetHeight;
          this.actions = true;
        });
      });
    }
  }

  public usePhoto() {
    const capture = this.canvas.nativeElement.toDataURL('image/jpeg');
    const timeTaken = new Date().getTime();
    if (!navigator.onLine) {
      localStorage.setItem(`capture@${timeTaken}`, capture);
      this.snackBar.open(`Since you're offline, your photo will be uploaded the next time you go online.`, 'Got it!');
    } else {
      this.http.post(`https://api.cloudinary.com/v1_1/${environment.cloudName}/image/upload`, {
        file: capture,
        upload_preset: environment.uploadPreset
      }).subscribe((response: any) => {
        if (response) {
          this.captureCollectionRef.add({
            public_id: response.public_id,
            uploaded: timeTaken
          }).then(() => {
            this.router.navigateByUrl('/');
          });
        }
      });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.actions = false;
    if (this.video) {
      this.video.nativeElement.srcObject.getVideoTracks().forEach(track => track.stop());
    }
  }
}
