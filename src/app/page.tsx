import TextProcessor from "@/components/TextProcessor";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">WordWeave</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your text with advanced formatting and natural language
            processing
          </p>
        </div>
        <TextProcessor />
      </div>
    </main>
  );
}
