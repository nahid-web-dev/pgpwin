import ProviderGamesClient from "./ProviderGamesClient";

export default async function ProviderPage({ params }) {
  const { providerId } = await params;

  console.log("Provider ID:", providerId);

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-gray-900 p-4">
      <ProviderGamesClient providerId={providerId} />
    </div>
  );
}
