import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export function createNewUser (db, email, password) {
    const auth = getAuth();
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed up 
        const user = userCredential.user;
        // ...
        try {
          const docRef = await setDoc(
            doc(db, "users", user.uid),
            {
              username: 'trevis',
              name: 'Trevis Wamuthenya'
            }
          );
          console.log("Document written with ID: ", docRef);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
        return user
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        return {
            errorCode,
            errorMessage
        }
      });
}

export function signIn(email, password) {
    const auth = getAuth()
    return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential)=> {
        const user = userCredential.user;
        return user  
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        return {
            errorCode,
            errorMessage
        }
      });
}