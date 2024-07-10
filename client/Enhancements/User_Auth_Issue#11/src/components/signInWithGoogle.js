import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebase";
import { toast } from "react-toastify";
import { setDoc, doc } from "firebase/firestore";
import './styles.css';

function SignInwithGoogle() {
  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(async (result) => {
      console.log(result);
      const user = result.user;
      if (result.user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: user.displayName,
          photo: user.photoURL,
          lastName: "",
        });
        toast.success("User logged in Successfully", {
          position: "top-center",
        });
        window.location.href = "/profile";
      }
    }).catch((error) => {
      console.error("Error signing in with Google:", error.message);
      toast.error("Error signing in with Google: " + error.message, {
        position: "bottom-center",
      });
    });
  };

  return (
    <div>
      <p className="continue-p">OR</p>
      <div className="google-sign-in" onClick={googleLogin}>
        <img src={require("../assets/google.png")} width={"60%"} alt="Sign in with Google" />
      </div>
    </div>
  );
}

export default SignInwithGoogle;
