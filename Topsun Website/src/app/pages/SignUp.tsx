/**
 * SignUp.tsx — same component as SignIn.tsx but defaults to the 'signup' tab.
 * This keeps both routes (/signin and /signup) working with a shared design.
 */
import SignIn from './SignIn';

// Re-export SignIn which already handles both tabs.
// The tab defaults to 'login' on /signin and 'signup' on /signup
// because each uses location.pathname to determine the initial tab.
export default function SignUp() {
  return <SignIn />;
}

