import { Redirect } from 'wouter';

/** Patient registration now runs through the guided onboarding flow. */
export default function RegisterPage() {
  return <Redirect to="/onboarding" />;
}
