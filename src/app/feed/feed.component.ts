import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
})
export class FeedComponent implements OnInit {
  captures$: Observable<any>;
  subscription: Subscription;
  constructor(db: AngularFirestore) {
    const ref = db.collection('captures', ref => ref.orderBy('uploaded', 'desc'));
    this.captures$ = ref.valueChanges();
  }

  ngOnInit() {
  }
}