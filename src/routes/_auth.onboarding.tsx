import { createFileRoute } from "@tanstack/react-router";
import { OnboardingWizard } from "../components/onboarding/OnboardingWizard";

export const Route = createFileRoute("/_auth/onboarding")({
    component: OnboardingPage,
});

function OnboardingPage() {
    return <OnboardingWizard />;
}
