import { Injectable } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import { ConfigService } from '@nestjs/config'
import { getFirestore } from 'firebase/firestore';
import { getImpliedNodeFormatForFile } from 'typescript';
import { User } from './entity/user.entity';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth/web-extension';

@Injectable()
export class EditalcheckappService {
  // teste provisorio do firebaseauth
  constructor(private readonly ConfigService: ConfigService) {
    const firebaseConfig = {
      apiKey: this.ConfigService.get('apiKey'),
      authDomain: this.ConfigService.get('authDomain'),
      projectId: this.ConfigService.get('projectId'),
      storageBucket: this.ConfigService.get('storageBucket'),
      messagingSenderId: this.ConfigService.get('messagingSenderId'),
      appId: this.ConfigService.get('appId')
    };

    const app = initializeApp(firebaseConfig);
  }

  provisionalLogin() {
    const auth = getAuth();

    // conta teste criada no firebase auth
    const email = 'emailquetivercadastradonofirebase@gmail.com';
    const password = 'teste1234';

    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
      const user = userCredential.user;
      console.log(`User logged in: ${user.email}`);
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Error code: ${errorCode}, Error message: ${errorMessage}`);
    });

  }
}